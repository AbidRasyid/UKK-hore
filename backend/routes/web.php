<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'message' => 'this api is running smoothly',
        'quote' => 'YUME WA POWER',
        'status' => 'active'
    ]);
});
