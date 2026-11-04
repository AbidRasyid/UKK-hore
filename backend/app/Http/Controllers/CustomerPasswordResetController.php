<?php

namespace App\Http\Controllers;

use App\Mail\ResetPasswordMail;
use App\Models\Customer;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Laravel\Reverb\Loggers\Log;

class CustomerPasswordResetController extends Controller
{
    public function forgot(Request $request): JsonResponse
    {
        $validated = $request->validate(['email' => ['required', 'email']]);
        $email = Str::lower($validated['email']);
        $customer = Customer::whereRaw('LOWER(email) = ?', [$email], 'and')->first();

        if ($customer) {
            Log::info("Customer has founded" . $customer->email);
            $token = Str::random(60);

            DB::table('password_reset_tokens')->updateOrInsert(
                ['email' => $email],
                [
                    'token' => hash('sha256', $token),
                    'created_at' => now(),
                ],
            );

            $resetUrl = rtrim((string) config('app.frontend_url'), '/')
                . '/reset-password?token=' . urlencode($token)
                . '&email=' . urlencode($email);

            Mail::to($email)->send(new ResetPasswordMail($resetUrl));

            Log::info("Email terkirim ke: " . $email);
        }else{
            Log::warning("Nasabah dengan email" . $email . "Tidak ditemukan");
        }

        return response()->json([
            'message' => 'If that email is registered, a password reset link has been sent.',
        ]);
    }

    public function reset(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'token' => ['required', 'string', 'size:60'],
            'new_password' => ['required', 'string', 'min:8'],
        ]);

        $email = Str::lower($validated['email']);
        $tokenRecord = DB::table('password_reset_tokens')->where('email', $email)->first();

        if (
            !$tokenRecord
            || !hash_equals($tokenRecord->token, hash('sha256', $validated['token']))
            || Carbon::parse($tokenRecord->created_at)->addMinutes(15)->isPast()
        ) {
            return response()->json([
                'message' => 'This password reset link is invalid or has expired.',
            ], 422);
        }

        $customer = Customer::whereRaw('LOWER(email) = ?', [$email], "and")->first();
        if (!$customer) {
            return response()->json([
                'message' => 'This password reset link is invalid or has expired.',
            ], 422);
        }

        $customer->update(['password' => $validated['new_password']]);
        DB::table('password_reset_tokens')->where('email', $email)->delete();

        return response()->json(['message' => 'Password reset successfully.']);
    }

    public function change(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'current_password' => ['required', 'string'],
            'new_password' => ['required', 'string', 'min:8'],
        ]);

        $customer = $request->user('customer');
        if (!$customer || !Hash::check($validated['current_password'], $customer->password)) {
            return response()->json(['message' => 'Current password is incorrect.'], 422);
        }

        $customer->update(['password' => $validated['new_password']]);

        return response()->json(['message' => 'Password changed successfully.']);
    }
}
