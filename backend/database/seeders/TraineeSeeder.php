<?php

namespace Database\Seeders;

use App\Models\Application;
use App\Models\Trainee;
use App\Models\User;
use Illuminate\Database\Seeder;

class TraineeSeeder extends Seeder
{
    public function run(): void
    {
        // ──────────────────────────────────────────────────────────────
        // 1. SCHOLARS — completed training; application_id = null
        // ──────────────────────────────────────────────────────────────
        $scholars = [
            ['email'=>'juan.delacruz@unc.edu.ph',       'instrument'=>'Trumpet',    'voice'=>null],
            ['email'=>'pedro.villanueva@unc.edu.ph',     'instrument'=>'Clarinet',   'voice'=>null],
            ['email'=>'mariaclara.bautista@unc.edu.ph',  'instrument'=>null,          'voice'=>'Soprano'],
            ['email'=>'liza.fernandez@unc.edu.ph',       'instrument'=>null,          'voice'=>'Alto'],
            ['email'=>'nico.panganiban@unc.edu.ph',      'instrument'=>null,          'voice'=>null],
            ['email'=>'kevin.soriano@unc.edu.ph',        'instrument'=>null,          'voice'=>null],
            ['email'=>'rina.pascual@unc.edu.ph',         'instrument'=>null,          'voice'=>null],
            ['email'=>'joy.espiritu@unc.edu.ph',         'instrument'=>null,          'voice'=>null],
        ];

        foreach ($scholars as $s) {
            $user = User::where('email', $s['email'])->first();
            if (!$user) continue;
            Trainee::create([
                'user_id'                 => $user->id,
                'application_id'          => null,
                'completion_rate'         => 100,
                'current_status'          => 'completed',
                'instrument'              => $s['instrument'],
                'voice'                   => $s['voice'],
                'total_expected_sessions' => 80,
                'date_joined'             => '2023-06-01',
            ]);
        }

        // ──────────────────────────────────────────────────────────────
        // 2. ACTIVE TRAINEES — linked to approved Application
        // ──────────────────────────────────────────────────────────────
        $trainees = [
            ['email'=>'trainee.band1@unc.edu.ph',        'instrument'=>'Trumpet',    'voice'=>null],
            ['email'=>'trainee.band2@unc.edu.ph',        'instrument'=>'Snare Drum', 'voice'=>null],
            ['email'=>'trainee.glee1@unc.edu.ph',        'instrument'=>null,          'voice'=>'Soprano'],
            ['email'=>'trainee.glee2@unc.edu.ph',        'instrument'=>null,          'voice'=>'Alto'],
            ['email'=>'trainee.dance1@unc.edu.ph',       'instrument'=>null,          'voice'=>null],
            ['email'=>'trainee.dance2@unc.edu.ph',       'instrument'=>null,          'voice'=>null],
            ['email'=>'trainee.majorettes1@unc.edu.ph',  'instrument'=>null,          'voice'=>null],
            ['email'=>'trainee.majorettes2@unc.edu.ph',  'instrument'=>null,          'voice'=>null],
        ];

        foreach ($trainees as $t) {
            $user = User::where('email', $t['email'])->first();
            if (!$user) continue;
            $application = Application::where('applicant_email', $t['email'])
                ->where('status', 'approved')
                ->first();
            Trainee::create([
                'user_id'                 => $user->id,
                'application_id'          => $application?->id,
                'completion_rate'         => rand(10, 40),
                'current_status'          => 'active',
                'instrument'              => $t['instrument'],
                'voice'                   => $t['voice'],
                'total_expected_sessions' => 30,
                'date_joined'             => '2025-06-01',
            ]);
        }
    }
}