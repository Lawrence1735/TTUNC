<?php

namespace Database\Seeders;

use App\Models\Trainee;
use App\Models\User;
use Illuminate\Database\Seeder;

class TraineeSeeder extends Seeder
{
    public function run(): void
    {
        // Map: email => trainee data
        $traineeData = [
            // ── Marching Band scholars (active, high completion) ──────────────────
            'juan.delacruz@unc.edu.ph' => [
                'completion_rate'        => 87,
                'current_status'         => 'active',
                'instrument'             => 'Trumpet',
                'total_expected_sessions'=> 30,
                'date_joined'            => '2021-09-01',
                'chapters_completed'     => array_fill(1, 26, true) + array_fill(27, 4, false),
            ],
            'pedro.villanueva@unc.edu.ph' => [
                'completion_rate'        => 73,
                'current_status'         => 'active',
                'instrument'             => 'Clarinet',
                'total_expected_sessions'=> 30,
                'date_joined'            => '2021-09-01',
                'chapters_completed'     => array_fill(1, 22, true) + array_fill(23, 8, false),
            ],
            'miguel.torres@unc.edu.ph' => [
                'completion_rate'        => 60,
                'current_status'         => 'active',
                'instrument'             => 'Snare Drum',
                'total_expected_sessions'=> 30,
                'date_joined'            => '2022-09-01',
                'chapters_completed'     => array_fill(1, 18, true) + array_fill(19, 12, false),
            ],
            'carlo.mendoza@unc.edu.ph' => [
                'completion_rate'        => 40,
                'current_status'         => 'active',
                'instrument'             => 'Trombone',
                'total_expected_sessions'=> 30,
                'date_joined'            => '2022-09-01',
                'chapters_completed'     => array_fill(1, 12, true) + array_fill(13, 18, false),
            ],
            'rodel.aquino@unc.edu.ph' => [
                'completion_rate'        => 20,
                'current_status'         => 'active',
                'instrument'             => 'Baritone',
                'total_expected_sessions'=> 30,
                'date_joined'            => '2023-09-01',
                'chapters_completed'     => array_fill(1, 6, true) + array_fill(7, 24, false),
            ],
            // ── Glee Club scholars ─────────────────────────────────────────────────
            'mariaclara.bautista@unc.edu.ph' => [
                'completion_rate'        => 93,
                'current_status'         => 'active',
                'voice'                  => 'Soprano',
                'total_expected_sessions'=> 30,
                'date_joined'            => '2021-09-01',
                'chapters_completed'     => array_fill(1, 28, true) + array_fill(29, 2, false),
            ],
            'liza.fernandez@unc.edu.ph' => [
                'completion_rate'        => 83,
                'current_status'         => 'active',
                'voice'                  => 'Alto',
                'total_expected_sessions'=> 30,
                'date_joined'            => '2021-09-01',
                'chapters_completed'     => array_fill(1, 25, true) + array_fill(26, 5, false),
            ],
            'patricia.cruz@unc.edu.ph' => [
                'completion_rate'        => 67,
                'current_status'         => 'active',
                'voice'                  => 'Mezzo-Soprano',
                'total_expected_sessions'=> 30,
                'date_joined'            => '2022-09-01',
                'chapters_completed'     => array_fill(1, 20, true) + array_fill(21, 10, false),
            ],
            'rowena.castillo@unc.edu.ph' => [
                'completion_rate'        => 30,
                'current_status'         => 'active',
                'voice'                  => 'Tenor',
                'total_expected_sessions'=> 30,
                'date_joined'            => '2023-09-01',
                'chapters_completed'     => array_fill(1, 9, true) + array_fill(10, 21, false),
            ],
            // ── Dance Club scholars ────────────────────────────────────────────────
            'nico.panganiban@unc.edu.ph' => [
                'completion_rate'        => 80,
                'current_status'         => 'active',
                'total_expected_sessions'=> 30,
                'date_joined'            => '2021-09-01',
                'chapters_completed'     => array_fill(1, 24, true) + array_fill(25, 6, false),
            ],
            'kevin.soriano@unc.edu.ph' => [
                'completion_rate'        => 57,
                'current_status'         => 'active',
                'total_expected_sessions'=> 30,
                'date_joined'            => '2022-09-01',
                'chapters_completed'     => array_fill(1, 17, true) + array_fill(18, 13, false),
            ],
            'jessa.navarro@unc.edu.ph' => [
                'completion_rate'        => 47,
                'current_status'         => 'active',
                'total_expected_sessions'=> 30,
                'date_joined'            => '2022-09-01',
                'chapters_completed'     => array_fill(1, 14, true) + array_fill(15, 16, false),
            ],
            // ── Majorettes scholars ────────────────────────────────────────────────
            'rina.pascual@unc.edu.ph' => [
                'completion_rate'        => 90,
                'current_status'         => 'active',
                'total_expected_sessions'=> 30,
                'date_joined'            => '2021-09-01',
                'chapters_completed'     => array_fill(1, 27, true) + array_fill(28, 3, false),
            ],
            'joy.espiritu@unc.edu.ph' => [
                'completion_rate'        => 63,
                'current_status'         => 'active',
                'total_expected_sessions'=> 30,
                'date_joined'            => '2022-09-01',
                'chapters_completed'     => array_fill(1, 19, true) + array_fill(20, 11, false),
            ],
            'camille.reyes@unc.edu.ph' => [
                'completion_rate'        => 23,
                'current_status'         => 'active',
                'total_expected_sessions'=> 30,
                'date_joined'            => '2023-09-01',
                'chapters_completed'     => array_fill(1, 7, true) + array_fill(8, 23, false),
            ],
            // ── Trainees (students still in training) ─────────────────────────────
            'bong.alvarez@unc.edu.ph' => [
                'completion_rate'        => 10,
                'current_status'         => 'active',
                'instrument'             => 'Trumpet',
                'total_expected_sessions'=> 30,
                'date_joined'            => '2024-09-01',
                'chapters_completed'     => array_fill(1, 3, true) + array_fill(4, 27, false),
            ],
            'gelo.santos@unc.edu.ph' => [
                'completion_rate'        => 7,
                'current_status'         => 'active',
                'instrument'             => 'Clarinet',
                'total_expected_sessions'=> 30,
                'date_joined'            => '2024-09-01',
                'chapters_completed'     => array_fill(1, 2, true) + array_fill(3, 28, false),
            ],
            'rhea.buenaventura@unc.edu.ph' => [
                'completion_rate'        => 13,
                'current_status'         => 'active',
                'voice'                  => 'Soprano',
                'total_expected_sessions'=> 30,
                'date_joined'            => '2024-09-01',
                'chapters_completed'     => array_fill(1, 4, true) + array_fill(5, 26, false),
            ],
            'dan.mercado@unc.edu.ph' => [
                'completion_rate'        => 17,
                'current_status'         => 'active',
                'total_expected_sessions'=> 30,
                'date_joined'            => '2024-09-01',
                'chapters_completed'     => array_fill(1, 5, true) + array_fill(6, 25, false),
            ],
            'sofia.morales@unc.edu.ph' => [
                'completion_rate'        => 10,
                'current_status'         => 'active',
                'total_expected_sessions'=> 30,
                'date_joined'            => '2024-09-01',
                'chapters_completed'     => array_fill(1, 3, true) + array_fill(4, 27, false),
            ],
        ];

        foreach ($traineeData as $email => $data) {
            $user = User::where('email', $email)->first();
            if (!$user) continue;

            $chapters = $data['chapters_completed'] ?? [];
            // Normalize to string keys 1-30
            $chapterMap = [];
            for ($i = 1; $i <= 30; $i++) {
                $chapterMap[(string) $i] = $chapters[$i] ?? false;
            }

            Trainee::create([
                'user_id'                 => $user->id,
                'completion_rate'         => $data['completion_rate'],
                'current_status'          => $data['current_status'],
                'instrument'              => $data['instrument'] ?? null,
                'voice'                   => $data['voice'] ?? null,
                'total_expected_sessions' => $data['total_expected_sessions'],
                'date_joined'             => $data['date_joined'],
                'chapters_completed'      => json_encode($chapterMap),
            ]);
        }
    }
}
