<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Application;
use App\Models\Interview;
use App\Models\Trainee;
use App\Models\User;
use App\Repositories\ApplicationRepository;
use App\Repositories\TraineeRepository;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

/**
 * Business logic for the Application pipeline.
 *
 * All state transitions (pending → interview_scheduled → approved/rejected)
 * and their side-effects (user provisioning, trainee creation) live here.
 * The controller becomes a pure HTTP adapter.
 */
final class ApplicationService
{
    public function __construct(
        private readonly ApplicationRepository $applicationRepository,
        private readonly TraineeRepository     $traineeRepository,
    ) {}

    /**
     * Paginated application list.
     */
    public function list(
        ?string $talentGroup,
        ?string $status,
        ?string $search
    ): LengthAwarePaginator {
        return $this->applicationRepository->paginate($talentGroup, $status, $search);
    }

    /**
     * Fetch a single application with relations.
     */
    public function get(int $id): Application
    {
        return $this->applicationRepository->findWithRelations($id);
    }

    /**
     * Store a new public application submission.
     *
     * @param array<string, mixed> $data
     */
    public function submit(array $data): Application
    {
        return DB::transaction(function () use ($data): Application {
            return $this->applicationRepository->create([
                ...$data,
                'status'                         => 'pending',
                'applications_this_week_tracker' => 1,
                'applied_at'                     => now(),
            ]);
        });
    }

    /**
     * Transition: pending → interview_scheduled.
     * Creates or updates the Interview record atomically.
     *
     * @param array<string, mixed> $scheduleData
     */
    public function scheduleInterview(
        Application $application,
        int $reviewerId,
        array $scheduleData
    ): Interview {
        if ($application->status !== 'pending') {
            throw new \DomainException('Only pending applications can be scheduled for interview.');
        }

        return DB::transaction(function () use ($application, $reviewerId, $scheduleData): Interview {
            $this->applicationRepository->update($application, ['status' => 'interview_scheduled']);

            return Interview::updateOrCreate(
                ['application_id' => $application->id],
                [
                    'reviewer_id'  => $reviewerId,
                    'scheduled_at' => $scheduleData['scheduled_at'],
                    'venue'        => $scheduleData['venue'] ?? null,
                    'notes'        => $scheduleData['notes'] ?? null,
                    'outcome'      => 'pending',
                ]
            );
        });
    }

    /**
     * Transition: any non-decided → approved.
     *
     * Side-effects (all in one transaction):
     *  1. Mark application approved
     *  2. Mark interview outcome = passed
     *  3. Provision User account if not already linked
     *  4. Create Trainee profile record
     *
     * @return array{user: User, trainee: Trainee}
     */
    public function approve(Application $application, ?string $approvalNotes): array
    {
        if (in_array($application->status, ['approved', 'rejected'], true)) {
            throw new \DomainException('This application has already been decided.');
        }

        return DB::transaction(function () use ($application, $approvalNotes): array {
            $this->applicationRepository->update($application, [
                'status'         => 'approved',
                'approval_notes' => $approvalNotes,
            ]);

            $application->interview?->update([
                'outcome'      => 'passed',
                'completed_at' => now(),
            ]);

            $user = $application->user;

            if (! $user) {
                $user = User::create([
                    'name'               => $application->applicant_name,
                    'email'              => $application->applicant_email,
                    'student_id'         => $application->applicant_student_id,
                    'password'           => bcrypt(bin2hex(random_bytes(8))),
                    'role'               => 'student',
                    'talent_group'       => $application->talent_group,
                    'phone'              => $application->applicant_phone,
                    'year_level'         => $application->applicant_year_level,
                    'course'             => $application->applicant_course,
                    'department'         => $application->applicant_department,
                    'address'            => $application->applicant_address,
                    'application_status' => 'approved',
                    'training_status'    => 'not_started',
                ]);

                $this->applicationRepository->update($application, ['user_id' => $user->id]);
            } else {
                $user->update([
                    'application_status' => 'approved',
                    'training_status'    => 'not_started',
                ]);
            }

            $trainee = $this->traineeRepository->firstOrCreate(
                ['user_id' => $user->id],
                [
                    'current_status'          => 'active',
                    'chapter'                 => $application->chapters,
                    'instrument'              => $application->instruments,
                    'voice'                   => $application->voices,
                    'total_expected_sessions' => 30,
                    'date_joined'             => now()->toDateString(),
                ]
            );

            return ['user' => $user, 'trainee' => $trainee];
        });
    }

    /**
     * Transition: any non-decided → rejected.
     *
     * @param array<string, string> $denialData
     */
    public function reject(Application $application, array $denialData): void
    {
        if (in_array($application->status, ['approved', 'rejected'], true)) {
            throw new \DomainException('This application has already been decided.');
        }

        DB::transaction(function () use ($application, $denialData): void {
            $this->applicationRepository->update($application, [
                'status'          => 'rejected',
                'denial_reason'   => $denialData['denial_reason'],
                'denial_feedback' => $denialData['denial_feedback'],
            ]);

            $application->interview?->update([
                'outcome'      => 'failed',
                'completed_at' => now(),
            ]);
        });
    }
}
