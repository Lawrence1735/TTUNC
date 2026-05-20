<?php

declare(strict_types=1);
 
namespace App\Http\Controllers\Api;
 
use App\Http\Controllers\Controller;
use App\Models\Application;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
 
final class RecruitmentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
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
        return response()->json(['data' => $application->load('interview')]);
    }
 
    public function scheduleInterview(Request $request, Application $application): JsonResponse
    {
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

        return response()->json(['message' => 'Application rejected.']);
    }
}

