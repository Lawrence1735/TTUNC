<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\Interview;
use App\Models\Trainee;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Support\Arr;
use Symfony\Component\HttpFoundation\Response;

final class RecruitmentController extends Controller
{
    /**
     * GET /api/v1/recruitment/applications
     */
    public function index(Request $request): JsonResponse
    {
        $applicationColumns = [
            'id',
            'user_id',
            'talent_group',
            'status',
            'applicant_name',
            'applicant_email',
            'applicant_student_id',
            'applicant_phone',
            'applicant_birthdate',
            'applicant_age',
            'applicant_address',
            'residing_address',
            'applicant_gender',
            'applicant_year_level',
            'applicant_course',
            'applicant_department',
            'guardian_name',
            'guardian_phone',
            'guardian_relationship',
            'photo_path',
            'denial_reason',
            'denial_feedback',
            'approval_notes',
            'applied_at',
            'created_at',
            'updated_at',
        ];

        $query = Application::query()
            ->select($applicationColumns)
            ->with(['interview', 'user']);

        if ($request->user()->role === 'director') {
            $query->where('talent_group', $request->user()->talent_group);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $query->where('applicant_name', 'like', '%' . $request->search . '%');
        }

        $applications = $query->orderByDesc('applied_at')->paginate(20);

        return response()->json($applications);
    }

    /**
     * GET /api/v1/recruitment/interviews
     */
    public function indexInterviews(Request $request): JsonResponse
    {
        $talentGroup = $request->user()->talent_group;
        $perPage = min((int) $request->get('per_page', 20), 100);

        $interviews = Interview::query()
            ->whereHas('application', function ($query) use ($talentGroup) {
                $query->where('talent_group', $talentGroup);
            })
            ->with(['application'])
            ->orderBy('scheduled_at', 'desc')
            ->paginate($perPage);

        return response()->json($interviews);
    }

    /**
     * POST /api/v1/applications  (public � no auth required)
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'talent_group'          => ['required', 'in:marching-band,glee-club,dance-club,majorettes'],
            'applicant_name'        => ['required', 'string', 'max:255'],
            'applicant_email'       => ['required', 'email'],
            'social_media'          => ['nullable', 'url'],
            'applicant_student_id'  => ['nullable', 'string'],
            'applicant_phone'       => ['nullable', 'string'],
            'applicant_year_level'  => ['nullable', 'string'],
            'applicant_course'      => ['nullable', 'string'],
            'applicant_department'  => ['nullable', 'string'],
            'applicant_address'     => ['nullable', 'string'],
            'residing_address'      => ['nullable', 'string'],
            'applicant_gender'      => ['nullable', 'string'],
            'applicant_birthdate'   => ['nullable', 'date'],
            'applicant_age'         => ['nullable', 'string'],
            'guardian_name'         => ['nullable', 'string'],
            'guardian_phone'        => ['nullable', 'string'],
            'guardian_relationship' => ['nullable', 'string'],
            'photo'                 => ['nullable', 'file', 'image', 'mimes:jpeg,jpg,png,webp', 'max:5120'],
        ]);

        $photoPath = null;
        if ($request->hasFile('photo')) {
            $photoPath = $request->file('photo')->store('application-photos', 'public');
        }

        $application = Application::create([
            ...\Arr::except($data, ['photo']),
            'photo_path' => $photoPath,
            'status'     => 'pending',
            'applied_at' => now(),
        ]);

        // Send confirmation email
        $subject = 'Application Submitted Successfully - ' . config('app.name', 'TalentTrackUNC');
        $body = implode("\n", [
            'Hello ' . $application->applicant_name . ',',
            '',
            'Thank you for submitting your application to UNC TalentTrack!',
            '',
            'Application Details:',
            'Talent Group: ' . ucfirst(str_replace('-', ' ', $application->talent_group)),
            'Reference ID: ' . $application->id,
            'Submitted Date: ' . $application->applied_at->format('F d, Y H:i A'),
            '',
            'What happens next?',
            '- We will review your application within 5-7 business days',
            '- Shortlisted candidates will be invited for auditions',
            '- You will receive all updates via email and the TalentTrack portal',
            '',
            'For any questions or concerns, please contact us at: talenttrack@unc.edu.ph',
            '',
            'Best regards,',
            config('app.name', 'TalentTrackUNC') . ' Team',
        ]);

        Mail::raw($body, function ($message) use ($application, $subject): void {
            $message->to($application->applicant_email)->subject($subject);
        });

        return response()->json(['data' => $application], Response::HTTP_CREATED);
    }

    /**
     * GET /api/v1/recruitment/applications/{application}
     */
    public function show(Application $application): JsonResponse
    {
        $applicationColumns = [
            'id',
            'user_id',
            'talent_group',
            'status',
            'applicant_name',
            'applicant_email',
            'applicant_student_id',
            'applicant_phone',
            'applicant_birthdate',
            'applicant_age',
            'applicant_address',
            'residing_address',
            'applicant_gender',
            'applicant_year_level',
            'applicant_course',
            'applicant_department',
            'guardian_name',
            'guardian_phone',
            'guardian_relationship',
            'photo_path',
            'denial_reason',
            'denial_feedback',
            'approval_notes',
            'applied_at',
            'created_at',
            'updated_at',
        ];

        $record = Application::query()
            ->select($applicationColumns)
            ->with(['interview', 'user'])
            ->findOrFail($application->id);

        return response()->json(['data' => $record]);
    }

