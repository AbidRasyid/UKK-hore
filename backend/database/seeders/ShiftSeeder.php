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

        $shift = $teller->shifts()
            ->whereDate('opened_at', today())
            ->first();

        if (! $shift) {
            $shift = Shift::create([
                'opening_balance' => 10000,
                'closing_balance' => null,
                'opened_at' => today()->startOfDay(),
                'closed_at' => null,
                'status' => ShiftStatus::OPEN->value,
            ]);
        }

        $shift->tellers()->syncWithoutDetaching([$teller->id]);
    }
}
