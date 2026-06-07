<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // ── Admin ─────────────────────────────────────────────────────────────────
        User::create([
            'name'         => 'Admin User',
            'email'        => 'admin@unc.edu.ph',
            'password'     => Hash::make('password'),
            'role'         => 'admin',
            'student_id'   => null,
        ]);

        // ── Directors (one per talent group) ─────────────────────────────────────
        $directors = [
            ['name' => 'Maria Santos',  'email' => 'director.band@unc.edu.ph',      'talent_group' => 'marching-band'],
            ['name' => 'Jose Reyes',    'email' => 'director.glee@unc.edu.ph',       'talent_group' => 'glee-club'],
            ['name' => 'Ana Garcia',    'email' => 'director.dance@unc.edu.ph',      'talent_group' => 'dance-club'],
            ['name' => 'Carmen Lopez',  'email' => 'director.majorettes@unc.edu.ph', 'talent_group' => 'majorettes'],
        ];

        foreach ($directors as $d) {
            User::create([
                'name'         => $d['name'],
                'email'        => $d['email'],
                'password'     => Hash::make('password'),
                'role'         => 'director',
                'talent_group' => $d['talent_group'],
            ]);
        }

        // ── Scholars (approved, active) ───────────────────────────────────────────
        $scholars = [
            // Marching Band
            ['name' => 'Juan Dela Cruz',    'email' => 'juan.delacruz@unc.edu.ph',    'talent_group' => 'marching-band', 'student_id' => '2021-0001', 'course' => 'BS Computer Science',     'year_level' => '3rd Year', 'instrument' => 'Trumpet'],
            ['name' => 'Pedro Villanueva',  'email' => 'pedro.villanueva@unc.edu.ph', 'talent_group' => 'marching-band', 'student_id' => '2021-0002', 'course' => 'BS Information Technology','year_level' => '2nd Year', 'instrument' => 'Clarinet'],
            ['name' => 'Miguel Torres',     'email' => 'miguel.torres@unc.edu.ph',    'talent_group' => 'marching-band', 'student_id' => '2022-0003', 'course' => 'BS Civil Engineering',    'year_level' => '2nd Year', 'instrument' => 'Snare Drum'],
            ['name' => 'Carlo Mendoza',     'email' => 'carlo.mendoza@unc.edu.ph',    'talent_group' => 'marching-band', 'student_id' => '2022-0004', 'course' => 'BS Nursing',              'year_level' => '1st Year', 'instrument' => 'Trombone'],
            ['name' => 'Rodel Aquino',      'email' => 'rodel.aquino@unc.edu.ph',     'talent_group' => 'marching-band', 'student_id' => '2023-0005', 'course' => 'BSBA Management',        'year_level' => '1st Year', 'instrument' => 'Baritone'],
            // Glee Club
            ['name' => 'Maria Clara Bautista', 'email' => 'mariaclara.bautista@unc.edu.ph', 'talent_group' => 'glee-club', 'student_id' => '2021-0006', 'course' => 'AB Communication',    'year_level' => '3rd Year', 'voice' => 'Soprano'],
            ['name' => 'Liza Fernandez',    'email' => 'liza.fernandez@unc.edu.ph',   'talent_group' => 'glee-club',    'student_id' => '2021-0007', 'course' => 'BS Psychology',           'year_level' => '3rd Year', 'voice' => 'Alto'],
            ['name' => 'Patricia Cruz',     'email' => 'patricia.cruz@unc.edu.ph',    'talent_group' => 'glee-club',    'student_id' => '2022-0008', 'course' => 'BS Education',            'year_level' => '2nd Year', 'voice' => 'Mezzo-Soprano'],
            ['name' => 'Rowena Castillo',   'email' => 'rowena.castillo@unc.edu.ph',  'talent_group' => 'glee-club',    'student_id' => '2023-0009', 'course' => 'BS Accountancy',          'year_level' => '1st Year', 'voice' => 'Tenor'],
            // Dance Club
            ['name' => 'Nico Panganiban',   'email' => 'nico.panganiban@unc.edu.ph',  'talent_group' => 'dance-club',   'student_id' => '2021-0010', 'course' => 'BS Tourism Management',  'year_level' => '3rd Year'],
            ['name' => 'Kevin Soriano',     'email' => 'kevin.soriano@unc.edu.ph',    'talent_group' => 'dance-club',   'student_id' => '2022-0011', 'course' => 'BS Hospitality Management','year_level' => '2nd Year'],
            ['name' => 'Jessa Navarro',     'email' => 'jessa.navarro@unc.edu.ph',    'talent_group' => 'dance-club',   'student_id' => '2022-0012', 'course' => 'BS Architecture',        'year_level' => '2nd Year'],
            // Majorettes
            ['name' => 'Rina Pascual',      'email' => 'rina.pascual@unc.edu.ph',     'talent_group' => 'majorettes',   'student_id' => '2021-0013', 'course' => 'BS Pharmacy',            'year_level' => '3rd Year'],
            ['name' => 'Joy Espiritu',      'email' => 'joy.espiritu@unc.edu.ph',     'talent_group' => 'majorettes',   'student_id' => '2022-0014', 'course' => 'BS Medical Technology',  'year_level' => '2nd Year'],
            ['name' => 'Camille Reyes',     'email' => 'camille.reyes@unc.edu.ph',    'talent_group' => 'majorettes',   'student_id' => '2023-0015', 'course' => 'BS Nursing',             'year_level' => '1st Year'],
        ];

        foreach ($scholars as $s) {
            User::create([
                'name'               => $s['name'],
                'email'              => $s['email'],
                'password'           => Hash::make('password'),
                'role'               => 'scholar',
                'talent_group'       => $s['talent_group'],
                'student_id'         => $s['student_id'],
                'course'             => $s['course'] ?? null,
                'year_level'         => $s['year_level'] ?? null,
                'application_status' => 'approved',
                'training_status'    => 'in_progress',
            ]);
        }

        // ── Trainees (currently in training) ─────────────────────────────────────
        $trainees = [
            ['name' => 'Bong Alvarez',    'email' => 'bong.alvarez@unc.edu.ph',    'talent_group' => 'marching-band', 'student_id' => '2024-0016', 'course' => 'BS Computer Science',    'year_level' => '1st Year'],
            ['name' => 'Gelo Santos',     'email' => 'gelo.santos@unc.edu.ph',     'talent_group' => 'marching-band', 'student_id' => '2024-0017', 'course' => 'BS Information Technology','year_level' => '1st Year'],
            ['name' => 'Rhea Buenaventura','email'=> 'rhea.buenaventura@unc.edu.ph','talent_group' => 'glee-club',    'student_id' => '2024-0018', 'course' => 'AB Communication',       'year_level' => '1st Year'],
            ['name' => 'Dan Mercado',     'email' => 'dan.mercado@unc.edu.ph',     'talent_group' => 'dance-club',   'student_id' => '2024-0019', 'course' => 'BS Tourism Management',  'year_level' => '1st Year'],
            ['name' => 'Sofia Morales',   'email' => 'sofia.morales@unc.edu.ph',   'talent_group' => 'majorettes',   'student_id' => '2024-0020', 'course' => 'BS Nursing',             'year_level' => '1st Year'],
        ];

        foreach ($trainees as $t) {
            User::create([
                'name'               => $t['name'],
                'email'              => $t['email'],
                'password'           => Hash::make('password'),
                'role'               => 'student',
                'talent_group'       => $t['talent_group'],
                'student_id'         => $t['student_id'],
                'course'             => $t['course'] ?? null,
                'year_level'         => $t['year_level'] ?? null,
                'application_status' => 'approved',
                'training_status'    => 'in_progress',
            ]);
        }
    }
}
