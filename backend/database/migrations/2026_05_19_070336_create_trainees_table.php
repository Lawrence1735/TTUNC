<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('trainees', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained('users')->cascadeOnDelete();
            $table->unsignedTinyInteger('completion_rate')->default(0);
            $table->enum('current_status', ['active','inactive','completed','dropped'])->default('active');
            $table->string('chapter', 80)->nullable();
            $table->string('instrument', 80)->nullable();
            $table->string('voice', 80)->nullable();
            $table->unsignedSmallInteger('total_expected_sessions')->default(30);
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