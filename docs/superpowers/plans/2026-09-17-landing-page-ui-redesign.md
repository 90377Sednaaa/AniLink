# AniLink Landing Page UI Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the AniLink landing page into a modern, stylized, and clean farm-to-table marketplace experience, removing button redundancies, adding an interactive FAQ accordion, relocating Admin to a discreet staff footer link, and incorporating high-quality agricultural photography.

**Architecture:** Single-page performant Blade template (`resources/views/welcome.blade.php`) styled with Tailwind v4, utilizing semantic HTML5 `<details>` for zero-bundle accessible accordion interactivity, real database counters, and optimized photographic assets stored in `public/images/landing/`.

**Tech Stack:** Laravel 12 (Blade, PHP 8.5), Tailwind CSS v4, Vite 8, PHPUnit.

## Global Constraints

- Modern, stylized, clean aesthetic using brand colors: Warm Canvas `#FAF8F3`, Forest Green `#2E5339`, Harvest Gold `#D4A017`, Border `#E8E2D6`.
- STRICT CONSTRAINT: Zero dot patterns, no polka dot backgrounds, and no pulsing dot icons or clutter.
- No public Admin link in top header or doorway cards; Admin access is via discreet footer staff portal (`/admin`) and direct URL.
- Zero heavy JS libraries for the landing page; use semantic HTML and Tailwind transitions.
- All PHP code must pass `vendor/bin/pint --format agent` and `vendor/bin/phpunit`.

---

### Task 1: Test Scaffold for Landing Page Content & Architecture

**Files:**
- Create: `tests/Feature/LandingPageTest.php`

**Interfaces:**
- Consumes: Laravel HTTP testing, `Product`, `FarmerProfile`, `User`, `Order` Eloquent models.
- Produces: Regression and acceptance test suite for `GET /`.

- [ ] **Step 1: Write the failing feature test**

```php
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
        $farmer = User::factory()->create(['role' => 'farmer']);
        FarmerProfile::factory()->create([
            'user_id' => $farmer->id,
            'verification_status' => 'approved',
        ]);
        Product::factory()->create([
            'user_id' => $farmer->id,
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
        
        // Assert header no longer contains redundant public admin button
        $response->assertDontSee('Open AniMarket</a>', false);
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `php vendor/bin/phpunit tests/Feature/LandingPageTest.php`  
Expected: FAIL (strings like "Fresh From Local Farms", "Frequently Asked Questions", "Staff Admin Portal" not found in current page)

- [ ] **Step 3: Commit initial test**

```bash
git add tests/Feature/LandingPageTest.php
git commit -m "test: add landing page feature test specification"
```

---

### Task 2: Curate and Download Real Photographic Produce Assets

**Files:**
- Create: `public/images/landing/hero-harvest.jpg`
- Create: `public/images/landing/category-greens.jpg`
- Create: `public/images/landing/category-roots.jpg`
- Create: `public/images/landing/category-fruits.jpg`
- Create: `public/images/landing/category-grains.jpg`

**Interfaces:**
- Consumes: High-resolution agricultural imagery from Unsplash public CDN (compressed, clean farm produce).
- Produces: Static web assets in `public/images/landing/`.

- [ ] **Step 1: Create landing image directory and download curated assets**

Run PowerShell script to download curated, high-quality, royalty-free agricultural imagery:
- Hero: Crisp freshly harvested farm crate / produce basket
- Category Greens: Fresh leafy vegetables (pechay, lettuce)
- Category Roots: Root vegetables and tubers (potatoes, carrots, ginger)
- Category Fruits: Tropical fresh fruits (mangoes, citrus)
- Category Grains: Grains and heirloom rice

- [ ] **Step 2: Verify asset presence and non-zero byte size**

Run: `powershell -Command "Get-ChildItem public/images/landing | Select-Object Name, Length"`  
Expected: 5 valid JPG files with byte length > 10KB.

- [ ] **Step 3: Commit assets**

```bash
git add public/images/landing/
git commit -m "assets: add curated farm produce photography for landing page"
```

---

### Task 3: Streamline Top Navigation Header & Multi-Column Footer

**Files:**
- Modify: `resources/views/welcome.blade.php:36-54` (Header)
- Modify: `resources/views/welcome.blade.php:244-256` (Footer)

**Interfaces:**
- Consumes: Routes `/shop`, `/manage`, `/admin`, `/shop/register`.
- Produces: Clean, clutter-free navigation with dedicated Staff Admin Portal in footer.

- [ ] **Step 1: Update Top Navigation Header**
Remove duplicate "Shop" / "Open AniMarket" buttons and public "Admin" link:
```html
<header class="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-[#E8E2D6]">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <a href="/" class="flex items-center gap-3 min-w-0">
            <img src="/apple-touch-icon-180.png" alt="AniLink logo" class="w-9 h-9 rounded-xl shadow-[0_4px_12px_rgba(46,83,57,0.12)]" />
            <span class="min-w-0">
                <span class="block font-semibold text-[#1A1A1A] leading-tight text-base">AniLink</span>
                <span class="block text-[11px] leading-tight text-[#5C5C5C] truncate">Cultivating Connection</span>
            </span>
        </a>
        <nav class="flex items-center gap-2 sm:gap-4 text-sm font-medium">
            <a href="/shop" class="px-3 py-1.5 rounded-full text-[#1A1A1A] hover:text-[#2E5339] hover:bg-[#E8F0E9] transition">Marketplace</a>
            <a href="/manage" class="hidden sm:inline-flex px-3 py-1.5 rounded-full text-[#5C5C5C] hover:text-[#2E5339] hover:bg-[#FAF8F3] transition">For Farmers</a>
            <a href="/shop" class="inline-flex h-10 items-center px-5 rounded-full bg-[#2E5339] text-white font-semibold hover:bg-[#24412D] transition shadow-[0_4px_12px_rgba(46,83,57,0.18)]">Shop Harvests</a>
        </nav>
    </div>
