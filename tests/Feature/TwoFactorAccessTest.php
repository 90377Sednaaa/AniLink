<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class TwoFactorAccessTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Http::fake();
    }

    public function test_register_rejects_admin_role(): void
    {
        $this->postJson('/api/register', [
            'name' => 'Evil Admin',
            'email' => 'evil@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'admin',
        ])->assertInvalid(['role']);

        $this->assertDatabaseMissing('users', ['email' => 'evil@example.com']);
    }

    public function test_pending_2fa_token_cannot_access_protected_routes(): void
    {
        $user = User::factory()->buyerIndividual()->create(['two_factor_enabled' => true]);
        $pendingToken = $user->createToken('2fa-pending', ['2fa:pending'])->plainTextToken;

        $this->withHeader('Authorization', "Bearer {$pendingToken}")
            ->getJson('/api/orders')
            ->assertForbidden()
            ->assertJsonPath('two_factor_required', true);
    }

    public function test_pending_2fa_token_can_logout_and_view_profile(): void
    {
        $user = User::factory()->buyerIndividual()->create(['two_factor_enabled' => true]);
        $pendingToken = $user->createToken('2fa-pending', ['2fa:pending'])->plainTextToken;

        $this->withHeader('Authorization', "Bearer {$pendingToken}")
            ->getJson('/api/me')
            ->assertOk();

        $this->withHeader('Authorization', "Bearer {$pendingToken}")
            ->postJson('/api/logout')
            ->assertOk();
    }

    public function test_verified_2fa_token_grants_access(): void
    {
        $user = User::factory()->buyerIndividual()->create(['two_factor_enabled' => true]);
        $verifiedToken = $user->createToken('auth-token', ['*', '2fa:verified'])->plainTextToken;

        $this->withHeader('Authorization', "Bearer {$verifiedToken}")
            ->getJson('/api/orders')
            ->assertOk();
    }

    public function test_token_without_2fa_is_blocked_once_2fa_is_enabled(): void
    {
        $user = User::factory()->buyerIndividual()->create();
        $oldToken = $user->createToken('auth-token', ['*'])->plainTextToken;
        $user->forceFill(['two_factor_enabled' => true])->save();

        $this->withHeader('Authorization', "Bearer {$oldToken}")
            ->getJson('/api/orders')
            ->assertForbidden()
            ->assertJsonPath('two_factor_required', true);
    }
}
