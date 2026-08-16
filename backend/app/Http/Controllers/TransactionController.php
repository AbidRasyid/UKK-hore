<?php

namespace App\Http\Controllers;

use App\AccountCode;
use App\Events\PinRequested;
use App\Events\TransactionCompleted;
use App\Models\AccountingJournal;
use App\Models\Customer;
use App\Models\Configuration;
use App\Models\Transaction;
use App\Positions;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class TransactionController extends Controller
{
    public function initiate(Request $request, int $customer_id)
    {
        $validated = $request->validate([
            'transaction_type' => ['required', 'in:deposit,withdrawal'],
            'amount' => ['required', 'integer', 'min:1']
        ]);

        $validated['user_id'] = Auth::id();
        $validated['customer_id'] = $customer_id;
        $minimumBalance = $this->getMinimumBalance();
        
        $customer = Customer::findOrFail($customer_id);
        
        // Hanya cek validasi limit di sini, jangan dipotong dulu
        if ($validated['transaction_type'] === 'withdrawal') {
            if (($customer->balance - $validated['amount']) < $minimumBalance) {
                return response()->json([
                    'status' => 'fail',
                    'message' => 'insufficient balance',
                ], 422);
            }
        }

        $referenceId = 'TRX-' . (string) Str::uuid();

        $transactionData = [
            'reference_id' => $referenceId,
            'user_id' => $validated['user_id'],
            'customer_id' => $customer->id,
            'amount' => $validated['amount'],
            'transaction_type' => $validated['transaction_type'],
            'transaction_date' => now()->toDateTimeString(), 
        ];

        Cache::put('transaction_' . $referenceId, $transactionData, now()->addMinutes(5));

        PinRequested::dispatch($transactionData);

        return response()->json([
            'status' => 'success',
            'message' => 'PIN request sent to customer',
            'data' => [
                'reference_id' => $referenceId,
                'amount' => $validated['amount'],
                'transaction_type' => $validated['transaction_type'],
            ]
        ], 200);
    }

    public function confirmStore(Request $request) 
    {
        $validated = $request->validate([
            'reference_id' => ['required', 'string'],
            'pin' => ['required', 'string', 'size:6'], // Wajib 6 digit PIN[cite: 1]
        ]);

        $lock = Cache::lock('transaction_lock_' . $validated['reference_id'], 10);

        if (!$lock->get()) {
            return response()->json([
                'status' => 'fail',
                'message' => 'Transaction is being processed. Please try again later.',
            ], 423);
        }

        try {
            $transactionData = Cache::get('transaction_' . $validated['reference_id']);
            $minimumBalance = $this->getMinimumBalance(); 

            if (!$transactionData) {
                return response()->json([
                    'status' => 'fail',
                    'message' => 'Transaction not found or expired.',
                ], 404);
            }

            $customer = Customer::findOrFail($transactionData['customer_id']);

            // Validasi PIN dikembalikan sesuai request Anda
            if (!Hash::check($validated['pin'], $customer->pin)) {
                return response()->json([
                    'status' => 'fail',
                    'message' => 'Invalid PIN.',
                ], 401);
            }

            $transaction = DB::transaction(function () use ( $transactionData, $minimumBalance) {
                $new_transaction = Transaction::create([
                    'user_id' => $transactionData['user_id'],
                    'customer_id' => $transactionData['customer_id'],
                    'transaction_date' => $transactionData['transaction_date'], 
                    'transaction_type' => $transactionData['transaction_type'],
                    'amount' => $transactionData['amount']
                ]);

                switch ($transactionData['transaction_type']) {
                    case 'deposit':
                        Customer::query()->where('id', '=', $transactionData['customer_id'])->increment('balance', $transactionData['amount']);
        
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
                        // Pemotongan dieksekusi di sini dengan aman (atomic query)
                        $updated = Customer::query()
                            ->where('id', $transactionData['customer_id'])
                            ->where('balance', '>=', $transactionData['amount'] + $minimumBalance)
                            ->decrement('balance', $transactionData['amount']);
                            
                        if (!$updated) {
                            throw new \Exception('Saldo tidak mencukupi saat eksekusi.');
                        }
                        
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

            Cache::forget('transaction_' . $validated['reference_id']);

            TransactionCompleted::dispatch([
                'teller_id' => $transactionData['user_id'], 
                'transaction' => $transaction
            ]);

            return response()->json([
                'status' => 'success',
                'message' => ucfirst($transactionData['transaction_type']) . ' successful and journal recorded',
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'fail',
                'message' => 'Transaction failed: ' . $e->getMessage()
            ], 500);
        } finally {
            $lock->release();
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