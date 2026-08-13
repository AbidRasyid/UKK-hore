<?php

namespace App\Http\Controllers;

use App\Http\Requests\UserRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;

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
                'role' => $validated['role']
            ]);
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

    public function show(int $id): JsonResponse {
        try {
            $user = User::findOrFail($id);
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

    public function update(UserRequest $request, int $id):JsonResponse
    {
        $validated = $request->validated();
        try {
            $user = User::findOrFail($id);
            $user->update([
                'username' => $validated['username'],
                'password' => $validated['password'],
                'fullname' => $validated['fullname'],
                'role' => $validated['role'],
                'status' => $validated['status']
            ]);
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

    // public function block(int $id):JsonResponse
    // {
    //     try {
    //         $user = User::findOrFail($id);

    //         if($user->status === Status::BLOCKED){
    //             return response()->json([
    //                 "message" => "User has blocked.",
    //             ], 400);
    //         }
    //         $user->update([
    //             "status" => Status::BLOCKED->value,
    //         ]);
    //         return response()->json([
    //             "message" => "User has been successfully blocked.",
    //             "data" => $user,
    //         ], 200);
    //     } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
    //         return response()->json([
    //             "message" => "User not found"
    //         ], 404);
    //     } catch(\Throwable $e){
    //         Log::error("BlockUser Error for ID $id: " . $e->getMessage());

    //         return response()->json([
    //             "message" => "Internal Server Error"
    //         ], 500);
    //     }
    // }
}
