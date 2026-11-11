<?php

namespace App\Http\Controllers;

use App\enum\ActivityAction;
use App\enum\ReportStatus;
use App\Models\DailyReport;
use App\Models\User;
use App\Services\LogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DailyReportController extends Controller
{
    public function index()
    {
        try {
            $data = DailyReport::query()
                ->with('user:id,fullname')
                ->whereNotNull('closing_balance')
                ->get();

            return response()->json([
                'message' => 'data has been loaded successfully',
                'data' => $data,
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
                'error' => $th->getMessage(),
            ], 404);
        }
    }

    public function approve(int $daily_report_id, Request $request)
    {
        return $this->review($daily_report_id, $request, ReportStatus::APPROVED);
    }

    public function reject(int $daily_report_id, Request $request): JsonResponse
    {
        return $this->review($daily_report_id, $request, ReportStatus::REJECTED);
    }

    private function review(int $daily_report_id, Request $request, ReportStatus $status): JsonResponse
    {
        $result = DB::transaction(function () use ($daily_report_id, $request, $status): array {
            $dailyReport = DailyReport::query()->lockForUpdate()->findOrFail($daily_report_id);

            if ($dailyReport->closing_balance === null) {
                return ['error' => 'An open shift cannot be reviewed before it is closed.', 'status' => 422];
            }

            if ($dailyReport->status !== ReportStatus::DRAFT->value) {
                return ['error' => 'This daily report has already been reviewed.', 'status' => 409];
            }

            $dailyReport->update([
                'status' => $status->value,
                'approved_by' => $status === ReportStatus::APPROVED ? $request->user()->id : null,
            ]);

            return ['data' => $dailyReport->fresh(), 'status' => 200];
        });

        if (isset($result['error'])) {
            return response()->json(['message' => $result['error']], $result['status']);
        }

        $isApproved = $status === ReportStatus::APPROVED;
        $action = $isApproved ? ActivityAction::REPORT_APPROVED : ActivityAction::REPORT_REJECTED;
        $verb = $isApproved ? 'approved' : 'rejected';
        $actor = $request->user()->fullname;
        LogService::record(
            $action,
            "Report {$verb} by {$actor} on Daily Report ID {$daily_report_id}."
        );

        return response()->json([
            'message' => $isApproved
                ? 'Daily report approved successfully.'
                : 'Daily report rejected successfully.',
            'data' => $result['data'],
        ]);
    }
}
