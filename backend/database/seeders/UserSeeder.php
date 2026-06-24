<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Admin
        User::create(['name'=>'Admin User','email'=>'admin@unc.edu.ph','password'=>Hash::make('password'),'role'=>'admin']);

        // Directors (1 per group)
        $directors = [
            ['name'=>'Maria Santos', 'email'=>'director.band@unc.edu.ph',       'talent_group'=>'marching-band'],
            ['name'=>'Jose Reyes',   'email'=>'director.glee@unc.edu.ph',        'talent_group'=>'glee-club'],
            ['name'=>'Ana Garcia',   'email'=>'director.dance@unc.edu.ph',       'talent_group'=>'dance-club'],
            ['name'=>'Carmen Lopez', 'email'=>'director.majorettes@unc.edu.ph',  'talent_group'=>'majorettes'],
        ];
        foreach ($directors as $d) {
            User::create(['name'=>$d['name'],'email'=>$d['email'],'password'=>Hash::make('password'),'role'=>'director','talent_group'=>$d['talent_group']]);
        }

        // Scholars (2 per group, role=scholar — training completed)
        $scholars = [
            // Marching Band
            ['name'=>'Juan Dela Cruz',   'email'=>'juan.delacruz@unc.edu.ph',       'talent_group'=>'marching-band','student_id'=>'2021-0001','course'=>'BS Computer Science',    'year_level'=>'3rd Year'],
            ['name'=>'Pedro Villanueva', 'email'=>'pedro.villanueva@unc.edu.ph',     'talent_group'=>'marching-band','student_id'=>'2021-0002','course'=>'BS Information Technology','year_level'=>'2nd Year'],
            // Glee Club
            ['name'=>'Maria Clara Bautista','email'=>'mariaclara.bautista@unc.edu.ph','talent_group'=>'glee-club','student_id'=>'2021-0006','course'=>'AB Communication','year_level'=>'3rd Year'],
            ['name'=>'Liza Fernandez',   'email'=>'liza.fernandez@unc.edu.ph',       'talent_group'=>'glee-club',    'student_id'=>'2021-0007','course'=>'BS Psychology',          'year_level'=>'3rd Year'],
            // Dance Club
            ['name'=>'Nico Panganiban',  'email'=>'nico.panganiban@unc.edu.ph',      'talent_group'=>'dance-club',   'student_id'=>'2021-0010','course'=>'BS Tourism Management',  'year_level'=>'3rd Year'],
            ['name'=>'Kevin Soriano',    'email'=>'kevin.soriano@unc.edu.ph',         'talent_group'=>'dance-club',   'student_id'=>'2022-0011','course'=>'BS Hospitality Management','year_level'=>'2nd Year'],
            // Majorettes
            ['name'=>'Rina Pascual',     'email'=>'rina.pascual@unc.edu.ph',          'talent_group'=>'majorettes',   'student_id'=>'2021-0013','course'=>'BS Pharmacy',            'year_level'=>'3rd Year'],
            ['name'=>'Joy Espiritu',     'email'=>'joy.espiritu@unc.edu.ph',           'talent_group'=>'majorettes',   'student_id'=>'2022-0014','course'=>'BS Medical Technology',  'year_level'=>'2nd Year'],
        ];
        foreach ($scholars as $s) {
            User::create(['name'=>$s['name'],'email'=>$s['email'],'password'=>Hash::make('password'),'role'=>'scholar','talent_group'=>$s['talent_group'],'student_id'=>$s['student_id'],'course'=>$s['course'],'year_level'=>$s['year_level']]);
        }

        // Active trainees (2 per group, role=student — currently in training)
        $trainees = [
            // Marching Band
            ['name'=>'Marco Reyes',    'email'=>'trainee.band1@unc.edu.ph',       'talent_group'=>'marching-band','student_id'=>'2025-0001','course'=>'BS Computer Science',   'year_level'=>'1st Year'],
            ['name'=>'Aling Santos',   'email'=>'trainee.band2@unc.edu.ph',       'talent_group'=>'marching-band','student_id'=>'2025-0002','course'=>'BS Civil Engineering',  'year_level'=>'1st Year'],
            // Glee Club
            ['name'=>'Karen Lopez',    'email'=>'trainee.glee1@unc.edu.ph',       'talent_group'=>'glee-club',    'student_id'=>'2025-0003','course'=>'AB Communication',      'year_level'=>'1st Year'],
            ['name'=>'Ryan Dela Cruz', 'email'=>'trainee.glee2@unc.edu.ph',       'talent_group'=>'glee-club',    'student_id'=>'2025-0004','course'=>'BS Education',          'year_level'=>'1st Year'],
            // Dance Club
            ['name'=>'Anna Villanueva','email'=>'trainee.dance1@unc.edu.ph',      'talent_group'=>'dance-club',   'student_id'=>'2025-0005','course'=>'BS Tourism Management', 'year_level'=>'1st Year'],
            ['name'=>'Chris Bautista', 'email'=>'trainee.dance2@unc.edu.ph',      'talent_group'=>'dance-club',   'student_id'=>'2025-0006','course'=>'BS Architecture',       'year_level'=>'1st Year'],
            // Majorettes
            ['name'=>'Diana Torres',   'email'=>'trainee.majorettes1@unc.edu.ph', 'talent_group'=>'majorettes',   'student_id'=>'2025-0007','course'=>'BS Pharmacy',           'year_level'=>'1st Year'],
            ['name'=>'Jenny Cruz',     'email'=>'trainee.majorettes2@unc.edu.ph', 'talent_group'=>'majorettes',   'student_id'=>'2025-0008','course'=>'BS Nursing',            'year_level'=>'1st Year'],
        ];
        foreach ($trainees as $t) {
            User::create(['name'=>$t['name'],'email'=>$t['email'],'password'=>Hash::make('password'),'role'=>'student','talent_group'=>$t['talent_group'],'student_id'=>$t['student_id'],'course'=>$t['course'],'year_level'=>$t['year_level']]);
        }
    }
}