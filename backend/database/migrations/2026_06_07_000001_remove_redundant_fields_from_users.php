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
        Schema::table('users', function (Blueprint $table) {
            // Remove redundant fields:
            // - application_status (use applications.status instead)
            // - training_status (use trainees.current_status instead)
            if (Schema::hasColumn('users', 'application_status')) {
                $table->dropColumn('application_status');
            }
            if (Schema::hasColumn('users', 'training_status')) {
                $table->dropColumn('training_status');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('application_status')->nullable()->after('role');
            $table->string('training_status')->nullable()->after('application_status');
        });
    }
};
