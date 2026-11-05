<?php

namespace Database\Seeders;

use App\enum\ReportStatus; // Pastikan namespace Enum kamu bener (biasanya 'Enums' huruf besar)
use App\Models\DailyReport;
use App\Models\Shift;
use App\Models\Teller;
use App\Models\User;
use Illuminate\Database\Seeder;

class DailyReportSeeder extends Seeder
{
    public function run(): void
    {
        $teller = User::where('username', 'teller')->firstOrFail();
        $tellerProfile = Teller::where('user_id', $teller->id)->firstOrFail();
        $shift = Shift::where('teller_id', $tellerProfile->id)
            ->whereDate('opened_at', today())
            ->firstOrFail();

        DailyReport::updateOrCreate(
            [
                'report_date' => today()->toDateString(),
                'user_id' => $teller->id,
            ],
            [
                'shift_id' => $shift->id,
                'opening_balance' => 10000,
                'total_deposits' => 8000,
                'total_withdrawals' => 2000,
                'system_balance' => 16000,
                'physical_balance' => 16000,
                'status' => ReportStatus::DRAFT->value,
                'approved_by' => null,
            ],
        );
    }
}
