<?php

namespace App\Http\Controllers;

use App\enum\ReportStatus;
use App\enum\ShiftStatus;
use App\enum\Status;
use App\enum\UserRole;
use App\Models\CashDenomination;
use App\Models\DailyReport;
use App\Models\Shift;
use App\Models\Teller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ShiftController extends Controller
{
    public function current(Request $request): JsonResponse
    {
        $teller = Teller::query()
            ->where('user_id', $request->user()->id)
            ->first();

        if (! $teller) {
            return response()->json(['message' => 'Teller profile not found.'], 404);
        }

        $shift = $teller->shifts()
            ->where('status', ShiftStatus::OPEN->value)
            ->latest('opened_at')
            ->first();

        $availableTellers = Teller::query()
            ->whereHas('user', fn ($query) => $query
                ->where('role', UserRole::TELLER->value)
                ->where('status', Status::ACTIVE->value))
            ->whereDoesntHave('shifts', fn ($query) => $query
                ->where('status', ShiftStatus::OPEN->value))
            ->with('user:id,fullname')
            ->orderBy('id')
            ->get(['id', 'user_id'])
            ->map(fn (Teller $availableTeller) => [
                'id' => $availableTeller->id,
                'name' => $availableTeller->user?->fullname ?? $availableTeller->name,
            ])
            ->values();

        $data = null;
        if ($shift) {
            $transactions = $shift->transactions;
            $totalDeposits = $transactions
                ->where('transaction_type', 'deposit')
                ->sum('amount');
            $totalWithdrawals = $transactions
                ->where('transaction_type', 'withdrawal')
                ->sum('amount');

            $data = [
                'id' => $shift->id,
                'opening_balance' => $shift->opening_balance,
                'opened_at' => $shift->opened_at,
                'total_deposits' => $totalDeposits,
                'total_withdrawals' => $totalWithdrawals,
                'system_balance' => $shift->opening_balance + $totalDeposits - $totalWithdrawals,
                'transactions_count' => $transactions->count(),
                'tellers' => $shift->tellers()
                    ->with('user:id,fullname')
                    ->get()
                    ->map(fn (Teller $shiftTeller) => [
                        'id' => $shiftTeller->id,
                        'name' => $shiftTeller->user?->fullname ?? $shiftTeller->name,
                    ])
                    ->values(),
            ];
        }

        return response()->json([
            'data' => $data,
            'teller_id' => $teller->id,
            'available_tellers' => $availableTellers,
            'cash_denominations' => CashDenomination::query()
                ->orderBy('value')
                ->get(['id', 'label', 'value']),
        ]);
    }

    public function open(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'opening_balance' => ['required', 'integer', 'min:0'],
            'teller_id' => ['sometimes', 'integer', 'exists:tellers,id'],
            'teller_ids' => ['sometimes', 'array', 'min:1'],
            'teller_ids.*' => ['required', 'integer', 'distinct', 'exists:tellers,id'],
        ]);

        $user = $request->user();
        $teller = Teller::query()
            ->where('user_id', $user->id)
            ->first();

        if (! $teller) {
            return response()->json(['message' => 'Teller profile not found.'], 404);
        }
        if (
            isset($validated['teller_id'])
            && (int) $validated['teller_id'] !== $teller->id
        ) {
            return response()->json(['message' => 'The teller does not belong to the authenticated user.'], 403);
        }

        $tellerIds = collect(
            $validated['teller_ids'] ?? [$validated['teller_id'] ?? $teller->id]
        )
            ->map(fn ($id) => (int) $id)
            ->unique()
            ->sort()
            ->values();

        if (! $tellerIds->contains($teller->id)) {
            return response()->json([
                'message' => 'Select your own teller profile as part of the shift team.',
            ], 422);
        }

        $activeTellerCount = Teller::query()
            ->whereIn('id', $tellerIds)
            ->whereHas('user', fn ($query) => $query
                ->where('role', UserRole::TELLER->value)
                ->where('status', Status::ACTIVE->value))
            ->count();

        if ($activeTellerCount !== $tellerIds->count()) {
            return response()->json([
                'message' => 'The shift team can only include active teller accounts.',
            ], 422);
        }

        $shift = DB::transaction(function () use ($teller, $tellerIds, $validated): ?Shift {
            $lockedTellers = Teller::query()
                ->whereIn('id', $tellerIds)
                ->orderBy('id')
                ->lockForUpdate()
                ->get();

            $hasOpenShift = $lockedTellers->contains(fn (Teller $selectedTeller) =>
                $selectedTeller->shifts()
                    ->where('status', ShiftStatus::OPEN->value)
                    ->exists()
            );

            if ($hasOpenShift) {
                return null;
            }

            $shift = Shift::create([
                'opening_balance' => $validated['opening_balance'],
                'opened_at' => now(),
                'status' => ShiftStatus::OPEN->value,
            ]);
            $shift->tellers()->attach($lockedTellers->modelKeys());
            DailyReport::create([
                'user_id' => $teller->user_id,
                'shift_id' => $shift->id,
                'report_date' => $shift->opened_at->toDateString(),
                'opening_balance' => $shift->opening_balance,
                'closing_balance' => null,
                'total_deposits' => 0,
                'total_withdrawals' => 0,
                'system_balance' => null,
                'physical_balance' => null,
                'status' => ReportStatus::DRAFT->value,
            ]);

            return $shift;
        });

        if (! $shift) {
            return response()->json(['message' => 'You already have an open shift.'], 409);
        }

        return response()->json([
            'message' => 'Shift opened successfully.',
            'data' => $shift,
        ], 201);
    }

    public function close(Request $request, int $shiftId): JsonResponse
    {
        $validated = $request->validate([
            'closing_balance' => ['required', 'integer', 'min:0'],
            'system_balance' => ['required', 'integer', 'min:0'],
            'cash_denominations' => ['required', 'array', 'min:1'],
            'cash_denominations.*.cash_denomination_id' => [
                'required',
                'integer',
                'distinct',
                'exists:cash_denominations,id',
            ],
            'cash_denominations.*.quantity' => ['required', 'integer', 'min:1'],
        ]);

        $user = $request->user();
        $teller = Teller::query()->where('user_id', $user->id)->first();
        if (! $teller) {
            return response()->json(['message' => 'Teller profile not found.'], 404);
        }

        $denominationIds = collect($validated['cash_denominations'])
            ->pluck('cash_denomination_id');
        $denominations = CashDenomination::query()
            ->whereIn('id', $denominationIds)
            ->get()
            ->keyBy('id');
        $countedBalance = collect($validated['cash_denominations'])
            ->sum(fn (array $count): int => $denominations[$count['cash_denomination_id']]->value * $count['quantity']);

        if ($countedBalance !== $validated['closing_balance']) {
            return response()->json([
                'message' => 'The closing balance must match the total of the cash denominations.',
            ], 422);
        }

        $result = DB::transaction(function () use ($shiftId, $teller, $user, $validated) {
            $shift = Shift::query()
                ->whereKey($shiftId)
                ->lockForUpdate()
                ->first();

            if (
                ! $shift
                || $shift->status !== ShiftStatus::OPEN->value
                || ! $shift->tellers()->whereKey($teller->id)->exists()
            ) {
                return null;
            }

            $transactions = $shift->transactions();
            $totalDeposits = (clone $transactions)
                ->where('transaction_type', 'deposit')
                ->sum('amount');
            $totalWithdrawals = (clone $transactions)
                ->where('transaction_type', 'withdrawal')
                ->sum('amount');
            $systemBalance = $shift->opening_balance + $totalDeposits - $totalWithdrawals;

            if ($validated['system_balance'] !== $systemBalance) {
                return ['invalid_system_balance' => true, 'system_balance' => $systemBalance];
            }

            $report = DailyReport::query()->firstOrNew([
                'shift_id' => $shift->id,
            ]);
            $report->fill([
                'user_id' => $user->id,
                'report_date' => $shift->opened_at->toDateString(),
                'opening_balance' => $shift->opening_balance,
                'closing_balance' => $validated['closing_balance'],
                'total_deposits' => $totalDeposits,
                'total_withdrawals' => $totalWithdrawals,
                'system_balance' => $systemBalance,
                'physical_balance' => $validated['closing_balance'],
                'status' => ReportStatus::DRAFT->value,
            ]);
            $report->save();

            $report->cashDenominations()->sync(
                collect($validated['cash_denominations'])
                    ->mapWithKeys(fn (array $count): array => [
                        $count['cash_denomination_id'] => ['quantity' => $count['quantity']],
                    ])
                    ->all()
            );

            $shift->update([
                'closing_balance' => $validated['closing_balance'],
                'closed_at' => now(),
                'status' => ShiftStatus::CLOSED->value,
            ]);
            $shift->transactions()->whereNull('daily_report_id')->update([
                'daily_report_id' => $report->id,
            ]);

            return ['report' => $report->load('cashDenominations')];
        });

        if ($result === null) {
            return response()->json(['message' => 'Open shift not found.'], 404);
        }

        if (isset($result['invalid_system_balance'])) {
            return response()->json([
                'message' => 'The system balance does not match the shift transactions.',
                'system_balance' => $result['system_balance'],
            ], 422);
        }

        return response()->json([
            'message' => 'Shift closed and daily report submitted successfully.',
            'data' => $result['report'],
        ], 201);
    }
}
