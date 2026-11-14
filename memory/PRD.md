# SAAARI — Luxury Indian Ethnic Wear E-commerce

## Original problem statement
SAARI — a complete luxury fashion e-commerce website for Indian ethnic wear. High-end editorial feel combining traditional fashion imagery with modern D2C e-commerce (like a luxury magazine). Cinematic hero, infinite marquee, six moods archive, interactive "Try the Look", "Pick a Silk", "The Rack", "Muse Film", "Muse Reels", "Bridal Collection". Persistent cart/wishlist (Zustand), horizontal scrolling carousels, in-page detail views, fully responsive. No generic Shopify templates. Award-tier craft: kinetic hero with masked line reveal, framer-motion scroll reveals, Lenis smooth scrolling, parallax hero.

## User personas
- Bride / wedding shopper browsing bridal Kanchipuram silks
- Festive shopper building a full styled look
- Returning customer with persistent bag and wishlist

## Architecture
- Frontend-only React (CRA + craco) app; products mocked in `/app/frontend/src/data/products.js` (9 products with fabric, category, description, care, delivery fields)
- State: Zustand with persist (`/app/frontend/src/store.js`) — cart + wishlist in localStorage
- Styles: App.css (tokens/core), Archive.css (sections), SilkFix.css, Rails.css (rails + overlay)
- Backend FastAPI exists but unused; all data MOCKED

## Implemented
- 2026-11 (earlier sessions): Hero, Six Moods archive, Try the Look, Pick a Silk (stacking fix), The Rack + Rack Detail, Muse Film, Muse Reels, Bridal Collection, cart drawer, Zustand store
- 2026-11-10: In-page product detail overlay (gallery w/ thumbnails + crossfade, size/variant selector, care & delivery accordions, wishlist, add-to-bag) opened from New Arrivals cards, Rack hangers, and Bridal "View the piece"
- 2026-11-10: Horizontal scroll fixed for all rails — new "New Arrivals" product rail after Try the Look (9 cards, snap scroll, arrow controls), rack hanger rail scrollable with arrows, reels arc horizontally scrollable
- 2026-11-10: Catalog expanded 4 → 9 products with categories powering working rack filters
- 2026-11-10: framer-motion scroll reveals across sections, masked line-by-line hero reveal, parallax/zoom hero image, Lenis momentum scrolling
- 2026-11-10: Brand favicon.svg (maroon/gold mark), page title and meta description

## Tested (preview)
- Arrivals rail scrolls (scrollWidth 2522 > client 1651, scrollLeft moves) desktop + 375px mobile
- Rack rail scrolls; filters show correct counts; hanger opens overlay
- Overlay: gallery thumb switch, care/delivery accordions, add-to-bag opens cart drawer, wishlist toggle reflected in nav count
- Bridal overlay opens; mobile overlay renders correctly

## Backlog
- P0: None open
- P1: Search overlay with matching product results; simulated checkout form in cart drawer; component modularization (App.js is monolithic)
- P2: Newsletter validation in footer; FastAPI + MongoDB products API; SEO meta/OG/JSON-LD; accessibility pass
