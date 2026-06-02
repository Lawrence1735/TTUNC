<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('trainees', function (Blueprint $table): void {
            $table->text('chapters_completed')->nullable()->after('chapter');
        });
    }

    public function down(): void
    {
        Schema::table('trainees', function (Blueprint $table): void {
            $table->dropColumn('chapters_completed');
        });
    }
};
