<?php

namespace App\Http\Controllers;

use App\enum\ActivityAction;
use App\enum\PinStatus;
use App\Models\ChangePinRequest;
use App\Models\Customer;
use App\Services\LogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class ChangePinController extends Controller
{
    public function index() {
        $request = ChangePinRequest::with('customer:id,student_name,account_number')
            ->where('status', PinStatus::PENDING->value)
            ->get();
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
        'new_pin_hash' => $request->new_pin,
        'status' => PinStatus::PENDING->value,
    ]);

    return response()->json(['message' => 'Permintaan ganti PIN dikirim. Menunggu persetujuan Admin.']);
    }

    public function update(Request $request, $id) {
        $pinRequest = ChangePinRequest::findOrFail($id);
    
    if ($pinRequest->status !== 'pending') {
        return response()->json(['message' => 'Request sudah diproses'], 400);
    }

    // 1. Ganti PIN nasabah dengan PIN baru dari request
    $customer = Customer::findOrFail($pinRequest->customer_id);
    $customer->update(['pin' => $request->new_pin_hash]);

    // 2. Update status request
    $pinRequest->update([
        'status' => 'approved',
        'approved_by' => $request->user()->id,
    ]);

    // 3. Log ke Activity Log
    LogService::record(
        ActivityAction::CUSTOMER_UPDATED,
        "PIN change approved by " . $request->user()->fullname . " for Customer ID {$customer->id}."
    );

    return response()->json(['message' => 'PIN berhasil diubah']);
    }
}
