<?php

declare(strict_types=1);

namespace App\Http\Requests\Recruitment;

use Illuminate\Foundation\Http\FormRequest;

final class RejectApplicationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'denial_reason'   => ['required', 'string', 'max:120'],
            'denial_feedback' => ['required', 'string', 'min:10', 'max:2000'],
        ];
    }
}
