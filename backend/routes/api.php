<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ProductController;

Route::apiResource('products', ProductController::class);
Route::get('users/{user}/products', [ProductController::class, 'productsByUser']);
Route::patch('products/{product}/assign', [ProductController::class, 'assign']);