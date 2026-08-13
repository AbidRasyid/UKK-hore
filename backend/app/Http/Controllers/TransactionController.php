<?php

namespace App\Http\Controllers;

use App\AccountCode;
use App\Models\AccountingJournal;
use App\Models\Transaction;
use App\Positions;
use App\TransactionTypes;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class TransactionController extends Controller
{
    public function store(Request $request, int $customer_id)
    {
        // 1. Validasi murni untuk input dari Request
        $validated = $request->validate([
            'transaction_type' => ['required', 'in:deposit,withdrawal'],
            'amount' => ['required', 'integer', 'min:1']
        ]);

        // 2. Gabungkan data yang digenerasi oleh backend
        $validated['user_id'] = Auth::id();
        $validated['customer_id'] = $customer_id;
        $validated['transaction_date'] = now();

        try {
            // 3. Gunakan 'use' untuk memasukkan $validated ke dalam scope fungsi
            $transaction = DB::transaction(function () use ($validated) {
                
                // --- STEP A: Simpan Transaksi ---
                $new_transaction = Transaction::create([
                    'user_id' => $validated['user_id'],
                    'customer_id' => $validated['customer_id'],
                    'transaction_date' => $validated['transaction_date'], // Typo sebelumnya: mengambil transaction_type
                    'transaction_type' => $validated['transaction_type'],
                    'amount' => $validated['amount']
                ]);
        
                // --- STEP B: Penulisan Jurnal Double-Entry ---
                if ($validated['transaction_type'] === 'deposit') {
                    // Logika Setoran: Kas bertambah (Debet), Tabungan bertambah (Kredit)
                    AccountingJournal::create([
                        'transaction_id' => $new_transaction->id,
                        'account_code' => AccountCode::CASH->value,
                        'position' => Positions::DEBIT->value,
                        'amount' => $new_transaction->amount // Typo 'amout' diperbaiki
                    ]);
                    AccountingJournal::create([
                        'transaction_id' => $new_transaction->id,
                        'account_code' => AccountCode::SAVINGS->value,
                        'position' => Positions::CREDIT->value,
                        'amount' => $new_transaction->amount
                    ]);
                } else {
                    // Logika Penarikan: Kas berkurang (Kredit), Tabungan berkurang (Debet)
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
                }

                return $new_transaction;
            });

            // 4. Return respon sukses tunggal yang dinamis
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
            // Opsi: Tambahkan $th->getMessage() sementara untuk membantu proses debugging jika gagal
            return response()->json([
                'status' => 'error',
                'message' => 'Transaction failed: ' . $th->getMessage() 
            ], 500);
        }
    }
}