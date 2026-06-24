<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

final class LocationController extends Controller
{
    private const PSGC_API_BASE = 'https://psgc.gitlab.io/api';

    public function regions(): JsonResponse
    {
        return response()->json([
            'data' => $this->fetchPsgcItems('/regions/'),
        ]);
    }

    public function provinces(Request $request): JsonResponse
    {
        $data = $request->validate([
            'region_code' => ['required', 'string', 'max:12'],
        ]);

        return response()->json([
            'data' => $this->fetchPsgcItems("/regions/{$data['region_code']}/provinces/"),
        ]);
    }

    public function cities(Request $request): JsonResponse
    {
        $data = $request->validate([
            'region_code' => ['nullable', 'string', 'max:12'],
            'province_code' => ['nullable', 'string', 'max:12'],
        ]);

        if (!empty($data['province_code'])) {
            return response()->json([
                'data' => $this->fetchPsgcItems("/provinces/{$data['province_code']}/cities-municipalities/"),
            ]);
        }

        if (!empty($data['region_code'])) {
            return response()->json([
                'data' => $this->fetchPsgcItems("/regions/{$data['region_code']}/cities-municipalities/"),
            ]);
        }

        return response()->json([
            'message' => 'Either region_code or province_code is required.',
            'errors' => [
                'region_code' => ['Either region_code or province_code is required.'],
            ],
        ], 422);
    }

    public function barangays(Request $request): JsonResponse
    {
        $data = $request->validate([
            'city_code' => ['required', 'string', 'max:12'],
        ]);

        return response()->json([
            'data' => $this->fetchPsgcItems("/cities-municipalities/{$data['city_code']}/barangays/"),
        ]);
    }

    /**
     * @return array<int, array{code:string, name:string}>
     */
    private function fetchPsgcItems(string $path): array
    {
        $response = Http::timeout(20)
            ->acceptJson()
            ->get(self::PSGC_API_BASE . $path);

        if (!$response->successful()) {
            return [];
        }

        $rows = $response->json();
        if (!is_array($rows)) {
            return [];
        }

        $normalized = [];
        foreach ($rows as $row) {
            if (!is_array($row)) {
                continue;
            }

            $code = isset($row['code']) ? (string) $row['code'] : '';
            $name = isset($row['name']) ? (string) $row['name'] : '';

            if ($code === '' || $name === '') {
                continue;
            }

            $normalized[] = [
                'code' => $code,
                'name' => $name,
            ];
        }

        usort($normalized, static fn (array $a, array $b): int => strcmp($a['name'], $b['name']));

        return $normalized;
    }
}
