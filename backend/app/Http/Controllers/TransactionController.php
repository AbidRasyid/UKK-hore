<?php

namespace App\Http\Controllers;

use App\AccountCode;
use App\Models\AccountingJournal;
use App\Models\Customer;
use App\Models\Configuration;
use App\Models\Transaction;
use App\Positions;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class TransactionController extends Controller
{
    public function store(Request $request, int $customer_id)
    {
        $validated = $request->validate([
            'transaction_type' => ['required', 'in:deposit,withdrawal'],
            'amount' => ['required', 'integer', 'min:1']
        ]);

        $validated['user_id'] = Auth::id();
        $validated['customer_id'] = $customer_id;
        $validated['transaction_date'] = now();
        $minimumBalance = $this->getMinimumBalance();

        if ($validated['transaction_type'] === 'withdrawal') {
            $customer = Customer::findOrFail($validated['customer_id']);

            if (
                $customer->balance < $minimumBalance ||
                ($customer->balance - $validated['amount']) < $minimumBalance
            ) {
                return response()->json([
                    'status' => 'fail',
                    'message' => 'insufficient balance',
                ], 402);
            }
        }

        try {
            $transaction = DB::transaction(function () use ($validated) {
                switch ($validated['transaction_type']) {
                    case 'deposit':
                        $new_transaction = Transaction::create([
                        'user_id' => $validated['user_id'],
                        'customer_id' => $validated['customer_id'],
                        'transaction_date' => $validated['transaction_date'], 
                        'transaction_type' => $validated['transaction_type'],
                        'amount' => $validated['amount']
                    ]);
                        Customer::query()->where('id', '=', $validated['customer_id'])->increment('balance', $validated['amount']);
        
                        AccountingJournal::create([
                            'transaction_id' => $new_transaction->id,
                            'account_code' => AccountCode::CASH->value,
                            'position' => Positions::DEBIT->value,
                            'amount' => $new_transaction->amount 
                        ]);
                        AccountingJournal::create([
                            'transaction_id' => $new_transaction->id,
                            'account_code' => AccountCode::SAVINGS->value,
                            'position' => Positions::CREDIT->value,
                            'amount' => $new_transaction->amount
                        ]);
                        break;

                    case 'withdrawal':
                        $new_transaction = Transaction::create([
                            'user_id' => $validated['user_id'],
                            'customer_id' => $validated['customer_id'],
                            'transaction_date' => $validated['transaction_date'], 
                            'transaction_type' => $validated['transaction_type'],
                            'amount' => $validated['amount']
                        ]);

                        Customer::query()->where('id', '=', $validated['customer_id'])->decrement('balance', $validated['amount']);
                        
                        AccountingJournal::create([
                            'transaction_id' => $new_transaction->id,
                            'account_code' => AccountCode::CASH->value,
                            'position' => Positions::CREDIT->value,
                            'amount' => $new_transaction->amount
                        ]);
                        AccountingJournal::create([
                            'transaction_id' => $new_transaction->id,
                            'account_code' => AccountCode::SAVINGS->value,
                            'position' => Positions::DEBIT->value,
                            'amount' => $new_transaction->amount
                        ]);
                        break;
                }
                return $new_transaction;
            });

            return response()->json([
                'status' => 'success',
                'message' => ucfirst($transaction->transaction_type) . ' successful and journal recorded',
                'data' => [
                    'transaction_id' => $transaction->id,
                    'date' => $transaction->transaction_date,
                    'transaction_type' => $transaction->transaction_type,
                    'amount' => $transaction->amount,
                ]
            ], 201);

        } catch (\Throwable $th) {
            return response()->json([
                'status' => 'error',
                'message' => 'Transaction failed: ' . $th->getMessage() 
            ], 500);
        }
    }

    private function getMinimumBalance(): int
    {
        $minimumBalance = Configuration::query()
            ->where('key', 'min_balance')
            ->value('value');

        return (int) ($minimumBalance ?? 10000);
    }
}