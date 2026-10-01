<?php

namespace Database\Seeders;

use App\Models\Customer;
use App\Models\User;
use App\enum\UserRole;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class userSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::create([
            'username' => 'admin',
            'password' => 'secret123',
            'fullname' => 'administrator',
            'role' => UserRole::ADMINISTRATOR->value,
        ]);

        User::create([
            'username' => 'supervisor',
            'password' => 'secret123',
            'fullname' => 'supervisor',
            'role' => UserRole::SUPERVISOR->value
        ]);

        User::create([
            'username' => 'teller',
            'password' => 'secret123',
            'fullname' => 'teller',
            'role' => UserRole::TELLER->value
        ]);

        Customer::create([
            'account_number' => '2617756',
            'student_id' => '17756',
            'student_name' => 'customer',
            'student_class' => '12 RPL 1',
            'balance' => 10000,
            'password' => '234345',
            'pin' => '123456'
        ]);
    }
}
