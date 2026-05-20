<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('interviews', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('application_id')->constrained('applications')->cascadeOnDelete();
            $table->foreignId('reviewer_id')->constrained('users')->restrictOnDelete();
            $table->dateTime('scheduled_at')->index();
            $table->string('venue', 200)->nullable();
            $table->text('notes')->nullable();
            $table->enum('outcome', ['pending','passed','failed','no_show'])->default('pending');
            $table->text('outcome_notes')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
            $table->unique('application_id');
            $table->index(['reviewer_id', 'scheduled_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('interviews');
    }
};