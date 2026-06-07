<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Scholarship;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

final class ScholarshipController extends Controller
{
    /**
     * GET /api/v1/scholarship/benefits
     * Static benefit list — same for all scholars.
     */
    public function benefits(): JsonResponse
    {
        $benefits = [
            [
                'id'          => 'ben-1',
                'name'        => 'Monthly Stipend',
                'type'        => 'stipend',
                'amount'      => 1500,
                'description' => 'Monthly financial support for scholars',
                'frequency'   => 'monthly',
                'status'      => 'active',
            ],
            [
                'id'          => 'ben-2',
                'name'        => 'Uniform Allowance',
                'type'        => 'allowance',
                'amount'      => 3000,
                'description' => 'Annual allowance for uniform and accessories',
                'frequency'   => 'annual',
                'status'      => 'active',
            ],
            [
                'id'          => 'ben-3',
                'name'        => 'Tuition Discount',
                'type'        => 'discount',
                'amount'      => null,
                'description' => 'Partial tuition discount based on scholarship percentage',
                'frequency'   => 'semester',
                'status'      => 'active',
            ],
            [
                'id'          => 'ben-4',
                'name'        => 'Equipment Privilege',
                'type'        => 'privilege',
                'amount'      => null,
                'description' => 'Access to university instruments and equipment',
                'frequency'   => 'semester',
                'status'      => 'active',
            ],
        ];

        return response()->json(['data' => $benefits]);
    }

    /**
     * GET /api/v1/scholarship/renewals
     * Current user's renewal submissions.
     */
    public function indexRenewals(Request $request): JsonResponse
    {
        $renewals = Scholarship::where('user_id', $request->user()->id)
            ->orderByDesc('created_at')
            ->get();

        return response()->json(['data' => $renewals]);
    }

    /**
     * POST /api/v1/scholarship/renewals
     */
    public function submitRenewal(Request $request): JsonResponse
    {
        $data = $request->validate([
            'semester'  => ['required', 'string', 'max:50'],
            'year'      => ['required', 'integer', 'min:2000', 'max:2100'],
            'gpa'       => ['required', 'numeric', 'min:1.0', 'max:5.0'],
            'documents' => ['nullable', 'array'],
        ]);

        $renewal = Scholarship::create([
            ...$data,
            'user_id' => $request->user()->id,
            'status'  => 'pending',
        ]);

        return response()->json(['data' => $renewal], Response::HTTP_CREATED);
    }
}
