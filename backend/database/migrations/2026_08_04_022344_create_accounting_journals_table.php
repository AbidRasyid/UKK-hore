<?php

use App\Positions;
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
        Schema::create('accounting_journals', function (Blueprint $table) {
                $table->id();

    $table->foreignId('transaction_id')
        ->constrained()
        ->cascadeOnDelete();

    $table->string('account_code', 10);

    $table->enum('position', array_column(Positions::cases(), 'value'));

    $table->unsignedBigInteger('amount');

    $table->timestamps();   
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('accounting_journals');
    }
};
