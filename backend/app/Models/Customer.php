<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use App\Models\Transaction;

class Customer extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'account_number',
        'student_id',
        'student_name',
        'student_class',
        'pin'
    ];

    protected $hidden = [
        'pin'
    ];

    protected function casts(): array{
        return [
            'pin' => 'hashed'
        ];
    }

    public function user(){
        return $this->belongsTo(User::class);
    }

    public function transaction(){
        return $this->hasMany(Transaction::class);
    }
}
