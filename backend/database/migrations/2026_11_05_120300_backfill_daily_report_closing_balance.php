<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('daily_reports')
            ->whereNull('closing_balance')
            ->whereNotNull('physical_balance')
            ->update(['closing_balance' => DB::raw('physical_balance')]);
    }

    public function down(): void {}
};
