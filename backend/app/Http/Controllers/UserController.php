<?php

namespace App\Http\Controllers;

use App\Http\Requests\UserRequest;
use App\enum\ActivityAction;
use App\Models\User;
use App\Services\LogService;
use Illuminate\Http\JsonResponse;
use App\enum\Status;
use App\enum\UserRole;
use App\Models\Teller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
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
        $user = DB::transaction(fn () => $this->createUser($validated));

        $actor = Auth::user()?->fullname ?? Auth::id() ?? 'Unknown';
        LogService::record(
            ActivityAction::USER_CREATED,
            "User created by {$actor} on User ID {$user->id}. Status: Success. User account created."
        );

        return response()->json([
            "message" => "User created successfully",
            "user" => $user
        ], 200);

    } catch (\Throwable $e) {
        FacadesLog::error($e->getMessage()); 
        $actor = Auth::user()?->fullname ?? Auth::id() ?? 'Unknown';
        $username = $validated['username'] ?? 'unknown';
        LogService::record(
            ActivityAction::USER_CREATED,
            "User created by {$actor} on User username {$username}. Status: Failed. {$e->getMessage()}"
        );

        return response()->json([
            "message" => "User failed to create",
            "error" => $e->getMessage() 
        ], 400);
    }
}

    public function bulkStore(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'users' => ['required', 'array', 'min:1', 'max:100'],
            'users.*.username' => ['required', 'string', 'distinct', 'unique:users,username'],
            'users.*.password' => ['required', 'string'],
            'users.*.fullname' => ['required', 'string'],
            'users.*.role' => ['required', Rule::enum(UserRole::class)],
            'users.*.status' => ['nullable', Rule::enum(Status::class)],
            'users.*.class' => ['nullable', 'string', 'required_if:users.*.role,teller'],
            'users.*.phone_number' => ['nullable', 'string', 'required_if:users.*.role,teller'],
        ]);

        try {
            $users = DB::transaction(function () use ($validated) {
                return collect($validated['users'])
                    ->map(fn (array $userData) => $this->createUser($userData));
            });

            $actor = Auth::user()?->fullname ?? Auth::id() ?? 'Unknown';
            foreach ($users as $user) {
                LogService::record(
                    ActivityAction::USER_CREATED,
                    "User created by {$actor} on User ID {$user->id}. Status: Success. User account created."
                );
            }

            return response()->json([
                'message' => 'Users created successfully',
                'data' => $users,
            ], 201);
        } catch (\Throwable $e) {
            FacadesLog::error($e->getMessage());

            return response()->json([
                'message' => 'Users failed to create.',
            ], 500);
        }
    }

    private function createUser(array $userData): User
    {
        $user = User::create([
            'username' => $userData['username'],
            'password' => $userData['password'],
            'fullname' => $userData['fullname'],
            'role' => $userData['role'],
            'status' => $userData['status'] ?? Status::ACTIVE->value,
        ]);

        if ($user->role === UserRole::TELLER) {
            Teller::create([
                'user_id' => $user->id,
                'name' => $userData['fullname'],
                'class' => $userData['class'],
                'phone_number' => $userData['phone_number'],
            ]);
        }

        return $user;
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

    public function update(Request $request, $user_id):JsonResponse
    {

        $userId = (int) $user_id;
        $validated = $request->validate([
            'username' => ['sometimes', 'required', 'string', Rule::unique('users', 'username')->ignore($userId)],
            'password' => ['sometimes', 'nullable', 'string', 'min:6'],
            'fullname' => ['sometimes', 'required', 'string'],
            'role'     => ['sometimes', 'required', Rule::enum(UserRole::class)],
            'status'   => ['sometimes', 'nullable', Rule::enum(Status::class)],
        ]);
        try {
            $user = User::findOrFail($userId);
            if (array_key_exists('password', $validated) &&empty($validated['password'])){
                unset($validated['password']);
            }
            $user->update($validated);
            $actor = Auth::user()?->fullname ?? Auth::id() ?? 'Unknown';
            LogService::record(
                ActivityAction::USER_UPDATED,
                "User updated by {$actor} on User ID {$user->id}. Status: Success. User details updated."
            );

            return response()->json([
                "message" => "User updated successfully",
                "user" => $user
            ], 200);
        }catch(\Throwable $e){
            $actor = Auth::user()?->fullname ?? Auth::id() ?? 'Unknown';
            LogService::record(
                ActivityAction::USER_UPDATED,
                "User updated by {$actor} on User ID {$userId}. Status: Failed. {$e->getMessage()}"
            );

            return response()->json([
                "message" => $e->getMessage(),
            ], 400);
        }
    }
}
