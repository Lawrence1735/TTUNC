<?php

declare(strict_types=1);

namespace App\Http\Requests\Training;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Validates a batch attendance upsert payload.
 *
 * Expected body shape:
 * {
 *   "session_date": "2024-11-15",
 *   "no_practice": false,
 *   "records": [
 *     { "trainee_id": 1, "status": "present" },
 *     { "trainee_id": 2, "status": "absent"  }
 *   ]
 * }
 */
final class BatchAttendanceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'session_date'           => ['required', 'date'],
            'no_practice'            => ['required', 'boolean'],
            'records'                => ['required', 'array', 'min:1'],
            'records.*.trainee_id'   => ['required', 'integer', 'exists:trainees,id'],
            'records.*.status'       => ['required', 'string', 'in:present,absent'],
            'records.*.notes'        => ['nullable', 'string', 'max:500'],
        ];
    }
}
