<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('applications', function (Blueprint $table): void {
            // Remove fields that are not part of the application form
            $drop = array_filter([
                'social_media',
                'vocal_range',
                'primary_dance_genre',
                'years_of_experience',
                'documents',
                'portfolio_url',
            ], fn($col) => Schema::hasColumn('applications', $col));

            if ($drop) {
                $table->dropColumn(array_values($drop));
            }

            // Add permanent address field
            if (!Schema::hasColumn('applications', 'residing_address')) {
                $table->text('residing_address')->nullable()->after('applicant_address');
            }
        });
    }

    public function down(): void
    {
        Schema::table('applications', function (Blueprint $table): void {
            $table->dropColumn('residing_address');
            $table->string('social_media')->nullable()->after('applicant_email');
            $table->string('vocal_range', 60)->nullable();
            $table->string('primary_dance_genre', 80)->nullable();
            $table->string('years_of_experience', 20)->nullable();
            $table->json('documents')->nullable();
            $table->string('portfolio_url')->nullable();
        });
    }
};
