<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ProductApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_farmer_can_create_product(): void
    {
        $farmer = User::factory()->farmer()->create();
        $category = Category::factory()->create();

        $response = $this->actingAs($farmer)->postJson('/api/products', [
            'category_id' => $category->id,
            'name' => 'Fresh Tomatoes',
            'unit_type' => 'kg',
            'price_per_unit' => 80,
            'available_quantity' => 100,
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.name', 'Fresh Tomatoes')
            ->assertJsonPath('data.status', 'available');

        $this->assertDatabaseHas('products', [
            'name' => 'Fresh Tomatoes',
            'farmer_id' => $farmer->id,
            'available_quantity' => 100,
        ]);
        $this->assertDatabaseHas('inventory_logs', [
            'product_id' => $response->json('data.id'),
            'change_amount' => 100,
            'reason' => 'restock',
        ]);
    }

    public function test_farmer_can_create_product_with_images(): void
    {
        Storage::fake('public');
        $farmer = User::factory()->farmer()->create();
        $category = Category::factory()->create();

        $response = $this->actingAs($farmer)->post('/api/products', [
            'category_id' => $category->id,
            'name' => 'Native Eggs',
            'unit_type' => 'piece',
            'price_per_unit' => 9,
            'available_quantity' => 200,
            'images' => [UploadedFile::fake()->image('eggs.jpg')],
        ]);

        $response->assertCreated();
        Storage::disk('public')->assertExists(Product::first()->images->first()->image_path);
    }

    public function test_buyer_cannot_create_product(): void
    {
        $buyer = User::factory()->buyerIndividual()->create();

        $this->actingAs($buyer)
            ->postJson('/api/products', ['name' => 'X'])
            ->assertForbidden();
    }

    public function test_guest_cannot_create_product(): void
    {
        $this->postJson('/api/products', ['name' => 'X'])->assertUnauthorized();
    }

    public function test_bulk_price_requires_min_bulk_quantity(): void
    {
        $farmer = User::factory()->farmer()->create();

        $this->actingAs($farmer)->postJson('/api/products', [
            'name' => 'Sweet Corn',
            'unit_type' => 'kg',
            'price_per_unit' => 40,
            'available_quantity' => 500,
            'bulk_price' => 30,
        ])->assertInvalid(['min_bulk_quantity']);
    }

    public function test_only_owner_can_update_product(): void
    {
        $owner = User::factory()->farmer()->create();
        $other = User::factory()->farmer()->create();
        $product = Product::factory()->create(['farmer_id' => $owner->id]);

        $this->actingAs($other)
            ->putJson("/api/products/{$product->id}", ['price_per_unit' => 99])
            ->assertForbidden();

        $this->actingAs($owner)
            ->putJson("/api/products/{$product->id}", ['price_per_unit' => 99])
            ->assertOk()
            ->assertJsonPath('data.price_per_unit', fn ($value) => (float) $value === 99.0);
    }

    public function test_setting_quantity_to_zero_marks_product_sold_out(): void
    {
        $farmer = User::factory()->farmer()->create();
        $product = Product::factory()->create(['farmer_id' => $farmer->id, 'available_quantity' => 25]);

        $this->actingAs($farmer)
            ->putJson("/api/products/{$product->id}", ['available_quantity' => 0])
            ->assertOk();

        $this->assertEquals('sold_out', $product->fresh()->status);
        $this->assertDatabaseHas('inventory_logs', [
            'product_id' => $product->id,
            'change_amount' => -25,
            'reason' => 'adjustment',
        ]);
    }

    public function test_archived_product_is_hidden_from_detail(): void
    {
        $farmer = User::factory()->farmer()->create();
        $product = Product::factory()->archived()->create(['farmer_id' => $farmer->id]);

        $this->getJson("/api/products/{$product->id}")->assertNotFound();

        $this->getJson('/api/products')
            ->assertOk()
            ->assertJsonCount(0, 'data');
    }

    public function test_farmer_can_list_own_products(): void
    {
        $farmer = User::factory()->farmer()->create();
        Product::factory()->count(3)->create(['farmer_id' => $farmer->id]);
        Product::factory()->create(); // another farmer's product

        $this->actingAs($farmer)
            ->getJson('/api/farmer/products')
            ->assertOk()
            ->assertJsonCount(3, 'data');
    }
}
