<?php

namespace App\Http\Controllers;

use App\enum\AccountCode;
use App\enum\ActivityAction;
use App\Events\PinRequested;
use App\Events\TransactionCompleted;
use App\Models\AccountingJournal;
use App\Models\Customer;
use App\Models\Configuration;
use App\Models\Shift;
use App\Models\Teller;
use App\Models\Transaction;
use App\enum\Positions;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use App\enum\UserRole;
use App\enum\Status;
use App\Services\LogService;

class TransactionController extends Controller
{

    public function supervisorIndex()
    {
        $today = now()->toDateString();

        $dailyVolume = Transaction::query()
            ->whereDate('transaction_date', $today)
            ->sum('amount');

        $transactions = Transaction::query()
            ->with('user:id,fullname')
            ->whereDate('transaction_date', $today)
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->limit(10)
            ->get(['id', 'user_id', 'transaction_date', 'transaction_type', 'amount', 'created_at'])
            ->map(fn (Transaction $transaction) => [
                'id' => $transaction->id,
                'transaction_date' => $transaction->transaction_date,
                'transaction_type' => $transaction->transaction_type,
                'amount' => $transaction->amount,
                'teller_name' => $transaction->user?->fullname,
            ]);

        return response()->json([
            'data' => [
                'daily_volume' => $dailyVolume,
                'transactions' => $transactions,
            ],
        ]);
    }

    public function supervisorHistory()
    {
        $filters = request()->validate([
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date', 'after_or_equal:date_from'],
            'search' => ['nullable', 'string', 'max:100'],
            'per_page' => ['sometimes', 'integer', 'min:10', 'max:100'],
        ]);

        $transactions = Transaction::query()
            ->with('user:id,fullname')
            ->when($filters['date_from'] ?? null, fn ($query, $date) => $query->whereDate('transaction_date', '>=', $date))
            ->when($filters['date_to'] ?? null, fn ($query, $date) => $query->whereDate('transaction_date', '<=', $date))
            ->when($filters['search'] ?? null, function ($query, $search) {
                $query->where(function ($query) use ($search) {
                    $query->where('id', 'like', "%{$search}%")
                        ->orWhere('transaction_type', 'like', "%{$search}%")
                        ->orWhere('amount', 'like', "%{$search}%")
                        ->orWhereHas('user', fn ($userQuery) => $userQuery->where('fullname', 'like', "%{$search}%"));
                });
            })
            ->orderByDesc('transaction_date')
            ->orderByDesc('id')
            ->paginate($filters['per_page'] ?? 10)
            ->appends(request()->query())
            ->through(fn (Transaction $transaction) => [
                'id' => $transaction->id,
                'transaction_date' => $transaction->transaction_date,
                'transaction_type' => $transaction->transaction_type,
                'amount' => $transaction->amount,
                'teller_name' => $transaction->user?->fullname,
            ]);

        return response()->json($transactions);
    }

    public function tellerHistory(Request $request)
    {
        $teller = Auth::user();
        if (!$teller || $teller->status !== Status::ACTIVE) {
            return response()->json(['message' => 'Unauthorized access'], 403);
        }

        $filters = $request->validate([
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date', 'after_or_equal:date_from'],
            'search' => ['nullable', 'string', 'max:100'],
            'per_page' => ['sometimes', 'integer', 'min:10', 'max:100'],
        ]);

        $transactions = Transaction::query()
            ->with('customer:id,account_number')
            ->where('user_id', $teller->id)
            ->when($filters['date_from'] ?? null, fn ($query, $date) => $query->whereDate('transaction_date', '>=', $date))
            ->when($filters['date_to'] ?? null, fn ($query, $date) => $query->whereDate('transaction_date', '<=', $date))
            ->when($filters['search'] ?? null, function ($query, $search) {
                $query->where(function ($query) use ($search) {
                    $query->where('id', 'like', "%{$search}%")
                        ->orWhere('transaction_type', 'like', "%{$search}%")
                        ->orWhere('amount', 'like', "%{$search}%")
                        ->orWhereHas('customer', fn ($customerQuery) => $customerQuery->where('account_number', 'like', "%{$search}%"));
                });
            })
            ->orderByDesc('transaction_date')
            ->orderByDesc('id')
            ->paginate($filters['per_page'] ?? 10)
            ->appends($request->query())
            ->through(fn (Transaction $transaction) => [
                'id' => $transaction->id,
                'transaction_date' => $transaction->transaction_date,
                'transaction_type' => $transaction->transaction_type,
                'amount' => $transaction->amount,
                'account_number' => $transaction->customer?->account_number,
                'created_at' => $transaction->created_at,
            ]);

        return response()->json($transactions);
    }

