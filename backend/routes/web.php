<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

use App\Models\Product;
use Illuminate\Http\Request;

Route::get('/test-create-product', function () {
    return '
        <form method="POST" action="/test-store-product">
            <input name="name" placeholder="Name">
            <input name="quantity" placeholder="Quantity">
            <input name="price" placeholder="Price">
            <button type="submit">Add Product</button>
        </form>
    ';
});

Route::post('/test-store-product', function (Request $request) {
    Product::create([
        'name' => $request->name,
        'quantity' => $request->quantity,
        'price' => $request->price,
    ]);

    return redirect('/test-create-product');
});

Route::get('/test-edit-product/{id}', function ($id) {
    $product = \App\Models\Product::findOrFail($id);

    return '
        <form method="POST" action="/test-update-product/' . $id . '">
            <input name="name" value="' . $product->name . '">
            <input name="quantity" value="' . $product->quantity . '">
            <input name="price" value="' . $product->price . '">
            <button type="submit">Update Product</button>
        </form>
    ';
});

Route::post('/test-update-product/{id}', function ($id, \Illuminate\Http\Request $request) {
    $product = \App\Models\Product::findOrFail($id);

    $product->update([
        'name' => $request->name,
        'quantity' => $request->quantity,
        'price' => $request->price,
    ]);

    return redirect('/api/products');
});

Route::get('/test-delete-product/{id}', function ($id) {
    \App\Models\Product::destroy($id);

    return redirect('/api/products');
});