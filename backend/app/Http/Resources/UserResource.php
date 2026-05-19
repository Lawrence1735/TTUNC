<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

final class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                     => $this->id,
            'name'                   => $this->name,
            'email'                  => $this->email,
            'student_id'             => $this->student_id,
            'role'                   => $this->role,
            'talent_group'           => $this->talent_group,
            'phone'                  => $this->phone,
            'year_level'             => $this->year_level,
            'course'                 => $this->course,
            'department'             => $this->department,
            'address'                => $this->address,
            'emergency_contact'      => $this->emergency_contact,
            'emergency_phone'        => $this->emergency_phone,
            'application_status'     => $this->application_status,
            'training_status'        => $this->training_status,
            'scholarship_percentage' => $this->scholarship_percentage,
            'assigned_instrument'    => $this->assigned_instrument,
            'assigned_voice'         => $this->assigned_voice,
            'created_at'             => $this->created_at?->toISOString(),
        ];
    }
}