    /**
     * POST /api/v1/recruitment/applications/{application}/schedule-interview
     */
    public function scheduleInterview(Request $request, Application $application): JsonResponse
    {
        $data = $request->validate([
            'scheduled_at' => ['required', 'date'],
            'venue'        => ['nullable', 'string'],
            'notes'        => ['nullable', 'string'],
            'email_subject'=> ['nullable', 'string', 'max:255'],
            'email_body'   => ['nullable', 'string', 'max:8000'],
        ]);

        $application->update(['status' => 'interview_scheduled']);

        $interview = $application->interview()->updateOrCreate(
            ['application_id' => $application->id],
            [
                'reviewer_id'  => $request->user()->id,
                'scheduled_at' => $data['scheduled_at'],
                'venue'        => $data['venue'] ?? null,
                'notes'        => $data['notes'] ?? null,
            ]
        );

        $subject = $data['email_subject'] ?? 'Interview Schedule - ' . config('app.name', 'TalentTrackUNC');
        $body = $data['email_body'] ?? $this->buildScheduleLetter(
            $application,
            (string) $data['scheduled_at'],
            $data['venue'] ?? null,
            $data['notes'] ?? null
        );

        Mail::raw($body, function ($message) use ($application, $subject): void {
            $message->to($application->applicant_email)->subject($subject);
        });

        return response()->json(['message' => 'Interview scheduled.', 'interview' => $interview]);
    }

    /**
     * POST /api/v1/recruitment/applications/{application}/reschedule-interview
     */
    public function rescheduleInterview(Request $request, Application $application): JsonResponse
    {
        $data = $request->validate([
            'scheduled_at' => ['required', 'date'],
            'venue'        => ['nullable', 'string'],
            'notes'        => ['nullable', 'string'],
        ]);

        $interview = $application->interview;

        if (! $interview) {
            return response()->json(
                ['message' => 'No interview found to reschedule.'],
                Response::HTTP_UNPROCESSABLE_ENTITY
            );
        }

        $interview->update([
            'scheduled_at' => $data['scheduled_at'],
            'venue'        => $data['venue'] ?? $interview->venue,
            'notes'        => $data['notes'] ?? $interview->notes,
        ]);

        return response()->json(['message' => 'Interview rescheduled.', 'interview' => $interview]);
    }

