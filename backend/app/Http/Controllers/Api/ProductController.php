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
        if ($request->filled('assigned_to')) {
            return Product::assignedTo($request->input('assigned_to'))->get();
        }

        return Product::with('assignedTo')->get();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required',
            'description' => 'nullable|string',
            'quantity' => 'required|integer|min:0',
            'price' => 'required|numeric|min:0',
            'assigned_to' => 'nullable|exists:users,id',
        ]);

        return Product::create($request->only(['name', 'description', 'quantity', 'price', 'assigned_to']));
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

        $request->validate([
            'name' => 'sometimes|required',
            'description' => 'nullable|string',
            'quantity' => 'sometimes|required|integer|min:0',
            'price' => 'sometimes|required|numeric|min:0',
            'assigned_to' => 'nullable|exists:users,id',
        ]);

        $product->update($request->only(['name', 'description', 'quantity', 'price', 'assigned_to']));

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
