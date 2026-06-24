<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class AnnouncementController extends Controller
{
    public function __construct(private NotificationService $notifications)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $query = Announcement::query()->with('creator:id,name');

        if ($request->user()->role === 'director') {
            $query->where(function ($q) use ($request): void {
                $q->where('talent_group', $request->user()->talent_group)
                  ->orWhereNull('talent_group');
            });
        }

        $records = $query->orderByDesc('date')->orderByDesc('created_at')->get();

        return response()->json(['data' => $records]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'category'     => ['required', 'string', 'max:60'],
            'date'         => ['required', 'date'],
            'icon'         => ['nullable', 'string', 'max:60'],
            'title'        => ['required', 'string', 'max:255'],
            'description'  => ['required', 'string'],
            'talent_group' => ['nullable', 'string', 'max:60'],
        ]);

        if ($request->user()->role === 'director') {
            $data['talent_group'] = $request->user()->talent_group;
        }

        $data['created_by'] = $request->user()->id;

        $record = Announcement::create($data)->load('creator:id,name');

        $this->notifications->notifyRolesInTalentGroups(
            ['student', 'trainee', 'scholar', 'director', 'admin'],
            $record->talent_group ? [(string) $record->talent_group] : null,
            'New announcement',
            (string) $record->title,
            'general',
            (string) $record->id,
            '/dashboard',
            (int) $request->user()->id,
        );

        return response()->json(['data' => $record], 201);
    }

    public function update(Request $request, Announcement $announcement): JsonResponse
    {
        $data = $request->validate([
            'category'     => ['sometimes', 'string', 'max:60'],
            'date'         => ['sometimes', 'date'],
            'icon'         => ['sometimes', 'nullable', 'string', 'max:60'],
            'title'        => ['sometimes', 'string', 'max:255'],
            'description'  => ['sometimes', 'string'],
            'talent_group' => ['sometimes', 'nullable', 'string', 'max:60'],
        ]);

        if ($request->user()->role === 'director') {
            $data['talent_group'] = $request->user()->talent_group;
        }

        $announcement->update($data);

        $fresh = $announcement->fresh()->load('creator:id,name');

        $this->notifications->notifyRolesInTalentGroups(
            ['student', 'trainee', 'scholar', 'director', 'admin'],
            $fresh->talent_group ? [(string) $fresh->talent_group] : null,
            'Announcement updated',
            (string) $fresh->title,
            'general',
            (string) $fresh->id,
            '/dashboard',
            (int) $request->user()->id,
        );

        return response()->json(['data' => $fresh]);
    }

    public function destroy(Announcement $announcement): JsonResponse
    {
        $announcement->delete();

        return response()->json(['message' => 'Announcement deleted.']);
    }
}
