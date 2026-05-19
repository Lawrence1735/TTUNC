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
     * Each row represents one trainee's attendance for one session date.
     * The no_practice flag marks a date as a non-training day (holiday,
     * cancellation, etc.) — rows with no_practice = true are excluded from
     * completion rate calculations, mirroring the frontend checkbox logic.
     *
     * The unique constraint on (trainee_id, session_date) prevents duplicate
     * entries for the same trainee on the same day.
     */
    public function up(): void
    {
        Schema::create('attendance_records', function (Blueprint $table): void {
            $table->id();

            $table->foreignId('trainee_id')
                  ->constrained('trainees')
                  ->cascadeOnDelete();

            $table->date('session_date')->index();

            // When true, this date is excluded from attendance rate calculations
            $table->boolean('no_practice')->default(false)->index();

            $table->enum('status', ['present', 'absent'])->default('absent');

            $table->text('notes')->nullable();

            $table->timestamps();

            // One record per trainee per session date
            $table->unique(['trainee_id', 'session_date']);

            // Composite index for bulk attendance queries (director dashboard)
            $table->index(['trainee_id', 'no_practice', 'status']);
            $table->index(['session_date', 'no_practice']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attendance_records');
    }
};
