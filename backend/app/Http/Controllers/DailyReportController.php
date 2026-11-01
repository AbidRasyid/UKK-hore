<?php

namespace App\Http\Controllers;

use App\ActivityAction;
use Illuminate\Http\Request;
use App\Models\Transaction;
use App\Models\DailyReport;
use App\Models\User;
use App\Services\LogService;
use Illuminate\Support\Facades\Auth;

class DailyReportController extends Controller
{
    public function index(){
        try {
            $data = DailyReport::all();
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

    public function initiateStore(int $user_id)
    {
        try {
            $transactions = Transaction::with('customer')
                ->where('user_id', $user_id)
                ->whereNull('daily_report_id')
                ->get();

            $totalDeposits = $transactions->where('transaction_type', 'deposit')->sum('amount');
            $totalWithdrawals = $transactions->where('transaction_type', 'withdrawal')->sum('amount');

            $formattedTransactions = $transactions->map(function ($trx) {
                return [
                    'id' => $trx->id,
                    'account_number' => $trx->customer ? $trx->customer->account_number : 'Unknown',
                    'transaction_type' => $trx->transaction_type,
                    'amount' => $trx->amount,
                    'transaction_date' => $trx->transaction_date,
                ];
            });

            return response()->json([
                'message' => 'form retrieved successfully',
                'data' => [
                    'transactions' => $formattedTransactions,
                    'total_deposits' => $totalDeposits,
                    'total_withdrawals' => $totalWithdrawals,
                    'system_balance' => $totalDeposits - $totalWithdrawals,
                ]
            ], 200);
        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Failed to retrieve form',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function tellerIndex(int $user_id)
    {
        return response()->json([
            'message' => 'daily reports loaded successfully',
            'data' => DailyReport::query()
                ->where('user_id', $user_id)
                ->latest('report_date')
                ->latest('id')
                ->get(),
        ], 200);
    }

    public function store(Request $request, int $user_id)
    {
        $validated = $request->validate([
            'opening_balance' => ['required', 'integer', 'min:0'],
            'system_balance' => ['required', 'integer', 'min:0'],
            'total_deposits' => ['required', 'integer', 'min:0'],
            'total_withdrawals' => ['required', 'integer', 'min:0'],
            'physical_balance' => ['required', 'integer', 'min:0'],
        ]);

        if(!($validated['system_balance'] === ($validated['opening_balance'] + $validated['total_deposits'] - $validated['total_withdrawals']))){
            return response()->json([
                'message' => 'system balance is not valid',
            ], 422);
        }

        if(!($validated['physical_balance'] === $validated['system_balance'])){
            return response()->json([
                'message' => 'physical balance is not valid',
            ], 422);
        }

        $dailyreport = DailyReport::create([
            'user_id' => $user_id,
            'report_date' => now()->toDateString(),
            'opening_balance' => $validated['opening_balance'],
            'total_deposits' => $validated['total_deposits'],
            'total_withdrawals' => $validated['total_withdrawals'],
            'system_balance' => $validated['system_balance'],
            'physical_balance' => $validated['physical_balance'],
        ]);

        if($dailyreport) {
            Transaction::query()
                ->where('user_id', $user_id)
                ->where('daily_report_id', null)
                ->update(['daily_report_id' => $dailyreport->id]);
        }
        return response()->json([
            'message' => 'Daily report created successfully and waiting supervisor approval',
            'data' => $dailyreport
        ], 201);
    }

    public function show(int $daily_report_id)
    {
        try {
            $dailyreport = DailyReport::findOrFail($daily_report_id);
            $teller = User::find($dailyreport['user_id'], 'fullname');
            $supervisor = User::find($dailyreport['approved_by'], 'fullname');
            $transaction = Transaction::where('daily_report_id', '=', $daily_report_id, 'and')->get();
            return response()->json([
                'message' => 'data has been loaded successfully',
                'teller' => $teller->fullname,
                'supervisor' => $supervisor->fullname ?? null,
                'data' => $dailyreport,
                'transactions' => $transaction
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                'message' => 'data not found',
                'error' => $th->getMessage()
            ], 404);
        }
    }

    public function approve(int $daily_report_id, Request $request)
    {
        try {
            $dailyreport = DailyReport::findOrFail($daily_report_id);
            $dailyreport->update([
                'status' => 'approved',
                'approved_by' => $request->user()->id,
            ]);
            $actor = Auth::user()?->fullname ?? Auth::id() ?? 'Unknown';
            LogService::record(
                ActivityAction::REPORT_APPROVED,
                "Report approved by {$actor} on Daily Report ID {$dailyreport->id}. Status: Success. Daily report approved."
            );

            return response()->json([
                'message' => 'Daily report approved successfully',
                'data' => $dailyreport
            ], 200);
        } catch (\Throwable $th) {
        $actor = Auth::user()?->fullname ?? Auth::id() ?? 'Unknown';
        LogService::record(
            ActivityAction::REPORT_APPROVED,
            "Report approved by {$actor} on Daily Report ID {$daily_report_id}. Status: Failed. {$th->getMessage()}"
        );

        return response()->json([
                'message' => 'data not found',
            ], 404);
        }
    }
}
