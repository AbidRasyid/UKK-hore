<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Shift extends Model
{
    protected $fillable = [
    'teller_id',
    'opening_balance',
    'closing_balance',
    'opened_at',
    'closed_at',
    'status'
    ];

    public function teller(){
        return $this->belongsTo(Teller::class);
    }
}