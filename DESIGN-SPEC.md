# Ecommerce Platform — Design Specification

> Covers three portals: **Customer Frontend**, **Vendor Dashboard**, **Admin Panel**
> Frontend stack: Angular + Tailwind CSS

---

## 1. Design Tokens

### 1.1 Color Palette

```
Primary       #4F46E5   (Indigo-600)   — CTAs, links, active states
Primary Dark  #3730A3   (Indigo-800)   — Hover on primary
Primary Light #EEF2FF   (Indigo-50)    — Backgrounds, chips

Accent        #F59E0B   (Amber-500)    — Star ratings, badges, highlights
Success       #10B981   (Emerald-500)  — Order success, in-stock, active
Warning       #F59E0B   (Amber-500)    — Pending states, low stock
Danger        #EF4444   (Red-500)      — Errors, delete, out-of-stock
Info          #3B82F6   (Blue-500)     — Informational banners

Neutral-50    #F9FAFB   — Page backgrounds
Neutral-100   #F3F4F6   — Card backgrounds, table rows (alt)
Neutral-200   #E5E7EB   — Borders, dividers
Neutral-400   #9CA3AF   — Placeholder text, disabled
Neutral-600   #4B5563   — Secondary text
Neutral-900   #111827   — Primary text, headings

White         #FFFFFF
```

### 1.2 Typography

```
Font Family:  Inter (Google Fonts)

Scale:
  xs    12px / line-height 16px
  sm    14px / line-height 20px
  base  16px / line-height 24px
  lg    18px / line-height 28px
  xl    20px / line-height 28px
  2xl   24px / line-height 32px
  3xl   30px / line-height 36px
  4xl   36px / line-height 40px

Weights:
  Regular   400  — Body text
  Medium    500  — Labels, nav items
  Semibold  600  — Card titles, section headings
  Bold      700  — Page headings, CTAs
```

### 1.3 Spacing Scale (Tailwind defaults)
```
4px, 8px, 12px, 16px, 20px, 24px, 32px, 40px, 48px, 64px, 80px, 96px
```

### 1.4 Border Radius
```
sm    4px   — Inputs, badges
md    8px   — Cards, buttons
lg    12px  — Modal dialogs
xl    16px  — Product image cards
full  9999px — Pills, avatars, chips
```

### 1.5 Shadows
```
sm   0 1px 2px rgba(0,0,0,0.05)                        — Subtle card lift
md   0 4px 6px -1px rgba(0,0,0,0.1)                   — Dropdowns, modals
lg   0 10px 15px -3px rgba(0,0,0,0.1)                 — Floating panels
```

---

## 2. Shared Components

### 2.1 Button Variants

```
Primary    bg-indigo-600 text-white hover:bg-indigo-700  rounded-md px-4 py-2
Secondary  bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50
Danger     bg-red-500 text-white hover:bg-red-600
Ghost      text-indigo-600 hover:bg-indigo-50 (no border)
Link       text-indigo-600 underline

Sizes:
  sm   text-sm px-3 py-1.5
  md   text-sm px-4 py-2      (default)
  lg   text-base px-6 py-3

States: disabled → opacity-50 cursor-not-allowed
        loading  → spinner icon replaces text
```

### 2.2 Form Inputs

```
Input      border border-neutral-200 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500
           Error state: border-red-500 + red helper text below
Select     Same as input + dropdown arrow
Textarea   Same as input, resize-y
Checkbox   accent-indigo-600
Label      text-sm font-medium text-neutral-700 mb-1
```

### 2.3 Cards

