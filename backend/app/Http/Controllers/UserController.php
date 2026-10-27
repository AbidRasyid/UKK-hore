<?php

namespace App\Http\Controllers;

use App\Http\Requests\UserRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use App\enum\Status;
use App\enum\UserRole;
use App\Models\Teller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log as FacadesLog;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    public function index():JsonResponse{
        try{
            $users = User::all();
            return response()->json([
                "message" => "users has loaded",
                "data" => $users,
            ], 200);
        }catch(\Throwable $e){
            return response()->json([
                "message" => "data not loaded",
            ], 500);
        }
    }

public function store(UserRequest $request): JsonResponse
{
    $validated = $request->validated();
    
    try {
        // 1. Buat User
        $user = User::create([
            'username' => $validated['username'],
            'password' => bcrypt($validated['password']), // Pastikan di-hash jika belum pakai casts 'hashed'
            'fullname' => $validated['fullname'],
            'role' => $validated['role'],
            'status' => $validated['status'] ?? Status::ACTIVE->value,
        ]);

        if ($user->role === UserRole::TELLER->value || $user->role === UserRole::TELLER) {
            Teller::create([
                'user_id' => $user->id,
                'name' => $validated['fullname'],
                'class' => $validated['class'] ?? null, 
                'phone_number' => $validated['phone_number'] ?? null,
            ]);
        }

        return response()->json([
            "message" => "User created successfully",
            "user" => $user
        ], 200);

    } catch (\Throwable $e) {
        FacadesLog::error($e->getMessage()); 
        
        return response()->json([
            "message" => "User failed to create",
            "error" => $e->getMessage() 
        ], 400);
    }
}

    public function show(int $user_id): JsonResponse {
        try {
            $user = User::findOrFail($user_id);
            return response()->json([
                "message" => "Users retrieved successfully.",
                "user" => $user
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                "message" => "user not found",
            ], 404);
        }
    }

    public function update(Request $request, int $user_id):JsonResponse
    {
        $validated = $request->validate([
            'username' => ['sometimes', 'required', 'string', Rule::unique('users', 'username')->ignore($user_id)],
            'password' => ['sometimes', 'nullable', 'string', 'min:6'],
            'fullname' => ['sometimes', 'required', 'string'],
            'role'     => ['sometimes', 'required', Rule::enum(UserRole::class)],
            'status'   => ['sometimes', 'nullable', Rule::enum(Status::class)],
        ]);
        try {
            $user = User::findOrFail($user_id);
            if (array_key_exists('password', $validated) &&empty($validated['password'])){
                unset($validated['password']);
            }
            $user->update($validated);
            return response()->json([
                "message" => "User updated successfully",
                "user" => $user
            ], 200);
        }catch(\Throwable $e){
            return response()->json([
                "message" => $e->getMessage(),
            ], 400);
        }
    }
}
