<?php

namespace Database\Seeders;

use App\Models\Application;
use App\Models\User;
use Illuminate\Database\Seeder;

class ApplicationSeeder extends Seeder
{
    public function run(): void
    {
        $applications = [
            // Marching Band — pending
            [
                'talent_group'           => 'marching-band',
                'status'                 => 'pending',
                'applicant_name'         => 'Ryan Ocampo',
                'applicant_email'        => 'ryan.ocampo@unc.edu.ph',
                'applicant_student_id'   => '2025-0101',
                'applicant_phone'        => '09171234567',
                'applicant_year_level'   => '1st Year',
                'applicant_course'       => 'BS Computer Science',
                'applicant_department'   => 'College of Engineering',
                'applicant_gender'       => 'Male',
                'applicant_age'          => '18',
                'years_of_experience'    => '3',
            ],
            [
                'talent_group'           => 'marching-band',
                'status'                 => 'pending',
                'applicant_name'         => 'Lea Domingo',
                'applicant_email'        => 'lea.domingo@unc.edu.ph',
                'applicant_student_id'   => '2025-0102',
                'applicant_phone'        => '09182345678',
                'applicant_year_level'   => '1st Year',
                'applicant_course'       => 'BS Nursing',
                'applicant_department'   => 'College of Nursing',
                'applicant_gender'       => 'Female',
                'applicant_age'          => '17',
                'years_of_experience'    => '2',
            ],
            // Marching Band — interview_scheduled
            [
                'talent_group'           => 'marching-band',
                'status'                 => 'interview_scheduled',
                'applicant_name'         => 'Marco Ramos',
                'applicant_email'        => 'marco.ramos@unc.edu.ph',
                'applicant_student_id'   => '2025-0103',
                'applicant_phone'        => '09193456789',
                'applicant_year_level'   => '1st Year',
                'applicant_course'       => 'BS Civil Engineering',
                'applicant_department'   => 'College of Engineering',
                'applicant_gender'       => 'Male',
                'applicant_age'          => '18',
                'years_of_experience'    => '1',
            ],
            // Glee Club — pending
            [
                'talent_group'           => 'glee-club',
                'status'                 => 'pending',
                'applicant_name'         => 'Nina Herrera',
                'applicant_email'        => 'nina.herrera@unc.edu.ph',
                'applicant_student_id'   => '2025-0104',
                'applicant_phone'        => '09204567890',
                'applicant_year_level'   => '1st Year',
                'applicant_course'       => 'AB Communication',
                'applicant_department'   => 'College of Arts & Sciences',
                'applicant_gender'       => 'Female',
                'applicant_age'          => '18',
                'vocal_range'            => 'Soprano',
                'years_of_experience'    => '4',
            ],
            [
                'talent_group'           => 'glee-club',
                'status'                 => 'pending',
                'applicant_name'         => 'Alex Flores',
                'applicant_email'        => 'alex.flores@unc.edu.ph',
                'applicant_student_id'   => '2025-0105',
                'applicant_phone'        => '09215678901',
                'applicant_year_level'   => '2nd Year',
                'applicant_course'       => 'BS Psychology',
                'applicant_department'   => 'College of Arts & Sciences',
                'applicant_gender'       => 'Male',
                'applicant_age'          => '19',
                'vocal_range'            => 'Tenor',
                'years_of_experience'    => '2',
            ],
            // Dance Club — pending
            [
                'talent_group'           => 'dance-club',
                'status'                 => 'pending',
                'applicant_name'         => 'Tricia Manalo',
                'applicant_email'        => 'tricia.manalo@unc.edu.ph',
                'applicant_student_id'   => '2025-0106',
                'applicant_phone'        => '09226789012',
                'applicant_year_level'   => '1st Year',
                'applicant_course'       => 'BS Tourism Management',
                'applicant_department'   => 'College of Business',
                'applicant_gender'       => 'Female',
                'applicant_age'          => '17',
                'primary_dance_genre'    => 'Contemporary',
                'years_of_experience'    => '5',
            ],
            // Majorettes — pending
            [
                'talent_group'           => 'majorettes',
                'status'                 => 'pending',
                'applicant_name'         => 'Bianca Salazar',
                'applicant_email'        => 'bianca.salazar@unc.edu.ph',
                'applicant_student_id'   => '2025-0107',
                'applicant_phone'        => '09237890123',
                'applicant_year_level'   => '1st Year',
                'applicant_course'       => 'BS Pharmacy',
                'applicant_department'   => 'College of Pharmacy',
                'applicant_gender'       => 'Female',
                'applicant_age'          => '18',
                'years_of_experience'    => '3',
            ],
            // Marching Band — approved (already scholars, linked user)
            [
                'talent_group'           => 'marching-band',
                'status'                 => 'approved',
                'applicant_name'         => 'Juan Dela Cruz',
                'applicant_email'        => 'juan.delacruz@unc.edu.ph',
                'applicant_student_id'   => '2021-0001',
                'applicant_phone'        => '09171110001',
                'applicant_year_level'   => '3rd Year',
                'applicant_course'       => 'BS Computer Science',
                'applicant_department'   => 'College of Engineering',
                'applicant_gender'       => 'Male',
                'applicant_age'          => '21',
                'years_of_experience'    => '5',
            ],
        ];

        foreach ($applications as $app) {
            // Link user if exists
            $user = User::where('email', $app['applicant_email'])->first();
            Application::create(array_merge($app, [
                'user_id' => $user?->id,
                'applications_this_week_tracker' => 0,
            ]));
        }
    }
}
