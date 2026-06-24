<?php

namespace Database\Seeders;

use App\Models\Application;
use App\Models\User;
use Illuminate\Database\Seeder;

class ApplicationSeeder extends Seeder
{
    public function run(): void
    {
        // Approved applications — one per active trainee (links application -> user -> trainee)
        $approved = [
            ['email'=>'trainee.band1@unc.edu.ph',       'talent_group'=>'marching-band','applicant_name'=>'Marco Reyes',    'applicant_student_id'=>'2025-0001','applicant_phone'=>'09171110001','applicant_year_level'=>'1st Year','applicant_course'=>'BS Computer Science',   'applicant_department'=>'College of Engineering',     'applicant_gender'=>'Male',  'applicant_age'=>'18'],
            ['email'=>'trainee.band2@unc.edu.ph',       'talent_group'=>'marching-band','applicant_name'=>'Aling Santos',   'applicant_student_id'=>'2025-0002','applicant_phone'=>'09171110002','applicant_year_level'=>'1st Year','applicant_course'=>'BS Civil Engineering',  'applicant_department'=>'College of Engineering',     'applicant_gender'=>'Male',  'applicant_age'=>'18'],
            ['email'=>'trainee.glee1@unc.edu.ph',       'talent_group'=>'glee-club',    'applicant_name'=>'Karen Lopez',    'applicant_student_id'=>'2025-0003','applicant_phone'=>'09171110003','applicant_year_level'=>'1st Year','applicant_course'=>'AB Communication',     'applicant_department'=>'College of Arts & Sciences', 'applicant_gender'=>'Female','applicant_age'=>'18'],
            ['email'=>'trainee.glee2@unc.edu.ph',       'talent_group'=>'glee-club',    'applicant_name'=>'Ryan Dela Cruz', 'applicant_student_id'=>'2025-0004','applicant_phone'=>'09171110004','applicant_year_level'=>'1st Year','applicant_course'=>'BS Education',          'applicant_department'=>'College of Education',       'applicant_gender'=>'Male',  'applicant_age'=>'18'],
            ['email'=>'trainee.dance1@unc.edu.ph',      'talent_group'=>'dance-club',   'applicant_name'=>'Anna Villanueva','applicant_student_id'=>'2025-0005','applicant_phone'=>'09171110005','applicant_year_level'=>'1st Year','applicant_course'=>'BS Tourism Management', 'applicant_department'=>'College of Business',        'applicant_gender'=>'Female','applicant_age'=>'18'],
            ['email'=>'trainee.dance2@unc.edu.ph',      'talent_group'=>'dance-club',   'applicant_name'=>'Chris Bautista', 'applicant_student_id'=>'2025-0006','applicant_phone'=>'09171110006','applicant_year_level'=>'1st Year','applicant_course'=>'BS Architecture',       'applicant_department'=>'College of Engineering',     'applicant_gender'=>'Male',  'applicant_age'=>'18'],
            ['email'=>'trainee.majorettes1@unc.edu.ph', 'talent_group'=>'majorettes',   'applicant_name'=>'Diana Torres',   'applicant_student_id'=>'2025-0007','applicant_phone'=>'09171110007','applicant_year_level'=>'1st Year','applicant_course'=>'BS Pharmacy',           'applicant_department'=>'College of Pharmacy',        'applicant_gender'=>'Female','applicant_age'=>'18'],
            ['email'=>'trainee.majorettes2@unc.edu.ph', 'talent_group'=>'majorettes',   'applicant_name'=>'Jenny Cruz',     'applicant_student_id'=>'2025-0008','applicant_phone'=>'09171110008','applicant_year_level'=>'1st Year','applicant_course'=>'BS Nursing',            'applicant_department'=>'College of Nursing',         'applicant_gender'=>'Female','applicant_age'=>'18'],
        ];
        foreach ($approved as $a) {
            $user = User::where('email', $a['email'])->first();
            Application::create([
                'user_id'                        => $user?->id,
                'talent_group'                   => $a['talent_group'],
                'status'                         => 'approved',
                'applicant_name'                 => $a['applicant_name'],
                'applicant_email'                => $a['email'],
                'applicant_student_id'           => $a['applicant_student_id'],
                'applicant_phone'                => $a['applicant_phone'],
                'applicant_year_level'           => $a['applicant_year_level'],
                'applicant_course'               => $a['applicant_course'],
                'applicant_department'           => $a['applicant_department'],
                'applicant_gender'               => $a['applicant_gender'],
                'applicant_age'                  => $a['applicant_age'],
                'applications_this_week_tracker' => 0,
                'applied_at'                     => now()->subDays(30),
            ]);
        }

        // Pending applications — new applicants not yet approved (1-2 per group for recruitment tab)
        $pending = [
            ['talent_group'=>'marching-band','status'=>'pending',            'applicant_name'=>'Ryan Ocampo',  'applicant_email'=>'ryan.ocampo@unc.edu.ph',  'applicant_student_id'=>'2025-0101','applicant_phone'=>'09171234567','applicant_year_level'=>'1st Year','applicant_course'=>'BS Computer Science',   'applicant_department'=>'College of Engineering',     'applicant_gender'=>'Male',  'applicant_age'=>'18'],
            ['talent_group'=>'marching-band','status'=>'interview_scheduled','applicant_name'=>'Lea Domingo',  'applicant_email'=>'lea.domingo@unc.edu.ph',  'applicant_student_id'=>'2025-0102','applicant_phone'=>'09182345678','applicant_year_level'=>'1st Year','applicant_course'=>'BS Nursing',            'applicant_department'=>'College of Nursing',         'applicant_gender'=>'Female','applicant_age'=>'17'],
            ['talent_group'=>'glee-club',    'status'=>'pending',            'applicant_name'=>'Nina Herrera', 'applicant_email'=>'nina.herrera@unc.edu.ph', 'applicant_student_id'=>'2025-0103','applicant_phone'=>'09204567890','applicant_year_level'=>'1st Year','applicant_course'=>'AB Communication',     'applicant_department'=>'College of Arts & Sciences', 'applicant_gender'=>'Female','applicant_age'=>'18'],
            ['talent_group'=>'dance-club',   'status'=>'pending',            'applicant_name'=>'Tricia Manalo','applicant_email'=>'tricia.manalo@unc.edu.ph','applicant_student_id'=>'2025-0104','applicant_phone'=>'09226789012','applicant_year_level'=>'1st Year','applicant_course'=>'BS Tourism Management','applicant_department'=>'College of Business',        'applicant_gender'=>'Female','applicant_age'=>'17'],
            ['talent_group'=>'majorettes',   'status'=>'pending',            'applicant_name'=>'Bianca Salazar','applicant_email'=>'bianca.salazar@unc.edu.ph','applicant_student_id'=>'2025-0105','applicant_phone'=>'09237890123','applicant_year_level'=>'1st Year','applicant_course'=>'BS Pharmacy',          'applicant_department'=>'College of Pharmacy',        'applicant_gender'=>'Female','applicant_age'=>'18'],
        ];
        foreach ($pending as $a) {
            Application::create(array_merge($a, [
                'user_id'                        => null,
                'applications_this_week_tracker' => 0,
                'applied_at'                     => now()->subDays(rand(1, 5)),
            ]));
        }
    }
}