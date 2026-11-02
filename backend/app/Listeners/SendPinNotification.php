<?php

namespace App\Listeners;

use App\Events\PinRequested;
use App\Models\Customer;
use Kreait\Firebase\Messaging\CloudMessage;
use Kreait\Laravel\Firebase\Facades\Firebase;
use Illuminate\Support\Facades\Log;

class SendPinNotification
{
    public function handle(PinRequested $event): void
    {
        $transactionData = $event->transactionData;
        $customer = Customer::where('id','=', $transactionData['customer_id'], 'and')->first();

        if (!$customer || !$customer->fcm_token) {
            Log::warning("FCM Token kosong untuk Customer ID {$transactionData['customer_id']}");
            return;
        }

        try {
            $message = CloudMessage::fromArray([
                'token' => $customer->fcm_token,
                'notification' => [
                    'title' => 'Permintaan Transaksi',
                    'body' => "Ada permintaan " . $transactionData['transaction_type'] . " sebesar Rp " . number_format($transactionData['amount'], 0, ',', '.') . ". Buka aplikasi untuk memasukkan PIN.",
                ],
                'data' => [
                    'type' => 'PIN_REQUEST',
                    'reference_id' => $transactionData['reference_id'],
                    'amount' => (string) $transactionData['amount'],
                    'transaction_type' => $transactionData['transaction_type'],
                ],
                'android' => [
                    'priority' => 'high',
                ],
            ]);

            Firebase::messaging()->send($message);
            Log::info("Notifikasi PIN terkirim ke Customer ID {$customer->id}");
        } catch (\Throwable $e) {
            Log::error("Gagal kirim notifikasi PIN: " . $e->getMessage());
        }
    }
}