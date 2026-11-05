<?php

namespace App\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class Teller extends Model
{
    protected $fillable = [
        'user_id',
        'name',
        'class',
        'phone_number'
    ];

    public function user(){
        return $this->belongsTo(User::class);
    }

    public function shifts()
    {
        return $this->belongsToMany(Shift::class, 'shift_teller')
            ->withTimestamps();
    }
}
