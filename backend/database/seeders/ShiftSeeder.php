<?php

namespace Database\Seeders;

use App\enum\ShiftStatus;
use App\Models\Shift;
use App\Models\Teller;
use App\Models\User;
use Illuminate\Database\Seeder;

class ShiftSeeder extends Seeder
{
    public function run(): void
    {
        $tellerUser = User::where('username', 'teller')->firstOrFail();
        $teller = Teller::where('user_id', $tellerUser->id)->firstOrFail();

        Shift::updateOrCreate(
            [
                'teller_id' => $teller->id,
                'opened_at' => today()->startOfDay(),
            ],
            [
                'opening_balance' => 10000,
                'closing_balance' => null,
                'closed_at' => null,
                'status' => ShiftStatus::OPEN->value,
            ],
        );
    }
}
