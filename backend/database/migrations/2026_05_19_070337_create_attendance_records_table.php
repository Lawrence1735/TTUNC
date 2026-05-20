<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('attendance_records', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('trainee_id')->constrained('trainees')->cascadeOnDelete();
            $table->date('session_date')->index();
            $table->boolean('no_practice')->default(false)->index();
            $table->enum('status', ['present','absent'])->default('absent');
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->unique(['trainee_id', 'session_date']);
            $table->index(['trainee_id', 'no_practice', 'status']);
            $table->index(['session_date', 'no_practice']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attendance_records');
    }
};