<?php

declare(strict_types=1);

namespace App\Http\Requests\Training;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Validates a director's update to a trainee profile.
 *
 * Note: completion_rate is intentionally excluded — it is a computed/cached
 * value managed by the attendance system, not editable directly.
 */
final class UpdateTraineeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'current_status' => [
                'sometimes',
                Rule::in(['active', 'inactive', 'completed', 'dropped']),
            ],
            'chapter'                  => ['sometimes', 'nullable', 'string', 'max:80'],
            'instrument'               => ['sometimes', 'nullable', 'string', 'max:80'],
            'voice'                    => ['sometimes', 'nullable', 'string', 'max:80'],
            'total_expected_sessions'  => ['sometimes', 'integer', 'min:1', 'max:365'],
            'date_joined'              => ['sometimes', 'nullable', 'date'],
        ];
    }

    public function messages(): array
    {
        return [
            'current_status.in' => 'Status must be one of: active, inactive, completed, dropped.',
        ];
    }
}
