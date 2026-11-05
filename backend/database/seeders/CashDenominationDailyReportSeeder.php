<?php

namespace Database\Seeders;

use App\Models\CashDenomination;
use App\Models\DailyReport;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CashDenominationDailyReportSeeder extends Seeder
{
    public function run(): void
    {
        $report = DailyReport::whereDate('report_date', today())->firstOrFail();

        foreach ([
            'Rp 1.000' => 1,
            'Rp 5.000' => 1,
            'Rp 10.000' => 1,
        ] as $label => $quantity) {
            $denomination = CashDenomination::where('label', $label)->firstOrFail();

            DB::table('cash_denomination_daily_report')->updateOrInsert(
                [
                    'daily_report_id' => $report->id,
                    'cash_denomination_id' => $denomination->id,
                ],
                [
                    'quantity' => $quantity,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
            );
        }
    }
}
