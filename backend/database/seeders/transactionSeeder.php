<?php

namespace Database\Seeders;

use App\enum\TransactionTypes;
use App\Models\Customer;
use App\Models\DailyReport;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Database\Seeder;

class transactionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $teller = User::where('username', '=', 'teller', 'and')->firstOrFail();
        $report = DailyReport::whereDate('report_date', today())->firstOrFail();
        $shiftId = $report->shift_id;

        $transactions = [
            [
                'customer_id' => Customer::where('student_id', '=', '17756', 'and')->firstOrFail()->id,
                'amount' => 5000,
                'transaction_type' => TransactionTypes::DEPOSIT->value,
            ],
            [
                'customer_id' => Customer::where('student_id', '=', '17756', 'and')->firstOrFail()->id,
                'amount' => 2000,
                'transaction_type' => TransactionTypes::WITHDRAWAL->value,
            ],
            [
                'customer_id' => Customer::where('student_id', '=', '17757', 'and')->firstOrFail()->id,
                'amount' => 3000,
                'transaction_type' => TransactionTypes::DEPOSIT->value,
            ],
        ];

        foreach ($transactions as $transaction) {
            Transaction::firstOrCreate(
                $transaction + [
                    'user_id' => $teller->id,
                    'daily_report_id' => $report->id,
                    'shift_id' => $shiftId,
                    'transaction_date' => today()->toDateString(),
                ],
            );
        }
    }
}
