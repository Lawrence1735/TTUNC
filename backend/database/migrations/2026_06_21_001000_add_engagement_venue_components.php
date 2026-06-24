<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('engagements', function (Blueprint $table) {
            if (!Schema::hasColumn('engagements', 'venue_region')) {
                $table->string('venue_region', 120)->nullable()->after('venue');
            }
            if (!Schema::hasColumn('engagements', 'venue_province')) {
                $table->string('venue_province', 120)->nullable()->after('venue_region');
            }
            if (!Schema::hasColumn('engagements', 'venue_city')) {
                $table->string('venue_city', 120)->nullable()->after('venue_province');
            }
            if (!Schema::hasColumn('engagements', 'venue_barangay')) {
                $table->string('venue_barangay', 120)->nullable()->after('venue_city');
            }
            if (!Schema::hasColumn('engagements', 'venue_street')) {
                $table->string('venue_street', 255)->nullable()->after('venue_barangay');
            }
        });
    }

    public function down(): void
    {
        Schema::table('engagements', function (Blueprint $table) {
            if (Schema::hasColumn('engagements', 'venue_street')) {
                $table->dropColumn('venue_street');
            }
            if (Schema::hasColumn('engagements', 'venue_barangay')) {
                $table->dropColumn('venue_barangay');
            }
            if (Schema::hasColumn('engagements', 'venue_city')) {
                $table->dropColumn('venue_city');
            }
            if (Schema::hasColumn('engagements', 'venue_province')) {
                $table->dropColumn('venue_province');
            }
            if (Schema::hasColumn('engagements', 'venue_region')) {
                $table->dropColumn('venue_region');
            }
        });
    }
};
