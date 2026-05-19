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
     * Stores public talent scholarship applications. user_id is nullable
     * because applicants submit before an account is created for them.
     * The JSON columns mirror the nested personalInfo / documents shape
     * from the frontend Application interface.
     */
    public function up(): void
    {
        Schema::create('applications', function (Blueprint $table): void {
            $table->id();

            // Nullable FK — applicant may not have an account yet
            $table->foreignId('user_id')
                  ->nullable()
                  ->constrained('users')
                  ->nullOnDelete();

            // Talent group the applicant is applying to
            $table->enum('talent_group', [
                'marching-band',
                'glee-club',
                'dance-club',
                'majorettes',
            ])->index();

            // Pipeline status
            $table->enum('status', [
                'pending',
                'interview_scheduled',
                'approved',
                'rejected',
            ])->default('pending')->index();

            // Weekly growth tracker — incremented on creation, reset weekly via scheduler
            $table->unsignedSmallInteger('applications_this_week_tracker')->default(0);

            // Personal info snapshot (denormalised for immutable audit trail)
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

            // Talent-group-specific fields
            $table->string('chapters', 80)->nullable()
                  ->comment('Chapter assignment, e.g. Chapter 1');
            $table->string('instruments', 80)->nullable()
                  ->comment('Instrument preference for marching band');
            $table->string('voices', 80)->nullable()
                  ->comment('Voice group for glee club');
            $table->string('vocal_range', 60)->nullable();
            $table->string('primary_dance_genre', 80)->nullable();
            $table->string('years_of_experience', 20)->nullable();

            // Free-text fields
            $table->text('experience')->nullable();
            $table->text('motivation')->nullable();

            // Portfolio / document attachments stored as JSON array of URLs
            $table->json('documents')->nullable()
                  ->comment('Array of document/portfolio URLs');
            $table->string('portfolio_url')->nullable();

            // Denial metadata (populated on rejection)
            $table->string('denial_reason', 120)->nullable();
            $table->text('denial_feedback')->nullable();

            // Approval notes
            $table->text('approval_notes')->nullable();

            $table->timestamp('applied_at')->useCurrent();
            $table->timestamps();
            $table->softDeletes();

            // Director dashboard query indexes
            $table->index(['talent_group', 'status']);
            $table->index(['status', 'applied_at']);
            $table->index('applied_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('applications');
    }
};
