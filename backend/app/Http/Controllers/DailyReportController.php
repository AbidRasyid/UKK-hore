<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Transaction;
use App\Models\DailyReport;

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
        $transaction = Transaction::query()
            ->where('user_id', $user_id)
            ->where('daily_report_id', null)
            ->get();
    
        return response()->json([
            'message' => 'form retrieved successfully',
            'data' => [
                'total_deposits' => $transaction->where('transaction_type', 'deposit')->sum('amount'),
                'total_withdrawals' => $transaction->where('transaction_type', 'withdrawal')->sum('amount'),
                'system_balance' => $transaction->where('transaction_type', 'deposit')->sum('amount') - $transaction->where('transaction_type', 'withdrawal')->sum('amount'),
            ]
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
            return response()->json([
                'message' => 'data has been loaded successfully',
                'data' => $dailyreport
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                'message' => 'data not found',
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
            return response()->json([
                'message' => 'Daily report approved successfully',
                'data' => $dailyreport
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                'message' => 'data not found',
            ], 404);
        }
    }
}
