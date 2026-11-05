<?php

namespace Database\Seeders;

use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Database\Seeder;

class ActivityLogSeeder extends Seeder
{
    public function run(): void
    {
        $teller = User::where('username', 'teller')->firstOrFail();

        ActivityLog::firstOrCreate(
            [
                'user_id' => $teller->id,
                'action' => 'LOGIN_SUCCESS',
                'description' => 'Sample activity log created by the database seeder.',
            ],
            [
                'ip_address' => '127.0.0.1',
            ],
        );
    }
}
