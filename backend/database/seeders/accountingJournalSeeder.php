<?php

namespace Database\Seeders;

use App\enum\AccountCode;
use App\enum\Positions;
use App\enum\TransactionTypes;
use App\Models\AccountingJournal;
use App\Models\Transaction;
use Illuminate\Database\Seeder;
use InvalidArgumentException;

class accountingJournalSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Transaction::query()
            ->select(['id', 'transaction_type', 'amount'])
            ->chunkById(100, function ($transactions): void {
                foreach ($transactions as $transaction) {
                    [$cashPosition, $savingsPosition] = match ($transaction->transaction_type) {
                        TransactionTypes::DEPOSIT->value => [
                            Positions::DEBIT->value,
                            Positions::CREDIT->value,
                        ],
                        TransactionTypes::WITHDRAWAL->value => [
                            Positions::CREDIT->value,
                            Positions::DEBIT->value,
                        ],
                        default => throw new InvalidArgumentException(
                            "Unsupported transaction type [{$transaction->transaction_type}] for transaction {$transaction->id}."
                        ),
                    };

                    AccountingJournal::query()->updateOrCreate(
                        [
                            'transaction_id' => $transaction->id,
                            'account_code' => AccountCode::CASH->value,
                            'position' => $cashPosition,
                        ],
                        ['amount' => $transaction->amount],
                    );

                    AccountingJournal::query()->updateOrCreate(
                        [
                            'transaction_id' => $transaction->id,
                            'account_code' => AccountCode::SAVINGS->value,
                            'position' => $savingsPosition,
                        ],
                        ['amount' => $transaction->amount],
                    );
                }
            });
    }
}
