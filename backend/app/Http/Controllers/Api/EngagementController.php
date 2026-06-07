<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Engagement;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class EngagementController extends Controller
{
    /**
     * GET /api/v1/engagements
     * Returns performances/workshops/competitions visible to the current user's talent group.
     */
    public function index(Request $request): JsonResponse
    {
        $talentGroup = $request->user()->talent_group;

        $query = Engagement::whereIn('type', ['performance', 'workshop', 'competition'])
            ->where('status', '!=', 'cancelled');

        // Directors and admins see all; scholars/trainees see only their group
        if (!in_array($request->user()->role, ['director', 'admin'], true)) {
            $query->where(function ($q) use ($talentGroup) {
                $q->whereJsonContains('talent_groups', $talentGroup)
                  ->orWhereNull('talent_groups');
            });
        }

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        $engagements = $query->orderBy('date')->get();

        return response()->json(['data' => $engagements]);
    }

    /**
     * GET /api/v1/engagements/rehearsals
     * Returns rehearsals for the current user's talent group.
     */
    public function rehearsals(Request $request): JsonResponse
    {
        $talentGroup = $request->user()->talent_group;

        $query = Engagement::where('type', 'rehearsal')
            ->where('status', '!=', 'cancelled');

        if (!in_array($request->user()->role, ['director', 'admin'], true)) {
            $query->where(function ($q) use ($talentGroup) {
                $q->whereJsonContains('talent_groups', $talentGroup)
                  ->orWhereNull('talent_groups');
            });
        }

        $rehearsals = $query->orderBy('date')->get();

        return response()->json(['data' => $rehearsals]);
    }

    /**
     * POST /api/v1/engagements (director/admin only)
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'event_name'    => ['required', 'string', 'max:255'],
            'description'   => ['nullable', 'string'],
            'date'          => ['required', 'date'],
            'time'          => ['required', 'string', 'max:10'],
            'venue'         => ['required', 'string', 'max:255'],
            'talent_groups' => ['nullable', 'array'],
            'type'          => ['required', 'in:performance,rehearsal,workshop,competition'],
            'is_required'   => ['boolean'],
        ]);

        $engagement = Engagement::create($data);

        return response()->json(['data' => $engagement], 201);
    }
}
