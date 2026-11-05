<?php

namespace Database\Seeders;

use App\Models\Shift;
use App\Models\Teller;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ShiftTellerSeeder extends Seeder
{
    public function run(): void
    {
        $tellerUser = User::where('username', 'teller')->firstOrFail();
        $teller = Teller::where('user_id', $tellerUser->id)->firstOrFail();
        $shift = Shift::where('teller_id', $teller->id)
            ->whereDate('opened_at', today())
            ->firstOrFail();

        $pivotExists = DB::table('shift_teller')
            ->where('shift_id', $shift->id)
            ->where('teller_id', $teller->id)
            ->exists();

        if (! $pivotExists) {
            DB::table('shift_teller')->insert([
                'shift_id' => $shift->id,
                'teller_id' => $teller->id,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
