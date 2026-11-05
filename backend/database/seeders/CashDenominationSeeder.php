<?php

namespace Database\Seeders;

use App\Models\CashDenomination;
use Illuminate\Database\Seeder;

class CashDenominationSeeder extends Seeder
{
    public function run(): void
    {
        foreach ([
            'Rp 1.000' => 1000,
            'Rp 2.000' => 2000,
            'Rp 5.000' => 5000,
            'Rp 10.000' => 10000,
            'Rp 20.000' => 20000,
            'Rp 50.000' => 50000,
            'Rp 100.000' => 100000,
        ] as $label => $value) {
            CashDenomination::updateOrCreate(
                ['label' => $label],
                ['value' => $value],
            );
        }
    }
}
