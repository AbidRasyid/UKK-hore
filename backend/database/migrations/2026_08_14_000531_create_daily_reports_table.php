<?php

use App\ReportStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('daily_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')
                ->constrained()
                ->restrictOnDelete();
            $table->date('report_date')->unique();
            $table->unsignedBigInteger('total_deposits')->default(0);
            $table->unsignedBigInteger('total_withdrawals')->default(0);
            $table->unsignedBigInteger('system_balance')->default(0);
            $table->unsignedBigInteger('physical_balance')->default(0);
            $table->enum('status', ReportStatus::cases())->default(ReportStatus::DRAFT->value);
            $table->foreignId('approved_by')->nullable()->constrained('users')->restrictOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('daily_reports');
    }
};
