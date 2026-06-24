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
        // Remove talent-classification fields from applications.
        // These are trainee-level fields that belong on the trainees table
        // AFTER an applicant is accepted — not on the application form itself.
        $drop = ['vocal_range', 'primary_dance_genre', 'years_of_experience', 'portfolio_url'];

        Schema::table('applications', function (Blueprint $table) use ($drop) {
            $existing = array_filter($drop, fn($col) => Schema::hasColumn('applications', $col));
            if ($existing) {
                $table->dropColumn(array_values($existing));
            }
        });
    }

    public function down(): void
    {
        Schema::table('applications', function (Blueprint $table) {
            $table->string('vocal_range', 60)->nullable()->after('photo_path');
            $table->string('primary_dance_genre', 80)->nullable()->after('vocal_range');
            $table->string('years_of_experience', 20)->nullable()->after('primary_dance_genre');
            $table->string('portfolio_url')->nullable()->after('years_of_experience');
        });
    }
};
