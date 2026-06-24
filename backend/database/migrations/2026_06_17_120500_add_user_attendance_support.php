<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('attendance_records', function (Blueprint $table): void {
            if (! Schema::hasColumn('attendance_records', 'user_id')) {
                $table->foreignId('user_id')->nullable()->after('trainee_id')->constrained('users')->nullOnDelete();
            }
        });

        // Make trainee_id nullable so attendance can be tracked directly by user (scholar entries).
        DB::statement('ALTER TABLE `attendance_records` MODIFY `trainee_id` BIGINT UNSIGNED NULL');

        Schema::table('attendance_records', function (Blueprint $table): void {
            $table->dropUnique('attendance_records_trainee_id_session_date_unique');
            $table->unique(['trainee_id', 'session_date'], 'attendance_records_trainee_session_unique');
            $table->unique(['user_id', 'session_date'], 'attendance_records_user_session_unique');
        });
    }

    public function down(): void
    {
        Schema::table('attendance_records', function (Blueprint $table): void {
            $table->dropUnique('attendance_records_user_session_unique');
            $table->dropUnique('attendance_records_trainee_session_unique');
            $table->unique(['trainee_id', 'session_date']);
        });

        DB::statement('ALTER TABLE `attendance_records` MODIFY `trainee_id` BIGINT UNSIGNED NOT NULL');

        Schema::table('attendance_records', function (Blueprint $table): void {
            if (Schema::hasColumn('attendance_records', 'user_id')) {
                $table->dropConstrainedForeignId('user_id');
            }
        });
    }
};
