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
        // No-op: documents.file_size (varchar) and documents.uploaded_by are retained as-is.
        // file_size stores human-readable strings (e.g. "2.5 MB").
        // uploaded_by is a display-name denorm alongside the user_id FK.
    }

    public function down(): void
    {
        // No-op.
    }
};
