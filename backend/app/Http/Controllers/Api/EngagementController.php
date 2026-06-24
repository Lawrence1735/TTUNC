<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Engagement;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class EngagementController extends Controller
{
    public function __construct(private NotificationService $notifications)
    {
    }

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
            'venue_region'  => ['nullable', 'string', 'max:120'],
            'venue_province'=> ['nullable', 'string', 'max:120'],
            'venue_city'    => ['nullable', 'string', 'max:120'],
            'venue_barangay'=> ['nullable', 'string', 'max:120'],
            'venue_street'  => ['nullable', 'string', 'max:255'],
            'organization_name' => ['nullable', 'string', 'max:255'],
            'contact_person'    => ['nullable', 'string', 'max:255'],
            'contact_email'     => ['nullable', 'email', 'max:255'],
            'contact_phone'     => ['nullable', 'string', 'max:30'],
            'attachments'   => ['nullable', 'array'],
            'talent_groups' => ['nullable', 'array'],
            'type'          => ['required', 'in:performance,rehearsal,workshop,competition'],
            'is_required'   => ['boolean'],
            'status'        => ['nullable', 'in:scheduled,completed,cancelled,pending_admin_approval,pending_director_approval,rejected'],
        ]);

        $data['created_by'] = $request->user()->id;
        $engagement = Engagement::create($data);

        $talentGroups = is_array($engagement->talent_groups) ? $engagement->talent_groups : null;
        $eventLabel = (string) $engagement->event_name;
        $dateLabel = (string) $engagement->date;
        $timeLabel = (string) $engagement->time;

        if ($request->user()->role === 'admin') {
            $this->notifications->notifyRolesInTalentGroups(
                ['director'],
                $talentGroups,
                'New engagement from admin',
                "Admin created {$eventLabel} on {$dateLabel} {$timeLabel}.",
                'engagement',
                (string) $engagement->id,
                '/dashboard?view=director',
                (int) $request->user()->id,
            );
        }

        if ($request->user()->role === 'director') {
            $this->notifications->notifyRoles(
                ['admin'],
                'New engagement from director',
                "Director submitted {$eventLabel} on {$dateLabel} {$timeLabel}.",
                'request',
                (string) $engagement->id,
                '/dashboard?view=admin',
                null,
                (int) $request->user()->id,
            );
        }

        if ((string) $engagement->status === 'scheduled') {
            $this->notifications->notifyRolesInTalentGroups(
                ['trainee', 'scholar'],
                $talentGroups,
                'New engagement scheduled',
                "{$eventLabel} is scheduled on {$dateLabel} {$timeLabel} at {$engagement->venue}.",
                'engagement',
                (string) $engagement->id,
                '/dashboard?view=engagement',
                (int) $request->user()->id,
            );
        }

        return response()->json(['data' => $engagement], 201);
    }

    /**
     * PATCH /api/v1/engagements/{engagement} (director/admin only)
     */
    public function update(Request $request, Engagement $engagement): JsonResponse
    {
        $before = [
            'status' => (string) $engagement->status,
            'event_name' => (string) $engagement->event_name,
            'date' => (string) $engagement->date,
            'time' => (string) $engagement->time,
            'venue' => (string) $engagement->venue,
        ];

        $data = $request->validate([
            'event_name'    => ['sometimes', 'string', 'max:255'],
            'description'   => ['sometimes', 'nullable', 'string'],
            'date'          => ['sometimes', 'date'],
            'time'          => ['sometimes', 'string', 'max:10'],
            'venue'         => ['sometimes', 'string', 'max:255'],
            'venue_region'  => ['sometimes', 'nullable', 'string', 'max:120'],
            'venue_province'=> ['sometimes', 'nullable', 'string', 'max:120'],
            'venue_city'    => ['sometimes', 'nullable', 'string', 'max:120'],
            'venue_barangay'=> ['sometimes', 'nullable', 'string', 'max:120'],
            'venue_street'  => ['sometimes', 'nullable', 'string', 'max:255'],
            'organization_name' => ['sometimes', 'nullable', 'string', 'max:255'],
            'contact_person'    => ['sometimes', 'nullable', 'string', 'max:255'],
            'contact_email'     => ['sometimes', 'nullable', 'email', 'max:255'],
            'contact_phone'     => ['sometimes', 'nullable', 'string', 'max:30'],
            'attachments'   => ['sometimes', 'nullable', 'array'],
            'talent_groups' => ['sometimes', 'nullable', 'array'],
            'type'          => ['sometimes', 'in:performance,rehearsal,workshop,competition'],
            'is_required'   => ['sometimes', 'boolean'],
            'status'        => ['sometimes', 'in:scheduled,completed,cancelled,pending_admin_approval,pending_director_approval,rejected'],
        ]);

        $engagement->update($data);
        $engagement = $engagement->fresh();

        $talentGroups = is_array($engagement->talent_groups) ? $engagement->talent_groups : null;
        $statusNow = (string) $engagement->status;
        $eventLabel = (string) $engagement->event_name;
        $dateLabel = (string) $engagement->date;
        $timeLabel = (string) $engagement->time;
        $venueLabel = (string) $engagement->venue;

        if ($before['status'] !== $statusNow) {
            if ($statusNow === 'scheduled') {
                if ($engagement->created_by && (int) $engagement->created_by !== (int) $request->user()->id) {
                    $this->notifications->notifyUser(
                        (int) $engagement->created_by,
                        'Engagement approved',
                        "{$eventLabel} was approved and scheduled on {$dateLabel} {$timeLabel}.",
                        'acceptance',
                        (string) $engagement->id,
                        '/dashboard?view=engagement',
                    );
                }

                $this->notifications->notifyRolesInTalentGroups(
                    ['trainee', 'scholar'],
                    $talentGroups,
                    'Engagement scheduled',
                    "{$eventLabel} is now scheduled on {$dateLabel} {$timeLabel} at {$venueLabel}.",
                    'engagement',
                    (string) $engagement->id,
                    '/dashboard?view=engagement',
                    (int) $request->user()->id,
                );
            }

            if ($statusNow === 'rejected' && $engagement->created_by && (int) $engagement->created_by !== (int) $request->user()->id) {
                $this->notifications->notifyUser(
                    (int) $engagement->created_by,
                    'Engagement request rejected',
                    "{$eventLabel} was rejected.",
                    'request',
                    (string) $engagement->id,
                    '/dashboard?view=engagement',
                );
            }

            if ($statusNow === 'pending_admin_approval') {
                $this->notifications->notifyRoles(
                    ['admin'],
                    'Engagement awaiting admin approval',
                    "{$eventLabel} requires admin approval.",
                    'request',
                    (string) $engagement->id,
                    '/dashboard?view=admin',
                    null,
                    (int) $request->user()->id,
                );
            }

            if ($statusNow === 'pending_director_approval') {
                $this->notifications->notifyRolesInTalentGroups(
                    ['director'],
                    $talentGroups,
                    'Engagement awaiting director approval',
                    "{$eventLabel} requires director approval.",
                    'request',
                    (string) $engagement->id,
                    '/dashboard?view=director',
                    (int) $request->user()->id,
                );
            }
        }

        $scheduleChanged = $before['event_name'] !== (string) $engagement->event_name
            || $before['date'] !== (string) $engagement->date
            || $before['time'] !== (string) $engagement->time
            || $before['venue'] !== (string) $engagement->venue;

        if ($scheduleChanged && $statusNow === 'scheduled') {
            $this->notifications->notifyRolesInTalentGroups(
                ['trainee', 'scholar'],
                $talentGroups,
                'Engagement details updated',
                "Updated: {$eventLabel} on {$dateLabel} {$timeLabel} at {$venueLabel}.",
                'engagement',
                (string) $engagement->id,
                '/dashboard?view=engagement',
                (int) $request->user()->id,
            );
        }

        return response()->json(['data' => $engagement]);
    }

    /**
     * DELETE /api/v1/engagements/{engagement} (director/admin only)
     */
    public function destroy(Engagement $engagement): JsonResponse
    {
        $eventLabel = (string) $engagement->event_name;
        $talentGroups = is_array($engagement->talent_groups) ? $engagement->talent_groups : null;

        $this->notifications->notifyRolesInTalentGroups(
            ['trainee', 'scholar', 'director', 'admin'],
            $talentGroups,
            'Engagement cancelled',
            "{$eventLabel} has been cancelled.",
            'engagement',
            (string) $engagement->id,
            '/dashboard?view=engagement',
            (int) $engagement->created_by,
        );

        $engagement->delete();
        return response()->json(['message' => 'Engagement deleted.']);
    }
}
