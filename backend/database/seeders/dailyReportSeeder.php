<?php

namespace Database\Seeders;

use App\enum\ReportStatus; // Pastikan namespace Enum kamu bener (biasanya 'Enums' huruf besar)
use App\Models\DailyReport;
use App\Models\User;
use Illuminate\Database\Seeder;

class DailyReportSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Ambil User Teller dan Supervisor
        $teller = User::where('username', '=', 'teller', 'and')->firstOrFail();
        $supervisor = User::where('username', '=','supervisor', 'and')->firstOrFail();


        DailyReport::updateOrCreate(
            [
                'report_date' => '2026-10-28',
                'user_id' => $teller->id, 
            ],
            [
                'opening_balance' => 10000,
                'total_deposits' => 8000,
                'total_withdrawals' => 2000,
                'system_balance' => 16000,
                'physical_balance' => 16000,
                'status' => ReportStatus::APPROVED->value,
                'approved_by' => $supervisor->id,
            ],
        );

        DailyReport::updateOrCreate(
            [
                'report_date' => '2026-10-29',
                'user_id' => $teller->id,
            ],
            [
                'opening_balance' => 20000,
                'total_deposits' => 15000,
                'total_withdrawals' => 5000,
                'system_balance' => 30000,
                'physical_balance' => 30000,
                'status' => ReportStatus::DRAFT->value,
                'approved_by' => null,
            ],
        );
    }
}