```
Product Card (grid):
  ┌─────────────────┐
  │   Image (4:3)   │  rounded-xl overflow-hidden
  │   [Wishlist ♡]  │  absolute top-2 right-2
  ├─────────────────┤
  │ Category badge  │  text-xs text-indigo-600 bg-indigo-50
  │ Product title   │  font-semibold text-neutral-900 line-clamp-2
  │ ★★★★☆ (4.2)    │  text-amber-500
  │ $29.99  ~~$39~~ │  price + strikethrough salePrice
  │ [Add to Cart]   │  full-width primary button
  └─────────────────┘
  Hover: shadow-lg, slight scale-[1.02]

Order Card:
  ┌─────────────────────────────────────┐
  │ Order #ORD-001  │  [Delivered ✓]   │
  │ Jan 15, 2025    │  $129.99          │
  ├─────────────────────────────────────┤
  │ [img] Product Name × 2             │
  │ [img] Product Name × 1             │
  │                  [View Details →]  │
  └─────────────────────────────────────┘
```

### 2.4 Badges / Status Chips

```
pending    bg-amber-100  text-amber-700
processing bg-blue-100   text-blue-700
shipped    bg-purple-100 text-purple-700
delivered  bg-green-100  text-green-700
cancelled  bg-red-100    text-red-700
active     bg-green-100  text-green-700
suspended  bg-red-100    text-red-700
```

### 2.5 Toast Notifications

```
Position: top-right, stacked
Success  bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800
Error    bg-red-50 border-l-4 border-red-500 text-red-800
Info     bg-blue-50 border-l-4 border-blue-500 text-blue-800
Auto-dismiss: 4 seconds
```

### 2.6 Pagination

```
← Prev  [1] [2] [3] ... [10]  Next →
Active page: bg-indigo-600 text-white rounded
```

### 2.7 Empty States

```
  [Icon illustration]
  Heading (e.g., "Your cart is empty")
  Subtext
  [Primary CTA Button]
```

---

## 3. Customer Frontend

### 3.1 Layout Shell

```
┌─────────────────────────────────────────────────────────────┐
│  HEADER (sticky, h-16, bg-white, border-b shadow-sm)        │
│  [Logo]  [Search bar (flex-1)]  [♡] [🛒(3)] [Account ▾]    │
├─────────────────────────────────────────────────────────────┤
│  CATEGORY NAV (h-10, bg-neutral-50, border-b)               │
│  All | Electronics | Clothing | Home | Sports | ...         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  MAIN CONTENT (max-w-7xl mx-auto px-4)                      │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  FOOTER (bg-neutral-900 text-white)                         │
│  Links | Social | Copyright                                 │
└─────────────────────────────────────────────────────────────┘
```

**Header Search Bar:**
- Expands on focus
- Shows autocomplete dropdown with product suggestions (name + image + price)
- `GET /api/products?search=` debounced 300ms

---

### 3.2 Screen: Home Page `/`

```
┌─────────────────────────────────────────────────────────┐
│  HERO BANNER (full-width, h-[480px])                    │
│  Gradient bg-indigo-600→bg-purple-600                   │
│  "Shop Everything You Love"                             │
│  [Shop Now]  [Browse Categories]                        │
├─────────────────────────────────────────────────────────┤
│  CATEGORIES GRID (8 tiles, 4 cols on lg, 2 on sm)       │
│  Icon + Label card with hover ring-indigo                │
├─────────────────────────────────────────────────────────┤
│  FEATURED PRODUCTS                                      │
│  Section heading + "View All →" link                    │
│  4-col product card grid                                │
├─────────────────────────────────────────────────────────┤
│  PROMO BANNER (bg-amber-50)                             │
│  "New Arrivals This Week" — full-width strip             │
├─────────────────────────────────────────────────────────┤
│  TRENDING NOW                                           │
│  Horizontal scroll of product cards (mobile)            │
│  4-col grid (desktop)                                   │
└─────────────────────────────────────────────────────────┘
```

---

### 3.3 Screen: Product Listing `/products` + `/products?category=X`

