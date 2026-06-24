<?php

declare(strict_types=1);
 
namespace App\Http\Controllers\Api;
 
use App\Http\Controllers\Controller;
use App\Models\AttendanceRecord;
use App\Models\Evaluation;
use App\Models\Trainee;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;
 
final class TrainingController extends Controller
{
    public function __construct(private NotificationService $notifications)
    {
    }

    // ── Trainees ──────────────────────────────────────────────────────────────
 
    public function indexTrainees(Request $request): JsonResponse
    {
        $query = Trainee::with('user', 'application');
        $includeScholars = $request->boolean('include_scholars', false);
 
        if ($request->user()->role === 'director') {
            $query->whereHas('user', function ($q) use ($request, $includeScholars) {
                $q->where('talent_group', $request->user()->talent_group);

                if (! $includeScholars) {
                    $q->where('role', '!=', 'scholar'); // Default: training views are trainee-focused
                }
            });
        } elseif (in_array($request->user()->role, ['student', 'trainee', 'scholar'], true)) {
            $query->where('user_id', $request->user()->id);
        }
 
        if ($request->filled('status')) {
            $query->where('current_status', $request->status);
        }
 
        $trainees = $query->paginate(20);
        return response()->json($trainees);
    }
 
    public function showTrainee(Trainee $trainee): JsonResponse
    {
        return response()->json(['data' => $trainee->load('user', 'application', 'attendanceRecords', 'evaluations')]);
    }
 
    public function updateTrainee(Request $request, Trainee $trainee): JsonResponse
    {
        $before = [
            'current_status' => $trainee->current_status,
            'instrument' => $trainee->instrument,
            'voice' => $trainee->voice,
            'chapter' => $trainee->chapter,
            'completion_rate' => $trainee->completion_rate,
            'chapters_completed' => $trainee->chapters_completed,
        ];

        $data = $request->validate([
            'current_status'          => ['nullable', 'in:active,inactive,completed,dropped'],
            'instrument'              => ['nullable', 'string'],
            'voice'                   => ['nullable', 'string'],
            'deactivation_note'       => ['nullable', 'string', 'max:2000'],
            'chapter'                 => ['nullable', 'string'],
            'chapters_completed'      => ['nullable', 'array'],
            'chapters_completed.*'    => ['boolean'],
            'completion_rate'         => ['nullable', 'integer', 'min:0', 'max:100'],
            'total_expected_sessions' => ['nullable', 'integer'],
        ]);

        if (array_key_exists('chapters_completed', $data) && is_array($data['chapters_completed'])) {
            $normalizedChapters = [];
            foreach ($data['chapters_completed'] as $chapter => $isCompleted) {
                $normalizedChapters[(string) $chapter] = (bool) $isCompleted;
            }
            $data['chapters_completed'] = $normalizedChapters;

            if (! array_key_exists('completion_rate', $data)) {
                $total = count($normalizedChapters) ?: 30;
                $completed = count(array_filter($normalizedChapters, fn ($v) => (bool) $v));
                $data['completion_rate'] = (int) round(($completed / $total) * 100);
            }
        }
 
        $trainee->update($data);

        $trainee = $trainee->fresh('user');
        $userId = (int) ($trainee->user_id ?? 0);

        $moduleChanged = $before['chapter'] !== $trainee->chapter
            || (int) ($before['completion_rate'] ?? -1) !== (int) ($trainee->completion_rate ?? -1)
            || json_encode($before['chapters_completed']) !== json_encode($trainee->chapters_completed);

        if ($moduleChanged) {
            $moduleLabel = $trainee->chapter ?: 'your assigned module';
            $progress = $trainee->completion_rate !== null ? (int) $trainee->completion_rate . '%' : 'updated';

            $this->notifications->notifyUser(
                $userId,
                'Training module progress updated',
                "Your module progress was updated. Current module: {$moduleLabel}. Completion: {$progress}.",
                'evaluation',
                (string) $trainee->id,
                '/dashboard?view=training',
            );
        }

        if ($before['instrument'] !== $trainee->instrument || $before['voice'] !== $trainee->voice) {
            $assignment = $trainee->instrument ?: ($trainee->voice ?: 'updated assignment');

            $this->notifications->notifyUser(
                $userId,
                'Training assignment updated',
                "Your instrument/voice assignment is now {$assignment}.",
                'instrument',
                (string) $trainee->id,
                '/dashboard?view=member-profile',
            );
        }

        if ($before['current_status'] !== $trainee->current_status) {
            $this->notifications->notifyUser(
                $userId,
                'Training status updated',
                'Your training status has been updated to ' . (string) $trainee->current_status . '.',
                'general',
                (string) $trainee->id,
                '/dashboard?view=training',
            );
        }

        return response()->json(['data' => $trainee->fresh('user')]);
    }
 
