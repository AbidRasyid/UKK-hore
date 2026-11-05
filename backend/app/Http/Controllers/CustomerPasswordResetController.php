<?php

namespace App\Http\Controllers;

use App\Mail\ResetCustomerPasswordCodeMail;
use App\Models\Customer;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class CustomerPasswordResetController extends Controller
{
    public function forgot(Request $request): JsonResponse
    {
        $validated = $request->validate(['email' => ['required', 'email']]);
        $email = Str::lower($validated['email']);
        $customer = Customer::whereRaw('LOWER(email) = ?', [$email], 'and')->first();

        if ($customer) {
            $code = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);

            DB::table('password_reset_tokens')->updateOrInsert(
                ['email' => $email],
                [
                    'token' => Hash::make($code),
                    'attempts' => 0,
                    'created_at' => now(),
                ],
            );

            Mail::to($customer->email)->send(new ResetCustomerPasswordCodeMail($code));
            Log::info("Password reset code submitted to SMTP for customer ID [{$customer->id}].");
        }

        return response()->json([
            'message' => 'If that email is registered, a password reset code has been sent.',
        ]);
    }

    public function reset(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'token' => ['required', 'digits:6'],
            'new_password' => ['required', 'string', 'min:8'],
        ]);

        $email = Str::lower($validated['email']);
        $tokenRecord = DB::table('password_reset_tokens')
            ->where('email', $email)
            ->first();

        if (!$tokenRecord) {
            return $this->invalidCodeResponse();
        }

        if (
            Carbon::parse($tokenRecord->created_at)->addMinutes(10)->isPast()
            || $tokenRecord->attempts >= 5
        ) {
            DB::table('password_reset_tokens')->where('email', $email)->delete();

            return $this->invalidCodeResponse();
        }

        if (!Hash::check($validated['token'], $tokenRecord->token)) {
            $attempts = $tokenRecord->attempts + 1;
            if ($attempts >= 5) {
                DB::table('password_reset_tokens')->where('email', $email)->delete();
            } else {
                DB::table('password_reset_tokens')
                    ->where('email', $email)
                    ->update(['attempts' => $attempts]);
            }

            return $this->invalidCodeResponse();
        }

        $customer = Customer::whereRaw('LOWER(email) = ?', [$email], 'and')->first();
        if (!$customer) {
            DB::table('password_reset_tokens')->where('email', $email)->delete();

            return $this->invalidCodeResponse();
        }

        DB::transaction(function () use ($customer, $validated, $email): void {
            $customer->update(['password' => $validated['new_password']]);
            DB::table('password_reset_tokens')->where('email', $email)->delete();
        });

        return response()->json(['message' => 'Password reset successfully.']);
    }

    private function invalidCodeResponse(): JsonResponse
    {
        return response()->json([
            'message' => 'The password reset code is invalid or has expired.',
        ], 422);
    }

    public function change(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'current_password' => ['required', 'string'],
            'new_password' => ['required', 'string', 'min:8'],
        ]);

        $customer = $request->user('customer');
        if (!$customer || !$customer->password || !Hash::check($validated['current_password'], $customer->password)) {
            return response()->json(['message' => 'Current password is incorrect.'], 422);
        }

        $customer->update(['password' => $validated['new_password']]);

        return response()->json(['message' => 'Password changed successfully.']);
    }
}
