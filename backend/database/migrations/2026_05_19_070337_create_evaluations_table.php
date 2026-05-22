<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('evaluations', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('trainee_id')->constrained('trainees')->cascadeOnDelete();
            $table->foreignId('evaluator_id')->constrained('users')->restrictOnDelete();
            $table->unsignedTinyInteger('rating');
            $table->json('section_a')->nullable();
            $table->json('section_b')->nullable();
            $table->json('section_c')->nullable();
            $table->text('notes')->nullable();
            $table->text('strengths')->nullable();
            $table->text('improvements')->nullable();
            $table->enum('recommendation', ['continue','probation','discontinue'])->default('continue');
            $table->enum('status', ['draft','submitted'])->default('draft')->index();
            $table->string('semester', 30)->nullable();
            $table->string('academic_year', 20)->nullable();
            $table->string('adjectival_rating', 60)->nullable();
            $table->boolean('recommend_for_renewal')->default(false);
            $table->date('evaluation_date')->index();
            $table->timestamps();
            $table->softDeletes();
            $table->index(['trainee_id', 'evaluation_date']);
            $table->index(['evaluator_id', 'evaluation_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('evaluations');
    }
};