```
┌──────────┬──────────────────────────────────────┐
│ FILTERS  │  TOOLBAR                             │
│ (w-64)   │  "245 results" | Sort ▾ | View ⊞ ≡  │
│          ├──────────────────────────────────────┤
│ Category │  PRODUCT GRID (3 cols lg, 2 md, 1 sm)│
│ Price    │  ┌────┐ ┌────┐ ┌────┐               │
│ Range    │  │Card│ │Card│ │Card│               │
│ Rating   │  └────┘ └────┘ └────┘               │
│ In Stock │                                      │
│ [Apply]  │  PAGINATION                          │
└──────────┴──────────────────────────────────────┘

Mobile: Filters in bottom sheet, triggered by [Filter] button
```

**Filter Panel:**
- Category: checkbox list (from `/api/product/categories`)
- Price: dual-handle range slider
- Rating: star selector (4★ & up, 3★ & up, etc.)
- In Stock only: toggle

---

### 3.4 Screen: Product Detail `/products/:id`

```
┌─────────────────────────────────────────────────────┐
│ Breadcrumb: Home > Electronics > Wireless Headphones │
├──────────────────────┬──────────────────────────────┤
│  IMAGE GALLERY       │  PRODUCT INFO                │
│  Main image (lg)     │  Category badge              │
│  Thumbnail strip     │  Title (2xl bold)            │
│                      │  ★★★★☆ 4.2 (128 reviews)   │
│                      │  $79.99  ~~$99.99~~          │
│                      │  ─────────────────────────  │
│                      │  Variant: Color              │
│                      │  [●Red] [○Blue] [○Black]     │
│                      │  Variant: Size               │
│                      │  [S] [M] [●L] [XL]           │
│                      │  ─────────────────────────  │
│                      │  Qty: [−] 1 [+]              │
│                      │  [Add to Cart]  [♡ Wishlist] │
│                      │  ─────────────────────────  │
│                      │  ✓ In Stock (24 left)        │
│                      │  🚚 Free shipping over $50   │
│                      │  Sold by: [Vendor Name]      │
├──────────────────────┴──────────────────────────────┤
│  TABS: Description | Specifications | Reviews (128) │
│  ─────────────────────────────────────────────────  │
│  [Tab Content]                                      │
├─────────────────────────────────────────────────────┤
│  RELATED PRODUCTS (4-col grid)                      │
└─────────────────────────────────────────────────────┘
```

**Reviews Tab:**
- Overall rating breakdown (5★ bar charts)
- Review cards: avatar, name, date, stars, text
- [Write a Review] button (requires auth)
- Review form: star selector + textarea

---

### 3.5 Screen: Cart `/cart`

```
┌─────────────────────────────┬─────────────────────┐
│  CART ITEMS                 │  ORDER SUMMARY      │
│                             │                     │
│  ┌─────────────────────┐    │  Subtotal   $159.98 │
│  │[img] Product Name   │    │  Shipping      Free │
│  │      Variant: Red/L │    │  Discount    -$20   │
│  │      $79.99         │    │  ─────────────────  │
│  │  [−] 2 [+]  [🗑]    │    │  Total      $139.98 │
│  └─────────────────────┘    │                     │
│  ┌─────────────────────┐    │  Coupon Code        │
│  │[img] Product Name   │    │  [_________] [Apply]│
│  └─────────────────────┘    │                     │
│                             │  [Proceed to        │
│  [← Continue Shopping]      │   Checkout]         │
└─────────────────────────────┴─────────────────────┘
```

---

### 3.6 Screen: Checkout `/checkout`

**Step indicator:**
```
[1. Shipping] ──── [2. Payment] ──── [3. Review]
```

**Step 1 — Shipping:**
```
Delivery Address
  Full Name  [_____________]
  Phone      [_____________]
  Address    [_____________]
  City       [_____]  ZIP [____]
  Country    [Select ▾]
  [Continue →]
```

**Step 2 — Payment (Stripe Elements):**
```
Card Number  [____-____-____-____]
Expiry [__/__]  CVC [___]
[← Back]  [Pay $139.98]
```

**Step 3 — Confirmation (`/order/success`):**
```
  ✓  (large green checkmark)
  "Order Placed Successfully!"
  Order #ORD-20250115-001
  Confirmation sent to email@example.com
  [View Order]  [Continue Shopping]
```

