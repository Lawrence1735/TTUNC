<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE `engagements` MODIFY `status` ENUM('scheduled','completed','cancelled','pending_admin_approval','rejected') NOT NULL DEFAULT 'scheduled'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE `engagements` MODIFY `status` ENUM('scheduled','completed','cancelled') NOT NULL DEFAULT 'scheduled'");
    }
};
