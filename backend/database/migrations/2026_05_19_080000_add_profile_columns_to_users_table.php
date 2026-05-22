<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->string('role', 30)->default('student')->after('email');
            $table->string('talent_group', 60)->nullable()->after('role');
            $table->string('student_id', 30)->nullable()->after('talent_group');
            $table->string('phone', 20)->nullable()->after('student_id');
            $table->string('year_level', 30)->nullable()->after('phone');
            $table->string('course', 120)->nullable()->after('year_level');
            $table->string('department', 120)->nullable()->after('course');
            $table->text('address')->nullable()->after('department');
            $table->string('application_status', 30)->nullable()->after('address');
            $table->string('training_status', 30)->nullable()->after('application_status');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->dropColumn([
                'role', 'talent_group', 'student_id', 'phone',
                'year_level', 'course', 'department', 'address',
                'application_status', 'training_status',
            ]);
        });
    }
};
