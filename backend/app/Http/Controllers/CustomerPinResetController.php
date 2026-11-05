<?php

namespace App\Http\Controllers;

use App\Mail\ResetCustomerPinMail;
use App\Models\Customer;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class CustomerPinResetController extends Controller
{
    public function requestCode(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
        ]);
        $email = Str::lower($validated['email']);
        $customer = Customer::query()
            ->whereRaw('LOWER(email) = ?', [$email])
            ->first();

        if ($customer) {
            $code = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);

            DB::table('customer_pin_reset_tokens')->updateOrInsert(
                ['email' => $email],
                [
                    'token' => Hash::make($code),
                    'attempts' => 0,
                    'created_at' => now(),
                ],
            );

            \Illuminate\Support\Facades\Mail::to($customer->email)
                ->send(new ResetCustomerPinMail($code));
        }

        return response()->json([
            'message' => 'If that email is registered, a PIN reset code has been sent.',
        ]);
    }

    public function reset(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'token' => ['required', 'digits:6'],
            'new_pin' => ['required', 'digits:6'],
        ]);

        $email = Str::lower($validated['email']);
        $tokenRecord = DB::table('customer_pin_reset_tokens')
            ->where('email', $email)
            ->first();

        if (!$tokenRecord) {
            return $this->invalidCodeResponse();
        }

        if (
            Carbon::parse($tokenRecord->created_at)->addMinutes(10)->isPast()
            || $tokenRecord->attempts >= 5
        ) {
            DB::table('customer_pin_reset_tokens')->where('email', $email)->delete();

            return $this->invalidCodeResponse();
        }

        if (!Hash::check($validated['token'], $tokenRecord->token)) {
            $attempts = $tokenRecord->attempts + 1;
            if ($attempts >= 5) {
                DB::table('customer_pin_reset_tokens')->where('email', $email)->delete();
            } else {
                DB::table('customer_pin_reset_tokens')
                    ->where('email', $email)
                    ->update(['attempts' => $attempts]);
            }

            return $this->invalidCodeResponse();
        }

        $customer = Customer::query()
            ->whereRaw('LOWER(email) = ?', [$email])
            ->first();

        if (!$customer) {
            DB::table('customer_pin_reset_tokens')->where('email', $email)->delete();

            return $this->invalidCodeResponse();
        }

        DB::transaction(function () use ($customer, $validated, $email): void {
            $customer->update(['pin' => $validated['new_pin']]);
            DB::table('customer_pin_reset_tokens')->where('email', $email)->delete();
        });

        return response()->json([
            'message' => 'PIN reset successfully.',
        ]);
    }

    private function invalidCodeResponse(): JsonResponse
    {
        return response()->json([
            'message' => 'The PIN reset code is invalid or has expired.',
        ], 422);
    }
}
