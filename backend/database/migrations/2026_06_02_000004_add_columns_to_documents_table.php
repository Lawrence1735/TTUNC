<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('documents', function (Blueprint $table) {
            $table->string('file_name')->after('file_path')->nullable();
            $table->string('file_size')->after('file_name')->nullable();
            $table->enum('category', [
                'scholarship-contract',
                'event-request',
                'event-approval',
                'performance-report',
                'scholar-records',
            ])->after('file_type')->default('scholar-records');
            $table->string('talent_group')->after('category')->nullable();
            $table->string('related_to')->after('talent_group')->nullable();
            $table->string('uploaded_by')->after('related_to')->nullable();
            $table->text('description')->after('uploaded_by')->nullable();
            $table->json('tags')->nullable();
            $table->enum('status', ['pending', 'approved', 'completed'])->default('pending');
        });
    }

    public function down(): void
    {
        Schema::table('documents', function (Blueprint $table) {
            $table->dropColumn(['file_name', 'file_size', 'category', 'talent_group', 'related_to', 'uploaded_by', 'description', 'tags', 'status']);
        });
    }
};
