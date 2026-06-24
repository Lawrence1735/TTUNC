<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\User;
use App\Models\UserNotification;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

final class AuthAndNotificationFlowTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        $this->ensureMinimalSchema();
        $this->resetTables();
    }

    private function ensureMinimalSchema(): void
    {
        if (! Schema::hasTable('users')) {
            Schema::create('users', function (Blueprint $table): void {
                $table->id();
                $table->string('name');
                $table->string('email')->unique();
                $table->timestamp('email_verified_at')->nullable();
                $table->string('password');
                $table->string('role', 30)->default('student');
                $table->string('talent_group', 60)->nullable();
                $table->string('student_id', 30)->nullable();
                $table->string('phone', 20)->nullable();
                $table->string('year_level', 30)->nullable();
                $table->string('course', 120)->nullable();
                $table->string('department', 120)->nullable();
                $table->text('address')->nullable();
                $table->rememberToken();
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('personal_access_tokens')) {
            Schema::create('personal_access_tokens', function (Blueprint $table): void {
                $table->id();
                $table->morphs('tokenable');
                $table->string('name');
                $table->string('token', 64)->unique();
                $table->text('abilities')->nullable();
                $table->timestamp('last_used_at')->nullable();
                $table->timestamp('expires_at')->nullable();
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('notifications')) {
            Schema::create('notifications', function (Blueprint $table): void {
                $table->id();
                $table->unsignedBigInteger('user_id');
                $table->string('title');
                $table->text('message');
                $table->string('type', 50)->default('general');
                $table->boolean('read')->default(false);
                $table->string('related_id')->nullable();
                $table->string('action_url')->nullable();
                $table->timestamps();

                $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
                $table->index(['user_id', 'read']);
            });
        }
    }

    private function resetTables(): void
    {
        DB::table('notifications')->delete();
        DB::table('personal_access_tokens')->delete();
        DB::table('users')->delete();
    }

    public function test_login_rejects_mismatched_selected_role(): void
    {
        $password = 'Secret123!';

        $user = User::factory()->create([
            'email' => 'director@example.com',
            'password' => Hash::make($password),
            'role' => 'director',
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => $user->email,
            'password' => $password,
            'role' => 'scholar',
        ]);

        $response
            ->assertStatus(422)
            ->assertJson([
                'message' => 'The selected Login As role does not match this account.',
            ]);
    }

    public function test_login_accepts_trainee_selection_for_student_role(): void
    {
        $password = 'Secret123!';

        $user = User::factory()->create([
            'email' => 'student@example.com',
            'password' => Hash::make($password),
            'role' => 'student',
            'talent_group' => 'marching-band',
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => $user->email,
            'password' => $password,
            'role' => 'trainee',
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('user.id', $user->id)
            ->assertJsonPath('user.role', 'student');
    }

    public function test_notifications_mark_read_persists_and_is_returned_in_index(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $notification = UserNotification::create([
            'user_id' => $user->id,
            'title' => 'Engagement Update',
            'message' => 'You have a new event notice.',
            'type' => 'engagement',
            'read' => false,
        ]);

        $this->postJson("/api/v1/notifications/{$notification->id}/read")
            ->assertOk();

        $this->assertDatabaseHas('notifications', [
            'id' => $notification->id,
            'user_id' => $user->id,
            'read' => true,
        ]);

        $this->getJson('/api/v1/notifications')
            ->assertOk()
            ->assertJsonFragment([
                'id' => $notification->id,
                'read' => true,
            ]);
    }

    public function test_login_and_me_return_expected_profile_fields(): void
    {
        $password = 'Secret123!';

        $user = User::factory()->create([
            'name' => 'Scholar User',
            'email' => 'scholar@example.com',
            'password' => Hash::make($password),
            'role' => 'scholar',
            'talent_group' => 'glee-club',
            'student_id' => '2026-0001',
            'phone' => '09123456789',
            'year_level' => '3rd Year',
            'course' => 'BSIT',
            'department' => 'CCS',
            'address' => 'Naga City',
        ]);

        $loginResponse = $this->postJson('/api/v1/auth/login', [
            'email' => $user->email,
            'password' => $password,
            'role' => 'scholar',
        ]);

        $loginResponse
            ->assertOk()
            ->assertJsonPath('user.id', $user->id)
            ->assertJsonPath('user.name', 'Scholar User')
            ->assertJsonPath('user.email', 'scholar@example.com')
            ->assertJsonPath('user.role', 'scholar')
            ->assertJsonPath('user.talent_group', 'glee-club')
            ->assertJsonPath('user.student_id', '2026-0001')
            ->assertJsonPath('user.phone', '09123456789')
            ->assertJsonPath('user.year_level', '3rd Year')
            ->assertJsonPath('user.course', 'BSIT')
            ->assertJsonPath('user.department', 'CCS')
            ->assertJsonPath('user.address', 'Naga City');

        $token = (string) $loginResponse->json('token');

        $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/v1/me')
            ->assertOk()
            ->assertJsonPath('id', $user->id)
            ->assertJsonPath('name', 'Scholar User')
            ->assertJsonPath('email', 'scholar@example.com')
            ->assertJsonPath('role', 'scholar')
            ->assertJsonPath('talent_group', 'glee-club')
            ->assertJsonPath('student_id', '2026-0001')
            ->assertJsonPath('phone', '09123456789')
            ->assertJsonPath('year_level', '3rd Year')
            ->assertJsonPath('course', 'BSIT')
            ->assertJsonPath('department', 'CCS')
            ->assertJsonPath('address', 'Naga City');
    }
}
