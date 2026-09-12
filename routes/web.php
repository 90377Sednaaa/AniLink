<?php

use App\Models\FarmerProfile;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome', [
        'liveListings' => Product::where('status', 'available')->count(),
        'verifiedFarms' => FarmerProfile::where('verification_status', 'approved')->count(),
        'farms' => User::where('role', 'farmer')->count(),
        'ordersDelivered' => Order::whereIn('status', ['delivered', 'completed'])->count(),
    ]);
});

Route::get('/admin', fn () => view('admin'));
Route::get('/admin/{any}', fn () => view('admin'))->where('any', '.*');

Route::get('/manage', fn () => view('manage'));
Route::get('/manage/{any}', fn () => view('manage'))->where('any', '.*');

Route::get('/shop', fn () => view('shop'));
Route::get('/shop/{any}', fn () => view('shop'))->where('any', '.*');
