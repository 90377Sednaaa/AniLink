<?php

namespace Database\Factories;

use App\Models\Order;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Order>
 */
class OrderFactory extends Factory
{
    public function definition(): array
    {
        return [
            'buyer_id' => User::factory()->buyerIndividual(),
            'farmer_id' => User::factory()->farmer(),
            'order_type' => 'retail',
            'status' => 'pending',
            'fulfillment_type' => 'pickup',
            'total_amount' => fake()->randomFloat(2, 100, 2000),
        ];
    }
}