</header>
```

- [ ] **Step 2: Update Footer with Staff Admin Portal**
Organize into 4 logical columns with clean copyright and discreet staff access:
```html
<footer class="border-t border-[#E8E2D6] bg-white">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div class="grid grid-cols-2 md:grid-cols-5 gap-8">
            <div class="col-span-2">
                <div class="flex items-center gap-3">
                    <img src="/apple-touch-icon-180.png" alt="AniLink" class="w-8 h-8 rounded-lg" />
                    <span class="font-semibold text-lg text-[#1A1A1A]">AniLink</span>
                </div>
                <p class="mt-3 text-sm text-[#5C5C5C] leading-6 max-w-sm">
                    Cultivating connection, harvesting fair trades. An open agricultural cooperative connecting verified local farmers directly to families and businesses.
                </p>
                <p class="mt-4 text-xs text-[#8A8A8A]">© {{ date('Y') }} AniLink Cooperative. All rights reserved.</p>
            </div>
            <div>
                <h4 class="text-xs font-semibold uppercase tracking-wider text-[#1A1A1A]">Marketplace</h4>
                <ul class="mt-3 space-y-2 text-sm text-[#5C5C5C]">
                    <li><a href="/shop" class="hover:text-[#2E5339] transition">Browse Produce</a></li>
                    <li><a href="/shop" class="hover:text-[#2E5339] transition">Verified Farms</a></li>
                    <li><a href="/shop" class="hover:text-[#2E5339] transition">Bulk B2B Orders</a></li>
                    <li><a href="/shop/register" class="hover:text-[#2E5339] transition">Buyer Account</a></li>
                </ul>
            </div>
            <div>
                <h4 class="text-xs font-semibold uppercase tracking-wider text-[#1A1A1A]">For Farmers</h4>
                <ul class="mt-3 space-y-2 text-sm text-[#5C5C5C]">
                    <li><a href="/manage" class="hover:text-[#2E5339] transition">AniManage Portal</a></li>
                    <li><a href="/manage" class="hover:text-[#2E5339] transition">Verification Guide</a></li>
                    <li><a href="/manage" class="hover:text-[#2E5339] transition">Fair Pricing Standards</a></li>
                </ul>
            </div>
            <div>
                <h4 class="text-xs font-semibold uppercase tracking-wider text-[#1A1A1A]">Cooperative</h4>
                <ul class="mt-3 space-y-2 text-sm text-[#5C5C5C]">
                    <li><a href="/shop" class="hover:text-[#2E5339] transition">About AniLink</a></li>
                    <li><a href="/shop" class="hover:text-[#2E5339] transition">Terms of Trade</a></li>
                    <li><a href="/admin" class="text-[#2E5339] font-medium hover:underline flex items-center gap-1">Staff Admin Portal →</a></li>
                </ul>
            </div>
        </div>
    </div>
