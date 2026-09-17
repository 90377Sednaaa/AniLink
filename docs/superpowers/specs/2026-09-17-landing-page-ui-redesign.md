# Design Spec: AniLink Landing Page UI/UX Redesign

**Date:** 2026-09-17  
**Status:** Approved  
**Target:** `resources/views/welcome.blade.php`, `public/images/landing/`

---

## 1. Overview & Goals

The goal is to elevate the **AniLink** public landing page into a modern, stylized, and clean farm-to-table marketplace experience. AniLink connects smallholder farmers directly with households and commercial food buyers.

### Key Objectives
1. **Streamline Navigation & Actions:** Remove duplicate buttons (e.g. redundant "Shop" and "Open AniMarket" buttons side-by-side) and remove the out-of-place public "Admin" button from the main header and doorway cards.
2. **Dedicated Staff / Admin Access:** Move admin access into a clean, dedicated "Staff Admin Portal" link in the footer, accessible via `/admin`.
3. **Modern & Stylized Aesthetics (Clean, No Dots):** Clean surfaces, crisp typography, warm linen tone background (`#FAF8F3`), deep forest green (`#2E5339`), and harvest gold (`#D4A017`). Explicitly avoid decorative dot patterns, polka dot backgrounds, or pulsing dots.
4. **Visual Imagery & Assets:** Replace the emoji-heavy preview with high-quality, crisp, curated agricultural photography (fresh local harvests, organic vegetables, farm crates, verified farmer badge).
5. **Interactive FAQ Section:** Implement an accessible, smooth accordion answering top buyer and farmer inquiries (middleman disintermediation, verification process, B2B bulk orders, delivery tracking, payments, and farmer fees).
6. **Performance & Simplicity (Approach 1):** Built directly in Blade and Tailwind v4 with zero heavy JS dependencies for ultra-fast First Contentful Paint (FCP) and low-bandwidth accessibility.

---

## 2. Page Structure & Components

### 2.1 Top Navigation Header
- **Branding:** AniLink icon + title with subtitle *"Cultivating Connection"*.
- **Left Navigation Links:**
  - `Marketplace` (`/shop`) — for household and commercial buyers.
  - `For Farmers` (`/manage`) — for producers and agricultural cooperatives.
- **Primary CTA:** A single high-contrast rounded pill button: `Shop Harvests` (`/shop`).
- **Cleanups:**
  - Removed duplicate `Shop` link next to `Open AniMarket`.
  - Removed public `Admin` link from the top header.

### 2.2 Hero Section
- **Badge:** `🧺 Farm-Direct Agricultural Cooperative` in a soft amber badge with solid border.
- **Main Headline:**
  > **Fresh From Local Farms,**<br>
  > **Fair Trades For Every Harvest.**
- **Sub-headline:**
  Connecting verified Filipino smallholder farmers directly to families and businesses. Fair prices for harvests, fresh produce for every table.
- **Dual CTAs:**
  - Primary button: `Browse Today's Harvests →` (`/shop`) with forest green fill and smooth hover lift.
  - Secondary button: `Sell Your Harvest` (`/manage`) with clean border and subtle hover state.
  - Microcopy: *"Need bulk supply for your restaurant or store? Direct quotes available."*
- **Trust Indicators (Clean, pill format):**
  - `100% Verified Local Farms`
  - `Direct Fair Pricing`
  - `Secure Escrow & 2FA`
- **Showcase Visual Card:**
  - Rich photographic display of crisp farm produce (e.g. highland lettuce, pechay, native tomatoes) with clean metadata tags:
    - Freshness chip: `Harvested Today`
    - Price tag: `₱35.00 / kg`
    - Origin badge: `Brgy. San Isidro · Verified Farm`

### 2.3 Live Network Metrics Ribbon
- Full-width dark forest green (`#2E5339`) container with clean rounded corners (`rounded-3xl`) and crisp white typography:
  - **Live Listings:** `$liveListings` harvest listings currently active.
  - **Verified Farms:** `$verifiedFarms` accredited farms and cooperatives.
  - **Registered Farmers:** `$farms` producers empowered on AniLink.
  - **Delivered Orders:** `$ordersDelivered` successful farm-to-table deliveries.
- Clean caption highlighting transparency and cooperative standards.

### 2.4 The Two Pathways (Replaces 3 Cluttered Doorways)
Two prominent cards tailored to user intent:
1. **For Households & Food Businesses:**
   - Highlights: Same-day farm harvests, transparent origins, wholesale bulk rates for restaurants.
   - Action button: `Enter AniMarket →` (`/shop`).
