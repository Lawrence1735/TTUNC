<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\User;
use App\Models\UserNotification;

final class NotificationService
{
    public function notifyUser(
        ?int $userId,
        string $title,
        string $message,
        string $type = 'general',
        ?string $relatedId = null,
        ?string $actionUrl = null,
    ): void {
        if (! $userId) {
            return;
        }

        UserNotification::create([
            'user_id' => $userId,
            'title' => $title,
            'message' => $message,
            'type' => $type,
            'read' => false,
            'related_id' => $relatedId,
            'action_url' => $actionUrl,
        ]);
    }

    /**
     * @param array<int,string> $roles
     */
    public function notifyRoles(
        array $roles,
        string $title,
        string $message,
        string $type = 'general',
        ?string $relatedId = null,
        ?string $actionUrl = null,
        ?string $talentGroup = null,
        ?int $excludeUserId = null,
    ): void {
        $query = User::query()->whereIn('role', $roles);

        if ($talentGroup !== null && $talentGroup !== '') {
            $query->where('talent_group', $talentGroup);
        }

        if ($excludeUserId !== null) {
            $query->where('id', '!=', $excludeUserId);
        }

        $userIds = $query->pluck('id')->all();

        $this->notifyUserIds($userIds, $title, $message, $type, $relatedId, $actionUrl);
    }

    /**
     * @param array<int,string> $roles
     * @param array<int,string>|null $talentGroups
     */
    public function notifyRolesInTalentGroups(
        array $roles,
        ?array $talentGroups,
        string $title,
        string $message,
        string $type = 'general',
        ?string $relatedId = null,
        ?string $actionUrl = null,
        ?int $excludeUserId = null,
    ): void {
        $query = User::query()->whereIn('role', $roles);

        if (is_array($talentGroups) && count($talentGroups) > 0) {
            $query->whereIn('talent_group', $talentGroups);
        }

        if ($excludeUserId !== null) {
            $query->where('id', '!=', $excludeUserId);
        }

        $userIds = $query->pluck('id')->all();

        $this->notifyUserIds($userIds, $title, $message, $type, $relatedId, $actionUrl);
    }

    /**
     * @param array<int,int|string> $userIds
     */
    public function notifyUserIds(
        array $userIds,
        string $title,
        string $message,
        string $type = 'general',
        ?string $relatedId = null,
        ?string $actionUrl = null,
    ): void {
        $normalized = array_values(array_unique(array_filter(array_map(
            static fn ($id) => is_numeric($id) ? (int) $id : null,
            $userIds,
        ))));

        if (count($normalized) === 0) {
            return;
        }

        $now = now();
        $rows = [];

        foreach ($normalized as $userId) {
            $rows[] = [
                'user_id' => $userId,
                'title' => $title,
                'message' => $message,
                'type' => $type,
                'read' => false,
                'related_id' => $relatedId,
                'action_url' => $actionUrl,
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        UserNotification::insert($rows);
    }
}
