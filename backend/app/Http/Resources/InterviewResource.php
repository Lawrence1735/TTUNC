<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

final class InterviewResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'application_id' => $this->application_id,
            'reviewer_id'    => $this->reviewer_id,
            'scheduled_at'   => $this->scheduled_at?->toISOString(),
            'venue'          => $this->venue,
            'notes'          => $this->notes,
            'outcome'        => $this->outcome,
            'outcome_notes'  => $this->outcome_notes,
            'completed_at'   => $this->completed_at?->toISOString(),
            'created_at'     => $this->created_at?->toISOString(),

            'reviewer'     => $this->whenLoaded('reviewer', fn () => new UserResource($this->reviewer)),
            'application'  => $this->whenLoaded('application', fn () => new ApplicationResource($this->application)),
        ];
    }
}
