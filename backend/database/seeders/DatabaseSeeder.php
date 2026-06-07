<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $this->call([
            UserSeeder::class,              // 1. users (admin, directors, scholars, trainees)
            ApplicationSeeder::class,       // 2. recruitment applications
            TraineeSeeder::class,           // 3. trainee records (linked to users)
            AttendanceRecordSeeder::class,  // 4. attendance records for training
            EngagementSeeder::class,        // 5. engagements & rehearsals
            EvaluationSeeder::class,        // 6. evaluations (needs trainees + directors)
            ScholarshipSeeder::class,       // 7. scholarship renewals (needs users)
            DocumentSeeder::class,          // 8. documents (contracts, reports, records)
            ProductSeeder::class,           // 9. inventory / products
        ]);
    }
}