---

### 3.7 Screen: Auth Pages

**Login `/auth/login`:**
```
Centered card (max-w-md), white bg, shadow-md
  Logo
  "Welcome Back"
  Email    [_____________]
  Password [_____________] [👁]
  [Forgot password?]
  [Log In]
  ─── or ───
  [Continue with Google]
  "Don't have an account? Sign Up"
```

**Signup `/auth/signup`:**
```
Same card layout
  Name / Email / Password / Confirm Password
  Role selector: [Customer] [Vendor]
  [Create Account]
```

**Forgot Password `/auth/forgot-password`:**
```
  Email field + [Send Reset Link]
  Success state: envelope illustration + "Check your email"
```

**Reset Password `/auth/reset-password/:token`:**
```
  New Password + Confirm Password + [Reset Password]
```

---

### 3.8 Screen: User Account `/account`

**Sidebar navigation:**
```
[Avatar] John Doe
         john@example.com
─────────────────────
📦 My Orders
♡  Wishlist
👤 Profile
🔒 Password
📍 Addresses
🔔 Notifications
```

**Orders Tab:**
- Order cards list with status badges
- Click → order detail with timeline:
  ```
  ● Order Placed → ● Processing → ● Shipped → ○ Delivered
  ```
- Tracking number, carrier info
- [Cancel Order] button (if cancellable)
- [Return Item] button (if delivered)

**Wishlist Tab:**
- Product card grid
- [Add to Cart] per item, [Remove ×]

**Profile Tab:**
- Name, email, phone fields
- Avatar upload (circle, click to change)
- [Save Changes]

**Notifications Tab:**
- List of notifications with unread dot
- Mark all as read
- Real-time updates via Socket.io

---

### 3.9 Screen: Order Detail `/account/orders/:id`

```
┌─────────────────────────────────────────────────────┐
│ Order #ORD-001        [Shipped]      Jan 15, 2025    │
├─────────────────────────────────────────────────────┤
│ PROGRESS TIMELINE                                   │
│ ●──────────●──────────●──────────○                  │
│ Placed   Confirmed  Shipped  Delivered               │
├─────────────────────────────────────────────────────┤
│ ITEMS                      │ ORDER SUMMARY          │
│ [img] Product × 2  $79.98  │ Subtotal   $79.98      │
│ [img] Product × 1  $29.99  │ Shipping      $0       │
│                            │ Total      $79.98      │
├─────────────────────────────────────────────────────┤
│ SHIPPING INFO              │ PAYMENT                │
│ John Doe                   │ Visa ····4242          │
│ 123 Main St                │ Paid on Jan 15         │
│ New York, NY 10001         │                        │
├─────────────────────────────────────────────────────┤
│ Tracking: FedEx #123456789  [Track Package →]       │
└─────────────────────────────────────────────────────┘
```

---

## 4. Vendor Dashboard

### 4.1 Layout Shell

```
┌─────────────────────────────────────────────────────┐
│  HEADER (bg-white border-b)                         │
│  [≡] Vendor Portal    [🔔] [Avatar ▾]               │
├──────────┬──────────────────────────────────────────┤
│ SIDEBAR  │                                          │
│ (w-64    │  MAIN CONTENT                            │
│ bg-      │  (flex-1, bg-neutral-50, p-6)            │
│ neutral- │                                          │
│ 900      │                                          │
│ text-    │                                          │
│ white)   │                                          │
│          │                                          │
│ Nav:     │                                          │
│ Dashboard│                                          │
│ Products │                                          │
│ Orders   │                                          │
│ Store    │                                          │
│ Wallet   │                                          │
│ Settings │                                          │
└──────────┴──────────────────────────────────────────┘
```

**Sidebar active state:** bg-indigo-600, left border-l-2 border-white

---

### 4.2 Screen: Vendor Onboarding `/vendor/register`

