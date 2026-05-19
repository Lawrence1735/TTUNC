<?php

declare(strict_types=1);

namespace App\Http\Requests\Recruitment;

use Illuminate\Foundation\Http\FormRequest;

final class ScheduleInterviewRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Gate checked in controller via policy
        return true;
    }

    public function rules(): array
    {
        return [
            'scheduled_at' => ['required', 'date', 'after:now'],
            'venue'        => ['nullable', 'string', 'max:200'],
            'notes'        => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'scheduled_at.after' => 'The interview must be scheduled for a future date and time.',
        ];
    }
}
