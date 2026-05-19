<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

final class ApplicationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'           => $this->id,
            'user_id'      => $this->user_id,
            'talent_group' => $this->talent_group,
            'status'       => $this->status,

            // Structured personal info matching frontend Application.personalInfo shape
            'personal_info' => $this->personal_info,

            // Talent-specific fields
            'chapters'            => $this->chapters,
            'instruments'         => $this->instruments,
            'voices'              => $this->voices,
            'vocal_range'         => $this->vocal_range,
            'primary_dance_genre' => $this->primary_dance_genre,
            'years_of_experience' => $this->years_of_experience,

            // Content
            'experience'    => $this->experience,
            'motivation'    => $this->motivation,
            'documents'     => $this->documents ?? [],
            'portfolio_url' => $this->portfolio_url,

            // Decision metadata
            'denial_reason'   => $this->denial_reason,
            'denial_feedback' => $this->denial_feedback,
            'approval_notes'  => $this->approval_notes,

            // Timestamps
            'applied_at'  => $this->applied_at?->toISOString(),
            'created_at'  => $this->created_at?->toISOString(),
            'updated_at'  => $this->updated_at?->toISOString(),

            // Eager-loaded relations (conditionally included)
            'interview' => $this->whenLoaded('interview', fn () => new InterviewResource($this->interview)),
            'user'      => $this->whenLoaded('user', fn () => new UserResource($this->user)),
        ];
    }
}
