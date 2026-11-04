<?php

namespace App\Models;

use App\enum\Status;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;

use App\Models\Transaction;
use Laravel\Sanctum\HasApiTokens;

class Customer extends Authenticatable
{
    use HasFactory, HasApiTokens;

    protected $table = 'customers';

    protected $fillable = [
        'account_number',
        'student_id',
        'student_name',
        'email',
        'student_class',
        'balance',
        'password',
        'pin',
        'status'
    ];

    protected $hidden = [
        'password',
        'pin',
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
