<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CashDenomination extends Model
{
    protected $fillable = [
        'label',
        'value'
    ];
}
