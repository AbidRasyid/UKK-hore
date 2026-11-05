<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('daily_reports', function (Blueprint $table): void {
            $table->unsignedBigInteger('closing_balance')->nullable()->after('opening_balance');
            $table->unsignedBigInteger('system_balance')->nullable()->default(null)->change();
            $table->unsignedBigInteger('physical_balance')->nullable()->default(null)->change();
        });

    }

    public function down(): void
    {
        DB::table('daily_reports')
            ->whereNull('system_balance')
            ->update(['system_balance' => 0]);
        DB::table('daily_reports')
            ->whereNull('physical_balance')
            ->update(['physical_balance' => 0]);

        Schema::table('daily_reports', function (Blueprint $table): void {
            $table->unsignedBigInteger('system_balance')->default(0)->change();
            $table->unsignedBigInteger('physical_balance')->default(0)->change();
            $table->dropColumn('closing_balance');
        });
    }
};