2. **For Smallholders & Cooperatives:**
   - Highlights: Fast 30-second harvest listing, one-tap order status steppers, zero predatory middleman cuts.
   - Action button: `Open AniManage →` (`/manage`).

### 2.5 Harvest Categories Showcase
A responsive curated category grid featuring real crop sectors:
- **Leafy Greens & Salad Crops** (Pechay, Kangkong, Baguio Romaine, Mustard Greens)
- **Root Crops & Tubers** (Benguet Potatoes, Native Ginger, Sweet Potatoes)
- **Heritage Fruits** (Guimaras Mangoes, Davao Pomelos, Solo Papaya)
- **Grains & Farm Staples** (Heirloom Kalinga Rice, Organic Red Rice, Farm Eggs)

### 2.6 How It Works in 3 Steps
1. **Farmers List Fresh Harvest:** Name, price per kg, and available volume posted quickly on web or mobile.
2. **Buyers Order Retail or Wholesale:** Households order weekly baskets; businesses request bulk quotes with direct farm rates.
3. **Direct Delivery & Seamless Handover:** Orders transition from confirmed to delivered with transparent notifications.

### 2.7 Interactive FAQ Accordion
Built with clean semantic HTML `<details>` and `<summary>` styled with Tailwind v4 for smooth toggle states without heavy JS:
1. **What is AniLink and how does it eliminate middlemen?**  
   AniLink connects smallholder farmers directly with buyers (households, restaurants, food enterprises). Farmers set their own fair prices, receive orders directly, and keep the earnings that layered traders typically siphon off.
2. **How are farmers and harvests verified?**  
   Every farm undergoes cooperative verification and administrative review before listings go live. This guarantees authentic origin tracking, transparent sourcing, and reliable quality.
3. **Can restaurants and businesses buy in bulk?**  
   Yes. AniLink features direct B2B bulk requests where commercial buyers can request wholesale volumes and negotiated rates directly with local agricultural cooperatives.
4. **How do deliveries and order fulfillment work?**  
   Orders transition transparently through five clear stages (Pending → Confirmed → Preparing → Ready → Delivered). Buyers can track their harvest from the field to their doorstep with automated status updates.
5. **What payment options are supported?**  
   AniLink supports digital payments (e-wallets, bank transfers) and cash-on-delivery (COD) with built-in order confirmation protections.
6. **Is it free for farmers to join and list harvests?**  
   Yes. Creating a farm profile and listing harvests is free. AniLink operates on a cooperative model to maximize farmer take-home income.

### 2.8 Conversion Call-to-Action Section
High-contrast banner:
- Bold invitation: *"Fresh harvests on your table, fair income in farmers' hands."*
- Action buttons: `Shop the Marketplace` and `Join as a Farmer`.

### 2.9 Multi-Column Footer & Staff Admin Portal
- **Brand Column:** AniLink logo, cooperative mission statement, copyright.
- **Marketplace Links:** Browse Produce, Farm Directory, Bulk Orders, Buyer Registration.
- **Farmer Links:** AniManage Portal, Verification Requirements, Seller Guides.
- **Platform Links:** About AniLink, Quality Standards, Privacy Policy, Terms of Trade.
- **Cooperative Staff Column:** Discreet **"Staff Admin Portal"** link (`/admin`) allowing administrators and cooperative reviewers direct access without cluttering the public visitor navigation.

---

## 3. Assets & Styling Specifications
- **Colors:**
  - Warm Canvas: `#FAF8F3`
  - Forest Primary: `#2E5339`
  - Forest Soft: `#4A7C59`
  - Harvest Gold: `#D4A017`
  - Harvest Light: `#FFF4D6`
  - Slate Dark: `#1A1A1A`
  - Border Neutral: `#E8E2D6`
- **Imagery:**
  - Download and optimize real photographic WebP/JPG images for farm produce in `public/images/landing/`:
    - `hero-harvest.jpg` (vibrant farm basket / fresh harvest)
    - `category-greens.jpg`
    - `category-roots.jpg`
    - `category-fruits.jpg`
    - `category-grains.jpg`
- **UI Constraints:**
  - No dot patterns, no polka dot backgrounds, no pulsing dot indicators.
  - Crisp borders (`border-[#E8E2D6]`), clean rounded corners (`rounded-2xl` / `rounded-3xl`), smooth transition states.

---

## 4. Verification Plan
- Verify page renders correctly at `GET /`.
- Verify all links (`/shop`, `/manage`, `/admin`, `/shop/register`) work as expected.
- Verify responsive layout on mobile (< 640px), tablet, and desktop (>= 1024px).
- Verify interactive FAQ opens/closes smoothly.
- Run `npm run build` or verify Tailwind classes compile cleanly.
