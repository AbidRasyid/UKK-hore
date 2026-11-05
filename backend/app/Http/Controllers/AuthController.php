<?php

namespace App\Http\Controllers;

use App\enum\ActivityAction;
use App\enum\Status;
use App\Models\Customer;
use App\Services\LogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\PersonalAccessToken;

class AuthController extends Controller
{
    private function createAuthCookie(string $token)
    {
        return cookie(
            'token',
            $token,
            60 * 24,
            '/',
            null,
            config('app.env') === 'production',
            true,
            false,
            'Lax'
        );
    }

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
                    LogService::record(
                        ActivityAction::LOGIN_FAILED,
                        "User login failed for username [{$user->username}]. Reason: account inactive or blocked.",
                        $user,
                    );

                    return response()->json([
                        'error' => 'user inactive or blocked',
                    ], 403);
                }

                LogService::record(
                    ActivityAction::LOGIN_SUCCESS,
                    "User login succeeded for username [{$user->username}].",
                    $user,
                );

                $token = $user->createToken('auth_token')->plainTextToken;
                $cookie = $this->createAuthCookie($token);

                return response()->json([
                    'message' => 'login successfully',
                    'user' => $user,
                ], 200)->withCookie($cookie);
            }
            LogService::record(
                ActivityAction::LOGIN_FAILED,
                "User login failed for username [{$validated['username']}]. Reason: invalid credentials.",
            );

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
                'password' => ['required', 'string'],
            ]);

            $customer = Customer::query()->where('student_id', '=', $validated['student_id'])->first();

            if ((! $customer || ! Hash::check($validated['password'], $customer->password))) {
                LogService::record(
                    ActivityAction::LOGIN_FAILED,
                    "Customer login failed for student ID [{$validated['student_id']}]. Reason: invalid credentials.",
                    $customer,
                );

                return response()->json([
                    'error' => 'user invalid',
                ], 400);
            }

            if ($customer->status === Status::INACTIVE || $customer->status === Status::BLOCKED) {
                LogService::record(
                    ActivityAction::LOGIN_FAILED,
                    "Customer login failed for student ID [{$customer->student_id}]. Reason: account inactive or blocked.",
                    $customer,
                );

                return response()->json([
                    'error' => 'user inactive or blocked',
                ], 403);
            }

            LogService::record(
                ActivityAction::LOGIN_SUCCESS,
                "Customer login succeeded for student ID [{$customer->student_id}].",
                $customer,
            );

            $token = $customer->createToken('auth_token')->plainTextToken;
            $cookie = $this->createAuthCookie($token);

            return response()->json([
                'message' => 'login successfully',
                'data' => $customer,
            ], 200)->withCookie($cookie);
        } catch (\Throwable $th) {
            return response()->json([
                'error' => $th->getMessage(),
            ], 500);
        }
    }

    public function logout(Request $request): JsonResponse
    {
        try {
            // 1. Manually pull the plaintext token from the cookie
            $tokenString = $request->cookie('token');

            if ($tokenString) {
                // Find the token in the database (Sanctum hashes them, findToken handles the reverse lookup)
                $token = PersonalAccessToken::findToken($tokenString);

                if ($token) {
                    $actor =  $token->tokenable();
                    if($actor){
                        LogService::record(
                            ActivityAction::LOGOUT,
                            'user logged out successfully'
                        );
                        $token->delete(); // Securely erase it from the personal_access_tokens table
                    }
                }
            }

            // 2. Fallback: If the user object is still resolved via standard guards, wipe it too
            if ($request->user()) {
                $accessToken = $request->user()->currentAccessToken();
                if ($accessToken instanceof PersonalAccessToken) {
                    $accessToken->delete();
                }
            }

            // 3. Clear the cookie from the user's browser
            return response()->json([
                'message' => 'Logged out successfully',
            ], 200)->withCookie(cookie()->forget('token'));

        } catch (\Throwable $th) {
            return response()->json([
                'error' => 'Logout encountered an issue, but session cookie cleared.',
                'details' => $th->getMessage(),
            ], 500)->withCookie(cookie()->forget('token')); // Always return the forget cookie!
        }
    }
}
