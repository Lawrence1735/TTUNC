<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Trainee profile records are created when an application is approved
     * and the applicant's user account is provisioned. completion_rate is
     * stored as a cached integer (0-100) and recomputed by the model accessor
     * from attendance_records on demand; the stored value is used for fast
     * dashboard queries without joining attendance.
     */
    public function up(): void
    {
        Schema::create('trainees', function (Blueprint $table): void {
            $table->id();

            $table->foreignId('user_id')
                  ->unique()
                  ->constrained('users')
                  ->cascadeOnDelete();

            // Cached completion rate (0-100); recomputed on attendance save
            $table->unsignedTinyInteger('completion_rate')->default(0)
                  ->comment('Cached value; recomputed from attendance_records');

            $table->enum('current_status', [
                'active',
                'inactive',
                'completed',
                'dropped',
            ])->default('active');

            // Assignment details
            $table->string('chapter', 80)->nullable();
            $table->string('instrument', 80)->nullable();
            $table->string('voice', 80)->nullable();

            // Total expected training sessions (configurable per group)
            $table->unsignedSmallInteger('total_expected_sessions')->default(30)
                  ->comment('Denominator for completion rate calculation');

            $table->date('date_joined')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->index('current_status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('trainees');
    }
};
