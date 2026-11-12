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
            $table->decimal('closing_balance', 15, 2)->nullable()->after('opening_balance');
            $table->decimal('system_balance', 15, 2)->nullable()->default(null)->change();
            $table->decimal('physical_balance', 15, 2)->nullable()->default(null)->change();
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
            $table->decimal('system_balance', 15, 2)->default(0)->change();
            $table->decimal('physical_balance', 15, 2)->default(0)->change();
            $table->dropColumn('closing_balance');
        });
    }
};
