<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('customers', function (Blueprint $table): void {
            $table->string('pin')->nullable()->change();
        });
    }

    public function down(): void
    {
        if (DB::table('customers')->whereNull('pin')->exists()) {
            throw new RuntimeException('Cannot make customer PIN required while accounts have no PIN.');
        }

        Schema::table('customers', function (Blueprint $table): void {
            $table->string('pin')->nullable(false)->change();
        });
    }
};
