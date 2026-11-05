<?php

namespace Database\Seeders;

use App\enum\Majors;
use App\enum\Status;
use App\enum\UserRole;
use App\Models\Customer;
use App\Models\User;
use Illuminate\Database\Seeder;

class userSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        foreach ([
            ['username' => 'admin', 'fullname' => 'Administrator', 'role' => UserRole::ADMINISTRATOR],
            ['username' => 'supervisor', 'fullname' => 'Supervisor', 'role' => UserRole::SUPERVISOR],
            ['username' => 'teller', 'fullname' => 'Teller', 'role' => UserRole::TELLER],
        ] as $user) {
            User::updateOrCreate(
                ['username' => $user['username']],
                [
                    'password' => 'secret123',
                    'fullname' => $user['fullname'],
                    'role' => $user['role']->value,
                    'status' => Status::ACTIVE->value,
                ],
            );
        }

        foreach ([
            [
                'account_number' => '2617756',
                'student_id' => '17756',
                'student_name' => 'Budi Santoso',
                'student_class' => Majors::RPL->value,
                'balance' => 13000,
            ],
            [
                'account_number' => '2617757',
                'student_id' => '17757',
                'student_name' => 'Siti Aminah',
                'student_class' => Majors::TKJ->value,
                'balance' => 13000,
            ],
        ] as $customer) {
            Customer::updateOrCreate(
                ['student_id' => $customer['student_id']],
                $customer + [
                    'pin' => '123456',
                    'status' => Status::ACTIVE->value,
                ],
            );
        }
    }
}
