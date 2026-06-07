<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ScholarshipSeeder extends Seeder
{
    public function run(): void
    {
        // Scholars eligible for renewal
        $scholarEmails = [
            'juan.delacruz@unc.edu.ph'        => ['gpa' => 1.75, 'status' => 'approved'],
            'pedro.villanueva@unc.edu.ph'     => ['gpa' => 1.95, 'status' => 'approved'],
            'miguel.torres@unc.edu.ph'        => ['gpa' => 2.10, 'status' => 'pending'],
            'mariaclara.bautista@unc.edu.ph'  => ['gpa' => 1.50, 'status' => 'approved'],
            'liza.fernandez@unc.edu.ph'       => ['gpa' => 1.75, 'status' => 'approved'],
            'patricia.cruz@unc.edu.ph'        => ['gpa' => 2.25, 'status' => 'pending'],
            'nico.panganiban@unc.edu.ph'      => ['gpa' => 1.85, 'status' => 'approved'],
            'rina.pascual@unc.edu.ph'         => ['gpa' => 1.60, 'status' => 'approved'],
            'joy.espiritu@unc.edu.ph'         => ['gpa' => 2.00, 'status' => 'pending'],
        ];

        $now = now();

        foreach ($scholarEmails as $email => $data) {
            $user = User::where('email', $email)->first();
            if (!$user) continue;

            DB::table('scholarships')->insert([
                'user_id'      => $user->id,
                'semester'     => '2nd Semester',
                'year'         => 2026,
                'gpa'          => $data['gpa'],
                'documents'    => json_encode([]),
                'status'       => $data['status'],
                'reviewed_at'  => $data['status'] === 'approved' ? $now : null,
                'review_notes' => $data['status'] === 'approved' ? 'Meets all scholarship renewal requirements.' : null,
                'created_at'   => $now,
                'updated_at'   => $now,
            ]);
        }
    }
}
