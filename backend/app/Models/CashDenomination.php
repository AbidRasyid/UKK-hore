<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CashDenomination extends Model
{
    protected $fillable = [
        'label',
        'value'
    ];

    public function dailyReports()
    {
        return $this->belongsToMany(DailyReport::class, 'cash_denomination_daily_report')
            ->withPivot('quantity')
            ->withTimestamps();
    }
}