    public function destroyTrainee(Trainee $trainee): JsonResponse
    {
        $trainee->delete();
        return response()->json(['message' => 'Trainee deleted.']);
    }
 
    public function traineeStats(Trainee $trainee): JsonResponse
    {
        $attended = $trainee->attendanceRecords()->where('status', 'present')->where('no_practice', false)->count();
        $total    = $trainee->attendanceRecords()->where('no_practice', false)->count();
        $rate     = $total > 0 ? round(($attended / $total) * 100, 1) : 0;
 
        return response()->json([
            'data' => [
                'trainee'         => $trainee->load('user'),
                'attendance_rate' => $rate,
                'attended'        => $attended,
                'total_sessions'  => $total,
                'completion_rate' => $trainee->completion_rate,
            ],
        ]);
    }
 
    // ── Attendance ────────────────────────────────────────────────────────────
 
    public function indexAttendance(Request $request): JsonResponse
    {
        $query = AttendanceRecord::with('trainee.user', 'user');
 
        if ($request->user()->role === 'director') {
            $query->where(function ($q) use ($request) {
                $q->whereHas('trainee.user', fn($q2) => $q2->where('talent_group', $request->user()->talent_group))
                  ->orWhereHas('user', fn($q2) => $q2->where('talent_group', $request->user()->talent_group));
            });
        } elseif (in_array($request->user()->role, ['student', 'trainee', 'scholar'], true)) {
            $traineeId = Trainee::query()->where('user_id', $request->user()->id)->value('id');
            $query->where(function ($q) use ($request, $traineeId) {
                if ($traineeId) {
                    $q->where('trainee_id', $traineeId);
                }
                $q->orWhere('user_id', $request->user()->id);
            });
        }

        if ($request->filled('trainee_id')) {
            $query->where('trainee_id', $request->trainee_id);
        }
 
        if ($request->filled('date_from')) {
            $query->where('session_date', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->where('session_date', '<=', $request->date_to);
        }
 
        return response()->json(['data' => $query->orderByDesc('session_date')->get()]);
    }
 
    public function batchUpsertAttendance(Request $request): JsonResponse
    {
        $data = $request->validate([
            'session_date' => ['required', 'date'],
            'no_practice'  => ['boolean'],
            'records'      => ['required', 'array'],
            'records.*.trainee_id' => ['nullable', 'integer', 'exists:trainees,id'],
            'records.*.user_id'    => ['nullable', 'integer', 'exists:users,id'],
            'records.*.status'     => ['required', 'in:present,absent,excused'],
            'records.*.attended'   => ['sometimes', 'boolean'],
        ]);

        foreach ($data['records'] as $idx => $record) {
            if (empty($record['trainee_id']) && empty($record['user_id'])) {
                throw ValidationException::withMessages([
                    "records.$idx" => 'Each attendance record must include trainee_id or user_id.',
                ]);
            }
        }

        foreach ($data['records'] as $record) {
            $status = $record['status'] ?? ($record['attended'] ? 'present' : 'absent');
            $traineeId = ! empty($record['trainee_id']) ? (int) $record['trainee_id'] : null;
            $userId = ! empty($record['user_id']) ? (int) $record['user_id'] : null;

            if (! $userId && $traineeId) {
                $userId = (int) Trainee::query()->whereKey($traineeId)->value('user_id');
            }

            $lookup = ['session_date' => $data['session_date']];
            if ($traineeId) {
                $lookup['trainee_id'] = $traineeId;
            } else {
                $lookup['user_id'] = $userId;
            }

            AttendanceRecord::updateOrCreate($lookup, [
                'trainee_id'   => $traineeId,
                'user_id'      => $userId,
                'status'       => $status,
                'no_practice'  => $data['no_practice'] ?? false,
            ]);
        }
 
        return response()->json(['message' => 'Attendance saved.', 'session_date' => $data['session_date']]);
    }

    public function deleteAttendanceSession(Request $request, string $sessionDate): JsonResponse
    {
        $request->validate([
            'sessionDate' => ['sometimes'],
        ]);

        $query = AttendanceRecord::query()->whereDate('session_date', $sessionDate);

        if ($request->user()->role === 'director') {
            $query->where(function ($q) use ($request) {
                $q->whereHas('trainee.user', fn($q2) => $q2->where('talent_group', $request->user()->talent_group))
                  ->orWhereHas('user', fn($q2) => $q2->where('talent_group', $request->user()->talent_group));
            });
        } elseif (in_array($request->user()->role, ['student', 'trainee', 'scholar'], true)) {
            $traineeId = Trainee::query()->where('user_id', $request->user()->id)->value('id');
            $query->where(function ($q) use ($request, $traineeId) {
                if ($traineeId) {
                    $q->where('trainee_id', $traineeId);
                }
                $q->orWhere('user_id', $request->user()->id);
            });
        }

        $deleted = $query->delete();

        return response()->json([
            'message' => 'Attendance session deleted.',
            'deleted' => $deleted,
            'session_date' => $sessionDate,
        ]);
    }

    public function clearAttendance(Request $request): JsonResponse
    {
        $query = AttendanceRecord::query();

        if ($request->user()->role === 'director') {
            $query->where(function ($q) use ($request) {
                $q->whereHas('trainee.user', fn($q2) => $q2->where('talent_group', $request->user()->talent_group))
                  ->orWhereHas('user', fn($q2) => $q2->where('talent_group', $request->user()->talent_group));
            });
        } elseif (in_array($request->user()->role, ['student', 'trainee', 'scholar'], true)) {
            $traineeId = Trainee::query()->where('user_id', $request->user()->id)->value('id');
            $query->where(function ($q) use ($request, $traineeId) {
                if ($traineeId) {
                    $q->where('trainee_id', $traineeId);
                }
                $q->orWhere('user_id', $request->user()->id);
            });
        }

        $deleted = $query->delete();

        return response()->json([
            'message' => 'Attendance records cleared.',
            'deleted' => $deleted,
        ]);
    }
 
    public function toggleNoPractice(AttendanceRecord $record): JsonResponse
    {
        $record->update(['no_practice' => ! $record->no_practice]);
        return response()->json(['message' => 'Toggled.', 'no_practice' => $record->no_practice]);
    }
 
    // ── Evaluations ───────────────────────────────────────────────────────────
 
    public function indexEvaluations(Request $request): JsonResponse
    {
        $query = Evaluation::with('trainee.user', 'evaluator');
 
        if ($request->user()->role === 'director') {
            $query->whereHas('trainee.user', fn($q) => $q->where('talent_group', $request->user()->talent_group));
        } elseif (in_array($request->user()->role, ['student', 'trainee', 'scholar'], true)) {
            $traineeId = Trainee::query()->where('user_id', $request->user()->id)->value('id');
            if (! $traineeId) {
                return response()->json(['data' => []]);
            }
            $query->where('trainee_id', $traineeId);
        }
 
        if ($request->filled('trainee_id')) {
            $query->where('trainee_id', $request->trainee_id);
        }
 
        return response()->json(['data' => $query->orderByDesc('evaluation_date')->get()]);
    }
 
    public function storeEvaluation(Request $request): JsonResponse
    {
        $data = $request->validate([
            'trainee_id'             => ['required', 'integer', 'exists:trainees,id'],
            'rating'                 => ['required', 'integer', 'min:1', 'max:100'],
            'recommendation'         => ['required', 'in:continue,probation,discontinue'],
            'evaluation_date'        => ['required', 'date'],
            'semester'               => ['nullable', 'string'],
            'academic_year'          => ['nullable', 'string'],
            'adjectival_rating'      => ['nullable', 'string'],
            'recommend_for_renewal'  => ['nullable', 'boolean'],
            'scholarship_percentage' => ['nullable', 'integer', 'min:0', 'max:100'],
            'notes'                  => ['nullable', 'string'],
            'strengths'              => ['nullable', 'string'],
            'improvements'           => ['nullable', 'string'],
            'section_a'              => ['nullable', 'array'],
            'section_b'              => ['nullable', 'array'],
            'section_c'              => ['nullable', 'array'],
            'status'                 => ['nullable', 'in:draft,submitted'],
        ]);

        $evaluation = Evaluation::create([
            ...$data,
            'evaluator_id' => $request->user()->id,
            'status'       => $data['status'] ?? 'submitted',
        ]);

        $evaluation->load('trainee.user', 'evaluator');
        $this->notifications->notifyUser(
            (int) ($evaluation->trainee?->user_id ?? 0),
            'New evaluation available',
            'A new performance evaluation has been submitted for you.',
            'evaluation',
            (string) $evaluation->id,
            '/dashboard?view=training',
        );
 
        return response()->json(['data' => $evaluation], Response::HTTP_CREATED);
    }
 
    public function showEvaluation(Evaluation $evaluation): JsonResponse
    {
        return response()->json(['data' => $evaluation->load('trainee.user', 'evaluator')]);
    }
 
    public function updateEvaluation(Request $request, Evaluation $evaluation): JsonResponse
    {
        $data = $request->validate([
            'rating'                 => ['nullable', 'integer', 'min:1', 'max:100'],
            'recommendation'         => ['nullable', 'in:continue,probation,discontinue'],
            'evaluation_date'        => ['nullable', 'date'],
            'adjectival_rating'      => ['nullable', 'string'],
            'recommend_for_renewal'  => ['nullable', 'boolean'],
            'scholarship_percentage' => ['nullable', 'integer', 'min:0', 'max:100'],
            'notes'                  => ['nullable', 'string'],
            'strengths'              => ['nullable', 'string'],
            'improvements'           => ['nullable', 'string'],
            'section_a'              => ['nullable', 'array'],
            'section_b'              => ['nullable', 'array'],
            'section_c'              => ['nullable', 'array'],
            'status'                 => ['nullable', 'in:draft,submitted'],
        ]);

        $evaluation->update($data);

        $fresh = $evaluation->fresh('trainee.user', 'evaluator');
        $this->notifications->notifyUser(
            (int) ($fresh->trainee?->user_id ?? 0),
            'Evaluation updated',
            'Your performance evaluation was updated.',
            'evaluation',
            (string) $fresh->id,
            '/dashboard?view=training',
        );
        return response()->json(['data' => $fresh]);
    }

    /**
     * POST /api/v1/training/trainees/{trainee}/promote
     * Promote a trainee to scholar after passing their final evaluation.
     */
    public function promoteToScholar(Request $request, Trainee $trainee): JsonResponse
    {
        $user = $trainee->user;

        if (! $user) {
            return response()->json(['message' => 'Trainee user record not found.'], Response::HTTP_NOT_FOUND);
        }

        if ($user->role === 'scholar') {
            return response()->json(['message' => 'User is already a scholar.', 'user' => $user], Response::HTTP_OK);
        }

        DB::transaction(function () use ($trainee, $user): void {
            $trainee->update(['current_status' => 'completed']);
            $user->forceFill(['role' => 'scholar'])->save();
        });

        $this->notifications->notifyUser(
            (int) $user->id,
            'Congratulations, you are now a scholar',
            'You have been promoted from trainee to scholar. Keep up the great work.',
            'acceptance',
            (string) $trainee->id,
            '/dashboard?view=scholarship',
        );

        return response()->json([
            'message' => 'Trainee promoted to scholar successfully.',
            'user' => [
                'id'           => $user->id,
                'name'         => $user->name,
                'email'        => $user->email,
                'role'         => $user->role,
                'talent_group' => $user->talent_group,
            ],
        ], Response::HTTP_OK);
    }
}
