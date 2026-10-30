<?php

namespace Database\Seeders;

use App\Models\Teller;
use App\Models\User;
use Illuminate\Database\Seeder;

class tellerSeeder extends Seeder
{
    public function run(): void
    {
        $teller = User::where('username', '=', 'teller', 'and')->firstOrFail();

        Teller::updateOrCreate(
            ['user_id' => $teller->id],
            [
                'name' => 'Teller Utama',
                'class' => '12 RPL 1',
                'phone_number' => '081234567890',
            ],
        );
    }
}
