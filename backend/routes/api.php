<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\UserController;
use App\enum\UserRole;
use App\Http\Controllers\DailyReportController;
// use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']);
Route::post('/customer/login', [AuthController::class, 'CustomerLogin']);

Route::middleware(['auth:sanctum', 'role:'. UserRole::ADMINISTRATOR->value . ',' . UserRole::SUPERVISOR->value])->group(function(){
    Route::get('/users', [UserController::class, 'index']);
    Route::get('/user/{user_id}', [UserController::class, 'show']);
});

Route::middleware(['auth:sanctum', 'role:'. UserRole::ADMINISTRATOR->value . ',' . UserRole::TELLER->value . ',' . UserRole::SUPERVISOR->value])->group(function(){
    Route::get('/customers', [CustomerController::class, 'index']);
    Route::get('/customer/{customer_id}', [CustomerController::class, 'show']);
});

Route::middleware(['auth:sanctum', 'role:'. UserRole::ADMINISTRATOR->value])->group(function(){
    Route::post('/users', [UserController::class, 'store']);
    Route::patch('/user/{user_id}/edit', [UserController::class, 'update']);

    Route::post('/customers', [CustomerController::class, 'store']);
    Route::patch('/customer/{customer_id}/edit', [CustomerController::class, 'update']);
    Route::delete('/customer/{customer_id}/delete', [CustomerController::class, 'delete']);
});

Route::middleware(['auth:sanctum', 'role:'. UserRole::SUPERVISOR->value])->group(function(){
    Route::get('/daily-reports', [DailyReportController::class, 'index']);
    Route::get('/daily-report/{id}', [DailyReportController::class, 'show']);
    Route::patch('/daily-report/{id}/approve', [DailyReportController::class, 'approve']);
});

Route::middleware(['auth:sanctum', 'role:'. UserRole::TELLER->value])->group(function(){
    Route::post('/user/{customer_id}/transaction/initiate', [TransactionController::class, 'initiate']);
    Route::post('/daily-report/{user_id}/initiate', [DailyReportController::class, 'initiateStore']);
    Route::post('/daily-report/{user_id}/store', [DailyReportController::class, 'store']);
});

Route::middleware(['auth:customer'])->group(function(){
    Route::post('/customer/{customer_id}/transaction/confirm', [TransactionController::class, 'confirmStore']);
    Route::get('/customer/{customer_id}/transactions', [TransactionController::class, 'show']);
});