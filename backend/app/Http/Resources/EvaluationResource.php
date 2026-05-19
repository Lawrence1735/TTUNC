<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

final class EvaluationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                     => $this->id,
            'trainee_id'             => $this->trainee_id,
            'evaluator_id'           => $this->evaluator_id,
            'rating'                 => $this->rating,
            'adjectival_rating_label'=> $this->adjectival_rating_label,
            'section_a'              => $this->section_a,
            'section_b'              => $this->section_b,
            'section_c'              => $this->section_c,
            'notes'                  => $this->notes,
            'strengths'              => $this->strengths,
            'improvements'           => $this->improvements,
            'recommendation'         => $this->recommendation,
            'status'                 => $this->status,
            'semester'               => $this->semester,
            'academic_year'          => $this->academic_year,
            'adjectival_rating'      => $this->adjectival_rating,
            'recommend_for_renewal'  => $this->recommend_for_renewal,
            'evaluation_date'        => $this->evaluation_date?->toDateString(),
            'created_at'             => $this->created_at?->toISOString(),

            'trainee'   => $this->whenLoaded('trainee', fn () => new TraineeResource($this->trainee)),
            'evaluator' => $this->whenLoaded('evaluator', fn () => new UserResource($this->evaluator)),
        ];
    }
}