    /**
     * POST /api/v1/recruitment/applications/{application}/approve
     */
    public function handleApproveInterview(Request $request, Application $application): JsonResponse
    {
        $data = $request->validate([
            'approval_notes' => ['nullable', 'string', 'max:3000'],
            'email_subject'  => ['nullable', 'string', 'max:255'],
            'email_body'     => ['nullable', 'string', 'max:8000'],
        ]);

        $createdCredentials = [
            'email' => $application->applicant_email,
            'temporary_password' => Str::password(12, true, true, false, false),
        ];

        DB::transaction(function () use ($application, $data, &$createdCredentials): void {
            $user = $application->user ?? User::query()->where('email', $application->applicant_email)->first();

            if ($user) {
                $resolvedRole = in_array($user->role, ['student', 'trainee'], true)
                    ? 'trainee'
                    : $user->role;

                $user->forceFill([
                    'name'         => $application->applicant_name,
                    'email'        => $application->applicant_email,
                    'password'     => Hash::make($createdCredentials['temporary_password']),
                    'role'         => $resolvedRole,
                    'talent_group' => $application->talent_group,
                    'student_id'   => $application->applicant_student_id,
                    'phone'        => $application->applicant_phone,
                    'year_level'   => $application->applicant_year_level,
                    'course'       => $application->applicant_course,
                    'department'   => $application->applicant_department,
                    'address'      => $application->applicant_address ?? $application->residing_address,
                ])->save();
            } else {
                $user = User::query()->create([
                    'name'         => $application->applicant_name,
                    'email'        => $application->applicant_email,
                    'password'     => Hash::make($createdCredentials['temporary_password']),
                    'role'         => 'trainee',
                    'talent_group' => $application->talent_group,
                    'student_id'   => $application->applicant_student_id,
                    'phone'        => $application->applicant_phone,
                    'year_level'   => $application->applicant_year_level,
                    'course'       => $application->applicant_course,
                    'department'   => $application->applicant_department,
                    'address'      => $application->applicant_address ?? $application->residing_address,
                ]);
            }

            $application->user_id = $user->id;

            Trainee::query()->firstOrCreate(
                ['user_id' => $user->id],
                [
                    'application_id'           => $application->id,
                    'completion_rate'          => 0,
                    'current_status'           => 'active',
                    'instrument'               => null,
                    'voice'                    => null,
                    'total_expected_sessions'  => 30,
                    'date_joined'              => now()->toDateString(),
                ]
            );

            // Keep application as decision/audit record only after approval.
            // Trainee-specific fields are owned by trainees table.
            $application->status = 'approved';
            $application->approval_notes = $data['approval_notes'] ?? null;
            $application->save();
        });

        $subject = $data['email_subject'] ?? 'Application Approved - ' . config('app.name', 'TalentTrackUNC');
        $body = $data['email_body'] ?? $this->buildApprovalLetter($application, $createdCredentials);
        $body = $this->injectApprovalCredentials($body, $createdCredentials, $application->applicant_email);

        Mail::raw($body, function ($message) use ($application, $subject): void {
            $message->to($application->applicant_email)->subject($subject);
        });

        return response()->json([
            'message' => 'Application approved. Trainee account generated and email notification sent.',
            'credentials_sent' => true,
        ]);
    }

    /**
     * POST /api/v1/recruitment/applications/{application}/reject
     */
    public function handleRejectInterview(Request $request, Application $application): JsonResponse
    {
        $data = $request->validate([
            'denial_reason'   => ['required', 'string'],
            'denial_feedback' => ['nullable', 'string'],
            'email_subject'   => ['nullable', 'string', 'max:255'],
            'email_body'      => ['nullable', 'string', 'max:8000'],
        ]);

        $application->update([
            'status'          => 'rejected',
            'denial_reason'   => $data['denial_reason'],
            'denial_feedback' => $data['denial_feedback'] ?? null,
        ]);

        $subject = $data['email_subject'] ?? 'Application Result - ' . config('app.name', 'TalentTrackUNC');
        $body = $data['email_body'] ?? $this->buildRejectionLetter(
            $application,
            $data['denial_reason'],
            $data['denial_feedback'] ?? null
        );

        Mail::raw($body, function ($message) use ($application, $subject): void {
            $message->to($application->applicant_email)->subject($subject);
        });

        return response()->json(['message' => 'Application rejected.', 'data' => $application]);
    }

