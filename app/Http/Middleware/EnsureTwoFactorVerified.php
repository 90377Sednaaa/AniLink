<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Laravel\Sanctum\TransientToken;
use Symfony\Component\HttpFoundation\Response;

class EnsureTwoFactorVerified
{
    /**
     * Requires the current token to explicitly carry the 2fa:verified ability once
     * the user has enabled 2FA (the * wildcard is deliberately not accepted, so
     * tokens issued before 2FA was enabled are blocked). This also blocks pending
     * (pre-OTP) login tokens. Routes that must stay reachable with those tokens
     * (2FA management, 2FA verify, logout, me) are mounted outside this middleware.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $token = $user->currentAccessToken();

        if ($user->two_factor_enabled && ! $this->isVerifiedToken($token)) {
            return response()->json([
                'message' => 'Two-factor authentication required. Please verify OTP.',
                'two_factor_required' => true,
            ], 403);
        }

        return $next($request);
    }

    private function isVerifiedToken(mixed $token): bool
    {
        if ($token instanceof TransientToken) {
            return true; // stateful web session
        }

        return is_array($token?->abilities) && in_array('2fa:verified', $token->abilities, true);
    }
}