```
Multi-step flow (if not yet vendor):

Step 1 — Store Info:
  Store Name  [_____________]
  Description [_____________]
  Category    [Select ▾]
  Logo Upload [Drop or click]
  [Next →]

Step 2 — Business Details:
  Business Type  [Individual / Company]
  Tax ID         [_____________]
  Phone          [_____________]
  [Next →]

Step 3 — Stripe Connect:
  "Connect your bank to receive payouts"
  [Connect with Stripe]  (redirects to Stripe OAuth)

  After return from Stripe:
  ✓ Connected  [Continue →]

Step 4 — Under Review:
  Clock illustration
  "Your application is under review (1-2 business days)"
  [Go to Dashboard]
```

---

### 4.3 Screen: Vendor Dashboard `/vendor/dashboard`

```
STATS ROW (4 cards)
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│ Revenue  │ │  Orders  │ │ Products │ │ Avg Order│
│ $12,450  │ │   248    │ │    34    │ │  $50.20  │
│ ↑12% mtd │ │ ↑8% mtd  │ │          │ │          │
└──────────┘ └──────────┘ └──────────┘ └──────────┘

REVENUE CHART (line chart, last 30 days)
┌───────────────────────────────────────────────────┐
│                                                   │
│  Revenue Over Time                                │
│  [Month ▾]                                        │
│  ~~~line chart~~~                                 │
└───────────────────────────────────────────────────┘

BOTTOM ROW
┌─────────────────────────┬─────────────────────────┐
│ RECENT ORDERS           │ TOP PRODUCTS             │
│ Order table (5 rows)    │ Ranked product list      │
│ [View All →]            │                         │
└─────────────────────────┴─────────────────────────┘
```

---

### 4.4 Screen: Vendor Products `/vendor/products`

```
TOOLBAR
[+ Add Product]                    [Search...] [Filter ▾]

TABLE
┌──────┬──────────────┬────────┬───────┬────────┬────────┐
│ IMG  │ PRODUCT      │ PRICE  │ STOCK │ STATUS │ ACTIONS│
├──────┼──────────────┼────────┼───────┼────────┼────────┤
│ [img]│ Product Name │ $29.99 │  42   │ Active │[✏][🗑]│
│      │ SKU-001      │        │       │        │        │
└──────┴──────────────┴────────┴───────┴────────┴────────┘
Pagination
```

---

### 4.5 Screen: Add / Edit Product `/vendor/products/new`

```
┌─────────────────────────────┬──────────────────────┐
│  BASIC INFO                 │  MEDIA               │
│  Title     [____________]   │  ┌────────────────┐  │
│  Slug      [____________]   │  │ Drop images    │  │
│  Category  [Select ▾]       │  │ (max 6)        │  │
│  SubCat    [Select ▾]       │  └────────────────┘  │
│  Description               │  Thumbnail row        │
│  [Rich text / textarea]    │                      │
├─────────────────────────────┤                      │
│  PRICING                    │                      │
│  Price      [$_______]      │                      │
│  Sale Price [$_______]      │                      │
├─────────────────────────────┤                      │
│  INVENTORY                  │                      │
│  SKU    [______]  Stock [__]│                      │
│  Track inventory [toggle]   │                      │
├─────────────────────────────┴──────────────────────┤
│  VARIANTS                                          │
│  [+ Add Variant]                                   │
│  ┌──────────┬───────────┬───────┬───────┬────────┐ │
│  │ SKU      │ Attrs     │ Price │ Stock │ Delete │ │
│  └──────────┴───────────┴───────┴───────┴────────┘ │
├─────────────────────────────────────────────────────┤
│  TAGS  [tag1 ×] [tag2 ×]  [+ Add tag]              │
├─────────────────────────────────────────────────────┤
│  [Save Draft]              [Publish Product]        │
└─────────────────────────────────────────────────────┘
```

---

### 4.6 Screen: Vendor Orders `/vendor/orders`

