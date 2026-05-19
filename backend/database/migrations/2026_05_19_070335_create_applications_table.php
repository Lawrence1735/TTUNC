<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('applications', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->enum('talent_group', ['marching-band','glee-club','dance-club','majorettes'])->index();
            $table->enum('status', ['pending','interview_scheduled','approved','rejected'])->default('pending')->index();
            $table->unsignedSmallInteger('applications_this_week_tracker')->default(0);
            $table->string('applicant_name');
            $table->string('applicant_email');
            $table->string('applicant_student_id', 20)->nullable();
            $table->string('applicant_phone', 20)->nullable();
            $table->date('applicant_birthdate')->nullable();
            $table->string('applicant_age', 10)->nullable();
            $table->text('applicant_address')->nullable();
            $table->string('applicant_gender', 20)->nullable();
            $table->string('applicant_year_level', 30)->nullable();
            $table->string('applicant_course', 120)->nullable();
            $table->string('applicant_department', 120)->nullable();
            $table->string('guardian_name', 120)->nullable();
            $table->string('guardian_phone', 20)->nullable();
            $table->string('guardian_relationship', 60)->nullable();
            $table->string('chapters', 80)->nullable();
            $table->string('instruments', 80)->nullable();
            $table->string('voices', 80)->nullable();
            $table->string('vocal_range', 60)->nullable();
            $table->string('primary_dance_genre', 80)->nullable();
            $table->string('years_of_experience', 20)->nullable();
            $table->text('experience')->nullable();
            $table->text('motivation')->nullable();
            $table->json('documents')->nullable();
            $table->string('portfolio_url')->nullable();
            $table->string('denial_reason', 120)->nullable();
            $table->text('denial_feedback')->nullable();
            $table->text('approval_notes')->nullable();
            $table->timestamp('applied_at')->useCurrent();
            $table->timestamps();
            $table->softDeletes();
            $table->index(['talent_group', 'status']);
            $table->index(['status', 'applied_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('applications');
    }
};