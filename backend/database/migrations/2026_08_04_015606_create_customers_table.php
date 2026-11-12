<?php

use App\enum\Majors;
use App\enum\Status;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            // $table->foreignId('user_id')->constrained()->restrictOnDelete();

            $table->string('account_number')->unique();
            $table->string('student_id')->unique();
            $table->string('student_name');
            $table->enum('student_class', array_column(Majors::cases(), 'value'));
            $table->decimal('balance', 15, 2)->default(10000);
            // $table->string('password');
            $table->string('pin');
            $table->enum('status', array_column(Status::cases(), 'value'))->default(Status::ACTIVE->value);
            $table->timestamps();
        });
        DB::statement('ALTER TABLE customers ADD CONSTRAINT balance_check CHECK (balance > 0)');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('ALTER TABLE customers DROP CONSTRAINT balance_check');
        Schema::dropIfExists('customers');
    }
};
