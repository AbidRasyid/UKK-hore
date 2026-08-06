<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\UserRole;
// use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware(['auth:sanctum', 'role:'. UserRole::ADMINISTRATOR->value])->group(function(){
    Route::get('/users', [UserController::class, 'GetAll']);
    Route::post('/users', [UserController::class, 'CreateUser']);
    Route::get('/user/{id}', [UserController::class, 'ShowUser']);
    Route::put('/user/{id}', [UserController::class, 'UpdateUser']);
    Route::put('/user/{id}/block', [UserController::class, 'BlockUser']);
});

Route::middleware(['auth:sanctum', 'role:'. UserRole::SUPERVISOR->value])->group(function(){
    Route::get('/users', [UserController::class, 'GetAll']);
    Route::get('/user/{id}', [UserController::class, 'ShowUser']);
});

Route::middleware(['auth:sanctum', 'role:'. UserRole::TELLER->value])->group(function(){
    Route::get('/users', [UserController::class, 'GetAll']);
    Route::get('/user/{id}', [UserController::class, 'ShowUser']);
});

Route::middleware(['auth:sanctum', 'role:'. UserRole::CUSTOMER->value])->group(function(){
    Route::get('/user/{id}', [UserController::class, 'ShowUser']);
});
