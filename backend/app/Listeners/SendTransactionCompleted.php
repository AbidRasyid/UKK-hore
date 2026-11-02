<?php

namespace App\Listeners;

use App\Events\TransactionCompleted;
use App\Models\Customer;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Kreait\Firebase\Messaging\CloudMessage;
use Kreait\Laravel\Firebase\Facades\Firebase;

class SendTransactionCompleted
{
    public function handle(TransactionCompleted $event): void
    {
        $transaction = data_get($event->payload, 'transaction');
        $customer = Customer::findOrFail($transaction->customer_id);
        $teller = User::findOrFail($transaction->user_id);

        // 1. Kirim ke Nasabah (Notif Sukses)
        if ($customer && $customer->fcm_token) {
            $this->sendNotif($customer->fcm_token, 'Transaksi Berhasil', "Transaksi {$transaction->transaction_type} sebesar Rp " . number_format($transaction->amount, 0, ',', '.') . " berhasil.");
        }

        // 2. Kirim ke Teller (Notif Sukses)
        if ($teller && $teller->fcm_token) {
            $this->sendNotif($teller->fcm_token, 'Transaksi Selesai', "Nasabah {$customer->student_name} berhasil melakukan {$transaction->transaction_type}.");
        }
    }

    private function sendNotif($token, $title, $body)
    {
        try {
            $message = CloudMessage::fromArray([
                'token' => $token,
                'notification' => ['title' => $title, 'body' => $body],
                'android' => ['priority' => 'high'],
            ]);
            Firebase::messaging()->send($message);
        } catch (\Throwable $e) {
            Log::error("Gagal kirim notif: " . $e->getMessage());
        }
    }
}