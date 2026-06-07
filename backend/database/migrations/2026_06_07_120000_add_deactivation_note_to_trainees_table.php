<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('trainees', function (Blueprint $table): void {
            $table->text('deactivation_note')->nullable()->after('voice');
        });
    }

    public function down(): void
    {
        Schema::table('trainees', function (Blueprint $table): void {
            $table->dropColumn('deactivation_note');
        });
    }
};
