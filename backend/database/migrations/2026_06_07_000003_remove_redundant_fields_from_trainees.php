<?php

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
        // No-op: trainees.completion_rate and trainees.chapter are retained.
        // completion_rate is kept as a cached/denormalised value (updated on save).
        // chapter is the human-readable label for the trainee's current chapter.
    }

    public function down(): void
    {
        // No-op.
    }
};
