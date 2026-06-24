<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('engagements', function (Blueprint $table) {
            if (!Schema::hasColumn('engagements', 'attachments')) {
                $table->json('attachments')->nullable()->after('venue');
            }
        });

        DB::statement("ALTER TABLE `engagements` MODIFY `status` ENUM('scheduled','completed','cancelled','pending_admin_approval','pending_director_approval','rejected') NOT NULL DEFAULT 'scheduled'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE `engagements` MODIFY `status` ENUM('scheduled','completed','cancelled','pending_admin_approval','rejected') NOT NULL DEFAULT 'scheduled'");

        Schema::table('engagements', function (Blueprint $table) {
            if (Schema::hasColumn('engagements', 'attachments')) {
                $table->dropColumn('attachments');
            }
        });
    }
};
