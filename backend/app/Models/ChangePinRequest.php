<?php

namespace App\Models;

use App\enum\PinStatus;
use Illuminate\Database\Eloquent\Model;
use Override;

class ChangePinRequest extends Model
{
    protected $fillable = [
        'customer_id',
        'new_pin',
        'status',
        'approved_by'
    ];

    protected $hidden = [
        'new_pin'
    ];

    #[Override]
    protected function casts(): array
    {
        return [
            'new_pin' => 'hashed',
            'status' => PinStatus::class,
        ];
    }

    public function customer() {
        return $this->belongsTo(Customer::class);
    }
    public function approver() {
        return $this->belongsTo(User::class, 'approved_by');
    }

}
