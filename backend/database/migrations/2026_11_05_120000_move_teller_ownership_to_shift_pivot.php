<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('shifts', 'teller_id')) {
            $legacyAssignments = DB::table('shifts')
                ->whereNotNull('teller_id')
                ->get(['id', 'teller_id']);

            foreach ($legacyAssignments as $assignment) {
                $alreadyAssigned = DB::table('shift_teller')
                    ->where('shift_id', $assignment->id)
                    ->where('teller_id', $assignment->teller_id)
                    ->exists();

                if ($alreadyAssigned) {
                    continue;
                }

                DB::table('shift_teller')->insert([
                    'shift_id' => $assignment->id,
                    'teller_id' => $assignment->teller_id,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            Schema::table('shifts', function ($table): void {
                $table->dropConstrainedForeignId('teller_id');
            });
        }
    }

    public function down(): void
    {
        Schema::table('shifts', function ($table): void {
            $table->foreignId('teller_id')
                ->nullable()
                ->constrained('tellers')
                ->nullOnDelete();
        });

        foreach (DB::table('shift_teller')->get(['shift_id', 'teller_id']) as $assignment) {
            DB::table('shifts')
                ->where('id', $assignment->shift_id)
                ->whereNull('teller_id')
                ->update(['teller_id' => $assignment->teller_id]);
        }
    }
};
