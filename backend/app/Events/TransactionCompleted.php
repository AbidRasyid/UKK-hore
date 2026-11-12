<?php

namespace App\Events;

// use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
// use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TransactionCompleted implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * The event payload.
     * @var mixed
     */
    public $payload;

    public function __construct($payload)
    {
        $this->payload = $payload;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('teller.' . $this->payload['teller_id']),
            new PrivateChannel('customer.' . $this->payload['transaction']->customer_id),
        ];
    }

    public function broadcastAs(): string
    {
        return 'TransactionCompleted';
    }

    public function broadcastWith(): array
    {
        return [
            'customer_id' => $this->payload['transaction']->customer_id,
            'transaction_id' => $this->payload['transaction']->id,
        ];
    }
}
