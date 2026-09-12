<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Product>
 */
class ProductFactory extends Factory
{
    public function definition(): array
    {
        return [
            'farmer_id' => User::factory()->farmer(),
            'category_id' => Category::factory(),
            'name' => fake()->randomElement(['Fresh Carrots', 'Native Eggs', 'Golden Mangoes', 'Sweet Corn']),
            'description' => fake()->sentence(),
            'unit_type' => fake()->randomElement(['kg', 'sack', 'piece', 'bundle']),
            'price_per_unit' => fake()->randomFloat(2, 20, 500),
            'available_quantity' => fake()->randomFloat(2, 10, 100),
            'harvest_date' => now()->toDateString(),
            'status' => 'available',
        ];
    }

    public function soldOut(): static
    {
        return $this->state(fn (array $attributes) => [
            'available_quantity' => 0,
            'status' => 'sold_out',
        ]);
    }

    public function archived(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'archived',
        ]);
    }

    public function bulkPricing(): static
    {
        return $this->state(fn (array $attributes) => [
            'min_bulk_quantity' => 50,
            'bulk_price' => $attributes['price_per_unit'] * 0.8,
        ]);
    }
}