    public function teller_daily_show(int $teller_id) {
        try {
            if (Auth::id() !== $teller_id) {
                return response()->json([
                    'message' => 'Unauthorized access',
                ], 403);
            }
            if (Auth::user()->role !== (UserRole::TELLER)) {
                return response()->json([
                    'message' => 'Unauthorized access',
                ], 403);
            }
            if (Auth::user()->status !== Status::ACTIVE) {
                return response()->json([
                    'message' => 'Unauthorized access',
                ], 403);
            }
            $data = Transaction::query()
                ->with(['customer:id,account_number'])
                ->where('user_id', $teller_id)
                ->where(function ($query) {
                    $query->whereDate('transaction_date', now()->toDateString());
                })
                ->orderBy('transaction_date', 'desc')
                ->get()->map(function (Transaction $transaction) {
                    $response = $transaction->toArray();
                    $response['account_number'] = $transaction->customer?->account_number;
                    unset($response['customer']);
                    return $response;
                });

            return response()->json([
                'message' => 'data has been loaded successfully',
                'data' => $data
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                'message' => 'data not loaded',
                'error' => $th->getMessage()
            ], 500);
        }
    }
    public function show(int $customer_id){
        try {
            $data = Transaction::query()
                ->with(['user:id,fullname', 'customer:id,student_name'])
                ->where('customer_id', $customer_id)
                ->orderBy('id', 'desc')
                ->get()
                ->map(function (Transaction $transaction) {
                    $response = $transaction->toArray();
                    $response['teller_name'] = $transaction->user?->fullname;
                    $response['customer_name'] = $transaction->customer?->student_name;

                    return $response;
                });

            return response()->json([
                'message' => 'data has been loaded successfully',
                'data' => $data
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                'message' => 'data not loaded',
            ], 500);
        }
    }

