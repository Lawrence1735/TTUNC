<?php

declare(strict_types=1);
 
namespace App\Http\Controllers\Api;
 
use App\Http\Controllers\Controller;
use App\Models\Application;
<<<<<<< HEAD
use App\Models\Interview;
use App\Services\ApplicationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Log;
=======
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
>>>>>>> origin/main
use Symfony\Component\HttpFoundation\Response;
 
final class RecruitmentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
<<<<<<< HEAD
$applications = $this->applicationService->list(
            talentGroup: $request->user()->talent_group,
            status:      $request->string('status')->value() ?: null,
            search:      $request->string('search')->value() ?: null,
        );

        return ApplicationResource::collection($applications);
    }

    /**
     * GET /api/v1/recruitment/interviews
     * Return all interviews for the authenticated director's talent group with pagination.
     */
    public function indexInterviews(Request $request): AnonymousResourceCollection
    {
$talentGroup = $request->user()->talent_group;
        $perPage = min((int)$request->get('per_page', 20), 100); // Max 100 per page

        $interviews = Interview::query()
            ->whereHas('application', function ($query) use ($talentGroup) {
                $query->where('talent_group', $talentGroup);
            })
            ->with(['application'])
            ->orderBy('scheduled_at', 'desc')
            ->paginate($perPage);

        return InterviewResource::collection($interviews);
    }

    /**
     * POST /api/v1/applications  (public)
     */
    public function store(StoreApplicationRequest $request): JsonResponse
=======
        $query = Application::query()->with('interview');
 
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
 
    public function store(Request $request): JsonResponse
>>>>>>> origin/main
    {
        $data = $request->validate([
            'talent_group'                => ['required', 'in:marching-band,glee-club,dance-club,majorettes'],
            'applicant_name'              => ['required', 'string', 'max:255'],
            'applicant_email'             => ['required', 'email'],
            'applicant_student_id'        => ['nullable', 'string'],
            'applicant_phone'             => ['nullable', 'string'],
            'applicant_year_level'        => ['nullable', 'string'],
            'applicant_course'            => ['nullable', 'string'],
            'applicant_department'        => ['nullable', 'string'],
            'applicant_address'           => ['nullable', 'string'],
            'applicant_gender'            => ['nullable', 'string'],
            'applicant_birthdate'         => ['nullable', 'date'],
            'applicant_age'               => ['nullable', 'string'],
            'guardian_name'               => ['nullable', 'string'],
            'guardian_phone'              => ['nullable', 'string'],
            'guardian_relationship'       => ['nullable', 'string'],
            'instruments'                 => ['nullable', 'string'],
            'voices'                      => ['nullable', 'string'],
            'vocal_range'                 => ['nullable', 'string'],
            'primary_dance_genre'         => ['nullable', 'string'],
            'years_of_experience'         => ['nullable', 'string'],
            'experience'                  => ['nullable', 'string'],
            'motivation'                  => ['nullable', 'string'],
        ]);
 
        $application = Application::create([
            ...$data,
            'status'     => 'pending',
            'applied_at' => now(),
        ]);
 
        // Send confirmation email (wrapped in try-catch to not fail the submission)
        try {
            // TODO: Implement email notification service
            // Mail::send('emails.application-received', ['application' => $application], function($message) use ($application) {
            //     $message->to($application->applicant_email)->subject('Application Received - UNC Talent Track');
            // });
        } catch (\Exception $e) {
            // Log error but don't fail the request
            \Log::error('Failed to send application confirmation email:', ['error' => $e->getMessage()]);
        }
 
        return response()->json(['data' => $application], Response::HTTP_CREATED);
    }
 
    public function show(Application $application): JsonResponse
    {
<<<<<<< HEAD
$application = $this->applicationService->get($application->id);

        return response()->json(['data' => new ApplicationResource($application)]);
    }

    /**
     * POST /api/v1/recruitment/applications/{application}/schedule-interview
     */
    public function scheduleInterview(
        ScheduleInterviewRequest $request,
        Application $application
    ): JsonResponse {
        try {
            // Find application by ID with proper error handling
            $app = Application::findOrFail($application->id);

            // Schedule interview via service (handles status update and transaction)
            $interview = $this->applicationService->scheduleInterview(
                application: $app,
                reviewerId:  $request->user()->id,
                scheduleData: $request->validated(),
            );

            // Reload with reviewer info
            $interview->load('reviewer:id,name');

            // Return success with updated application status
            $app->refresh(); // Ensure we have latest status from DB

            return response()->json([
                'message'       => 'Interview scheduled successfully.',
                'interview'     => new InterviewResource($interview),
                'application'   => new ApplicationResource($app),
            ], Response::HTTP_OK);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'error'   => 'Application not found',
                'message' => 'The application you are trying to schedule does not exist.',
            ], Response::HTTP_NOT_FOUND);

        } catch (\DomainException $e) {
            return response()->json([
                'error'   => 'Invalid operation',
                'message' => $e->getMessage(),
            ], Response::HTTP_UNPROCESSABLE_ENTITY);

        } catch (\Illuminate\Database\QueryException $e) {
            \Log::error('Database error in scheduleInterview', ['error' => $e->getMessage()]);
            return response()->json([
                'error'   => 'Database error',
                'message' => 'Failed to save interview to database. Please check the scheduled_at date format.',
            ], Response::HTTP_INTERNAL_SERVER_ERROR);

        } catch (\Exception $e) {
            \Log::error('Unexpected error in scheduleInterview', ['error' => $e->getMessage()]);
            return response()->json([
                'error'   => 'Server error',
                'message' => $e->getMessage(),
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * POST /api/v1/recruitment/applications/{application}/reschedule-interview
     */
    public function rescheduleInterview(
        ScheduleInterviewRequest $request,
        Application $application
    ): JsonResponse {
        try {
            $interview = $this->applicationService->rescheduleInterview(
                application: $application,
                reviewerId:  $request->user()->id,
                scheduleData: $request->validated(),
            );
        } catch (\DomainException $e) {
            return response()->json(['message' => $e->getMessage()], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $interview->load('reviewer:id,name');

        return response()->json([
            'message'   => 'Interview rescheduled successfully.',
            'interview' => new InterviewResource($interview),
=======
        return response()->json(['data' => $application->load('interview')]);
    }
 
    public function scheduleInterview(Request $request, Application $application): JsonResponse
    {
        $data = $request->validate([
            'scheduled_at' => ['required', 'date'],
            'venue'        => ['nullable', 'string'],
            'notes'        => ['nullable', 'string'],
>>>>>>> origin/main
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
 
        return response()->json(['message' => 'Interview scheduled.', 'interview' => $interview]);
    }

    public function handleApproveInterview(Request $request, Application $application): JsonResponse
    {
        $request->validate(['approval_notes' => ['nullable', 'string']]);

        $application->update([
            'status'         => 'approved',
            'approval_notes' => $request->approval_notes,
        ]);

        return response()->json(['message' => 'Application approved.']);
    }

    public function handleRejectInterview(Request $request, Application $application): JsonResponse
    {
        $data = $request->validate([
            'denial_reason'   => ['required', 'string'],
            'denial_feedback' => ['nullable', 'string'],
        ]);

        $application->update([
            'status'          => 'rejected',
            'denial_reason'   => $data['denial_reason'],
            'denial_feedback' => $data['denial_feedback'] ?? null,
        ]);

        return response()->json(['message' => 'Application rejected.', 'data' => $application]);
    }
}

