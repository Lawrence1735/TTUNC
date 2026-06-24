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
            EngagementSeeder::class,        // 4. engagements & rehearsals
            EvaluationSeeder::class,        // 5. evaluations (needs trainees + directors)
            ScholarshipSeeder::class,       // 6. scholarship renewals (needs users)
            DocumentSeeder::class,          // 7. documents (contracts, reports, records)
            ProductSeeder::class,           // 8. inventory / products
        ]);
    }
}
