<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class PinRequested implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public mixed $transactionData;

    public function __construct(mixed $transactionData)
    {
        $this->transactionData = $transactionData;
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('customer' . $this->transactionData['customer_id']),
        ];
    }

    public function broadcastWith(){
        return [
            'reference_id' => $this->transactionData['reference_id'],
            'amount' => $this->transactionData['amount'],
            'message' => 'Please enter the PIN to proceed with the transaction.',
        ];
    }
}
