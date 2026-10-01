<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\enum\Status;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'username' => ['required', 'string'],
                'password' => ['required', 'string'],
            ]);
            if (Auth::attempt($validated)) {
    $user = Auth::user();

    if ($user->status === Status::INACTIVE || $user->status === Status::BLOCKED) {
        return response()->json([
            'error' => 'user inactive or blocked'
        ], 403);
    }

    $token = $user->createToken('auth_token')->plainTextToken;

    return response()->json([
        'message' => 'login successfully',
        'token' => $token,
        'token_type' => 'Bearer',
        'user' => $user,
    ], 200);
}

            return response()->json([
                'error' => 'invalid credentials',
            ], 401);
        } catch (\Throwable $e) {
            return response()->json([
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ], 500);
        }
    }

    public function CustomerLogin(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'student_id' => ['required', 'string'],
                'password' => ['required', 'string']
            ]);
            $customer = Customer::query()->where('student_id', '=', $validated['student_id'])->first();
            if ((!$customer || !password_verify($validated['password'], $customer->password))) {
                return response()->json([
                    'error' => 'user invalid'
                ], 400);
            }

            if ($customer->status === Status::INACTIVE || $customer->status === Status::BLOCKED){
                return response()->json([
                    'error' => 'user inactive or blocked'
                ], 403);
            }

            $token = $customer->createToken('auth_token')->plainTextToken;

            return response()->json([
                'message' => 'login successfully',
                'token' => $token,
                'token_type' => 'bearer',
                'data' => $customer
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                'error' => $th->getMessage(),
            ], 500);
        }
    }
}
