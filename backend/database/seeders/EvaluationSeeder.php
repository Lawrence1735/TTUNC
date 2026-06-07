<?php

namespace Database\Seeders;

use App\Models\Evaluation;
use App\Models\Trainee;
use App\Models\User;
use Illuminate\Database\Seeder;

class EvaluationSeeder extends Seeder
{
    public function run(): void
    {
        // Get directors by talent group
        $directors = User::where('role', 'director')->get()->keyBy('talent_group');

        // Trainees to evaluate (scholars with decent completion)
        $toEvaluate = [
            'juan.delacruz@unc.edu.ph'        => ['rating' => 88, 'adjectival' => 'Outstanding',       'recommend' => true,  'strengths' => 'Excellent trumpet technique and leadership.', 'improvements' => 'Continue developing sight-reading skills.'],
            'pedro.villanueva@unc.edu.ph'     => ['rating' => 75, 'adjectival' => 'Very Satisfactory',  'recommend' => true,  'strengths' => 'Consistent attendance and team player.', 'improvements' => 'Work on tone production consistency.'],
            'mariaclara.bautista@unc.edu.ph'  => ['rating' => 92, 'adjectival' => 'Outstanding',       'recommend' => true,  'strengths' => 'Exceptional vocal range and pitch accuracy.', 'improvements' => 'Continue breath control exercises.'],
            'liza.fernandez@unc.edu.ph'       => ['rating' => 82, 'adjectival' => 'Outstanding',       'recommend' => true,  'strengths' => 'Strong alto foundation and musicality.', 'improvements' => 'Improve solo performance confidence.'],
            'nico.panganiban@unc.edu.ph'      => ['rating' => 79, 'adjectival' => 'Very Satisfactory',  'recommend' => true,  'strengths' => 'Dynamic stage presence and energy.', 'improvements' => 'Focus on precision in formation transitions.'],
            'kevin.soriano@unc.edu.ph'        => ['rating' => 71, 'adjectival' => 'Satisfactory',      'recommend' => true,  'strengths' => 'Good rhythm and coordination.', 'improvements' => 'Improve musicality and expression in choreography.'],
            'rina.pascual@unc.edu.ph'         => ['rating' => 91, 'adjectival' => 'Outstanding',       'recommend' => true,  'strengths' => 'Exceptional baton technique and crowd engagement.', 'improvements' => 'Maintain current performance level.'],
        ];

        foreach ($toEvaluate as $email => $data) {
            $user    = User::where('email', $email)->first();
            if (!$user) continue;

            $trainee  = Trainee::where('user_id', $user->id)->first();
            if (!$trainee) continue;

            $director = $directors->get($user->talent_group);
            if (!$director) continue;

            $sectionA = [
                'reportsRegularly'       => 4,
                'followsInstructions'    => 4,
                'showsInitiative'        => intval($data['rating'] / 25),
                'workWithOthers'         => 4,
                'maintainsAttendance'    => 5,
            ];
            $sectionB = [
                'technicalSkill'         => intval($data['rating'] / 20),
                'musicalityOrTechnique'  => 4,
                'stagePrescence'         => 4,
                'adaptability'           => 3,
            ];

            Evaluation::create([
                'trainee_id'           => $trainee->id,
                'evaluator_id'         => $director->id,
                'rating'               => $data['rating'],
                'section_a'            => json_encode($sectionA),
                'section_b'            => json_encode($sectionB),
                'section_c'            => null,
                'notes'                => $data['improvements'],
                'strengths'            => $data['strengths'],
                'improvements'         => $data['improvements'],
                'recommendation'       => 'continue',
                'status'               => 'submitted',
                'semester'             => '2nd Semester',
                'academic_year'        => '2025-2026',
                'adjectival_rating'    => $data['adjectival'],
                'recommend_for_renewal'=> $data['recommend'],
                'evaluation_date'      => '2026-05-15',
            ]);
        }
    }
}
