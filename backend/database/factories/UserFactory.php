<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends Factory<User>
 */
final class UserFactory extends Factory
{
    protected $model = User::class;

    public function definition(): array
    {
        return [
            'name'                   => fake()->name(),
            'email'                  => fake()->unique()->safeEmail(),
            'student_id'             => null,
            'email_verified_at'      => now(),
            'password'               => Hash::make('password'),
            'remember_token'         => Str::random(10),
            'role'                   => 'student',
            'talent_group'           => null,
            'phone'                  => fake()->phoneNumber(),
            'year_level'             => fake()->randomElement(['1st Year', '2nd Year', '3rd Year', '4th Year']),
            'course'                 => fake()->randomElement([
                'Bachelor of Music',
                'Bachelor of Arts in Communication',
                'Bachelor of Science in Nursing',
                'Bachelor of Physical Education',
            ]),
            'application_status'     => null,
            'training_status'        => null,
            'scholarship_percentage' => null,
        ];
    }

    public function director(): static
    {
        return $this->state(fn (array $attributes): array => [
            'role'         => 'director',
            'talent_group' => fake()->randomElement(['marching-band', 'glee-club', 'dance-club', 'majorettes']),
        ]);
    }

    public function scholar(): static
    {
        return $this->state(fn (array $attributes): array => [
            'role'                   => 'scholar',
            'application_status'     => 'approved',
            'training_status'        => 'completed',
            'scholarship_percentage' => fake()->randomElement([75, 100]),
        ]);
    }

    public function trainee(): static
    {
        return $this->state(fn (array $attributes): array => [
            'role'               => 'student',
            'application_status' => 'approved',
            'training_status'    => 'in_progress',
        ]);
    }
}
