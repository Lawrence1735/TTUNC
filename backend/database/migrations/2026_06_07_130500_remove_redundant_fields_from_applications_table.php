<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('applications', function (Blueprint $table): void {
            $toDrop = array_values(array_filter(
                ['chapters', 'instruments', 'voices'],
                fn($col) => Schema::hasColumn('applications', $col)
            ));
            if ($toDrop) {
                $table->dropColumn($toDrop);
            }
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
