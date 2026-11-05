<?php

namespace Database\Seeders;

use App\Models\Shift;
use App\Models\Teller;
use App\Models\User;
use Illuminate\Database\Seeder;

class ShiftTellerSeeder extends Seeder
{
    public function run(): void
    {
        $tellerUser = User::where('username', 'teller')->firstOrFail();
        $teller = Teller::where('user_id', $tellerUser->id)->firstOrFail();
        $shift = Shift::whereHas('tellers', fn ($query) => $query->whereKey($teller->id))
            ->whereDate('opened_at', today())
            ->firstOrFail();

        $shift->tellers()->syncWithoutDetaching([$teller->id]);
    }
}
