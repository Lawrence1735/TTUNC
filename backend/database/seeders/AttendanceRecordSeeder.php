<?php

namespace Database\Seeders;

use App\Models\AttendanceRecord;
use App\Models\Trainee;
use Illuminate\Database\Seeder;

class AttendanceRecordSeeder extends Seeder
{
    public function run(): void
    {
        // Get all active trainees
        $trainees = Trainee::where('current_status', 'active')->get();

        foreach ($trainees as $trainee) {
            // Generate 25-30 attendance records for each trainee
            $recordCount = rand(25, 30);
            $startDate = now()->subMonths(6);

            for ($i = 0; $i < $recordCount; $i++) {
                $sessionDate = $startDate->copy()->addDays($i * 7 + rand(-2, 2));

                // 85% attendance rate
                $status = rand(1, 100) <= 85 ? 'present' : (rand(1, 100) <= 50 ? 'absent' : 'excused');
                $noPractice = rand(1, 100) <= 10 ? true : false;

                AttendanceRecord::create([
                    'trainee_id'   => $trainee->id,
                    'session_date' => $sessionDate,
                    'status'       => $status,
                    'notes'        => $this->generateNote($status),
                    'no_practice'  => $noPractice,
                ]);
            }
        }
    }

    private function generateNote(string $status): ?string
    {
        $notes = [
            'present' => [
                'Attended full session',
                'Good participation',
                'Focused and engaged',
                'Strong performance today',
                'Completed all activities',
            ],
            'absent' => [
                'Class conflict',
                'Emergency',
                'Illness',
                'Transportation issue',
                'Unable to attend',
            ],
            'excused' => [
                'Medical appointment',
                'Family emergency',
                'University obligation',
                'Pre-approved absence',
                'Official excuse',
            ],
        ];

        if (!isset($notes[$status])) {
            return null;
        }

        return $notes[$status][array_rand($notes[$status])];
    }
}
