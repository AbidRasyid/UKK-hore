<?php

use App\enum\TransactionTypes;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
    $table->foreignId('customer_id')
        ->constrained() 
        ->restrictOnDelete();

    $table->foreignId('user_id')
        ->constrained()
        ->restrictOnDelete();
    $table->foreignId('daily_report_id')
        ->nullable()
        ->default(null);
    $table->date('transaction_date');
    $table->enum('transaction_type', array_column(TransactionTypes::cases(), 'value'));
    $table->decimal('amount', 15, 2);

    $table->timestamps();
    });
    DB::statement('ALTER TABLE transactions ADD CONSTRAINT amount_check CHECK (amount > 0)');
    }
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('ALTER TABLE transactions DROP CONSTRAINT amount_check');
        Schema::dropIfExists('transactions');
    }
};
