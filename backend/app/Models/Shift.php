<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Shift extends Model
{
    protected $fillable = [
    'opening_balance',
    'closing_balance',
    'opened_at',
    'closed_at',
    'status'
    ];

    protected function casts(): array
    {
        return [
            'opened_at' => 'datetime',
            'closed_at' => 'datetime',
        ];
    }

    public function tellers()
    {
        return $this->belongsToMany(Teller::class, 'shift_teller')
            ->withTimestamps();
    }

    public function dailyReport()
    {
        return $this->hasOne(DailyReport::class);
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }
}