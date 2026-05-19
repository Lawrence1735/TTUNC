<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Creates the core users table with RBAC role column, talent group
     * affiliation, and all personal profile fields surfaced by the frontend.
     */
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table): void {
            $table->id();

            // Identity
            $table->string('name');
            $table->string('email')->unique();
            $table->string('student_id', 20)->nullable()->unique()->comment('University student ID, e.g. 2024-00678');
            $table->string('password');

            // RBAC
            $table->enum('role', ['admin', 'director', 'trainee', 'scholar', 'student'])
                  ->default('student')
                  ->index();

            // Talent group affiliation (directors and scholars)
            $table->enum('talent_group', [
                'marching-band',
                'glee-club',
                'dance-club',
                'majorettes',
            ])->nullable()->index();

            // Extended profile fields
            $table->string('phone', 20)->nullable();
            $table->string('year_level', 30)->nullable();
            $table->string('course', 120)->nullable();
            $table->string('department', 120)->nullable();
            $table->text('address')->nullable();
            $table->string('emergency_contact', 120)->nullable();
            $table->string('emergency_phone', 20)->nullable();

            // Scholarship / training lifecycle
            $table->enum('application_status', [
                'pending',
                'approved',
                'disapproved',
                'qualified',
                'not_qualified',
            ])->nullable();

            $table->enum('training_status', [
                'not_started',
                'in_progress',
                'completed',
                'failed',
            ])->nullable();

            $table->unsignedTinyInteger('scholarship_percentage')->nullable()
                  ->comment('Scholarship grant percentage: 75 or 100');

            // Instrument / voice assignment (set after training approval)
            $table->string('assigned_instrument', 80)->nullable();
            $table->string('assigned_voice', 80)->nullable();

            // Sanctum / auth
            $table->rememberToken();
            $table->timestamp('email_verified_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            // Composite indexes for common director queries
            $table->index(['talent_group', 'role'], 'users_talent_group_role_index');
            $table->index(['talent_group', 'training_status'], 'users_talent_group_training_status_index');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
