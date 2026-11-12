<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AccountingJournal extends Model
{
    use HasFactory;

    protected $casts = [
        'amount' => 'decimal:2',
    ];

    protected $fillable = [
        'transaction_id',
        'account_code',
        'position',
        'amount',
    ];

    public function transaction(){
        return $this->belongsTo(Transaction::class);
    }
}
