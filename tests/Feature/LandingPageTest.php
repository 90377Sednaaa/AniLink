<?php

namespace Tests\Feature;

use App\Models\FarmerProfile;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LandingPageTest extends TestCase
{
    use RefreshDatabase;

    public function test_landing_page_renders_successfully_with_live_stats(): void
    {
        $farmer = User::factory()->farmer()->create();
        FarmerProfile::factory()->approved()->create([
            'user_id' => $farmer->id,
        ]);
        Product::factory()->create([
            'farmer_id' => $farmer->id,
            'status' => 'available',
        ]);
        Order::factory()->create([
            'status' => 'delivered',
        ]);

        $response = $this->get('/');

        $response->assertStatus(200);
        $response->assertSee('Fresh From Local Farms');
        $response->assertSee('Fair Trades For Every Harvest');
        $response->assertSee('Browse Today’s Harvests');
        $response->assertSee('Frequently Asked Questions');
        $response->assertSee('Staff Admin Portal');

        // Header should not have duplicate "Open AniMarket" button next to Shop
        $response->assertDontSee('Open AniMarket</a>', false);
    }
}
