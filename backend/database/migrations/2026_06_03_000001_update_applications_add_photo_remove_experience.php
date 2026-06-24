<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('applications', function (Blueprint $table): void {
            $toDrop = array_filter(
                ['experience', 'motivation'],
                fn($col) => Schema::hasColumn('applications', $col)
            );
            if ($toDrop) {
                $table->dropColumn(array_values($toDrop));
            }
            if (!Schema::hasColumn('applications', 'photo_path')) {
                $table->string('photo_path')->nullable()->after('guardian_relationship');
            }
        });
    }

    public function down(): void
    {
        Schema::table('applications', function (Blueprint $table): void {
            $table->dropColumn('photo_path');
            $table->text('experience')->nullable();
            $table->text('motivation')->nullable();
        });
    }
};
