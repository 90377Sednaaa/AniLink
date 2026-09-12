<?php

namespace Database\Factories;

use App\Models\FarmerProfile;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<FarmerProfile>
 */
class FarmerProfileFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory()->farmer(),
            'farm_name' => fake()->company().' Farm',
            'barangay' => fake()->streetName(),
            'municipality' => fake()->city(),
            'province' => fake()->city(),
            'verification_status' => 'pending',
        ];
    }

    public function approved(): static
    {
        return $this->state(fn (array $attributes) => [
            'verification_status' => 'approved',
        ]);
    }
}
