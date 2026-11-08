<?php

namespace App\Http\Controllers;

use App\enum\ActivityAction;
use Illuminate\Http\Request;
use App\Models\DailyReport;
use App\Models\User;
use App\Services\LogService;
use Illuminate\Support\Facades\Auth;

class DailyReportController extends Controller
{
    public function index(){
        try {
            $data = DailyReport::query()
                ->with('user:id,fullname')
                ->whereNotNull('closing_balance')
                ->get();
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

    public function tellerIndex(int $user_id)
    {
        return response()->json([
            'message' => 'daily reports loaded successfully',
            'data' => DailyReport::query()
                ->where('user_id', $user_id)
                ->whereNotNull('closing_balance')
                ->latest('report_date')
                ->latest('id')
                ->get(),
        ], 200);
    }

    public function show(int $daily_report_id)
    {
        try {
            $dailyreport = DailyReport::findOrFail($daily_report_id);
            $teller = User::find($dailyreport['user_id'], 'fullname');
            $supervisor = User::find($dailyreport['approved_by'], 'fullname');
            $transaction = $dailyreport->transaction;
            $tellers = $dailyreport->shift?->tellers()
                ->with('user:id,fullname')
                ->get()
                ->map(fn ($shiftTeller) => $shiftTeller->user?->fullname ?? $shiftTeller->name)
                ->filter()
                ->values() ?? collect();

            return response()->json([
                'message' => 'data has been loaded successfully',
                'teller' => $teller?->fullname,
                'tellers' => $tellers->isNotEmpty()
                    ? $tellers
                    : collect([$teller?->fullname])->filter()->values(),
                'supervisor' => $supervisor->fullname ?? null,
                'data' => $dailyreport,
                'transactions' => $transaction,
                'cash_denominations' => $dailyreport->cashDenominations,
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
            if ($dailyreport->closing_balance === null) {
                return response()->json([
                    'message' => 'An open shift cannot be approved before it is closed.',
                ], 422);
            }
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
