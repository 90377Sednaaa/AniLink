<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title>AniLink — Cultivating Connection, Harvesting Fair Trades</title>
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png">
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon-180.png">
        <meta name="description" content="AniLink connects smallholder farmers directly to households and businesses — fair prices for harvests, fresh produce for every table.">

        @fonts

        @if (file_exists(public_path('build/manifest.json')) || file_exists(public_path('hot')))
            @vite(['resources/css/app.css', 'resources/js/app.js'])
        @else
            <style>
                /* Critical fallback before `npm run build` — brand colors + readable layout */
                body { margin: 0; background: #FAF8F3; color: #1A1A1A; font-family: 'Poppins', ui-sans-serif, system-ui, sans-serif; }
                a { color: #2E5339; }
                img { vertical-align: middle; }
                .wl-fallback-note { max-width: 640px; margin: 48px auto; padding: 24px; background: #fff; border: 1px solid #E8E2D6; border-radius: 12px; }
            </style>
        @endif
    </head>
    <body class="bg-[#FAF8F3] text-[#1A1A1A] font-sans antialiased min-h-screen flex flex-col selection:bg-[#FFF4D6] selection:text-[#8A6A0A]">
        @unless (file_exists(public_path('build/manifest.json')) || file_exists(public_path('hot')))
            <div class="wl-fallback-note">
                <strong>AniLink</strong> — Cultivating Connection, Harvesting Fair Trades.<br /><br />
                The web assets aren’t built yet. Run <code>npm install &amp;&amp; npm run build</code>,
                then refresh this page. Meanwhile: <a href="/shop">AniMarket</a> · <a href="/manage">AniManage (farmers)</a> · <a href="/admin">Admin console</a>
            </div>
        @endunless

        {{-- ===== Top Header ===== --}}
        <header class="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E8E2D6]">
            <div class="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
                <a href="/" class="flex items-center gap-3 min-w-0">
                    <img src="/apple-touch-icon-180.png" alt="AniLink logo" class="w-9 h-9 rounded-xl shadow-[0_4px_12px_rgba(46,83,57,0.12)]" />
                    <span class="min-w-0">
                        <span class="block font-semibold leading-tight text-base text-[#1A1A1A]">AniLink</span>
                        <span class="block text-[11px] leading-tight text-[#5C5C5C] truncate">Cultivating Connection</span>
                    </span>
                </a>
                <nav class="flex items-center gap-2 sm:gap-3 text-sm">
                    <a href="/shop" class="inline-flex h-9 items-center px-3.5 rounded-full font-medium text-[#1A1A1A] hover:text-[#2E5339] hover:bg-[#E8F0E9] transition">Marketplace</a>
                    <a href="/manage" class="hidden sm:inline-flex h-9 items-center px-3.5 rounded-full font-medium text-[#5C5C5C] hover:text-[#2E5339] hover:bg-[#FAF8F3] transition">For Farmers</a>
                    <a href="/shop" class="inline-flex h-10 items-center px-5 rounded-full bg-[#2E5339] text-white font-semibold hover:bg-[#24412D] transition shadow-[0_4px_14px_rgba(46,83,57,0.18)]">Shop Harvests</a>
                </nav>
            </div>
        </header>

        <main class="flex-1">
            {{-- ===== Hero Section ===== --}}
            <section class="max-w-6xl mx-auto px-4 sm:px-6 pt-12 pb-14 lg:pt-20 lg:pb-20 grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
                <div>
                    <span class="inline-flex items-center gap-2 h-8 px-3.5 rounded-full bg-[#FFF4D6] border border-[#F2D98A] text-[#8A6A0A] text-xs font-semibold">
                        🧺 Farm-Direct Agricultural Cooperative
                    </span>
                    <h1 class="mt-5 text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.12] text-[#1A1A1A]">
                        Fresh From Local Farms,<br class="hidden sm:block" />
                        <span class="text-[#2E5339]">Fair Trades For Every Harvest.</span>
                    </h1>
                    <p class="mt-5 text-[#5C5C5C] text-base sm:text-lg leading-7 max-w-[54ch]">
                        <span class="font-semibold text-[#1A1A1A]">Ani</span> means harvest. AniLink connects verified Filipino smallholder farmers directly to households and food businesses — guaranteed fair prices for every harvest, fresher produce for every table.
                    </p>

                    <div class="mt-8 flex flex-wrap items-center gap-3.5">
                        <a href="/shop" class="inline-flex h-12 items-center px-7 rounded-full bg-[#2E5339] text-white font-semibold hover:bg-[#24412D] transition shadow-[0_6px_20px_rgba(46,83,57,0.22)]">
                            Browse Today’s Harvests →
                        </a>
                        <a href="/manage" class="inline-flex h-12 items-center px-7 rounded-full bg-white border border-[#E8E2D6] font-semibold text-[#1A1A1A] hover:bg-white/80 hover:border-[#2E5339]/40 transition">
                            Sell Your Harvest
                        </a>
                    </div>
                    <p class="mt-4 text-xs text-[#8A8A8A]">
                        New buyer? <a href="/shop/register" class="text-[#2E5339] font-semibold underline">Create a free account</a> · Need commercial bulk supply? <a href="/shop" class="text-[#2E5339] font-semibold underline">Request wholesale B2B quotes</a>
                    </p>

                    {{-- Trust signals — clean, solid pill badges (no dot clutter) --}}
                    <div class="mt-8 flex flex-wrap gap-2.5 text-xs font-medium text-[#2E5339]">
                        <span class="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-full bg-white border border-[#E8E2D6] shadow-sm">✓ 100% Verified Local Farmers</span>
                        <span class="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-full bg-white border border-[#E8E2D6] shadow-sm">✓ Direct Fair Pricing</span>
                        <span class="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-full bg-white border border-[#E8E2D6] shadow-sm">✓ 2FA Secure Escrow Accounts</span>
                    </div>
                </div>

                {{-- Hero Visual Showcase Card --}}
                <div class="relative max-w-md w-full mx-auto lg:mx-0 lg:justify-self-end">
                    <div class="absolute -top-3 -left-3 w-24 h-24 rounded-2xl bg-[#E8F0E9] -z-10" aria-hidden="true"></div>
                    <div class="absolute -bottom-3 -right-3 w-28 h-28 rounded-2xl bg-[#FFF4D6] -z-10" aria-hidden="true"></div>

                    <div class="bg-white rounded-2xl border border-[#E8E2D6] p-4 sm:p-5 shadow-[0_12px_32px_rgba(46,83,57,0.08)]">
                        <div class="relative overflow-hidden rounded-xl border border-[#E8E2D6]">
                            <img src="/images/landing/hero-harvest.jpg" alt="Fresh farm produce harvest basket" class="w-full h-52 object-cover" />
                            <div class="absolute top-3 left-3">
                                <span class="px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-sm border border-[#E8E2D6] text-[11px] font-semibold text-[#8A6A0A] shadow-sm">
                                    Harvested Today
                                </span>
                            </div>
                            <div class="absolute top-3 right-3">
                                <span class="px-2.5 py-1 rounded-full bg-[#2E5339] text-white text-[11px] font-semibold shadow-sm">
                                    Direct Farm Origin
                                </span>
                            </div>
                        </div>

                        <div class="mt-4">
                            <div class="flex items-start justify-between gap-2">
                                <div>
                                    <h3 class="font-semibold text-base text-[#1A1A1A]">Crisp Highland Greens &amp; Veggies</h3>
                                    <p class="text-xs text-[#5C5C5C] mt-0.5">Freshly cut early morning · Benguet Cooperative</p>
                                </div>
                                <div class="text-right shrink-0">
                                    <span class="text-lg font-bold text-[#2E5339]">₱35.00</span>
                                    <span class="block text-[11px] text-[#8A8A8A] font-medium">/ kg avg</span>
                                </div>
                            </div>

                            <div class="mt-4 pt-3 border-t border-[#E8E2D6] flex items-center justify-between">
                                <div class="flex items-center gap-2.5 min-w-0">
                                    <img src="/images/landing/farmer-avatar.jpg" alt="Farmer Danilo" class="w-8 h-8 rounded-full object-cover border border-[#E8E2D6]" />
                                    <div class="min-w-0">
                                        <span class="block text-xs font-semibold text-[#1A1A1A] truncate">Mang Danilo</span>
                                        <span class="block text-[10px] text-[#5C5C5C] truncate">Benguet Co-op</span>
                                    </div>
                                </div>
                                <span class="px-2 py-0.5 rounded-full bg-[#E8F0E9] text-[#2E5339] text-[11px] font-semibold whitespace-nowrap">
                                    ✓ Verified Farm
                                </span>
                            </div>

                            <a href="/shop" class="mt-4 w-full h-10 rounded-xl bg-[#2E5339] text-white text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-[#24412D] transition shadow-sm">
                                View Available Harvests →
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {{-- ===== Live Network Metrics Ribbon ===== --}}
            <section class="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
                <div class="bg-[#2E5339] rounded-2xl sm:rounded-3xl text-white p-6 sm:p-8 lg:p-10 shadow-[0_12px_32px_rgba(46,83,57,0.18)]">
                    <div class="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                        <div>
                            <div class="text-3xl sm:text-4xl font-semibold tracking-tight">{{ number_format($liveListings) }}</div>
                            <div class="text-sm text-white/80 mt-1 font-medium">harvest{{ $liveListings === 1 ? '' : 's' }} on the market now</div>
                        </div>
                        <div>
                            <div class="text-3xl sm:text-4xl font-semibold tracking-tight">{{ number_format($verifiedFarms) }}</div>
                            <div class="text-sm text-white/80 mt-1 font-medium">verified farm{{ $verifiedFarms === 1 ? '' : 's' }}</div>
                        </div>
                        <div>
                            <div class="text-3xl sm:text-4xl font-semibold tracking-tight">{{ number_format($farms) }}</div>
                            <div class="text-sm text-white/80 mt-1 font-medium">farmer{{ $farms === 1 ? '' : 's' }} on AniLink</div>
                        </div>
                        <div>
                            <div class="text-3xl sm:text-4xl font-semibold tracking-tight">{{ number_format($ordersDelivered) }}</div>
                            <div class="text-sm text-white/80 mt-1 font-medium">order{{ $ordersDelivered === 1 ? '' : 's' }} delivered</div>
                        </div>
                    </div>
                    <div class="mt-8 pt-6 border-t border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-white/75">
                        <span>Transparent origin tracking and cooperative oversight for every harvest.</span>
                        <span class="text-white font-medium">Zero hidden commissions · 100% direct-to-farm payments</span>
                    </div>
                </div>
            </section>

            {{-- ===== The Two Clear Pathways (Buyers vs Farmers) ===== --}}
            <section class="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
                <div class="text-center max-w-2xl mx-auto">
                    <h2 class="text-2xl sm:text-3xl font-semibold tracking-tight text-[#1A1A1A]">Two Clear Pathways, One Fair Cooperative</h2>
                    <p class="mt-2 text-sm sm:text-base text-[#5C5C5C]">Built to empower Filipino smallholders and provide fresher, affordable produce to households and businesses.</p>
                </div>

                <div class="mt-10 grid md:grid-cols-2 gap-6">
                    {{-- Pathway 1: Buyers --}}
                    <div class="bg-white rounded-2xl border border-[#E8E2D6] p-7 shadow-[0_6px_20px_rgba(46,83,57,0.06)] flex flex-col justify-between hover:border-[#2E5339]/40 transition">
                        <div>
                            <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8F0E9] text-[#2E5339] text-xs font-semibold">
                                🌿 For Households &amp; Food Businesses
                            </div>
                            <h3 class="mt-4 text-xl font-semibold text-[#1A1A1A]">I’m Buying Produce</h3>
                            <p class="mt-2 text-sm text-[#5C5C5C] leading-6">
                                Browse fresh harvests straight from accredited farms. Enjoy restaurant-grade freshness with transparent farm origins and B2B wholesale pricing.
                            </p>
                            <ul class="mt-5 space-y-2.5 text-sm text-[#5C5C5C]">
                                <li class="flex items-center gap-2">
                                    <span class="text-[#2E5339] font-bold">✓</span> Up to 30% savings vs supermarket retail markups
                                </li>
                                <li class="flex items-center gap-2">
                                    <span class="text-[#2E5339] font-bold">✓</span> Full visibility on harvest dates and verified farm location
                                </li>
                                <li class="flex items-center gap-2">
                                    <span class="text-[#2E5339] font-bold">✓</span> Direct B2B quotes for restaurants, caterers, and vendors
                                </li>
                            </ul>
                        </div>
                        <div class="mt-8 pt-6 border-t border-[#E8E2D6]">
                            <a href="/shop" class="inline-flex h-11 items-center px-6 rounded-full bg-[#2E5339] text-white font-semibold hover:bg-[#24412D] transition shadow-sm">
                                Enter AniMarket →
                            </a>
                        </div>
                    </div>

                    {{-- Pathway 2: Farmers --}}
                    <div class="bg-white rounded-2xl border border-[#E8E2D6] p-7 shadow-[0_6px_20px_rgba(46,83,57,0.06)] flex flex-col justify-between hover:border-[#2E5339]/40 transition">
                        <div>
                            <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF4D6] border border-[#F2D98A] text-[#8A6A0A] text-xs font-semibold">
                                🧑‍🌾 For Smallholders &amp; Cooperatives
                            </div>
                            <h3 class="mt-4 text-xl font-semibold text-[#1A1A1A]">I’m Farming</h3>
                            <p class="mt-2 text-sm text-[#5C5C5C] leading-6">
                                Post your harvests in 30 seconds from any phone or browser. Manage stock with one-tap steppers, receive direct payments, and grow your customer base.
                            </p>
                            <ul class="mt-5 space-y-2.5 text-sm text-[#5C5C5C]">
                                <li class="flex items-center gap-2">
                                    <span class="text-[#2E5339] font-bold">✓</span> Retain 100% of your agreed harvest price
                                </li>
                                <li class="flex items-center gap-2">
                                    <span class="text-[#2E5339] font-bold">✓</span> One-tap stock management — no complicated spreadsheets
                                </li>
                                <li class="flex items-center gap-2">
                                    <span class="text-[#2E5339] font-bold">✓</span> Low-bandwidth friendly design optimized for rural mobile networks
                                </li>
                            </ul>
                        </div>
                        <div class="mt-8 pt-6 border-t border-[#E8E2D6]">
                            <a href="/manage" class="inline-flex h-11 items-center px-6 rounded-full bg-white border border-[#2E5339] text-[#2E5339] font-semibold hover:bg-[#E8F0E9] transition">
                                Open AniManage →
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {{-- ===== Curated Harvest Categories Showcase ===== --}}
            <section class="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
                <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                        <h2 class="text-2xl sm:text-3xl font-semibold tracking-tight text-[#1A1A1A]">Curated Harvest Categories</h2>
                        <p class="mt-1.5 text-sm sm:text-base text-[#5C5C5C]">Sourced directly from accredited regional cooperatives.</p>
                    </div>
                    <a href="/shop" class="text-sm font-semibold text-[#2E5339] hover:underline flex items-center gap-1 shrink-0">
                        View all listings in AniMarket →
                    </a>
                </div>

                <div class="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {{-- Category 1: Greens --}}
                    <div class="bg-white rounded-2xl border border-[#E8E2D6] overflow-hidden shadow-sm hover:shadow-md hover:border-[#2E5339]/40 transition group">
                        <img src="/images/landing/category-greens.jpg" alt="Leafy greens" class="w-full h-44 object-cover group-hover:scale-105 transition duration-300" />
                        <div class="p-5">
                            <h3 class="font-semibold text-base text-[#1A1A1A]">Highland &amp; Lowland Greens</h3>
                            <p class="mt-1 text-xs text-[#5C5C5C] leading-5">Pechay, Baguio Romaine, Kangkong, and crisp cabbage.</p>
                            <a href="/shop" class="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#2E5339] group-hover:underline">Browse Greens →</a>
                        </div>
                    </div>

                    {{-- Category 2: Root Crops --}}
                    <div class="bg-white rounded-2xl border border-[#E8E2D6] overflow-hidden shadow-sm hover:shadow-md hover:border-[#2E5339]/40 transition group">
                        <img src="/images/landing/category-roots.jpg" alt="Root vegetables" class="w-full h-44 object-cover group-hover:scale-105 transition duration-300" />
                        <div class="p-5">
                            <h3 class="font-semibold text-base text-[#1A1A1A]">Root Crops &amp; Tubers</h3>
                            <p class="mt-1 text-xs text-[#5C5C5C] leading-5">Benguet potatoes, native ginger, sweet potatoes, and carrots.</p>
                            <a href="/shop" class="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#2E5339] group-hover:underline">Browse Root Crops →</a>
                        </div>
                    </div>

                    {{-- Category 3: Fruits --}}
                    <div class="bg-white rounded-2xl border border-[#E8E2D6] overflow-hidden shadow-sm hover:shadow-md hover:border-[#2E5339]/40 transition group">
                        <img src="/images/landing/category-fruits.jpg" alt="Tropical fruits" class="w-full h-44 object-cover group-hover:scale-105 transition duration-300" />
                        <div class="p-5">
                            <h3 class="font-semibold text-base text-[#1A1A1A]">Heritage &amp; Tropical Fruits</h3>
                            <p class="mt-1 text-xs text-[#5C5C5C] leading-5">Guimaras mangoes, Davao pomelos, solo papaya, and citrus.</p>
                            <a href="/shop" class="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#2E5339] group-hover:underline">Browse Fruits →</a>
                        </div>
                    </div>

                    {{-- Category 4: Grains --}}
                    <div class="bg-white rounded-2xl border border-[#E8E2D6] overflow-hidden shadow-sm hover:shadow-md hover:border-[#2E5339]/40 transition group">
                        <img src="/images/landing/category-grains.jpg" alt="Heirloom grains" class="w-full h-44 object-cover group-hover:scale-105 transition duration-300" />
                        <div class="p-5">
                            <h3 class="font-semibold text-base text-[#1A1A1A]">Heirloom Grains &amp; Staples</h3>
                            <p class="mt-1 text-xs text-[#5C5C5C] leading-5">Kalinga unpolished rice, organic red rice, and farm eggs.</p>
                            <a href="/shop" class="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#2E5339] group-hover:underline">Browse Grains →</a>
                        </div>
                    </div>
                </div>
            </section>

            {{-- ===== How It Works ===== --}}
            <section class="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
                <div class="bg-white rounded-2xl sm:rounded-3xl border border-[#E8E2D6] p-6 sm:p-10 shadow-[0_6px_20px_rgba(46,83,57,0.06)]">
                    <div class="max-w-xl">
                        <h2 class="text-2xl sm:text-3xl font-semibold tracking-tight text-[#1A1A1A]">From Farm to Table in Three Transparent Steps</h2>
                        <p class="mt-2 text-sm sm:text-base text-[#5C5C5C]">No multi-tiered traders, no delayed payments, no predatory markups.</p>
                    </div>

                    <ol class="mt-8 grid sm:grid-cols-3 gap-6 sm:gap-8">
                        <li class="flex gap-4">
                            <span class="w-10 h-10 shrink-0 rounded-full bg-[#2E5339] text-white font-bold grid place-items-center">1</span>
                            <div>
                                <h3 class="font-semibold text-base text-[#1A1A1A] leading-snug">Farmers list fresh harvest</h3>
                                <p class="text-sm text-[#5C5C5C] mt-1.5 leading-6">Crop name, unit price, and available harvest quantity are posted in seconds, optimized even for 3G rural mobile connections.</p>
                            </div>
                        </li>
                        <li class="flex gap-4">
                            <span class="w-10 h-10 shrink-0 rounded-full bg-[#4A7C59] text-white font-bold grid place-items-center">2</span>
                            <div>
                                <h3 class="font-semibold text-base text-[#1A1A1A] leading-snug">Buyers order retail or bulk</h3>
                                <p class="text-sm text-[#5C5C5C] mt-1.5 leading-6">Households order weekly baskets; food businesses and caterers request wholesale quotes directly from producer cooperatives.</p>
                            </div>
                        </li>
                        <li class="flex gap-4">
                            <span class="w-10 h-10 shrink-0 rounded-full bg-[#D4A017] text-[#1A1A1A] font-bold grid place-items-center">3</span>
                            <div>
                                <h3 class="font-semibold text-base text-[#1A1A1A] leading-snug">Seamless order handover</h3>
                                <p class="text-sm text-[#5C5C5C] mt-1.5 leading-6">Orders transition transparently from pending to confirmed, ready, and delivered with real-time notifications for both sides.</p>
                            </div>
                        </li>
                    </ol>
                </div>
            </section>

            {{-- ===== Interactive FAQ Accordion ===== --}}
            <section class="max-w-4xl mx-auto px-4 sm:px-6 pb-20">
                <div class="text-center max-w-2xl mx-auto">
                    <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8F0E9] text-[#2E5339] text-xs font-semibold">
                        Answers &amp; Transparency
                    </span>
                    <h2 class="mt-3 text-2xl sm:text-3xl font-semibold tracking-tight text-[#1A1A1A]">Frequently Asked Questions</h2>
                    <p class="mt-2 text-sm sm:text-base text-[#5C5C5C]">Everything you need to know about buying, selling, and partnering with AniLink.</p>
                </div>

                <div class="mt-10 space-y-4">
                    {{-- FAQ 1 --}}
                    <details class="group bg-white rounded-2xl border border-[#E8E2D6] p-5 sm:p-6 shadow-sm transition hover:border-[#2E5339]/40">
                        <summary class="flex items-center justify-between gap-4 font-semibold text-base sm:text-lg text-[#1A1A1A] cursor-pointer list-none select-none">
                            <span>What is AniLink and how does it eliminate middlemen?</span>
                            <span class="w-7 h-7 rounded-full bg-[#FAF8F3] border border-[#E8E2D6] flex items-center justify-center text-[#5C5C5C] group-open:rotate-180 transition-transform duration-200 shrink-0">
                                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </span>
                        </summary>
                        <div class="mt-4 pt-3 border-t border-[#E8E2D6]/60 text-sm sm:text-base text-[#5C5C5C] leading-7">
                            AniLink is a direct digital marketplace connecting local agricultural smallholders with households, caterers, and food enterprises. By facilitating direct connections and transparent logistics, farmers receive their full asking price without multiple layers of traders taking predatory commissions.
                        </div>
                    </details>

                    {{-- FAQ 2 --}}
                    <details class="group bg-white rounded-2xl border border-[#E8E2D6] p-5 sm:p-6 shadow-sm transition hover:border-[#2E5339]/40">
                        <summary class="flex items-center justify-between gap-4 font-semibold text-base sm:text-lg text-[#1A1A1A] cursor-pointer list-none select-none">
                            <span>How are farmers and harvests verified?</span>
                            <span class="w-7 h-7 rounded-full bg-[#FAF8F3] border border-[#E8E2D6] flex items-center justify-center text-[#5C5C5C] group-open:rotate-180 transition-transform duration-200 shrink-0">
                                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </span>
                        </summary>
                        <div class="mt-4 pt-3 border-t border-[#E8E2D6]/60 text-sm sm:text-base text-[#5C5C5C] leading-7">
                            Every producer on AniLink undergoes a vetting process requiring valid identification, proof of agricultural tenure or barangay certification, and cooperative affiliation review. Verified profiles receive an official verification badge guaranteeing authentic local origin and harvest freshness.
                        </div>
                    </details>

                    {{-- FAQ 3 --}}
                    <details class="group bg-white rounded-2xl border border-[#E8E2D6] p-5 sm:p-6 shadow-sm transition hover:border-[#2E5339]/40">
                        <summary class="flex items-center justify-between gap-4 font-semibold text-base sm:text-lg text-[#1A1A1A] cursor-pointer list-none select-none">
                            <span>Can restaurants and businesses buy in bulk?</span>
                            <span class="w-7 h-7 rounded-full bg-[#FAF8F3] border border-[#E8E2D6] flex items-center justify-center text-[#5C5C5C] group-open:rotate-180 transition-transform duration-200 shrink-0">
                                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </span>
                        </summary>
                        <div class="mt-4 pt-3 border-t border-[#E8E2D6]/60 text-sm sm:text-base text-[#5C5C5C] leading-7">
                            Yes! AniLink provides a dedicated B2B bulk quote system. Restaurants, institutional buyers, and grocers can submit quantity requests and negotiate direct terms with agricultural cooperatives for steady weekly harvest shipments.
                        </div>
                    </details>

                    {{-- FAQ 4 --}}
                    <details class="group bg-white rounded-2xl border border-[#E8E2D6] p-5 sm:p-6 shadow-sm transition hover:border-[#2E5339]/40">
                        <summary class="flex items-center justify-between gap-4 font-semibold text-base sm:text-lg text-[#1A1A1A] cursor-pointer list-none select-none">
                            <span>How does delivery and order tracking work?</span>
                            <span class="w-7 h-7 rounded-full bg-[#FAF8F3] border border-[#E8E2D6] flex items-center justify-center text-[#5C5C5C] group-open:rotate-180 transition-transform duration-200 shrink-0">
                                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </span>
                        </summary>
                        <div class="mt-4 pt-3 border-t border-[#E8E2D6]/60 text-sm sm:text-base text-[#5C5C5C] leading-7">
                            Orders move through a five-stage state machine: Pending → Confirmed → Preparing → Ready → Delivered. Both the buyer and farmer receive real-time status updates and order timelines with complete contact details for arranged cooperative hub pickups or direct courier handoffs.
                        </div>
                    </details>

                    {{-- FAQ 5 --}}
                    <details class="group bg-white rounded-2xl border border-[#E8E2D6] p-5 sm:p-6 shadow-sm transition hover:border-[#2E5339]/40">
                        <summary class="flex items-center justify-between gap-4 font-semibold text-base sm:text-lg text-[#1A1A1A] cursor-pointer list-none select-none">
                            <span>What payment methods are supported?</span>
                            <span class="w-7 h-7 rounded-full bg-[#FAF8F3] border border-[#E8E2D6] flex items-center justify-center text-[#5C5C5C] group-open:rotate-180 transition-transform duration-200 shrink-0">
                                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </span>
                        </summary>
                        <div class="mt-4 pt-3 border-t border-[#E8E2D6]/60 text-sm sm:text-base text-[#5C5C5C] leading-7">
                            AniLink supports secure digital payments (GCash, Maya, bank transfer) and verified Cash-on-Delivery (COD) depending on the farm’s fulfillment arrangement, backed by multi-factor security on sensitive accounts.
                        </div>
                    </details>

                    {{-- FAQ 6 --}}
                    <details class="group bg-white rounded-2xl border border-[#E8E2D6] p-5 sm:p-6 shadow-sm transition hover:border-[#2E5339]/40">
                        <summary class="flex items-center justify-between gap-4 font-semibold text-base sm:text-lg text-[#1A1A1A] cursor-pointer list-none select-none">
                            <span>Is it free for farmers to join and list harvests?</span>
                            <span class="w-7 h-7 rounded-full bg-[#FAF8F3] border border-[#E8E2D6] flex items-center justify-center text-[#5C5C5C] group-open:rotate-180 transition-transform duration-200 shrink-0">
                                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </span>
                        </summary>
                        <div class="mt-4 pt-3 border-t border-[#E8E2D6]/60 text-sm sm:text-base text-[#5C5C5C] leading-7">
                            Yes. Creating a farmer account and publishing harvest listings is 100% free. AniLink operates under a transparent cooperative charter aimed at empowering agrarian livelihoods rather than extracting producer profits.
                        </div>
                    </details>
                </div>
            </section>

            {{-- ===== Final Conversion Call-to-Action ===== --}}
            <section class="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
                <div class="bg-[#2E5339] rounded-2xl sm:rounded-3xl text-white p-8 sm:p-14 text-center relative overflow-hidden shadow-[0_16px_40px_rgba(46,83,57,0.22)]">
                    <div class="max-w-2xl mx-auto">
                        <h2 class="text-3xl sm:text-4xl font-semibold tracking-tight text-white leading-tight">
                            Fresh harvests on your table,<br />
                            fair income in farmers’ hands.
                        </h2>
                        <p class="mt-4 text-white/80 text-sm sm:text-base leading-6 max-w-xl mx-auto">
                            Join thousands of households, chefs, and local growers cultivating fair agricultural trade today.
                        </p>
                        <div class="mt-8 flex flex-wrap items-center justify-center gap-4">
                            <a href="/shop" class="inline-flex h-12 items-center px-8 rounded-full bg-[#D4A017] text-[#1A1A1A] font-semibold hover:brightness-105 transition shadow-lg">
                                Shop the Marketplace →
                            </a>
                            <a href="/manage" class="inline-flex h-12 items-center px-8 rounded-full bg-white/10 text-white border border-white/30 font-semibold hover:bg-white/20 transition">
                                Register as a Farmer
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </main>

        {{-- ===== Multi-Column Footer with Discreet Staff Portal ===== --}}
        <footer class="border-t border-[#E8E2D6] bg-white">
            <div class="max-w-6xl mx-auto px-4 sm:px-6 py-12">
                <div class="grid grid-cols-2 md:grid-cols-5 gap-8">
                    <div class="col-span-2">
                        <div class="flex items-center gap-3">
                            <img src="/apple-touch-icon-180.png" alt="AniLink logo" class="w-8 h-8 rounded-lg" />
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
                            <li class="pt-2">
                                <a href="/admin" class="text-[#2E5339] font-medium hover:underline inline-flex items-center gap-1">
                                    Staff Admin Portal →
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </footer>
    </body>
</html>
