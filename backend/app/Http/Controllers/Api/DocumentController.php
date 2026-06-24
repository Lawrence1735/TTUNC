<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Document;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

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
     * Accepts either JSON (file_path string) or multipart/form-data (actual file upload).
     */
    public function store(Request $request): JsonResponse
    {
        if ($request->hasFile('file')) {
            $validated = $request->validate([
                'file'         => ['required', 'file', 'max:10240', 'mimes:pdf,doc,docx,jpg,jpeg,png'],
                'title'        => ['required', 'string', 'max:255'],
                'category'     => ['required', 'in:scholarship-contract,event-request,event-approval,performance-report,scholar-records'],
                'talent_group' => ['nullable', 'string'],
                'related_to'   => ['nullable', 'string'],
                'description'  => ['nullable', 'string'],
                'tags'         => ['nullable', 'array'],
                'status'       => ['nullable', 'in:pending,approved,completed'],
            ]);

            $file = $request->file('file');
            $path = $file->store('documents', 'public');

            $document = Document::create([
                'title'        => $validated['title'],
                'file_path'    => $path,
                'file_name'    => $file->getClientOriginalName(),
                'file_size'    => number_format($file->getSize() / 1024, 1) . ' KB',
                'file_type'    => $file->getMimeType(),
                'category'     => $validated['category'],
                'talent_group' => $validated['talent_group'] ?? null,
                'related_to'   => $validated['related_to'] ?? null,
                'description'  => $validated['description'] ?? null,
                'tags'         => isset($validated['tags']) ? $validated['tags'] : null,
                'status'       => $validated['status'] ?? 'pending',
                'user_id'      => $request->user()->id,
                'uploaded_by'  => $request->user()->name,
            ]);

            return response()->json(['data' => $document], 201);
        }

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

    /**
     * PATCH /api/v1/documents/{document} (director/admin only)
     */
    public function update(Request $request, Document $document): JsonResponse
    {
        if ($request->user()->role === 'director' && $document->talent_group !== $request->user()->talent_group) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $data = $request->validate([
            'title'        => ['sometimes', 'string', 'max:255'],
            'description'  => ['nullable', 'string'],
            'related_to'   => ['nullable', 'string'],
            'talent_group' => ['nullable', 'string'],
            'tags'         => ['nullable', 'array'],
            'status'       => ['sometimes', 'in:pending,approved,completed'],
        ]);

        $document->update($data);

        return response()->json(['data' => $document->fresh()]);
    }

    /**
     * DELETE /api/v1/documents/{document} (director/admin only)
     */
    public function destroy(Request $request, Document $document): JsonResponse
    {
        if ($request->user()->role === 'director' && $document->talent_group !== $request->user()->talent_group) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        if ($document->file_path && Storage::disk('public')->exists($document->file_path)) {
            Storage::disk('public')->delete($document->file_path);
        }

        $document->delete();

        return response()->json(null, 204);
    }
}
