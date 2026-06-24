<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Add 'excused' to attendance_records.status enum
        DB::statement("ALTER TABLE `attendance_records` MODIFY `status` ENUM('present','absent','excused') NOT NULL DEFAULT 'absent'");

        // 2. Add scholarship_percentage to evaluations
        Schema::table('evaluations', function (Blueprint $table) {
            $table->unsignedTinyInteger('scholarship_percentage')
                ->nullable()
                ->after('recommend_for_renewal')
                ->comment('Scholarship grant % awarded based on evaluation (e.g. 25, 50, 75, 100)');
        });

        // 3. Add evaluation_id FK to scholarships
        Schema::table('scholarships', function (Blueprint $table) {
            $table->foreignId('evaluation_id')
                ->nullable()
                ->after('user_id')
                ->constrained('evaluations')
                ->nullOnDelete()
                ->comment('The evaluation that triggered this scholarship record');
        });

        // 4. Add created_by FK to engagements
        Schema::table('engagements', function (Blueprint $table) {
            $table->foreignId('created_by')
                ->nullable()
                ->after('status')
                ->constrained('users')
                ->nullOnDelete()
                ->comment('Director who created this engagement/rehearsal');
        });
    }

    public function down(): void
    {
        // Reverse 4
        Schema::table('engagements', function (Blueprint $table) {
            $table->dropForeign(['created_by']);
            $table->dropColumn('created_by');
        });

        // Reverse 3
        Schema::table('scholarships', function (Blueprint $table) {
            $table->dropForeign(['evaluation_id']);
            $table->dropColumn('evaluation_id');
        });

        // Reverse 2
        Schema::table('evaluations', function (Blueprint $table) {
            $table->dropColumn('scholarship_percentage');
        });

        // Reverse 1
        DB::statement("ALTER TABLE `attendance_records` MODIFY `status` ENUM('present','absent') NOT NULL DEFAULT 'absent'");
    }
};
