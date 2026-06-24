<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Scholarship;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Symfony\Component\HttpFoundation\Response;

final class ScholarshipController extends Controller
{
    public function __construct(private NotificationService $notifications)
    {
    }

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
        $query = Scholarship::query()->with('user');

        if (in_array($request->user()->role, ['director', 'admin'], true)) {
            if ($request->user()->role === 'director') {
                $query->whereHas('user', function ($userQuery) use ($request): void {
                    $userQuery->where('talent_group', $request->user()->talent_group);
                });
            }

            if ($request->filled('user_id')) {
                $query->where('user_id', (int) $request->user_id);
            }
        } else {
            $query->where('user_id', $request->user()->id);
        }

        $renewals = $query->orderByDesc('created_at')->get();

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

        $this->notifications->notifyRoles(
            ['admin'],
            'Scholarship renewal submitted',
            $request->user()->name . ' submitted a scholarship renewal request.',
            'request',
            (string) $renewal->id,
            '/dashboard?view=admin',
            null,
            (int) $request->user()->id,
        );

        $this->notifications->notifyRoles(
            ['director'],
            'Scholarship renewal submitted',
            $request->user()->name . ' submitted a scholarship renewal request.',
            'request',
            (string) $renewal->id,
            '/dashboard?view=director',
            (string) $request->user()->talent_group,
            (int) $request->user()->id,
        );

        return response()->json(['data' => $renewal], Response::HTTP_CREATED);
    }

    /**
     * PATCH /api/v1/scholarship/renewals/{scholarship}/review
     */
    public function reviewRenewal(Request $request, Scholarship $scholarship): JsonResponse
    {
        $actor = $request->user();

        if ($actor->role === 'director') {
            $targetTalentGroup = (string) ($scholarship->user?->talent_group ?? '');
            if ($targetTalentGroup === '' || $targetTalentGroup !== (string) ($actor->talent_group ?? '')) {
                return response()->json([
                    'message' => 'You can only review scholarship renewals in your talent group.',
                ], Response::HTTP_FORBIDDEN);
            }
        }

        $data = $request->validate([
            'status' => ['required', 'in:approved,rejected'],
            'review_notes' => ['nullable', 'string'],
        ]);

        $scholarship->status = $data['status'];
        $scholarship->review_notes = $data['review_notes'] ?? null;
        $scholarship->reviewed_at = Carbon::now();
        $scholarship->save();

        $statusLabel = $scholarship->status === 'approved' ? 'approved' : 'rejected';
        $this->notifications->notifyUser(
            (int) $scholarship->user_id,
            'Scholarship renewal reviewed',
            'Your scholarship renewal request has been ' . $statusLabel . '.',
            'request',
            (string) $scholarship->id,
            '/dashboard?view=scholarship',
        );

        return response()->json([
            'data' => $scholarship->fresh(['user']),
        ]);
    }
}
