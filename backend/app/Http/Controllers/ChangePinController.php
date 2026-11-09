<?php

namespace App\Http\Controllers;

use App\enum\ActivityAction;
use App\enum\PinStatus;
use App\Models\ChangePinRequest;
use App\Models\Customer;
use App\Services\LogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Kreait\Firebase\Messaging\CloudMessage;
use Kreait\Laravel\Firebase\Facades\Firebase;

class ChangePinController extends Controller
{
    public function setup(Request $request)
    {
        $validated = $request->validate([
            'new_pin' => ['required', 'digits:6'],
        ]);
        $customerId = $request->user('customer')->id;

        $created = DB::transaction(function () use ($customerId, $validated): bool {
            $customer = Customer::query()->lockForUpdate()->findOrFail($customerId);
            if ($customer->pin !== null) {
                return false;
            }

            $customer->update(['pin' => $validated['new_pin']]);
            return true;
        });

        if (!$created) {
            return response()->json([
                'message' => 'A transaction PIN is already set. Use the change PIN flow instead.',
            ], 409);
        }

        return response()->json(['message' => 'Transaction PIN set successfully.']);
    }

    public function index() {
        $request = ChangePinRequest::with('customer:id,student_name,account_number')->get();
        return response()->json([
            'data' => $request
        ]);
    }

    public function store(Request $request){
        $request->validate([
            'old_pin' => ['required', 'digits:6'],
            'new_pin' => ['required', 'digits:6', 'different:old_pin']
        ]);

        $customer = $request->user('customer');

    
    if (!Hash::check($request->old_pin, $customer->pin)) {
        return response()->json(['message' => 'PIN lama salah'], 401);
    }

    
    $existing = ChangePinRequest::where('customer_id', $customer->id)
        ->where('status', 'pending')
        ->exists();
    if ($existing) {
        return response()->json(['message' => 'Sudah ada permintaan ganti PIN yang menunggu persetujuan.'], 400);
    }

    ChangePinRequest::create([
        'customer_id' => $customer->id,
        'new_pin' => $request->new_pin,
        'status' => PinStatus::PENDING->value,
    ]);

    return response()->json(['message' => 'Permintaan ganti PIN dikirim. Menunggu persetujuan Admin.']);
    }

    public function update(Request $request, int $id) {
        $validated = $request->validate([
            'status' => ['required', Rule::enum(PinStatus::class)]
        ]);
        $pinRequest = ChangePinRequest::findOrFail($id);
        $customer = Customer::findOrFail($pinRequest->customer_id);
    
        if ($pinRequest->status !== PinStatus::PENDING) {
            return response()->json(['message' => 'Request sudah diproses'], 400);
        }

        $status = $validated['status'];
        $pinRequest->update([
            'status' => $status,
            'approved_by' => $request->user()->id,
        ]);

        if ($status === PinStatus::APPROVED->value) {
            $customer->update(['pin' => $pinRequest->new_pin]);
        }

        $message = $status === PinStatus::APPROVED->value
            ? 'Permintaan perubahan PIN disetujui'
            : 'Permintaan perubahan PIN ditolak';

        LogService::record(
            ActivityAction::CUSTOMER_UPDATED,
            "PIN change {$status} by " . $request->user()->fullname . " for Customer ID {$customer->id}."
        );
        $this->sendStatusNotification($customer, $pinRequest->id, $status, $message);

        return response()->json([
            'message' => $message,
            'data' => $pinRequest->fresh(),
        ]);
    }

    private function sendStatusNotification(Customer $customer, int $requestId, string $status, string $message): void
    {
        if (!$customer->fcm_token) {
            Log::warning("FCM Token kosong untuk Customer ID {$customer->id}");
            return;
        }

        try {
            Firebase::messaging()->send(CloudMessage::fromArray([
                'token' => $customer->fcm_token,
                'notification' => [
                    'title' => 'Permintaan Perubahan PIN',
                    'body' => $message,
                ],
                'data' => [
                    'type' => 'PIN_CHANGE_RESULT',
                    'reference_id' => (string) $requestId,
                    'status' => $status,
                ],
                'android' => [
                    'priority' => 'high',
                ],
            ]));
        } catch (\Throwable $e) {
            Log::error("Gagal kirim notifikasi perubahan PIN: {$e->getMessage()}");
        }
    }
}
