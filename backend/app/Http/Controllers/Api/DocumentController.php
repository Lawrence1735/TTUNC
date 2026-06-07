<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Document;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class DocumentController extends Controller
{
    /**
     * GET /api/v1/documents
     */
    public function index(Request $request): JsonResponse
    {
        $query = Document::query();

        // Directors see only their talent group; admins see all
        if ($request->user()->role === 'director') {
            $query->where('talent_group', $request->user()->talent_group);
        } elseif (!in_array($request->user()->role, ['admin'], true)) {
            // Scholars/trainees see only their own documents
            $query->where('user_id', $request->user()->id);
        }

        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        if ($request->filled('talent_group')) {
            $query->where('talent_group', $request->talent_group);
        }

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'like', '%' . $request->search . '%')
                  ->orWhere('related_to', 'like', '%' . $request->search . '%');
            });
        }

        $documents = $query->orderByDesc('created_at')->get();

        return response()->json(['data' => $documents]);
    }

    /**
     * GET /api/v1/documents/{document}
     */
    public function show(Document $document): JsonResponse
    {
        return response()->json(['data' => $document]);
    }

    /**
     * POST /api/v1/documents (director/admin only)
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title'        => ['required', 'string', 'max:255'],
            'file_path'    => ['required', 'string'],
            'file_name'    => ['nullable', 'string'],
            'file_size'    => ['nullable', 'string'],
            'file_type'    => ['nullable', 'string'],
            'category'     => ['required', 'in:scholarship-contract,event-request,event-approval,performance-report,scholar-records'],
            'talent_group' => ['nullable', 'string'],
            'related_to'   => ['nullable', 'string'],
            'description'  => ['nullable', 'string'],
            'tags'         => ['nullable', 'array'],
            'status'       => ['in:pending,approved,completed'],
        ]);

        $document = Document::create([
            ...$data,
            'user_id'     => $request->user()->id,
            'uploaded_by' => $request->user()->name,
        ]);

        return response()->json(['data' => $document], 201);
    }
}
