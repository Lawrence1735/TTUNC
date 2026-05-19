<?php

declare(strict_types=1);

namespace App\Http\Requests\Training;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class StoreEvaluationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'trainee_id'      => ['required', 'integer', 'exists:trainees,id'],
            'rating'          => ['required', 'integer', 'min:1', 'max:100'],
            'evaluation_date' => ['required', 'date'],
            'notes'           => ['nullable', 'string', 'max:2000'],
            'strengths'       => ['nullable', 'string', 'max:2000'],
            'improvements'    => ['nullable', 'string', 'max:2000'],
            'status'          => ['required', Rule::in(['draft', 'submitted'])],
            'recommendation'  => ['required', Rule::in(['continue', 'probation', 'discontinue'])],
            'semester'        => ['nullable', 'string', 'max:30'],
            'academic_year'   => ['nullable', 'string', 'max:20'],
            'recommend_for_renewal' => ['nullable', 'boolean'],

            // Section A — Discipline
            'section_a'                          => ['nullable', 'array'],
            'section_a.reports_on_time'          => ['nullable', 'integer', 'min:1', 'max:5'],
            'section_a.reports_regularly'        => ['nullable', 'integer', 'min:1', 'max:5'],
            'section_a.practices_on_time'        => ['nullable', 'integer', 'min:1', 'max:5'],
            'section_a.practices_regularly'      => ['nullable', 'integer', 'min:1', 'max:5'],
            'section_a.no_unnecessary_absence'   => ['nullable', 'integer', 'min:1', 'max:5'],
            'section_a.mastery_tasks'            => ['nullable', 'integer', 'min:1', 'max:5'],
            'section_a.maintains_cleanliness'    => ['nullable', 'integer', 'min:1', 'max:5'],

            // Section B — Performance Interest
            'section_b'                          => ['nullable', 'array'],
            'section_b.improvement_interest'     => ['nullable', 'integer', 'min:1', 'max:5'],
            'section_b.performance_interest'     => ['nullable', 'integer', 'min:1', 'max:5'],
            'section_b.work_ethic'               => ['nullable', 'integer', 'min:1', 'max:5'],
            'section_b.initiative'               => ['nullable', 'integer', 'min:1', 'max:5'],
            'section_b.efficiency'               => ['nullable', 'integer', 'min:1', 'max:5'],

            // Section C — Interpersonal
            'section_c'                          => ['nullable', 'array'],
            'section_c.teamwork'                 => ['nullable', 'integer', 'min:1', 'max:5'],
            'section_c.tact'                     => ['nullable', 'integer', 'min:1', 'max:5'],
            'section_c.courtesy'                 => ['nullable', 'integer', 'min:1', 'max:5'],
            'section_c.disposition'              => ['nullable', 'integer', 'min:1', 'max:5'],
        ];
    }
}
