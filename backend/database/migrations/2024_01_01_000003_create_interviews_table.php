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
     * One application can have at most one active interview record.
     * The unique constraint on application_id enforces this at the DB level.
     * reviewer_id references the director/admin who scheduled the interview.
     */
    public function up(): void
    {
        Schema::create('interviews', function (Blueprint $table): void {
            $table->id();

            $table->foreignId('application_id')
                  ->constrained('applications')
                  ->cascadeOnDelete();

            // The director or admin who scheduled / will conduct the interview
            $table->foreignId('reviewer_id')
                  ->constrained('users')
                  ->restrictOnDelete();

            $table->dateTime('scheduled_at')->index();
            $table->string('venue', 200)->nullable();
            $table->text('notes')->nullable();

            // Outcome recorded after the interview takes place
            $table->enum('outcome', [
                'pending',
                'passed',
                'failed',
                'no_show',
            ])->default('pending');

            $table->text('outcome_notes')->nullable();
            $table->timestamp('completed_at')->nullable();

            $table->timestamps();

            // One active interview per application
            $table->unique('application_id');
            $table->index(['reviewer_id', 'scheduled_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('interviews');
    }
};