```
FILTER TABS: All | Pending | Processing | Shipped | Delivered | Cancelled

TABLE
┌────────┬───────────┬──────────┬────────┬──────────┬────────────┐
│ ORDER  │ CUSTOMER  │ DATE     │ TOTAL  │ STATUS   │ ACTIONS    │
├────────┼───────────┼──────────┼────────┼──────────┼────────────┤
│ #001   │ John Doe  │ Jan 15   │ $79.99 │ [Paid]   │[View][Ship]│
└────────┴───────────┴──────────┴────────┴──────────┴────────────┘

Order Detail slide-over panel:
  Customer info, items, shipping address
  [Mark as Shipped] → modal: Carrier + Tracking Number
  [Mark as Delivered]
```

---

### 4.7 Screen: Vendor Wallet `/vendor/wallet`

```
BALANCE CARDS
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│ Available        │ │ Locked           │ │ Total Paid Out   │
│ $1,234.50        │ │ $320.00          │ │ $8,900.00        │
│ [Request Payout] │ │ (processing)     │ │                  │
└──────────────────┘ └──────────────────┘ └──────────────────┘

PAYOUT HISTORY TABLE
┌──────────┬──────────┬────────┬──────────┐
│ DATE     │ AMOUNT   │ STATUS │ STRIPE ID│
├──────────┼──────────┼────────┼──────────┤
│ Jan 15   │ $500.00  │ [Paid] │ tr_xxxx  │
└──────────┴──────────┴────────┴──────────┘
```

---

### 4.8 Screen: Store Settings `/vendor/store`

```
TABS: Store Info | Policies | Social

Store Info:
  Store name, description, logo, banner image upload
  Contact email, phone, address
  [Save Changes]

Policies:
  Return policy [textarea]
  Shipping policy [textarea]
```

---

## 5. Admin Panel

### 5.1 Layout Shell

```
┌─────────────────────────────────────────────────────┐
│  HEADER (bg-neutral-900 text-white h-14)            │
│  [≡] Admin Panel        [🔔] [Search] [Avatar ▾]    │
├──────────┬──────────────────────────────────────────┤
│ SIDEBAR  │                                          │
│ (w-64    │  MAIN CONTENT                            │
│ bg-      │  (bg-neutral-50, p-6)                    │
│ neutral- │                                          │
│ 800)     │                                          │
│          │                                          │
│ 📊 Dashboard           │
│ 📦 Orders              │
│ 🛍 Products            │
│ 👥 Users               │
│ 🏪 Vendors             │
│🏷  Coupons             │
│ 🚚 Shipments           │
│ 🔐 Roles               │
│ 🔑 Permissions         │
│ 🔔 Notifications       │
└──────────┴──────────────────────────────────────────┘
```

---

### 5.2 Screen: Admin Dashboard `/admin/dashboard`

```
STATS ROW (5 cards)
┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
│ Revenue │ │ Orders  │ │  Users  │ │ Vendors │ │Products │
│$48,200  │ │  1,240  │ │  8,900  │ │   52    │ │   340   │
│↑18% mo  │ │ ↑5% mo  │ │ ↑23%mo  │ │         │ │         │
└─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘

ROW 2
┌──────────────────────────┬───────────────────────────┐
│ REVENUE CHART            │ ORDER STATUS DONUT        │
│ (bar chart, 12 months)   │ Pending/Processing/etc    │
└──────────────────────────┴───────────────────────────┘

ROW 3
┌──────────────────────────┬───────────────────────────┐
│ RECENT ORDERS            │ NEW VENDOR APPLICATIONS   │
│ Table (10 rows)          │ List with [Approve][Reject]│
└──────────────────────────┴───────────────────────────┘
```

---

### 5.3 Screen: Admin Orders `/admin/orders`

