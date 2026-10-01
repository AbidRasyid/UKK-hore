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
        return $this->hasOne(User::class);
    }
}