    private function buildScheduleLetter(Application $application, string $scheduledAt, ?string $venue, ?string $notes): string
    {
        $dateTime = date('M d, Y h:i A', strtotime($scheduledAt));

        $lines = [
            'Dear ' . $application->applicant_name . ',',
            '',
            'Thank you for your application to ' . strtoupper((string) $application->talent_group) . '.',
            'Your interview has been scheduled for: ' . $dateTime,
        ];

        if ($venue) {
            $lines[] = 'Venue: ' . $venue;
        }
        if ($notes) {
            $lines[] = 'Notes: ' . $notes;
        }

        $lines[] = '';
        $lines[] = 'Please be present at least 15 minutes before your schedule.';
        $lines[] = '';
        $lines[] = 'Regards,';
        $lines[] = config('app.name', 'TalentTrackUNC');

        return implode(PHP_EOL, $lines);
    }

    private function buildApprovalLetter(Application $application, ?array $createdCredentials): string
    {
        $lines = [
            'Dear ' . $application->applicant_name . ',',
            '',
            'Congratulations. Your application has been approved.',
            'You have been accepted as a trainee under ' . strtoupper((string) $application->talent_group) . '.',
        ];

        if ($createdCredentials) {
            $lines[] = '';
            $lines[] = 'Your account has been created. Please use the credentials below:';
            $lines[] = 'Email: ' . $createdCredentials['email'];
            $lines[] = 'Temporary Password: ' . $createdCredentials['temporary_password'];
            $lines[] = 'Please change your password after your first login.';
        }

        $lines[] = '';
        $lines[] = 'Welcome to TalentTrackUNC.';
        $lines[] = '';
        $lines[] = 'Regards,';
        $lines[] = config('app.name', 'TalentTrackUNC');

        return implode(PHP_EOL, $lines);
    }

    private function injectApprovalCredentials(string $body, ?array $createdCredentials, string $applicantEmail): string
    {
        $credentialsBlock = implode(PHP_EOL, [
            'Your account has been created or updated. Please use the credentials below:',
            'Email: ' . $createdCredentials['email'],
            'Temporary Password: ' . $createdCredentials['temporary_password'],
            'Please change your password after your first login.',
        ]);

        // Allow editable templates to define placeholders for credentials.
        $replacedBody = str_replace(
            ['{{email}}', '{{temporary_password}}', '{{credentials_block}}'],
            [$createdCredentials['email'], $createdCredentials['temporary_password'], $credentialsBlock],
            $body
        );

        if ($replacedBody !== $body) {
            return $replacedBody;
        }

        return rtrim($body) . PHP_EOL . PHP_EOL . $credentialsBlock;
    }

    private function buildRejectionLetter(Application $application, string $reason, ?string $feedback): string
    {
        $lines = [
            'Dear ' . $application->applicant_name . ',',
            '',
            'Thank you for your application to ' . strtoupper((string) $application->talent_group) . '.',
            'After review, we regret to inform you that your application was not accepted at this time.',
            'Reason: ' . $reason,
        ];

        if ($feedback) {
            $lines[] = 'Feedback: ' . $feedback;
        }

        $lines[] = '';
        $lines[] = 'We appreciate your interest and encourage you to apply again in the future.';
        $lines[] = '';
        $lines[] = 'Regards,';
        $lines[] = config('app.name', 'TalentTrackUNC');

        return implode(PHP_EOL, $lines);
    }
}