```
FILTER BAR: Status tabs + Date range picker + Search

TABLE (sortable columns)
┌──────┬──────────┬───────────┬──────────┬────────┬──────────┬────────┐
│ORDER │ CUSTOMER │ VENDOR    │ DATE     │ TOTAL  │ STATUS   │ACTIONS │
├──────┼──────────┼───────────┼──────────┼────────┼──────────┼────────┤
│#001  │ John Doe │ TechStore │ Jan 15   │ $79.99 │[Shipped] │[View]  │
└──────┴──────────┴───────────┴──────────┴────────┴──────────┴────────┘

Order detail modal or page — same as vendor but with admin controls:
  [Change Status ▾] dropdown
  [Assign to Shipment]
  Full order timeline + refund history
```

---

### 5.4 Screen: Admin Users `/admin/users`

```
TOOLBAR: [Search by name/email]  [Role filter ▾]  [Export CSV]

TABLE
┌──────┬───────────┬──────────────────┬──────────┬──────────┬────────┐
│AVATAR│ NAME      │ EMAIL            │ ROLE     │ JOINED   │ACTIONS │
├──────┼───────────┼──────────────────┼──────────┼──────────┼────────┤
│ [av] │ John Doe  │ john@example.com │ [User]   │ Jan '25  │[✏][🔒]│
└──────┴───────────┴──────────────────┴──────────┴──────────┴────────┘

Edit user modal:
  Role selector, status toggle (active/suspended)
```

---

### 5.5 Screen: Admin Vendors `/admin/vendors`

```
FILTER TABS: All | Pending | Active | Suspended | Rejected

TABLE
┌──────────────┬──────────┬────────────┬──────────┬─────────────────────┐
│ VENDOR NAME  │ OWNER    │ COMMISSION │ STATUS   │ ACTIONS             │
├──────────────┼──────────┼────────────┼──────────┼─────────────────────┤
│ TechStore    │ Jane Doe │ 10%        │[Pending] │[Approve] [Reject]   │
│ FashionHub   │ Bob Lee  │ 10%        │[Active]  │[Suspend] [View]     │
└──────────────┴──────────┴────────────┴──────────┴─────────────────────┘

Vendor detail page:
  Store info, owner info, products count, revenue, payout history
  [Change Status] [Edit Commission]
```

---

### 5.6 Screen: Admin Coupons `/admin/coupons`

```
TOOLBAR: [+ Create Coupon]  [Search]

TABLE
┌────────────┬──────────┬────────────┬────────┬──────────┬────────┐
│ CODE       │ DISCOUNT │ USAGE      │ EXPIRY │ STATUS   │ACTIONS │
├────────────┼──────────┼────────────┼────────┼──────────┼────────┤
│ SUMMER20   │ 20%      │ 45/100     │ Jul 31 │[Active]  │[✏][🗑]│
└────────────┴──────────┴────────────┴────────┴──────────┴────────┘

Create/Edit Coupon modal:
  Code, Discount Type (% / fixed), Amount, Min Order, Max Uses, Expiry, Eligible roles
```

---

### 5.7 Screen: Admin Roles & Permissions `/admin/roles` + `/admin/permissions`

```
ROLES PAGE:
Left: Role list (admin, seller, support, user...)
  [+ New Role]
Right: Selected role editor
  Name, Description
  PERMISSIONS MATRIX:
  ┌──────────────┬────────┬──────┬────────┬────────┐
  │ MODULE       │ CREATE │ READ │ UPDATE │ DELETE │
  ├──────────────┼────────┼──────┼────────┼────────┤
  │ Orders       │  [✓]   │ [✓]  │  [✓]   │  [ ]   │
  │ Products     │  [ ]   │ [✓]  │  [ ]   │  [ ]   │
  │ Users        │  [ ]   │ [✓]  │  [✓]   │  [ ]   │
  └──────────────┴────────┴──────┴────────┴────────┘
  [Save Role]
```

---

### 5.8 Screen: Admin Notifications `/admin/notifications`

