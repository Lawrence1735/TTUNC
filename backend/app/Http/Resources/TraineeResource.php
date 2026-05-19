<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

final class TraineeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                       => $this->id,
            'user_id'                  => $this->user_id,
            'completion_rate'          => $this->completion_rate,
            'computed_completion_rate' => $this->computed_completion_rate,
            'attendance_rate'          => $this->attendance_rate,
            'current_status'           => $this->current_status,
            'chapter'                  => $this->chapter,
            'instrument'               => $this->instrument,
            'voice'                    => $this->voice,
            'total_expected_sessions'  => $this->total_expected_sessions,
            'date_joined'              => $this->date_joined?->toDateString(),
            'created_at'               => $this->created_at?->toISOString(),

            'user'               => $this->whenLoaded('user', fn () => new UserResource($this->user)),
            'attendance_records' => $this->whenLoaded('attendanceRecords', fn () => AttendanceRecordResource::collection($this->attendanceRecords)),
            'evaluations'        => $this->whenLoaded('evaluations', fn () => EvaluationResource::collection($this->evaluations)),
        ];
    }
}
