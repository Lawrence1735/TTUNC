<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('engagements', function (Blueprint $table) {
            if (!Schema::hasColumn('engagements', 'organization_name')) {
                $table->string('organization_name')->nullable()->after('venue');
            }
            if (!Schema::hasColumn('engagements', 'contact_person')) {
                $table->string('contact_person')->nullable()->after('organization_name');
            }
            if (!Schema::hasColumn('engagements', 'contact_email')) {
                $table->string('contact_email')->nullable()->after('contact_person');
            }
            if (!Schema::hasColumn('engagements', 'contact_phone')) {
                $table->string('contact_phone', 30)->nullable()->after('contact_email');
            }
        });
    }

    public function down(): void
    {
        Schema::table('engagements', function (Blueprint $table) {
            if (Schema::hasColumn('engagements', 'contact_phone')) {
                $table->dropColumn('contact_phone');
            }
            if (Schema::hasColumn('engagements', 'contact_email')) {
                $table->dropColumn('contact_email');
            }
            if (Schema::hasColumn('engagements', 'contact_person')) {
                $table->dropColumn('contact_person');
            }
            if (Schema::hasColumn('engagements', 'organization_name')) {
                $table->dropColumn('organization_name');
            }
        });
    }
};