```
COMPOSE PANEL
  Target: [All Users ▾] / specific user search
  Title   [_____________]
  Message [_____________]
  Type    [Info / Success / Warning / Danger]
  [Send Notification]

SENT HISTORY TABLE
┌────────────────┬────────────┬──────────┬──────────┐
│ MESSAGE        │ TARGET     │ SENT AT  │ TYPE     │
└────────────────┴────────────┴──────────┴──────────┘
```

---

### 5.9 Screen: Admin Shipments `/admin/shipments`

```
TABLE
┌──────────┬────────┬───────────────┬──────────┬──────────┬────────┐
│ ORDER    │CARRIER │ TRACKING #    │ SHIPPED  │ STATUS   │ACTIONS │
├──────────┼────────┼───────────────┼──────────┼──────────┼────────┤
│ #ORD-001 │ FedEx  │ 123456789     │ Jan 16   │[Shipped] │[Update]│
└──────────┴────────┴───────────────┴──────────┴──────────┴────────┘

Update Shipment modal:
  Carrier, Tracking Number, Status selector, Notes
```

---

## 6. Navigation Flows

### 6.1 Customer Journey Flow

```
Landing (/)
  → Browse Categories → Product Listing → Product Detail
                                               ↓
                                         Add to Cart
                                               ↓
                                           Cart (/cart)
                                               ↓
                                    [Not logged in] → Login/Signup
                                               ↓
                                      Checkout Step 1 (Shipping)
                                               ↓
                                      Checkout Step 2 (Payment)
                                               ↓
                                      Order Confirmation
                                               ↓
                                       Account → Orders
```

### 6.2 Vendor Journey Flow

```
Register as Vendor → Vendor Onboarding (4 steps)
  → Pending Review → [Admin Approves] → Active Vendor
                                              ↓
                                    Vendor Dashboard
                                    ├── Add Products
                                    ├── Manage Orders → [Mark Shipped]
                                    ├── View Wallet → [Request Payout]
                                    └── Store Settings
```

### 6.3 Admin Journey Flow

```
Admin Login → Dashboard Overview
  ├── Review Vendor Applications → Approve/Reject
  ├── Orders → Monitor / Change Status
  ├── Users → Manage / Suspend
  ├── Coupons → Create / Deactivate
  ├── Roles → Edit Permissions Matrix
  └── Notifications → Broadcast Messages
```

---

## 7. Responsive Breakpoints

```
sm   640px   — Mobile landscape
md   768px   — Tablet portrait
lg   1024px  — Desktop (main target)
xl   1280px  — Wide desktop
```

**Mobile adaptations:**
- Sidebar → off-canvas drawer (hamburger trigger)
- Product grid: 2 cols → 1 col
- Filter panel → bottom sheet
- Checkout steps → full-screen per step
- Tables → card-based list view

---

## 8. Angular Project Structure (Planned)

```
src/app/
├── core/
│   ├── guards/          auth.guard, vendor.guard, admin.guard
│   ├── interceptors/    auth.interceptor (attach Bearer token)
│   ├── services/        api.service, auth.service, cart.service, socket.service
│   └── models/          TypeScript interfaces for all API models
├── shared/
│   ├── components/      button, badge, card, modal, toast, pagination, spinner
│   ├── directives/      click-outside, lazy-image
│   └── pipes/           currency-format, time-ago, truncate
├── features/
│   ├── home/
│   ├── products/        listing, detail
│   ├── cart/
│   ├── checkout/        steps: shipping, payment, confirmation
│   ├── auth/            login, signup, forgot, reset
│   ├── account/         orders, wishlist, profile, notifications
│   ├── vendor/          dashboard, products, orders, wallet, store
│   └── admin/           dashboard, orders, users, vendors, coupons, roles, notifications, shipments
└── app.routes.ts        lazy-loaded routes per feature
```

**State management:** Angular Signals (or NgRx if complexity warrants)
**HTTP:** Angular HttpClient with interceptor for JWT
**Real-time:** socket.io-client service injected where needed
**Forms:** Reactive Forms throughout
**Charts (admin/vendor):** ng2-charts (Chart.js wrapper)
