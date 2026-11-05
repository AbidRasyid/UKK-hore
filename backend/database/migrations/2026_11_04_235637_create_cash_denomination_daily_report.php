<?php

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
        Schema::create('cash_denomination_daily_report', function (Blueprint $table) {
            $table->id();
            $table->foreignId('daily_report_id')->constrained('daily_reports')->onDelete('cascade');
            $table->foreignId('cash_denomination_id')->constrained('cash_denominations')->onDelete('cascade');
            $table->unsignedInteger('quantity'); 
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cash_denomination_daily_report');
    }
};
