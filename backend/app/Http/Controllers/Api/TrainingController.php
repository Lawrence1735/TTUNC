<?php

declare(strict_types=1);
 
namespace App\Http\Controllers\Api;
 
use App\Http\Controllers\Controller;
use App\Models\AttendanceRecord;
use App\Models\Evaluation;
use App\Models\Trainee;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
 
final class TrainingController extends Controller
{
    // ── Trainees ──────────────────────────────────────────────────────────────
 
    public function indexTrainees(Request $request): JsonResponse
    {
        $query = Trainee::with('user');
 
        if ($request->user()->role === 'director') {
            $query->whereHas('user', fn($q) => $q->where('talent_group', $request->user()->talent_group));
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
        return response()->json(['data' => $trainee->load('user', 'attendanceRecords', 'evaluations')]);
    }
 
    public function updateTrainee(Request $request, Trainee $trainee): JsonResponse
    {
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
        $query = AttendanceRecord::with('trainee.user');
 
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
            'records.*.trainee_id' => ['required', 'integer', 'exists:trainees,id'],
            'records.*.attended'   => ['required', 'boolean'],
        ]);
 
        foreach ($data['records'] as $record) {
            AttendanceRecord::updateOrCreate(
                ['trainee_id' => $record['trainee_id'], 'session_date' => $data['session_date']],
                [
                    'status'      => $record['attended'] ? 'present' : 'absent',
                    'no_practice' => $data['no_practice'] ?? false,
                ]
            );
        }
 
        return response()->json(['message' => 'Attendance saved.', 'session_date' => $data['session_date']]);
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
            'trainee_id'       => ['required', 'integer', 'exists:trainees,id'],
            'rating'           => ['required', 'integer', 'min:1', 'max:100'],
            'recommendation'   => ['required', 'in:continue,probation,discontinue'],
            'evaluation_date'  => ['required', 'date'],
            'semester'         => ['nullable', 'string'],
            'academic_year'    => ['nullable', 'string'],
            'notes'            => ['nullable', 'string'],
            'strengths'        => ['nullable', 'string'],
            'improvements'     => ['nullable', 'string'],
            'section_a'        => ['nullable', 'array'],
            'section_b'        => ['nullable', 'array'],
            'section_c'        => ['nullable', 'array'],
            'status'           => ['nullable', 'in:draft,submitted'],
        ]);
 
        $evaluation = Evaluation::create([
            ...$data,
            'evaluator_id' => $request->user()->id,
            'status'       => $data['status'] ?? 'submitted',
        ]);
 
        return response()->json(['data' => $evaluation->load('trainee.user', 'evaluator')], Response::HTTP_CREATED);
    }
 
    public function showEvaluation(Evaluation $evaluation): JsonResponse
    {
        return response()->json(['data' => $evaluation->load('trainee.user', 'evaluator')]);
    }
 
    public function updateEvaluation(Request $request, Evaluation $evaluation): JsonResponse
    {
        $data = $request->validate([
            'rating'          => ['nullable', 'integer', 'min:1', 'max:100'],
            'recommendation'  => ['nullable', 'in:continue,probation,discontinue'],
            'evaluation_date' => ['nullable', 'date'],
            'notes'           => ['nullable', 'string'],
            'strengths'       => ['nullable', 'string'],
            'improvements'    => ['nullable', 'string'],
            'status'          => ['nullable', 'in:draft,submitted'],
        ]);
 
        $evaluation->update($data);
        return response()->json(['data' => $evaluation->fresh('trainee.user', 'evaluator')]);
    }
}
