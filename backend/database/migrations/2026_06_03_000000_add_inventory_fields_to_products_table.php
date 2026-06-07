<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->enum('type', ['uniform', 'instrument', 'accessory'])->default('instrument')->after('name');
            $table->enum('condition', ['excellent', 'good', 'fair', 'needs_repair'])->default('good')->after('type');
            $table->enum('status', ['available', 'assigned', 'borrowed', 'returned', 'lost', 'damaged'])->default('available')->after('condition');
            $table->string('talent_group')->nullable()->after('status');
            $table->string('serial_number')->nullable()->after('talent_group');
            $table->string('property_type')->nullable()->after('serial_number'); // university/personal
            $table->string('instrument_type')->nullable()->after('property_type');
            $table->string('accessory_type')->nullable()->after('instrument_type');
            $table->string('uniform_set')->nullable()->after('accessory_type');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn([
                'type', 'condition', 'status', 'talent_group', 'serial_number',
                'property_type', 'instrument_type', 'accessory_type', 'uniform_set',
            ]);
        });
    }
};
