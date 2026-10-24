<?php

namespace App\Http\Controllers;

use App\Http\Requests\UserRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use App\enum\Status;
use App\enum\UserRole;
use App\Models\Teller;
use Illuminate\Http\Request;
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
            $user = User::create([
                'username' => $validated['username'],
                'password' => $validated['password'],
                'fullname' => $validated['fullname'],
                'role' => $validated['role'],
                'status' => $validated['status'] ?? Status::ACTIVE->value,
            ]);
            if($user->role === UserRole::TELLER) {
                Teller::create([
                    'user_id' => $user->id,
                    'name' => $validated['fullname'],
                    'class' => $validated['class'],
                    'phone_number' => $validated['phone_number'],
                ]);
                return response()->json([
                    "message" => "User created successfully",
                    "user" => $user
                ], 200);
            }
            return response()->json([
               "message" => "User created successfully",
                "user" => $user
            ], 200);
        } catch (\Throwable $e) {
            return response()->json([
                "message" => "User fail to create successfully",
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
            'username' => ['sometimes', 'required', 'string'],
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

    public function block(int $user_id):JsonResponse
    {
        try {
            $user = User::findOrFail($user_id);

            if($user->status === Status::BLOCKED){
                return response()->json([
                    "message" => "User has blocked.",
                ], 400);
            }
            $user->update([
                "status" => Status::BLOCKED->value,
            ]);
            return response()->json([
                "message" => "User has been successfully blocked.",
                "data" => $user,
            ], 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                "message" => "User not found"
            ], 404);
        } catch(\Throwable $e){
            return response()->json([
                "message" => "Internal Server Error"
            ], 500);
        }
    }
}
