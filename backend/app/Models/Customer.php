<?php

namespace App\Models;

use App\Status;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use App\Models\Transaction;
use Laravel\Sanctum\HasApiTokens;

class Customer extends Model
{
    use HasFactory, HasApiTokens;

    protected $fillable = [
        'user_id',
        'account_number',
        'student_id',
        'student_name',
        'student_class',
        'password',
        'pin',
        'status'
    ];

    protected $hidden = [
        'password',
        'pin'
    ];

    
    protected function casts(): array{
        return [
            'password' => 'hashed',
            'pin' => 'hashed',
            'status' => Status::class,
        ];
    }

    public function transaction(){
        return $this->hasMany(Transaction::class);
    }
}
