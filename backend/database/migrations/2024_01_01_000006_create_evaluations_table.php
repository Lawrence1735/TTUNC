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
     * Stores structured evaluation records for trainees. The rating column
     * holds the composite 1-100 numeric score. The section_* JSON columns
     * store the granular sub-metric breakdowns (Section A: discipline,
     * Section B: performance interest, Section C: interpersonal) that the
     * frontend EvaluationFormDialog collects.
     */
    public function up(): void
    {
        Schema::create('evaluations', function (Blueprint $table): void {
            $table->id();

            $table->foreignId('trainee_id')
                  ->constrained('trainees')
                  ->cascadeOnDelete();

            // The director or admin who submitted the evaluation
            $table->foreignId('evaluator_id')
                  ->constrained('users')
                  ->restrictOnDelete();

            // Composite numeric score 1-100
            $table->unsignedTinyInteger('rating')
                  ->comment('Overall score 1-100');

            // Granular section breakdowns stored as JSON
            $table->json('section_a')->nullable()
                  ->comment('Discipline metrics: reports_on_time, reports_regularly, etc.');
            $table->json('section_b')->nullable()
                  ->comment('Performance interest metrics');
            $table->json('section_c')->nullable()
                  ->comment('Interpersonal metrics: teamwork, tact, courtesy, disposition');

            $table->text('notes')->nullable();
            $table->text('strengths')->nullable();
            $table->text('improvements')->nullable();

            $table->enum('recommendation', [
                'continue',
                'probation',
                'discontinue',
            ])->default('continue');

            $table->enum('status', ['draft', 'submitted'])->default('draft')->index();

            $table->string('semester', 30)->nullable();
            $table->string('academic_year', 20)->nullable();
            $table->string('adjectival_rating', 60)->nullable();
            $table->boolean('recommend_for_renewal')->default(false);

            $table->date('evaluation_date')->index();

            $table->timestamps();
            $table->softDeletes();

            // Director dashboard: latest evaluations per trainee
            $table->index(['trainee_id', 'evaluation_date']);
            $table->index(['evaluator_id', 'evaluation_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('evaluations');
    }
};
