<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Application;
use App\Models\AttendanceRecord;
use App\Models\Evaluation;
use App\Models\Trainee;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * Seeds the database with the same fixture data used by the React frontend
 * mock datasets, enabling immediate local development without a real data
 * pipeline.
 */
final class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ── Admin ─────────────────────────────────────────────────────────────
        $admin = User::factory()->create([
            'name'     => 'Kenjie E. Jimenea',
            'email'    => 'admin@unc.edu.ph',
            'password' => Hash::make('password'),
            'role'     => 'admin',
        ]);

        // ── Directors ─────────────────────────────────────────────────────────
        $directors = [
            ['name' => 'Carl Ariel Fausto',      'email' => 'carl.fausto@unc.edu.ph',          'talent_group' => 'marching-band'],
            ['name' => 'Janeth Aquino',           'email' => 'janeth.aquino@unc.edu.ph',         'talent_group' => 'majorettes'],
            ['name' => 'Prof. Carmen Villanueva', 'email' => 'c.villanueva@unc.edu.ph',          'talent_group' => 'glee-club'],
            ['name' => 'Janeth Aquino',           'email' => 'janeth.aquino.dance@unc.edu.ph',   'talent_group' => 'dance-club'],
        ];

        foreach ($directors as $d) {
            User::factory()->create([
                ...$d,
                'password' => Hash::make('password'),
                'role'     => 'director',
            ]);
        }

        // ── Scholars / Trainees ───────────────────────────────────────────────
        $scholars = [
            [
                'name' => 'Francis Mae Aladano', 'email' => 'scholar@unc.edu.ph',
                'student_id' => '2023-00001', 'talent_group' => 'marching-band',
                'assigned_instrument' => 'Flute', 'scholarship_percentage' => 100,
            ],
            [
                'name' => 'Monray Andante', 'email' => 'monray.andante@unc.edu.ph',
                'student_id' => '2022-00145', 'talent_group' => 'marching-band',
                'assigned_instrument' => 'Alto Sax', 'scholarship_percentage' => 75,
            ],
            [
                'name' => 'Abkaye Avila', 'email' => 'abkaye.avila@unc.edu.ph',
                'student_id' => '2023-00298', 'talent_group' => 'marching-band',
                'assigned_instrument' => 'Trombone', 'scholarship_percentage' => 100,
            ],
            [
                'name' => 'Seth Jeziel Baider', 'email' => 'seth.baider@unc.edu.ph',
                'student_id' => '2023-00723', 'talent_group' => 'glee-club',
                'assigned_voice' => 'Tenor', 'scholarship_percentage' => 100,
            ],
            [
                'name' => 'Mark Aaron Banas', 'email' => 'mark.banas@unc.edu.ph',
                'student_id' => '2022-00891', 'talent_group' => 'glee-club',
                'assigned_voice' => 'Bass', 'scholarship_percentage' => 75,
            ],
            [
                'name' => 'Irish Josane Agor', 'email' => 'irish.agor@unc.edu.ph',
                'student_id' => '2023-00934', 'talent_group' => 'dance-club',
                'scholarship_percentage' => 100,
            ],
            [
                'name' => 'Reu Rosa Abueg', 'email' => 'reu.abueg@unc.edu.ph',
                'student_id' => '2023-00412', 'talent_group' => 'majorettes',
                'scholarship_percentage' => 75,
            ],
        ];

        foreach ($scholars as $s) {
            $user = User::factory()->create([
                ...$s,
                'password'           => Hash::make('password'),
                'role'               => 'scholar',
                'application_status' => 'approved',
                'training_status'    => 'completed',
                'year_level'         => '2nd Year',
                'course'             => 'Bachelor of Music',
            ]);

            // Create trainee profile
            $trainee = Trainee::create([
                'user_id'                 => $user->id,
                'current_status'          => 'completed',
                'instrument'              => $s['assigned_instrument'] ?? null,
                'voice'                   => $s['assigned_voice'] ?? null,
                'total_expected_sessions' => 30,
                'date_joined'             => now()->subMonths(6)->toDateString(),
                'completion_rate'         => 100,
            ]);

            // Seed a sample evaluation
            $director = User::where('talent_group', $user->talent_group)
                ->where('role', 'director')
                ->first();

            if ($director) {
                Evaluation::create([
                    'trainee_id'      => $trainee->id,
                    'evaluator_id'    => $director->id,
                    'rating'          => fake()->numberBetween(75, 98),
                    'notes'           => 'Excellent performance throughout the training period.',
                    'recommendation'  => 'continue',
                    'status'          => 'submitted',
                    'evaluation_date' => now()->subMonths(1)->toDateString(),
                    'semester'        => '1st Semester',
                    'academic_year'   => '2024-2025',
                ]);
            }
        }

        // ── Trainee in progress ───────────────────────────────────────────────
        $traineeUser = User::factory()->create([
            'name'               => 'Christiana Jean Alvarez',
            'email'              => 'training@unc.edu.ph',
            'student_id'         => '2024-00002',
            'password'           => Hash::make('password'),
            'role'               => 'student',
            'talent_group'       => 'glee-club',
            'application_status' => 'approved',
            'training_status'    => 'in_progress',
            'year_level'         => '2nd Year',
            'course'             => 'Bachelor of Music',
        ]);

        $activeTrainee = Trainee::create([
            'user_id'                 => $traineeUser->id,
            'current_status'          => 'active',
            'voice'                   => 'Soprano',
            'total_expected_sessions' => 30,
            'date_joined'             => now()->subMonths(2)->toDateString(),
            'completion_rate'         => 0,
        ]);

        // Seed 15 attendance records (10 present, 5 absent, 2 no-practice)
        $sessionDates = collect(range(1, 17))->map(
            fn (int $i) => now()->subDays($i * 3)->toDateString()
        );

        foreach ($sessionDates as $idx => $date) {
            AttendanceRecord::create([
                'trainee_id'   => $activeTrainee->id,
                'session_date' => $date,
                'no_practice'  => $idx >= 15, // last 2 are no-practice
                'status'       => $idx < 10 ? 'present' : 'absent',
            ]);
        }

        $activeTrainee->recalculateAndSaveCompletionRate();

        // ── Sample pending applications ───────────────────────────────────────
        $pendingApps = [
            [
                'applicant_name'       => 'John Paul Ramos',
                'applicant_email'      => 'john.ramos@student.unc.edu.ph',
                'applicant_student_id' => '2024-00678',
                'talent_group'         => 'marching-band',
                'instruments'          => 'Trumpet',
            ],
            [
                'applicant_name'       => 'Christopher James Alvarez',
                'applicant_email'      => 'christopheralvaroz@student.unc.edu.ph',
                'applicant_student_id' => '2024-01156',
                'talent_group'         => 'marching-band',
                'instruments'          => 'Percussion',
            ],
            [
                'applicant_name'       => 'Maria Santos',
                'applicant_email'      => 'mariacantoz@student.unc.edu.ph',
                'applicant_student_id' => '2024-01157',
                'talent_group'         => 'glee-club',
                'voices'               => 'Soprano',
            ],
        ];

        foreach ($pendingApps as $app) {
            Application::create([
                ...$app,
                'status'                         => 'pending',
                'applications_this_week_tracker' => 1,
                'applied_at'                     => now()->subDays(fake()->numberBetween(1, 7)),
                'applicant_year_level'           => '1st Year',
                'applicant_course'               => 'Bachelor of Music',
            ]);
        }
    }
}
