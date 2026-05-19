<?php

declare(strict_types=1);

namespace App\Http\Requests\Recruitment;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class StoreApplicationRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Public endpoint — no auth required
        return true;
    }

    public function rules(): array
    {
        return [
            // Talent group
            'talent_group' => [
                'required',
                Rule::in(['marching-band', 'glee-club', 'dance-club', 'majorettes']),
            ],

            // Personal info
            'applicant_name'       => ['required', 'string', 'max:120'],
            'applicant_email'      => ['required', 'email', 'max:255'],
            'applicant_student_id' => ['nullable', 'string', 'max:20'],
            'applicant_phone'      => ['nullable', 'string', 'max:20'],
            'applicant_birthdate'  => ['nullable', 'date'],
            'applicant_age'        => ['nullable', 'string', 'max:10'],
            'applicant_address'    => ['nullable', 'string', 'max:500'],
            'applicant_gender'     => ['nullable', 'string', 'max:20'],
            'applicant_year_level' => ['nullable', 'string', 'max:30'],
            'applicant_course'     => ['nullable', 'string', 'max:120'],
            'applicant_department' => ['nullable', 'string', 'max:120'],

            // Guardian
            'guardian_name'         => ['nullable', 'string', 'max:120'],
            'guardian_phone'        => ['nullable', 'string', 'max:20'],
            'guardian_relationship' => ['nullable', 'string', 'max:60'],

            // Talent-specific
            'chapters'             => ['nullable', 'string', 'max:80'],
            'instruments'          => ['nullable', 'string', 'max:80'],
            'voices'               => ['nullable', 'string', 'max:80'],
            'vocal_range'          => ['nullable', 'string', 'max:60'],
            'primary_dance_genre'  => ['nullable', 'string', 'max:80'],
            'years_of_experience'  => ['nullable', 'string', 'max:20'],

            // Free text
            'experience'   => ['nullable', 'string', 'max:2000'],
            'motivation'   => ['nullable', 'string', 'max:2000'],

            // Documents
            'documents'    => ['nullable', 'array', 'max:10'],
            'documents.*'  => ['string', 'url', 'max:500'],
            'portfolio_url'=> ['nullable', 'url', 'max:500'],
        ];
    }
}