</footer>
```

- [ ] **Step 3: Run partial test**

Run: `php vendor/bin/phpunit tests/Feature/LandingPageTest.php`  
Expected: Verifies header and footer link assertions pass.

- [ ] **Step 4: Commit header and footer**

```bash
git add resources/views/welcome.blade.php
git commit -m "feat(landing): streamline header nav and add discreet staff admin footer"
```

---

### Task 4: Modern Stylized Hero with Photography Card & Clean Trust Pills

**Files:**
- Modify: `resources/views/welcome.blade.php:56-134` (Hero Section)

**Interfaces:**
- Consumes: `/images/landing/hero-harvest.jpg`.
- Produces: High-converting hero section with zero dot patterns and clean visual hierarchy.

- [ ] **Step 1: Implement Modern Stylized Hero Section**
- Headline: "Fresh From Local Farms, Fair Trades For Every Harvest."
- Clean solid tags (no pulsing dots, no dot backgrounds).
- Dual CTAs: `Browse Today’s Harvests →` and `Sell Your Harvest`.
- Photographic Card: Showcases fresh produce image with styled overlays (`Harvested Today`, `₱35.00 / kg`, `Mang Danilo · Benguet Co-op ✓ Verified`).

- [ ] **Step 2: Commit hero section**

```bash
git add resources/views/welcome.blade.php
git commit -m "feat(landing): elevate hero with photographic produce showcase and clean trust signals"
```

---

### Task 5: Live Metrics Ribbon & The Two Pathways (Buyers vs Farmers)

**Files:**
- Modify: `resources/views/welcome.blade.php:135-183`

**Interfaces:**
- Consumes: `$liveListings`, `$verifiedFarms`, `$farms`, `$ordersDelivered` controller variables.
- Produces: Dark forest glass ribbon (`#2E5339`) and 2 dedicated user pathways (Households & Businesses vs Farmers & Producers), replacing the 3rd admin doorway.

- [ ] **Step 1: Implement Dark Forest Metrics Ribbon**
Display the 4 key metrics with clean typography and solid borders.

- [ ] **Step 2: Implement The Two Pathways Cards**
- Card 1: `I'm Buying Produce` (Households, caterers, food businesses). CTA: `Enter AniMarket →` (`/shop`).
- Card 2: `I'm Selling Harvests` (Smallholders, farm co-ops). CTA: `Open AniManage →` (`/manage`).

- [ ] **Step 3: Commit metrics and pathways**

```bash
git add resources/views/welcome.blade.php
git commit -m "feat(landing): implement live metrics ribbon and dual buyer-farmer pathways"
```

---

### Task 6: Curated Harvest Categories & How It Works 3 Steps

**Files:**
- Modify: `resources/views/welcome.blade.php:184-242`

**Interfaces:**
- Consumes: Category images in `public/images/landing/`.
- Produces: Visual grid of key produce sectors and 3-step farm-to-table process.

- [ ] **Step 1: Implement Category Cards Grid**
4 stylized category cards with photos, crop titles, and sample produce tags (Leafy Greens, Root Crops, Heritage Fruits, Grains & Staples).

- [ ] **Step 2: Implement 3-Step "Farm to Table" Process**
Clean step indicators: 1. Farmers List Harvest, 2. Buyers Order Direct, 3. Seamless Handover.

- [ ] **Step 3: Commit categories and process**

```bash
git add resources/views/welcome.blade.php
git commit -m "feat(landing): add harvest category showcase and 3-step flow"
```

---

### Task 7: Interactive FAQ Accordion & Final Conversion CTA

**Files:**
- Modify: `resources/views/welcome.blade.php` (After process section, before footer)

**Interfaces:**
- Consumes: Tailwind v4 `<details>` styling with group-open rotation.
- Produces: 6 comprehensive interactive FAQ cards with smooth expand/collapse.

- [ ] **Step 1: Implement FAQ Accordion Section**
Include 6 core questions:
1. What is AniLink and how does it eliminate middlemen?
2. How are farmers and harvests verified?
3. Can restaurants and businesses buy in bulk?
4. How does order delivery and pickup work?
5. What payment options are supported?
6. Is it free for farmers to join and list harvests?

- [ ] **Step 2: Implement Final Conversion CTA Banner**
"Fresh harvests on your table, fair income in farmers' hands." with dual action buttons.

- [ ] **Step 3: Commit FAQ and CTA banner**

```bash
git add resources/views/welcome.blade.php
git commit -m "feat(landing): add interactive FAQ accordion and final conversion CTA"
```

---

### Task 8: Verification, Asset Build, and Style Formatting

**Files:**
- Modify: `resources/views/welcome.blade.php`

- [ ] **Step 1: Run Feature Tests**

Run: `php vendor/bin/phpunit tests/Feature/LandingPageTest.php`  
Expected: All tests PASS with 0 errors.

- [ ] **Step 2: Build Assets**

Run: `npm run build`  
Expected: Vite build succeeds and writes to `public/build/`.

- [ ] **Step 3: Run Laravel Pint Code Formatter**

Run: `vendor/bin/pint --format agent`  
Expected: Code formatted to project standard.

- [ ] **Step 4: Final verification and commit**

```bash
git add resources/views/welcome.blade.php public/build/
git commit -m "chore: complete landing page UI enhancement build and verification"
```
