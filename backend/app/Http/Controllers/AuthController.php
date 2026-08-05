<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Status;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function verification(Request $request): JsonResponse
    {

        try {
            $validated = $request->validate([
            'username' => ['required', 'string'],
            'password' => ['required', 'string'],
        ]);
        if(Auth::attempt($validated)){
            $user = Auth::user();
            if($user->status === Status::ACTIVE){
                $token = $user->createToken('auth_token')->plainTextToken;
                return response()->json([
                    "message" => "login successfully",
                    "token" => $token,
                    "token_type" => "Bearer",
                    "user" => $user
                ], 200);
                }
                return response()->json([
                    'error' => 'user has blocked'
                ], 403);
        }
            return response()->json([
                'error' => 'invalid',
            ], 401);
        } catch (\Throwable $e) {
            return response()->json([
                'error' => $e->getMessage(),
                        'file' => $e->getFile(),
        'line' => $e->getLine(),
            ], 500);
        }
    }
}
