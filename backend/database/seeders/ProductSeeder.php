<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('products')->truncate();

        $now = now();
        $bandDirId  = DB::table('users')->where('email', 'director.band@unc.edu.ph')->value('id');
        $choirDirId = DB::table('users')->where('email', 'director.glee@unc.edu.ph')->value('id');
        $danceDirId = DB::table('users')->where('email', 'director.dance@unc.edu.ph')->value('id');
        $majorDirId = DB::table('users')->where('email', 'director.majorettes@unc.edu.ph')->value('id');

        $products = [
            [
                'name' => 'Yamaha Trumpet YTR-2335', 'description' => 'Bb trumpet for marching band.',
                'quantity' => 8, 'price' => 12500.00, 'assigned_to' => $bandDirId,
                'type' => 'instrument', 'condition' => 'good', 'status' => 'assigned',
                'talent_group' => 'marching-band', 'serial_number' => 'YTR2335-001',
                'property_type' => 'university', 'instrument_type' => 'trumpet',
                'accessory_type' => null, 'uniform_set' => null,
                'created_at' => $now, 'updated_at' => $now,
            ],
            [
                'name' => 'Jupiter Trombone JTB-700', 'description' => 'Tenor trombone for marching.',
                'quantity' => 4, 'price' => 18000.00, 'assigned_to' => $bandDirId,
                'type' => 'instrument', 'condition' => 'good', 'status' => 'assigned',
                'talent_group' => 'marching-band', 'serial_number' => 'JTB700-001',
                'property_type' => 'university', 'instrument_type' => 'trombone',
                'accessory_type' => null, 'uniform_set' => null,
                'created_at' => $now, 'updated_at' => $now,
            ],
            [
                'name' => 'Pearl Marching Snare Drum', 'description' => '14-inch marching snare drum.',
                'quantity' => 6, 'price' => 9800.00, 'assigned_to' => $bandDirId,
                'type' => 'instrument', 'condition' => 'excellent', 'status' => 'assigned',
                'talent_group' => 'marching-band', 'serial_number' => 'PRL-SD-001',
                'property_type' => 'university', 'instrument_type' => 'percussion',
                'accessory_type' => null, 'uniform_set' => null,
                'created_at' => $now, 'updated_at' => $now,
            ],
            [
                'name' => 'Bass Drum (Field/Marching)', 'description' => '28-inch bass drum with marching harness.',
                'quantity' => 2, 'price' => 22000.00, 'assigned_to' => $bandDirId,
                'type' => 'instrument', 'condition' => 'fair', 'status' => 'assigned',
                'talent_group' => 'marching-band', 'serial_number' => 'BD-MAR-001',
                'property_type' => 'university', 'instrument_type' => 'percussion',
                'accessory_type' => null, 'uniform_set' => null,
                'created_at' => $now, 'updated_at' => $now,
            ],
            [
                'name' => 'Marching Euphonium', 'description' => 'Convertible marching/concert euphonium.',
                'quantity' => 3, 'price' => 35000.00, 'assigned_to' => $bandDirId,
                'type' => 'instrument', 'condition' => 'good', 'status' => 'assigned',
                'talent_group' => 'marching-band', 'serial_number' => 'EUPH-001',
                'property_type' => 'university', 'instrument_type' => 'euphonium',
                'accessory_type' => null, 'uniform_set' => null,
                'created_at' => $now, 'updated_at' => $now,
            ],
            [
                'name' => 'Yamaha Flute YFL-222', 'description' => 'Student-level concert flute.',
                'quantity' => 5, 'price' => 8500.00, 'assigned_to' => $bandDirId,
                'type' => 'instrument', 'condition' => 'excellent', 'status' => 'available',
                'talent_group' => 'marching-band', 'serial_number' => 'YFL222-001',
                'property_type' => 'university', 'instrument_type' => 'flute',
                'accessory_type' => null, 'uniform_set' => null,
                'created_at' => $now, 'updated_at' => $now,
            ],
            [
                'name' => 'Marching Band Uniform Set', 'description' => 'Complete uniform: jacket, pants, shako hat, gloves.',
                'quantity' => 40, 'price' => 4500.00, 'assigned_to' => $bandDirId,
                'type' => 'uniform', 'condition' => 'good', 'status' => 'assigned',
                'talent_group' => 'marching-band', 'serial_number' => null,
                'property_type' => 'university', 'instrument_type' => null,
                'accessory_type' => null, 'uniform_set' => 'full-set',
                'created_at' => $now, 'updated_at' => $now,
            ],
            [
                'name' => 'Marching Shoes (Black)', 'description' => 'Standard black marching shoes.',
                'quantity' => 40, 'price' => 850.00, 'assigned_to' => $bandDirId,
                'type' => 'uniform', 'condition' => 'fair', 'status' => 'assigned',
                'talent_group' => 'marching-band', 'serial_number' => null,
                'property_type' => 'university', 'instrument_type' => null,
                'accessory_type' => null, 'uniform_set' => 'shoes',
                'created_at' => $now, 'updated_at' => $now,
            ],
            [
                'name' => 'Twirling Baton (Chrome)', 'description' => '28-inch chrome twirling baton.',
                'quantity' => 15, 'price' => 1200.00, 'assigned_to' => $majorDirId,
                'type' => 'accessory', 'condition' => 'good', 'status' => 'available',
                'talent_group' => 'majorettes', 'serial_number' => null,
                'property_type' => 'university', 'instrument_type' => null,
                'accessory_type' => 'baton', 'uniform_set' => null,
                'created_at' => $now, 'updated_at' => $now,
            ],
            [
                'name' => 'Color Guard Flag Set', 'description' => 'Silk flags in UNC colors.',
                'quantity' => 3, 'price' => 6500.00, 'assigned_to' => $majorDirId,
                'type' => 'accessory', 'condition' => 'excellent', 'status' => 'available',
                'talent_group' => 'majorettes', 'serial_number' => null,
                'property_type' => 'university', 'instrument_type' => null,
                'accessory_type' => 'flag', 'uniform_set' => null,
                'created_at' => $now, 'updated_at' => $now,
            ],
            [
                'name' => 'Majorette Uniform Set', 'description' => 'Performance costume with boots.',
                'quantity' => 15, 'price' => 3800.00, 'assigned_to' => $majorDirId,
                'type' => 'uniform', 'condition' => 'good', 'status' => 'assigned',
                'talent_group' => 'majorettes', 'serial_number' => null,
                'property_type' => 'university', 'instrument_type' => null,
                'accessory_type' => null, 'uniform_set' => 'full-set',
                'created_at' => $now, 'updated_at' => $now,
            ],
            [
                'name' => 'Yamaha P-45 Digital Piano', 'description' => '88-key weighted keyboard.',
                'quantity' => 2, 'price' => 28000.00, 'assigned_to' => $choirDirId,
                'type' => 'instrument', 'condition' => 'excellent', 'status' => 'available',
                'talent_group' => 'glee-club', 'serial_number' => 'YAM-P45-001',
                'property_type' => 'university', 'instrument_type' => 'keyboard',
                'accessory_type' => null, 'uniform_set' => null,
                'created_at' => $now, 'updated_at' => $now,
            ],
            [
                'name' => 'Shure SM58 Vocal Microphone', 'description' => 'Dynamic vocal microphone.',
                'quantity' => 8, 'price' => 7200.00, 'assigned_to' => $choirDirId,
                'type' => 'accessory', 'condition' => 'excellent', 'status' => 'available',
                'talent_group' => 'glee-club', 'serial_number' => 'SM58-001',
                'property_type' => 'university', 'instrument_type' => null,
                'accessory_type' => 'microphone', 'uniform_set' => null,
                'created_at' => $now, 'updated_at' => $now,
            ],
            [
                'name' => 'Microphone Stand (Adjustable)', 'description' => 'Height-adjustable boom stand.',
                'quantity' => 10, 'price' => 1500.00, 'assigned_to' => $choirDirId,
                'type' => 'accessory', 'condition' => 'good', 'status' => 'available',
                'talent_group' => 'glee-club', 'serial_number' => null,
                'property_type' => 'university', 'instrument_type' => null,
                'accessory_type' => 'mic-stand', 'uniform_set' => null,
                'created_at' => $now, 'updated_at' => $now,
            ],
            [
                'name' => 'Music Stand', 'description' => 'Folding metal music stand.',
                'quantity' => 20, 'price' => 950.00, 'assigned_to' => $choirDirId,
                'type' => 'accessory', 'condition' => 'fair', 'status' => 'available',
                'talent_group' => 'glee-club', 'serial_number' => null,
                'property_type' => 'university', 'instrument_type' => null,
                'accessory_type' => 'stand', 'uniform_set' => null,
                'created_at' => $now, 'updated_at' => $now,
            ],
            [
                'name' => 'Glee Club Formal Uniform', 'description' => 'Formal attire: gown/barong.',
                'quantity' => 25, 'price' => 3200.00, 'assigned_to' => $choirDirId,
                'type' => 'uniform', 'condition' => 'good', 'status' => 'assigned',
                'talent_group' => 'glee-club', 'serial_number' => null,
                'property_type' => 'university', 'instrument_type' => null,
                'accessory_type' => null, 'uniform_set' => 'formal',
                'created_at' => $now, 'updated_at' => $now,
            ],
            [
                'name' => 'Portable Bluetooth Speaker (JBL Xtreme)', 'description' => 'Rechargeable portable speaker.',
                'quantity' => 3, 'price' => 15000.00, 'assigned_to' => $danceDirId,
                'type' => 'accessory', 'condition' => 'excellent', 'status' => 'available',
                'talent_group' => 'dance-club', 'serial_number' => 'JBL-XT-001',
                'property_type' => 'university', 'instrument_type' => null,
                'accessory_type' => 'speaker', 'uniform_set' => null,
                'created_at' => $now, 'updated_at' => $now,
            ],
            [
                'name' => 'Dance Costume Set - Contemporary', 'description' => 'Contemporary dance costumes.',
                'quantity' => 20, 'price' => 2800.00, 'assigned_to' => $danceDirId,
                'type' => 'uniform', 'condition' => 'good', 'status' => 'available',
                'talent_group' => 'dance-club', 'serial_number' => null,
                'property_type' => 'university', 'instrument_type' => null,
                'accessory_type' => null, 'uniform_set' => 'contemporary',
                'created_at' => $now, 'updated_at' => $now,
            ],
            [
                'name' => 'Dance Costume Set - Folk/Cultural', 'description' => 'Traditional Filipino folk dance costumes.',
                'quantity' => 15, 'price' => 3500.00, 'assigned_to' => $danceDirId,
                'type' => 'uniform', 'condition' => 'good', 'status' => 'available',
                'talent_group' => 'dance-club', 'serial_number' => null,
                'property_type' => 'university', 'instrument_type' => null,
                'accessory_type' => null, 'uniform_set' => 'folk',
                'created_at' => $now, 'updated_at' => $now,
            ],
            [
                'name' => 'Dance Mat / Practice Floor', 'description' => 'Portable interlocking foam mats.',
                'quantity' => 4, 'price' => 5500.00, 'assigned_to' => $danceDirId,
                'type' => 'accessory', 'condition' => 'good', 'status' => 'available',
                'talent_group' => 'dance-club', 'serial_number' => null,
                'property_type' => 'university', 'instrument_type' => null,
                'accessory_type' => 'mat', 'uniform_set' => null,
                'created_at' => $now, 'updated_at' => $now,
            ],
            [
                'name' => 'Portable PA System', 'description' => '2x speakers + mixer for indoor events.',
                'quantity' => 1, 'price' => 85000.00, 'assigned_to' => $majorDirId,
                'type' => 'accessory', 'condition' => 'excellent', 'status' => 'available',
                'talent_group' => 'majorettes', 'serial_number' => 'PA-SYS-001',
                'property_type' => 'university', 'instrument_type' => null,
                'accessory_type' => 'pa-system', 'uniform_set' => null,
                'created_at' => $now, 'updated_at' => $now,
            ],
            [
                'name' => 'LED Stage Lighting Kit', 'description' => '6x LED par lights with DMX controller.',
                'quantity' => 2, 'price' => 42000.00, 'assigned_to' => $majorDirId,
                'type' => 'accessory', 'condition' => 'good', 'status' => 'available',
                'talent_group' => 'majorettes', 'serial_number' => 'LED-KIT-001',
                'property_type' => 'university', 'instrument_type' => null,
                'accessory_type' => 'lighting', 'uniform_set' => null,
                'created_at' => $now, 'updated_at' => $now,
            ],
            [
                'name' => 'Projector (EPSON EB-X51)', 'description' => '3800-lumen projector.',
                'quantity' => 2, 'price' => 28000.00, 'assigned_to' => null,
                'type' => 'accessory', 'condition' => 'good', 'status' => 'available',
                'talent_group' => null, 'serial_number' => 'EPS-X51-001',
                'property_type' => 'university', 'instrument_type' => null,
                'accessory_type' => 'projector', 'uniform_set' => null,
                'created_at' => $now, 'updated_at' => $now,
            ],
            [
                'name' => 'Extension Cord (30m, Heavy Duty)', 'description' => 'Heavy-duty 30m extension cord.',
                'quantity' => 5, 'price' => 1800.00, 'assigned_to' => null,
                'type' => 'accessory', 'condition' => 'good', 'status' => 'available',
                'talent_group' => null, 'serial_number' => null,
                'property_type' => 'university', 'instrument_type' => null,
                'accessory_type' => 'cable', 'uniform_set' => null,
                'created_at' => $now, 'updated_at' => $now,
            ],
        ];

        DB::table('products')->insert($products);
    }
}