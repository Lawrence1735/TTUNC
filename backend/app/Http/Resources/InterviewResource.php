<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

final class InterviewResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'application_id' => $this->application_id,
            'applicant_name' => $this->application?->applicant_name ?? null,
            'date'           => Carbon::parse($this->scheduled_at)->toDateString(),
            'time'           => Carbon::parse($this->scheduled_at)->format('H:i'),
            'venue'          => $this->venue,
            'notes'          => $this->notes,
            'status'         => $this->outcome ?? 'scheduled',
        ];
    }
}
