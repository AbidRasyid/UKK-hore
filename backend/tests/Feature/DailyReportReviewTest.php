<?php

use App\Models\DailyReport;
use App\Models\User;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Laravel\Sanctum\Sanctum;

beforeEach(function () {
    Schema::dropIfExists('activity_logs');
    Schema::dropIfExists('daily_reports');
    Schema::dropIfExists('users');

    Schema::create('users', function (Blueprint $table) {
        $table->id();
        $table->string('username')->unique();
        $table->string('password');
        $table->string('fullname');
        $table->string('role');
        $table->string('status');
        $table->timestamps();
    });

    Schema::create('daily_reports', function (Blueprint $table) {
        $table->id();
        $table->unsignedBigInteger('user_id');
        $table->date('report_date');
        $table->unsignedBigInteger('opening_balance')->default(0);
        $table->unsignedBigInteger('closing_balance')->nullable();
        $table->unsignedBigInteger('total_deposits')->default(0);
        $table->unsignedBigInteger('total_withdrawals')->default(0);
        $table->unsignedBigInteger('system_balance')->nullable();
        $table->unsignedBigInteger('physical_balance')->nullable();
        $table->string('status')->default('draft');
        $table->unsignedBigInteger('approved_by')->nullable();
        $table->timestamps();
    });

    Schema::create('activity_logs', function (Blueprint $table) {
        $table->id();
        $table->unsignedBigInteger('user_id')->nullable();
        $table->unsignedBigInteger('customer_id')->nullable();
        $table->string('action');
        $table->text('description');
        $table->string('ip_address')->nullable();
        $table->timestamps();
    });
});

function createReportReviewUser(string $role): User
{
    return User::create([
        'username' => "{$role}-reviewer",
        'password' => 'password',
        'fullname' => ucfirst($role).' Reviewer',
        'role' => $role,
        'status' => 'active',
    ]);
}

function createReviewableDailyReport(User $teller, ?int $closingBalance = 20000): DailyReport
{
    return DailyReport::create([
        'user_id' => $teller->id,
        'report_date' => now()->toDateString(),
        'opening_balance' => 10000,
        'closing_balance' => $closingBalance,
        'total_deposits' => 15000,
        'total_withdrawals' => 5000,
        'system_balance' => 20000,
        'physical_balance' => $closingBalance,
        'status' => 'draft',
    ]);
}

it('allows supervisors to reject a closed daily report', function () {
    $supervisor = createReportReviewUser('supervisor');
    $report = createReviewableDailyReport(createReportReviewUser('teller'));
    Sanctum::actingAs($supervisor);

    $this->patchJson("/api/daily-report/{$report->id}/reject")
        ->assertOk()
        ->assertJsonPath('data.status', 'rejected')
        ->assertJsonPath('data.approved_by', null);

    $this->assertDatabaseHas('activity_logs', [
        'user_id' => $supervisor->id,
        'action' => 'REPORT_REJECTED',
    ]);
});

it('allows supervisors to approve a closed daily report', function () {
    $supervisor = createReportReviewUser('supervisor');
    $report = createReviewableDailyReport(createReportReviewUser('teller'));
    Sanctum::actingAs($supervisor);

    $this->patchJson("/api/daily-report/{$report->id}/approve")
        ->assertOk()
        ->assertJsonPath('data.status', 'approved')
        ->assertJsonPath('data.approved_by', $supervisor->id);
});

it('does not allow a report to be reviewed before its shift is closed', function () {
    Sanctum::actingAs(createReportReviewUser('supervisor'));
    $report = createReviewableDailyReport(createReportReviewUser('teller'), null);

    $this->patchJson("/api/daily-report/{$report->id}/reject")
        ->assertUnprocessable();

    expect($report->fresh()->status)->toBe('draft');
});

it('does not allow a teller to reject a daily report', function () {
    Sanctum::actingAs(createReportReviewUser('teller'));
    $report = createReviewableDailyReport(createReportReviewUser('supervisor'));

    $this->patchJson("/api/daily-report/{$report->id}/reject")
        ->assertForbidden();

    expect($report->fresh()->status)->toBe('draft');
});

it('does not allow a reviewed report to be changed to another decision', function () {
    Sanctum::actingAs(createReportReviewUser('supervisor'));
    $report = createReviewableDailyReport(createReportReviewUser('teller'));

    $this->patchJson("/api/daily-report/{$report->id}/reject")->assertOk();
    $this->patchJson("/api/daily-report/{$report->id}/approve")->assertStatus(409);

    expect($report->fresh()->status)->toBe('rejected');
});
