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
        Schema::table('trainees', function (Blueprint $table) {
            // Nullable so old-member scholars seeded without an application still work
            $table->foreignId('application_id')
                  ->nullable()
                  ->after('user_id')
                  ->constrained('applications')
                  ->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('trainees', function (Blueprint $table) {
            $table->dropForeign(['application_id']);
            $table->dropColumn('application_id');
        });
    }
};
