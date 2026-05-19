<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

final class AttendanceRecordResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'           => $this->id,
            'trainee_id'   => $this->trainee_id,
            'session_date' => $this->session_date?->toDateString(),
            'no_practice'  => $this->no_practice,
            'status'       => $this->status,
            'notes'        => $this->notes,
            'created_at'   => $this->created_at?->toISOString(),
        ];
    }
}
