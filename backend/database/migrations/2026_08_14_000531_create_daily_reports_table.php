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
                $table->date('report_date')->unique();
                $table->unsignedBigInteger('opening_balance')->default(0);
                $table->unsignedBigInteger('total_deposits')->default(0);
                $table->unsignedBigInteger('total_withdrawals')->default(0);
                $table->unsignedBigInteger('system_balance')->default(0);
                $table->unsignedBigInteger('physical_balance')->default(0);
                $table->enum('status', ReportStatus::cases())->default(ReportStatus::DRAFT->value);
                $table->foreignId('approved_by')->nullable()->constrained('users')->restrictOnDelete()->default(null);
                $table->timestamps();
            });

            Schema::table('transactions', function (Blueprint $table) {
                $table->foreign('daily_report_id')
                    ->references('id')
                    ->on('daily_reports')
                    ->restrictOnDelete();
            });
        }

        /**
         * Reverse the migrations.
         */
        public function down(): void
        {
            Schema::table('transactions', function (Blueprint $table) {
                $table->dropForeign(['daily_report_id']);
            });

            Schema::dropIfExists('daily_reports');
        }
    };
