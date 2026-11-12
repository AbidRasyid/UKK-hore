<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use App\Models\AccountingJournal;

class Transaction extends Model
{
    use HasFactory;

    protected $casts = [
        'amount' => 'decimal:2',
    ];

    protected $fillable = [
        'customer_id',
        'user_id', 
        'daily_report_id',
        'shift_id',
        'transaction_date',
        'transaction_type',
        'amount'
    ];

    public function customer(){
        return $this->belongsTo(Customer::class);
    }

    public function user(){
        return $this->belongsTo(User::class);
    }

    public function accounting_journal(){
        return $this->hasMany(AccountingJournal::class);
    }

    public function daily_report(){
        return $this->belongsTo(DailyReport::class);
    }

    public function shift(){
        return $this->belongsTo(Shift::class);
    }
}
