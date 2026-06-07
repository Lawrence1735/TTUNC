<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('applications', function (Blueprint $table): void {
            $table->dropColumn(['chapters', 'instruments', 'voices']);
        });
    }

    public function down(): void
    {
        Schema::table('applications', function (Blueprint $table): void {
            $table->string('chapters', 80)->nullable();
            $table->string('instruments', 80)->nullable();
            $table->string('voices', 80)->nullable();
        });
    }
};
