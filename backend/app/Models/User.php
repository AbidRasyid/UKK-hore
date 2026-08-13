<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
// use Database\Factories\UserFactory;
// use Illuminate\Database\Eloquent\Attributes\Fillable;
// use Illuminate\Database\Eloquent\Attributes\Hidden;
// use Illuminate\Database\Eloquent\Attributes\Table;
use App\UserRole;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use App\Models\Transaction;
use App\Status;
use Laravel\Sanctum\HasApiTokens;

// use Illuminate\Support\Carbon;
// use Illuminate\Support\Str;


class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;
    
    protected $fillable = [
        "username",
        "password",
        "fullname",
        "role",
        "status"
    ];

    protected $hidden = [
        "password",
        "remember_token"
    ];

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
            'role' => UserRole::class,
            'status' => Status::class,
        ];
    }

    public function transaction(){
        return $this->hasMany(Transaction::class);
    }

    public function dashboardRoute(): string
{
    return match ($this->role) {
        UserRole::ADMINISTRATOR => 'admin',
        UserRole::SUPERVISOR => 'supervisor',
        UserRole::TELLER => 'teller',
    };
}
}
