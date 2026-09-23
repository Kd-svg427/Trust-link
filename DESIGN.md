# TrustLink — Design System (Stitch Import)

Draft an agent-friendly design system for TrustLink, Ghana's trusted e-commerce marketplace. Apply these rules when generating or redesigning any screen.

---

## 1. Product Overview

- **Product:** TrustLink — mobile-first e-commerce marketplace for Ghana.
- **Audience:** Ghanaian shoppers and small-business vendors.
- **Brand promise:** "Shop with confidence." Verified vendors only, secure payments (MTN MoMo, Vodafone Cash, AirtelTigo Money, bank card), 1–3 day nationwide delivery, WhatsApp order support.
- **Aesthetic:** Premium dark UI with glassmorphism. Modern, trust-forward, high-contrast, subtle 3D-free. Designed to feel trustworthy, fast, and local ("Made in Ghana").
- **Platform:** Responsive web app (PWA). Desktop = top navbar; mobile = bottom tab bar. Works offline-capable, dark mode default.

---

## 2. Design Tokens

### Colors
| Token | Hex |
|---|---|
| Primary (forest green) | `#1B5E20` |
| Primary light | `#4CAF50` |
| Primary lighter | `#81C784` |
| Primary dark | `#0D3B12` |
| Gold accent | `#FFB300` |
| Gold light | `#FFD54F` |
| Gold dark | `#FF8F00` |
| Success | `#10B981` |
| Warning | `#F59E0B` |
| Error | `#EF4444` |
| Info | `#3B82F6` |
| WhatsApp | `#25D366` |

Status colors are always used as a tinted pill (10% alpha background + 1px translucent border of the same hue).

### Surfaces (dark mode default)
| Token | Hex |
|---|---|
| Background primary | `#0a0a0a` |
| Background secondary | `#111111` |
| Background tertiary | `#1a1a1a` |
| Card | `#161616` |
| Elevated | `#1e1e1e` |
| Input | `#1a1a1a` |
| Border | `#2a2a2a` |
| Border light | `#333333` |

### Text
| Token | Hex |
|---|---|
| Text primary | `#f5f5f5` |
| Text secondary | `#9ca3af` |
| Text muted | `#6b7280` |

### Light mode overrides (toggleable via theme switch)
- Background primary `#f8f9fa`, surfaces `#ffffff`, text primary `#111827`.
- All other brand colors (primary green, gold, status) stay identical.
- Glass surfaces become white at 70–85% opacity with darker borders.

### Typography
- **Font family:** `Plus Jakarta Sans` (weights 300, 400, 500, 600, 700, 800, 900), fallback to system-ui.
- **Scale:** display 2.5–2.75rem / weight 800; section titles 1.5rem / 700; body 0.95–1rem; secondary 0.875rem; captions 0.75–0.8rem / 600.
- **Headings:** tight line-height (1.15), negative letter-spacing on large display text, weight 800.
- **Logo wordmark:** gradient text from primary-light `#4CAF50` → gold `#FFB300`, weight 800.

### Radius
- Small 8px · Medium 12px · Large 16px · XL 24px · Pills 9999px.

### Elevation
- Soft shadows only; green glow `rgba(76,175,80,0.3)` on primary hover, gold glow `rgba(255,179,0,0.3)` on gold hover.

### Motion
- Micro-transitions 0.15s (fast) / 0.3s (base) / 0.5s (slow), ease curve.
- Subtle entrances only: fade-in, fade-in-up (12px), scale-in, slide-up. Disallow AI-float, bounce, and gradient-shift animations.
- Skeleton loading uses shimmer (background-position loop) for all async content.

### Effects
- **Glassmorphism:** `backdrop-filter: blur(16–20px)` on navbar and icon buttons; glass surfaces are `rgba(255,255,255,0.05)` with `rgba(255,255,255,0.1)` borders.
- **Primary buttons:** linear gradient `#1B5E20 → #4CAF50`, white text, soft green tinted drop-shadow, green glow + 1px lift on hover.
- **Gradient text** reserved for the logo and decorative emphasis only.

---

## 3. Core Components

### Header / Navbar (desktop)
- Fixed top, full-width, `rgba(10,10,10,0.85)` + `blur(20px)`, 1px bottom border.
- Height 64px, max-width 1280px container.
- Left: logo mark (36px rounded icon) + gradient "TrustLink" wordmark.
- Center/right: nav links (Home, Products, Cart) with Lucide icons, cart count badge, auth section (Login button or "My Store/Dashboard" + Logout), theme toggle.
- Cart badge: gold pill with count.

### Mobile Bottom Navigation
- Fixed bottom tab bar, 4 items: Home, Shop, Cart (with count badge), Login/Account.
- Icon above label; active item highlighted.