    public function initiate(Request $request, int $customer_id)
    {
        $validated = $request->validate([
            'transaction_type' => ['required', 'in:deposit,withdrawal'],
            'amount' => ['required', 'integer', 'min:1']
        ]);

        $validated['user_id'] = Auth::id();
        $validated['customer_id'] = $customer_id;
        $teller = Teller::query()->where('user_id', $validated['user_id'])->first();
        $shift = $teller?->shifts()
            ->where('status', 'open')
            ->latest('opened_at')
            ->first();

        if (!$shift) {
            return response()->json([
                'status' => 'fail',
                'message' => 'Open a shift before initiating transactions.',
            ], 409);
        }

        $minimumBalance = $this->getMinimumBalance();
        
        $customer = Customer::findOrFail($customer_id);
        // Hanya cek validasi limit di sini, jangan dipotong dulu
        if ($validated['transaction_type'] === 'withdrawal') {
            if (($customer->balance - $validated['amount']) < $minimumBalance) {
                $actor = Auth::user()?->fullname ?? Auth::id() ?? 'Unknown';
                LogService::record(
                    ActivityAction::TRANSACTION_FAILED,
                    "Transaction initiation by {$actor} on Customer ID {$customer->id}. Status: Failed. Insufficient balance."
                );

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
            'shift_id' => $shift->id,
        ];

        Cache::put('transaction_' . $referenceId, $transactionData, now()->addMinutes(5));

        PinRequested::dispatch($transactionData);

        $actor = Auth::user()?->fullname ?? Auth::id() ?? 'Unknown';
        LogService::record(
            ActivityAction::TRANSACTION_INITIATED,
            "Transaction initiated by {$actor} on Transaction Ref {$referenceId}. Status: Success. PIN request sent for customer ID {$customer->id}."
        );

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
            $actor = auth::guard('customer')->user()->id;
            LogService::record(
                ActivityAction::TRANSACTION_FAILED,
                "Transaction confirmation by {$actor} on Transaction Ref {$validated['reference_id']}. Status: Failed. Transaction is already being processed."
            );

            return response()->json([
                'status' => 'fail',
                'message' => 'Transaction is being processed. Please try again later.',
            ], 423);
        }

        try {
            $transactionData = Cache::get('transaction_' . $validated['reference_id']);
            $minimumBalance = $this->getMinimumBalance(); 

            if (!$transactionData) {
                $actor = auth::guard('customer')->user()->id;
                LogService::record(
                    ActivityAction::TRANSACTION_FAILED,
                    "Transaction confirmation by {$actor} on Transaction Ref {$validated['reference_id']}. Status: Failed. Transaction not found or expired."
                );

                return response()->json([
                    'status' => 'fail',
                    'message' => 'Transaction not found or expired.',
                ], 404);
            }

            $customer = Customer::findOrFail($transactionData['customer_id']);

            if ($customer->pin === null) {
                return response()->json([
                    'status' => 'fail',
                    'message' => 'Set up a transaction PIN before confirming transactions.',
                ], 409);
            }

            if (!Hash::check($validated['pin'], $customer->pin)) {
                $actor = auth::guard('customer')->user()->id;
                LogService::record(
                    ActivityAction::TRANSACTION_FAILED,
                    "Transaction confirmation by {$actor} on Transaction Ref {$validated['reference_id']}. Status: Failed. Invalid PIN."
                );

                return response()->json([
                    'status' => 'fail',
                    'message' => 'Invalid PIN.',
                ], 401);
            }

            $transaction = DB::transaction(function () use ( $transactionData, $minimumBalance) {
                $shift = Shift::query()
                    ->whereKey($transactionData['shift_id'])
                    ->lockForUpdate()
                    ->first();

                if (!$shift || $shift->status !== 'open') {
                    throw new \DomainException('The teller shift is closed. Open a shift before initiating transactions.');
                }

                $new_transaction = Transaction::create([
                    'user_id' => $transactionData['user_id'],
                    'customer_id' => $transactionData['customer_id'],
                    'shift_id' => $transactionData['shift_id'],
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

            $actor = Auth::user()?->fullname ?? Auth::id() ?? 'Unknown';
            LogService::record(
                ActivityAction::TRANSACTION_SUCCESS,
                "Transaction confirmed by {$actor} on Transaction Ref {$validated['reference_id']}. Status: Success. {$transactionData['transaction_type']} transaction completed."
            );

            return response()->json([
                'status' => 'success',
                'message' => ucfirst($transactionData['transaction_type']) . ' successful and journal recorded',
            ], 200);

        } catch (\DomainException $e) {
            $actor = Auth::user()?->fullname ?? Auth::id() ?? 'Unknown';
            LogService::record(
                ActivityAction::TRANSACTION_FAILED,
                "Transaction confirmation by {$actor} on Transaction Ref {$validated['reference_id']}. Status: Failed. {$e->getMessage()}"
            );

            return response()->json([
                'status' => 'fail',
                'message' => $e->getMessage(),
            ], 409);
        } catch (\Exception $e) {
            $actor = Auth::user()?->fullname ?? Auth::id() ?? 'Unknown';
            LogService::record(
                ActivityAction::TRANSACTION_FAILED,
                "Transaction confirmation by {$actor} on Transaction Ref {$validated['reference_id']}. Status: Failed. {$e->getMessage()}"
            );

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