<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Recruitment\ApproveApplicationRequest;
use App\Http\Requests\Recruitment\RejectApplicationRequest;
use App\Http\Requests\Recruitment\ScheduleInterviewRequest;
use App\Http\Requests\Recruitment\StoreApplicationRequest;
use App\Http\Resources\ApplicationResource;
use App\Http\Resources\InterviewResource;
use App\Models\Application;
use App\Models\Interview;
use App\Services\ApplicationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

/**
 * Thin HTTP adapter for recruitment pipeline endpoints.
 * All business logic lives in ApplicationService.
 */
final class RecruitmentController extends Controller
{
    public function __construct(
        private readonly ApplicationService $applicationService,
    ) {}

    /**
     * GET /api/v1/recruitment/applications
     */
    public function index(Request $request): AnonymousResourceCollection
    {
<<<<<<< HEAD
        $applications = $this->applicationService->list(
            talentGroup: $request->user()->talent_group,
            status:      $request->string('status')->value() ?: null,
            search:      $request->string('search')->value() ?: null,
        );

        return ApplicationResource::collection($applications);
=======
        $query = Application::query()->with('interview');
 
        // Directors can only see applications for their assigned talent group
        if ($request->user()->role === 'director') {
            if (!$request->user()->talent_group) {
                return response()->json(['message' => 'Director talent group not assigned'], Response::HTTP_FORBIDDEN);
            }
            $query->where('talent_group', $request->user()->talent_group);
        }
 
        // Filter by status if provided
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
 
        // Filter by talent_group if provided (for admins)
        if ($request->filled('talent_group') && $request->user()->role === 'admin') {
            $query->where('talent_group', $request->talent_group);
        }
 
        // Search by applicant name
        if ($request->filled('search')) {
            $query->where('applicant_name', 'like', '%' . $request->search . '%');
        }
 
        $applications = $query->orderByDesc('applied_at')->paginate(20);
 
        return response()->json($applications);
>>>>>>> 2b86443 (feat: add Progress, Table, Tabs, Textarea components and ApplicationClient API)
    }

    /**
     * GET /api/v1/recruitment/interviews
     * Return all interviews for the authenticated director's talent group with pagination.
     */
    public function indexInterviews(Request $request): AnonymousResourceCollection
    {
<<<<<<< HEAD
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
=======
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
 
        // Get user_id from authenticated request, or null for public submissions
        $userId = $request->user()?->id;
 
        $application = Application::create([
            ...$data,
            'user_id'    => $userId,
            'status'     => 'pending',
            'applied_at' => now(),
        ]);
 
        return response()->json(
            ['data' => $application->load('interview')],
            Response::HTTP_CREATED
        );
>>>>>>> 2b86443 (feat: add Progress, Table, Tabs, Textarea components and ApplicationClient API)
    }

    /**
     * POST /api/v1/applications  (public)
     */
    public function store(StoreApplicationRequest $request): JsonResponse
    {
        $application = $this->applicationService->submit($request->validated());

        return response()->json(
            ['data' => new ApplicationResource($application)],
            Response::HTTP_CREATED
        );
    }

    /**
     * GET /api/v1/recruitment/applications/{application}
     */
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
=======
        return response()->json(['data' => $application->load('interview')]);
    }
 
    public function scheduleInterview(Request $request, Application $application): JsonResponse
    {
        // Only directors and admins can schedule interviews
        if (!in_array($request->user()->role, ['director', 'admin'])) {
            return response()->json(['message' => 'Unauthorized'], Response::HTTP_FORBIDDEN);
        }
 
        // Directors can only schedule for their assigned talent group
        if ($request->user()->role === 'director' && $application->talent_group !== $request->user()->talent_group) {
            return response()->json(['message' => 'Cannot schedule interviews for other talent groups'], Response::HTTP_FORBIDDEN);
        }
 
        $data = $request->validate([
            'scheduled_at' => ['required', 'date'],
            'venue'        => ['nullable', 'string'],
            'notes'        => ['nullable', 'string'],
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
        // Only directors and admins can approve
        if (!in_array($request->user()->role, ['director', 'admin'])) {
            return response()->json(['message' => 'Unauthorized'], Response::HTTP_FORBIDDEN);
        }
 
        // Directors can only approve for their assigned talent group
        if ($request->user()->role === 'director' && $application->talent_group !== $request->user()->talent_group) {
            return response()->json(['message' => 'Cannot approve applications for other talent groups'], Response::HTTP_FORBIDDEN);
        }
 
        $request->validate(['approval_notes' => ['nullable', 'string']]);

        $application->update([
            'status'         => 'approved',
            'approval_notes' => $request->input('approval_notes'),
        ]);

        return response()->json(['message' => 'Application approved.', 'data' => $application]);
    }

    public function handleRejectInterview(Request $request, Application $application): JsonResponse
    {
        // Only directors and admins can reject
        if (!in_array($request->user()->role, ['director', 'admin'])) {
            return response()->json(['message' => 'Unauthorized'], Response::HTTP_FORBIDDEN);
        }
 
        // Directors can only reject for their assigned talent group
        if ($request->user()->role === 'director' && $application->talent_group !== $request->user()->talent_group) {
            return response()->json(['message' => 'Cannot reject applications for other talent groups'], Response::HTTP_FORBIDDEN);
        }
 
        $data = $request->validate([
            'denial_reason'   => ['required', 'string'],
            'denial_feedback' => ['nullable', 'string'],
        ]);
>>>>>>> 2b86443 (feat: add Progress, Table, Tabs, Textarea components and ApplicationClient API)

        $interview->load('reviewer:id,name');

        return response()->json([
            'message'   => 'Interview rescheduled successfully.',
            'interview' => new InterviewResource($interview),
        ]);
    }

    /**
     * POST /api/v1/recruitment/applications/{application}/approve
     */
    public function handleApproveInterview(
        ApproveApplicationRequest $request,
        Application $application
    ): JsonResponse {
        try {
            $result = $this->applicationService->approve(
                application:   $application,
                approvalNotes: $request->validated('approval_notes'),
            );
        } catch (\DomainException $e) {
            return response()->json(['message' => $e->getMessage()], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        return response()->json([
            'message'    => 'Application approved. User account and trainee profile provisioned.',
            'user_id'    => $result['user']->id,
            'trainee_id' => $result['trainee']->id,
        ]);
    }

    /**
     * POST /api/v1/recruitment/applications/{application}/reject
     */
    public function handleRejectInterview(
        RejectApplicationRequest $request,
        Application $application
    ): JsonResponse {
        try {
            $this->applicationService->reject($application, $request->validated());
        } catch (\DomainException $e) {
            return response()->json(['message' => $e->getMessage()], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        return response()->json(['message' => 'Application rejected.', 'data' => $application]);
    }
}
