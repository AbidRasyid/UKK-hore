<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DailyReport extends Model
{
    protected $fillable = [
        'user_id',
        'shift_id',
        'report_date',
        'opening_balance',
        'closing_balance',
        'total_deposits',
        'total_withdrawals',
        'system_balance',
        'physical_balance',
        'status',
        'approved_by',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function shift()
    {
        return $this->belongsTo(Shift::class);
    }

    public function transaction()
    {
        return $this->hasMany(Transaction::class);
    }

    public function cashDenominations()
    {
        return $this->belongsToMany(CashDenomination::class, 'cash_denomination_daily_report')
            ->withPivot('quantity')
            ->withTimestamps();
    }
}
