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
        Schema::table('customers', function (Blueprint $table) {
            $table->decimal('balance', 15, 2)->default(10000)->change();
        });

        Schema::table('transactions', function (Blueprint $table) {
            $table->decimal('amount', 15, 2)->change();
        });

        Schema::table('accounting_journals', function (Blueprint $table) {
            $table->decimal('amount', 15, 2)->change();
        });

        Schema::table('daily_reports', function (Blueprint $table) {
            $table->decimal('opening_balance', 15, 2)->default(0)->change();
            $table->decimal('closing_balance', 15, 2)->nullable()->change();
            $table->decimal('total_deposits', 15, 2)->default(0)->change();
            $table->decimal('total_withdrawals', 15, 2)->default(0)->change();
            $table->decimal('system_balance', 15, 2)->nullable()->default(0)->change();
            $table->decimal('physical_balance', 15, 2)->nullable()->default(0)->change();
        });

        Schema::table('shifts', function (Blueprint $table) {
            $table->decimal('opening_balance', 15, 2)->change();
            $table->decimal('closing_balance', 15, 2)->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->unsignedBigInteger('balance')->default(10000)->change();
        });

        Schema::table('transactions', function (Blueprint $table) {
            $table->unsignedBigInteger('amount')->change();
        });

        Schema::table('accounting_journals', function (Blueprint $table) {
            $table->unsignedBigInteger('amount')->change();
        });

        Schema::table('daily_reports', function (Blueprint $table) {
            $table->unsignedBigInteger('opening_balance')->default(0)->change();
            $table->unsignedBigInteger('closing_balance')->nullable()->change();
            $table->unsignedBigInteger('total_deposits')->default(0)->change();
            $table->unsignedBigInteger('total_withdrawals')->default(0)->change();
            $table->unsignedBigInteger('system_balance')->nullable()->default(0)->change();
            $table->unsignedBigInteger('physical_balance')->nullable()->default(0)->change();
        });

        Schema::table('shifts', function (Blueprint $table) {
            $table->unsignedBigInteger('opening_balance')->change();
            $table->unsignedBigInteger('closing_balance')->nullable()->change();
        });
    }
};
