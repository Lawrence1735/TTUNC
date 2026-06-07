<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class EngagementSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();

        $engagements = [
            // ── Upcoming performances ─────────────────────────────────────────────
            [
                'event_name'   => 'UNC Foundation Day',
                'description'  => 'Annual university founding anniversary celebration with grand parade and concert.',
                'date'         => '2026-06-15',
                'time'         => '14:00',
                'venue'        => 'UNC Main Campus Grounds',
                'talent_groups'=> json_encode(['marching-band', 'majorettes', 'glee-club', 'dance-club']),
                'type'         => 'performance',
                'is_required'  => true,
                'status'       => 'scheduled',
                'created_at'   => $now,
                'updated_at'   => $now,
            ],
            [
                'event_name'   => 'Peñafrancia Festival Street Parade',
                'description'  => 'Traditional street parade for Naga\'s biggest annual festival honoring Our Lady of Peñafrancia.',
                'date'         => '2026-09-08',
                'time'         => '07:00',
                'venue'        => 'Naga City Streets',
                'talent_groups'=> json_encode(['marching-band', 'majorettes', 'dance-club']),
                'type'         => 'performance',
                'is_required'  => true,
                'status'       => 'scheduled',
                'created_at'   => $now,
                'updated_at'   => $now,
            ],
            [
                'event_name'   => 'UNC Graduation Ceremony',
                'description'  => 'Processional and recessional music for commencement exercises.',
                'date'         => '2026-07-15',
                'time'         => '08:00',
                'venue'        => 'UNC Gymnasium',
                'talent_groups'=> json_encode(['marching-band', 'glee-club']),
                'type'         => 'performance',
                'is_required'  => true,
                'status'       => 'scheduled',
                'created_at'   => $now,
                'updated_at'   => $now,
            ],
            [
                'event_name'   => 'Bicol Regional Arts Competition',
                'description'  => 'Regional performing arts showcase and competition at Bicol Convention Center.',
                'date'         => '2026-08-10',
                'time'         => '10:00',
                'venue'        => 'Bicol Convention Center',
                'talent_groups'=> json_encode(['glee-club', 'dance-club']),
                'type'         => 'competition',
                'is_required'  => true,
                'status'       => 'scheduled',
                'created_at'   => $now,
                'updated_at'   => $now,
            ],
            [
                'event_name'   => 'Naga City Independence Day Celebration',
                'description'  => 'Official city ceremony honoring Philippine independence.',
                'date'         => '2026-06-12',
                'time'         => '09:00',
                'venue'        => 'Naga City Plaza',
                'talent_groups'=> json_encode(['marching-band', 'majorettes']),
                'type'         => 'performance',
                'is_required'  => true,
                'status'       => 'scheduled',
                'created_at'   => $now,
                'updated_at'   => $now,
            ],
            // ── Completed ─────────────────────────────────────────────────────────
            [
                'event_name'   => 'UNC Intramurals Opening Ceremony',
                'description'  => 'Grand opening of annual intramural sports competition.',
                'date'         => '2026-03-25',
                'time'         => '13:00',
                'venue'        => 'UNC Sports Complex',
                'talent_groups'=> json_encode(['marching-band', 'dance-club']),
                'type'         => 'performance',
                'is_required'  => true,
                'status'       => 'completed',
                'created_at'   => $now,
                'updated_at'   => $now,
            ],
            [
                'event_name'   => 'Teacher Recognition Day Program',
                'description'  => 'Special tribute performance for UNC educators.',
                'date'         => '2026-04-05',
                'time'         => '14:00',
                'venue'        => 'UNC Main Auditorium',
                'talent_groups'=> json_encode(['glee-club']),
                'type'         => 'performance',
                'is_required'  => false,
                'status'       => 'completed',
                'created_at'   => $now,
                'updated_at'   => $now,
            ],
            // ── Rehearsals ────────────────────────────────────────────────────────
            [
                'event_name'   => 'Weekly Band Practice',
                'description'  => 'Regular weekly rehearsal for marching formations and music.',
                'date'         => '2026-06-06',
                'time'         => '15:00',
                'venue'        => 'Band Room, Music Building',
                'talent_groups'=> json_encode(['marching-band']),
                'type'         => 'rehearsal',
                'is_required'  => true,
                'status'       => 'scheduled',
                'created_at'   => $now,
                'updated_at'   => $now,
            ],
            [
                'event_name'   => 'Foundation Day Rehearsal',
                'description'  => 'Intensive preparation for upcoming Foundation Day performance.',
                'date'         => '2026-06-10',
                'time'         => '14:00',
                'venue'        => 'UNC Covered Court',
                'talent_groups'=> json_encode(['marching-band', 'majorettes', 'glee-club', 'dance-club']),
                'type'         => 'rehearsal',
                'is_required'  => true,
                'status'       => 'scheduled',
                'created_at'   => $now,
                'updated_at'   => $now,
            ],
            [
                'event_name'   => 'Glee Club Vocal Workshop',
                'description'  => 'Voice training and choral technique workshop.',
                'date'         => '2026-06-07',
                'time'         => '09:00',
                'venue'        => 'Music Hall, Room 201',
                'talent_groups'=> json_encode(['glee-club']),
                'type'         => 'workshop',
                'is_required'  => true,
                'status'       => 'scheduled',
                'created_at'   => $now,
                'updated_at'   => $now,
            ],
            [
                'event_name'   => 'Dance Club Choreography Practice',
                'description'  => 'Rehearsal for competition routine.',
                'date'         => '2026-06-08',
                'time'         => '16:00',
                'venue'        => 'Dance Studio, PE Building',
                'talent_groups'=> json_encode(['dance-club']),
                'type'         => 'rehearsal',
                'is_required'  => true,
                'status'       => 'scheduled',
                'created_at'   => $now,
                'updated_at'   => $now,
            ],
        ];

        DB::table('engagements')->insert($engagements);
    }
}