### Buttons
- **Primary:** green gradient, glow on hover.
- **Gold:** solid `#FFB300`, dark text, darker gold on hover — used for vendor/sell CTAs and promo banners.
- **Outline:** transparent, 1.5px primary-light border, fills green on hover.
- **Ghost:** text secondary, glass fill on hover.
- **Danger:** red gradient (#DC2626 → #EF4444) with red glow.
- **WhatsApp:** `#25D366`.
- Sizes: sm (0.5rem 1rem / 0.8rem), default (0.75rem 1.5rem / 0.9rem), lg (1rem 2rem / 1rem).
- Shape: rounded-md, weight 600, `scale(0.97)` press feedback; 18px spinner inside when loading.

### Product Card
- Square image area with `discount-badge` (`-N%`) in gold/warning at top-left.
- Below: vendor store name (muted, small), product title (weight 600), price row (current in primary-light where prominent + compare-at struck through), low-stock warning ("Only N left" in warning) or "Out of stock" (error), full-width Add to Cart button when in stock.
- Card: 16px radius, subtle border, 4px border-light + soft shadow on hover.

### Category Card
- Icon in a rounded square + category name; grid of cards.

### Trust Badges
- 4-item row: Verified Vendors, Secure Payments, Fast Delivery, 24/7 Support. Each an icon in a tinted circle, bold label, one-line muted description.

### Badges / Pills
- Success / warning / error / info / primary / gold variants. Uppercase, 0.75rem, weight 600, letter-spacing 0.5px, pill shape.
- Status mapping — orders: pending=warning, processing=info, shipped=primary, delivered=success, cancelled=error; vendors: approved=success, rejected/suspended=error; payments: paid=success, failed=error, refunded=warning.

### Forms
- Inputs: dark surface `#1a1a1a`, 1.5px border, 12px radius; focus ring = 3px `rgba(76,175,80,0.15)` with primary-light border; error state = red border + red ring; muted placeholder. Selects use a custom chevron.

### Stats Cards (dashboards)
- Card with label (muted, small, uppercase), large weight-800 number, and an icon chip; optional delta/trend.

### Data Table (admin / vendor)
- Bordered rows, avatar + name cells, status badges, row actions (icon buttons or small buttons), tabular numbers, hover highlight.

### Other
- Star rating: gold filled stars, neutral outline stars.
- Quantity selector: − value +.
- Product gallery: main image + thumbnails.
- Search bar: icon + input with focus ring; sort dropdown.
- Toast notifications: bottom toast, status-colored left border/icon, auto-dismiss.
- Modal: dark surface, 16–24px radius, backdrop blur/dim, slide/scale-in.
- Promo banner ("Start Selling on TrustLink"): gradient green panel, white bold headline, gold button.
- Empty state: centered icon, message, and a CTA button.
- Pagination: numbered pill buttons, active = primary.
- Order success: animated checkmark + order ID + WhatsApp tracking hint.
- Install banner: PWA install prompt.

---

## 4. Layout

- Max content width **1280px**, gutter 1.5rem (24px).
- Sections: section header (small uppercase pill badge with icon, weight-800 title, muted subtitle) + content grid.
- Product grid: responsive columns (2 → 3 → 4), masonry not used; consistent card heights.
- Category grid: 4-up desktop, 2-up mobile.
- Page shell: fixed header, main content area, footer.
- Footer: multi-column (brand + trust points, links, payment methods, contact/WhatsApp), payment badges, copyright.

---

## 5. Screens

### 1. Home (`#/`)
- **Hero:** left = "Verified vendors only" pill (success icon), headline "Quality products from Ghanaian vendors." (2.75rem/800, "from Ghanaian vendors" in primary-light), subtext on payments/delivery/WhatsApp, CTAs **Shop Products** (primary) + **Sell on TrustLink** (outline), trust bullets (Secure checkout · 1-3 day delivery · WhatsApp support), payment badges (MTN MoMo, Vodafone Cash, Card). Right = 2×2 card grid (Featured / New arrivals / Verified stores / Shop with confidence panel).
- **Trust badges strip**, **Shop by Category** grid, **Featured Products** (8, skeleton-loading), **Flash Deals** (gold badge, compare-at pricing), **Start Selling promo banner** (gold CTA).

### 2. Products / Shop (`#/products`)
- Sticky search bar + sort control; category filter chips; responsive product grid; pagination; loading skeletons; empty state.

### 3. Product Detail (`#/product/:id`)
- Gallery (main image + thumbnails); title, rating stars, vendor store link, prices with compare-at, stock indicator; quantity selector; **Add to Cart** (primary) + **Buy Now** (gold); payment method badges; tabs for Description / Reviews; review list with star ratings; "Chat on WhatsApp" support action.

### 4. Cart (`#/cart`)
- Line-item list: image, title, unit price, quantity stepper, line total, remove. Order summary card: subtotal, delivery (flat or free threshold), total, **Proceed to Checkout** (primary). Empty state with CTA.

### 5. Checkout (`#/checkout`)
- Left: delivery form (name, phone, address, region) + payment method radio cards (MTN MoMo, Vodafone Cash, AirtelTigo Money, Bank Card — each icon + label + description). Right: order summary. **Place Order** button with loading state; validation errors inline.

### 6. Order Success (`#/order-success/:id`)
- Animated success checkmark, "Order placed" headline, order ID, total, delivery estimate, WhatsApp order-follow-up hint, CTA back to shopping.

### 7. Login (`#/login`)
- Centered card on branded background: email + password, show/hide password, sign-in button; role quick-login buttons for demo (Buyer / Vendor / Admin); link to create account; trust reassurance (secure checkout).

### 8. Buyer Dashboard (`#/dashboard`)
- Stats row (e.g., total orders, pending, totals); order history table with status badges; order detail expand; account info.

### 9. Vendor Dashboard (`#/vendor`)
- Tabs: **Overview / Products / Orders / Announcements / Settings**.
  - Overview: stats grid (sales, orders, pending orders, low stock) + recent orders.
  - Products: filter chips, table (image, title, price, stock, status), edit/delete, **Add Product** opens modal form, status toggles.
  - Orders: table with status badges + status update actions.
  - Announcements: list of platform announcements.
  - Settings: store profile form, payment config, WhatsApp number.

### 10. Admin Dashboard (`#/admin`)
- Stats grid (total vendors, pending approvals, revenue, orders); vendor moderation table with approve/reject/suspend actions; status badges throughout. Gated behind triple-click on logo.

### 11. Legal — Privacy (`#/privacy`) & Terms (`#/terms`)
- Simple readable document layout: title, last-updated line, sectioned prose, back link.

---

## 6. Accessibility & State

- Focus states: green ring rolling from inputs to buttons/links.
- Touch targets ≥ 40px; mobile bottom nav is thumb-friendly.
- Loading: shimmer skeletons matching layout; buttons show inline spinner.
- Empty/error states: friendly message + recovery CTA.
- Dark mode is default and persisted (localStorage); light mode available via toggle.

---

## 7. Stitch Prompts (copy-paste per screen)

Paste the whole app into Stitch first:

> Design a mobile-first premium dark-mode e-commerce marketplace for Ghana called TrustLink. Brand: forest green `#1B5E20`, green light `#4CAF50`, gold accent `#FFB300`, near-black surfaces `#0a0a0a`–`#1e1e1e`, Plus Jakarta Sans, 12–16px radii, subtle glassmorphism on navbar. Full app layout (all screens): header navbar with Home/Products/Cart + cart count + login, mobile bottom tab bar (Home, Shop, Cart, Account). Pages: Home (hero, categories, featured, flash deals, promo banner), Products (search + filter + grid), Product Detail (gallery, quantity, tabs, reviews), Cart, Checkout (MoMo/Vodafone Cash/card), Order Success, Login, Buyer Dashboard, Vendor Dashboard (tabs), Admin Dashboard, Privacy, Terms.

Per-screen refinements (edit one at a time):

- **Home:** "Regenerate the home page: flat sales-direct hero, left text (verified-vendors pill, headline 'Quality products from Ghanaian vendors.', Shop Products + Sell on TrustLink CTAs, payment badges for MTN MoMo / Vodafone Cash / Card), right 2x2 feature image cards. Then trust-badge strip, Shop by Category grid, Featured Products (4-col), Flash Deals with compare-at prices, and a green promo banner with gold 'Create Your Store' button."
- **Products:** "Products page: sticky search bar with sort dropdown, category chips, responsive product grid, pagination pills; card = square image with discount badge, vendor name, bold title, price + struck compare-at, low-stock warning, full-width Add to Cart."
- **Product detail:** "Product detail: left image gallery with thumbnails, right title + star rating + vendor, price with compare-at, stock line, quantity stepper, Add to Cart (green) + Buy Now (gold), payment badges, tabs for Description and Reviews with star ratings, WhatsApp order button."
- **Cart:** "Cart page: line items with quantity steppers and remove, order summary card with subtotal, delivery, total, Proceed to Checkout button; empty state with icon and CTA."
- **Checkout:** "Checkout: left delivery form (name, phone, address, region) + payment radio cards (MTN MoMo, Vodafone Cash, AirtelTigo Money, Bank Card), right order summary, Place Order button with loading spinner, inline validation errors."
- **Login:** "Login: centered card on dark branded background, email + password with show/hide, sign-in, and Seller/Buyer/Admin quick-login demo buttons."
- **Vendor dashboard:** "Vendor dashboard with tabs Overview/Products/Orders/Announcements/Settings; overview = stats grid + recent orders; products = filter chips + table with add/edit modal and status toggles; orders = table with status badges and update actions; settings = store profile form and WhatsApp number."
- **Admin dashboard:** "Admin dashboard: stats row + vendor moderation table with approve/reject/suspend actions and status badges."
- **Theme test:** "Redesign every screen for light mode while keeping identical green/gold brand colors and layout, per the design tokens."