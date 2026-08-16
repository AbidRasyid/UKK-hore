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

    protected $table = 'customers';

    protected $fillable = [
        'user_id',
        'account_number',
        'student_id',
        'student_name',
        'student_class',
        'balance',
        'password',
        'pin',
        'status'
    ];

    protected $hidden = [
        'password',
        'pin',
        'balance'
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
