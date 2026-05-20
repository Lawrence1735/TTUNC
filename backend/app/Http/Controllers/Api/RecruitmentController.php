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

        return response()->json(['message' => 'Application rejected.']);
    }
}
