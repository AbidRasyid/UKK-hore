    <?php

    use App\enum\ReportStatus;
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
            Schema::create('daily_reports', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')
                    ->constrained()
                    ->restrictOnDelete();
                $table->date('report_date'); 
                $table->decimal('opening_balance', 15, 2)->default(0);
                $table->decimal('total_deposits', 15, 2)->default(0);
                $table->decimal('total_withdrawals', 15, 2)->default(0);
                $table->decimal('system_balance', 15, 2)->default(0);
                $table->decimal('physical_balance', 15, 2)->default(0);
                $table->enum('status', ReportStatus::cases())->default(ReportStatus::DRAFT->value);
                $table->foreignId('approved_by')->nullable()->constrained('users')->restrictOnDelete()->default(null);
                $table->timestamps();
            });
        }

        /**
         * Reverse the migrations.
         */
        public function down(): void
        {
            Schema::dropIfExists('daily_reports');
        }
    };
