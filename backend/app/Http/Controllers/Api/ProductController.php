<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $query = Product::with('assignedTo');

        if ($user && $user->role === 'director') {
            $query->where('talent_group', $user->talent_group);
        }

        if ($request->filled('assigned_to')) {
            $query->where('assigned_to', $request->input('assigned_to'));
        }

        return $query->get();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'name'            => ['required', 'string', 'max:255'],
            'description'     => ['nullable', 'string'],
            'quantity'        => ['nullable', 'integer', 'min:0'],
            'price'           => ['nullable', 'numeric', 'min:0'],
            'assigned_to'     => ['nullable', 'exists:users,id'],
            'type'            => ['nullable', 'in:uniform,instrument,accessory'],
            'condition'       => ['nullable', 'in:excellent,good,fair,needs_repair'],
            'status'          => ['nullable', 'in:available,assigned,borrowed,returned,lost,damaged'],
            'talent_group'    => ['nullable', 'string', 'max:100'],
            'serial_number'   => ['nullable', 'string', 'max:255'],
            'property_type'   => ['nullable', 'string', 'max:100'],
            'instrument_type' => ['nullable', 'string', 'max:100'],
            'accessory_type'  => ['nullable', 'string', 'max:100'],
            'uniform_set'     => ['nullable', 'string', 'max:100'],
        ]);

        $user = $request->user();
        if ($user && $user->role === 'director') {
            $data['talent_group'] = $user->talent_group;
        }

        $data['quantity'] = $data['quantity'] ?? 1;
        $data['price'] = $data['price'] ?? 0;
        $data['type'] = $data['type'] ?? 'instrument';
        $data['condition'] = $data['condition'] ?? 'good';
        $data['status'] = $data['status'] ?? 'available';

        return Product::create($data)->load('assignedTo');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        return Product::with('assignedTo')->findOrFail($id);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $product = Product::findOrFail($id);

        $data = $request->validate([
            'name'            => ['sometimes', 'required', 'string', 'max:255'],
            'description'     => ['sometimes', 'nullable', 'string'],
            'quantity'        => ['sometimes', 'integer', 'min:0'],
            'price'           => ['sometimes', 'numeric', 'min:0'],
            'assigned_to'     => ['sometimes', 'nullable', 'exists:users,id'],
            'type'            => ['sometimes', 'in:uniform,instrument,accessory'],
            'condition'       => ['sometimes', 'in:excellent,good,fair,needs_repair'],
            'status'          => ['sometimes', 'in:available,assigned,borrowed,returned,lost,damaged'],
            'talent_group'    => ['sometimes', 'nullable', 'string', 'max:100'],
            'serial_number'   => ['sometimes', 'nullable', 'string', 'max:255'],
            'property_type'   => ['sometimes', 'nullable', 'string', 'max:100'],
            'instrument_type' => ['sometimes', 'nullable', 'string', 'max:100'],
            'accessory_type'  => ['sometimes', 'nullable', 'string', 'max:100'],
            'uniform_set'     => ['sometimes', 'nullable', 'string', 'max:100'],
        ]);

        $product->update($data);

        return $product->load('assignedTo');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        Product::destroy($id);

        return response()->json(['message' => 'Deleted successfully']);
    }

    /**
     * Return items assigned to a specific user.
     */
    public function productsByUser(User $user)
    {
        return $user->assignedProducts()->with('assignedTo')->get();
    }

    /**
     * Assign a product to a scholar.
     */
    public function assign(Request $request, string $id)
    {
        $product = Product::findOrFail($id);

        $request->validate([
            'assigned_to' => 'required|exists:users,id',
        ]);

        $product->assigned_to = $request->input('assigned_to');
        $product->save();

        return $product->load('assignedTo');
    }
}
