# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server with hot reload (ts-node-dev)
npm run build    # Compile TypeScript → dist/
npm start        # Run compiled production server (node dist/server.js)
```

No test framework is configured in this project.

## Architecture

**Stack:** Node.js + Express v5 + TypeScript + MongoDB (Mongoose) + Socket.io + Stripe

**Layer pattern:** Routes → Controllers → Services → Models

```
src/
├── server.ts          # HTTP server, MongoDB connect, Socket.io init
├── app.ts             # Express app, all route mounting
├── socket.ts          # Socket.io setup and room management
├── models/            # Mongoose schemas (User, Product, Order, Vendor, etc.)
├── routes/            # Express route definitions
├── controllers/       # Request handlers
├── services/          # Business logic and DB operations
├── middlewares/       # Auth, role, vendor, multer, validate
├── admin/             # Admin-specific controllers/routes/services
├── vendor/            # Vendor-specific controllers/routes/services
├── events/            # EventEmitter system + listeners
├── cron-jobs/         # node-cron scheduled tasks
├── validators/        # Joi validation schemas
├── config/            # DB connection, permission matrix, route config
├── utils/             # Shared utilities (notifications, inventory restore)
├── templates/         # Email templates
└── seed/              # DB seed scripts for roles/permissions
```

## Key Architectural Patterns

**Authentication:** JWT with two tokens — access token (60m, `JWT_SECRET`) and refresh token (7d, `JWT_REFRESH_SECRET`). Auth middleware attaches `{ id, name, email, phone, role }` to `req.user`.

**Multi-role RBAC:** Roles: `admin`, `vendor`, `seller`, `support`, `user`, `tester`. Admin role with null permissions = full access. Fine-grained permissions defined in `src/config/permission-matrix.ts` and seeded via `src/seed/`.

**Vendor middleware** (`src/middlewares/vendor.middleware.ts`) checks `vendor.status === "active"` before allowing vendor operations.

**Stock management:** Products have both `stock` and `reservedStock` fields (same for variants). Stock is reserved at checkout, finalized on Stripe `payment_intent.succeeded`, or released on failure/cancellation via `src/utils/restore-inventory.ts`.

**Stripe webhooks** (`src/controllers/webhook.controller.ts`) handle: `payment_intent.succeeded/failed`, `account.updated` (vendor onboarding), `transfer.created/reversed` (vendor payouts). The `/api/webhook` route bypasses body-parser JSON and uses raw body for signature verification.

**Event system:** `src/events/appEvents.ts` is a singleton EventEmitter. Events: `order.created`, `order.status.changed`, `vendor.account.status`. Listeners in `src/events/listeners/` handle side effects (emails, notifications).

**Real-time notifications:** Socket.io with per-user rooms (user joins room by userId on `join` event). `sendRealtimeNotification(userId, payload)` and `sendGlobalNotification(payload)` in `src/utils/notifications.ts`.

**Cron jobs:**
- `src/cron-jobs/cancell-orders.cron.ts` — runs every 5 minutes, cancels orders pending >15 minutes without payment
- `src/cron-jobs/stripe-reconcillation-order.ts` — reconciles order/payment status with Stripe

**MongoDB transactions** are used in critical paths (order creation, stock management, payouts). The local MongoDB URI requires `?replicaSet=rs0` for transaction support.

**File uploads:** Multer stores files in `/uploads/` (gitignored). Max 6 images per request.

## Environment Variables

Required in `.env`:
```
PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017/my_node_app?replicaSet=rs0
JWT_SECRET=
JWT_REFRESH_SECRET=
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
CLIENT_URL=http://localhost:4200
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
PLATFORM_COMMISSION=0.1
FRONTEND_URL=http://localhost:4200/
```

## API Route Namespaces

| Prefix | Domain |
|--------|--------|
| `/api/auth` | Signup, login, refresh, logout, password reset |
| `/api/users` | User profiles |
| `/api/products` | Product CRUD + search |
| `/api/product/categories` + `/api/product/subcategories` | Taxonomy |
| `/api/cart` | Cart management |
| `/api/order` | Order lifecycle |
| `/api/payment/stripe` | Payment intent create/confirm |
| `/api/webhook` | Stripe webhooks (raw body, no auth) |
| `/api/return` | Return requests |
| `/api/review` | Product reviews |
| `/api/wishlist` | Wishlists |
| `/api/vendor` | Vendor profiles + store + products |
| `/api/admin/*` | Admin dashboard, coupons, shipments, roles, permissions, users, notifications |

## Vendor Dashboard UI Plan

**Framework:** Angular (port 4200) | **Styling:** Tailwind CSS | **HTTP:** Angular HttpClient with JWT interceptor

### Project Structure
```
src/app/
├── core/
│   ├── interceptors/
│   │   ├── auth.interceptor.ts        # Attaches Bearer token to every request
│   │   └── refresh.interceptor.ts     # On 401 → call /api/auth/refresh → retry
│   ├── guards/
│   │   ├── auth.guard.ts              # Checks JWT exists + role = "vendor"
│   │   └── vendor-status.guard.ts     # Checks vendor.status === "active"
│   └── services/
│       ├── auth.service.ts            # login, logout, token storage
│       └── vendor.service.ts          # vendor profile, status, vendorId
├── shared/
│   ├── components/
│   │   ├── status-badge/              # Reusable badge for pending/active/rejected etc.
│   │   ├── image-upload/              # Drag-drop, max 6 files, preview grid
│   │   └── sidebar-layout/            # Vendor dashboard shell with sidebar nav
│   └── models/
│       ├── vendor.model.ts
│       ├── store.model.ts
│       ├── product.model.ts
│       ├── order.model.ts
│       ├── wallet.model.ts
│       └── payout.model.ts
└── features/
    ├── vendor-apply/                  # Apply to become vendor
    ├── vendor-pending/                # Waiting for admin approval
    └── vendor-dashboard/              # All dashboard features (auth-gated)
        ├── overview/
        ├── store/
        ├── products/
        ├── orders/
        └── payouts/
```

### Pages & Routes

| Route | Component | Guard | API Call |
|-------|-----------|-------|----------|
| `/vendor/apply` | VendorApplyComponent | AuthGuard (role=user) | `POST /api/vendor` |
| `/vendor/pending` | VendorPendingComponent | AuthGuard | — |
| `/vendor/dashboard` | OverviewComponent | VendorStatusGuard | wallet + analytics |
| `/vendor/store/create` | StoreCreateComponent | VendorStatusGuard | `POST /api/vendor/store` |
| `/vendor/store/edit` | StoreEditComponent | VendorStatusGuard | `PUT /api/vendor/store/:id` |
| `/vendor/store/analytics` | StoreAnalyticsComponent | VendorStatusGuard | `GET /api/vendor/store/:id/analytics` |
| `/vendor/products` | ProductListComponent | VendorStatusGuard | `GET /api/vendor/store/:id/products` |
| `/vendor/products/new` | ProductCreateComponent | VendorStatusGuard | `POST /api/vendor/products` (multipart) |
| `/vendor/products/:id/edit` | ProductEditComponent | VendorStatusGuard | `PUT /api/products/:id` |
| `/vendor/orders` | OrderListComponent | VendorStatusGuard | `GET /api/vendor/store/:vendorId/orders` |
| `/vendor/orders/:id` | OrderDetailComponent | VendorStatusGuard | order detail view |
| `/vendor/wallet` | WalletComponent | VendorStatusGuard | `GET /api/vendor/wallet/:vendorId` |
| `/vendor/payouts` | PayoutListComponent | VendorStatusGuard | `GET /api/vendor/payouts/` |
| `/vendor/payouts/request` | PayoutRequestComponent | VendorStatusGuard | `POST /api/vendor/payouts/request` |
| `/vendor/stripe/onboard` | StripeOnboardComponent | VendorStatusGuard | `POST /api/vendor/stripe/onboard` |

### Vendor Lifecycle & UI State Machine
```
User logs in
    ↓
role = "vendor"?
    ↓ NO → redirect to /vendor/apply (POST /api/vendor)
    ↓ YES
vendor.status check
    ├── "pending"    → /vendor/pending (info screen, no dashboard)
    ├── "suspended"  → show suspension message
    ├── "rejected"   → show rejection reason + reapply option
    └── "active"     → /vendor/dashboard (full access)
```

### Dashboard Overview Cards (Home Page)
- **Wallet Balance** — from `GET /api/vendor/wallet/:vendorId` → `balance`
- **Locked Balance** — `lockedBalance` (funds in pending payout)
- **Total Earned** — `totalEarned`
- **Total Orders** — from store analytics `totalOrders`
- **Total Revenue** — `totalRevenue`
- **Avg Order Value** — `avgOrderValue`
- **Stripe Status** — `stripeOnboarded` + `payoutsEnabled` badge

### Product Create/Edit Form Fields
```
name, description, price, stock, category, subcategory,
sku, weight, dimensions, tags, variants (size/color/price/stock)
images: FileList (max 6) → multipart/form-data
```

### Payout Request Form
```
amount: number (max = wallet.balance)
method: "stripe" | "bank" | "paypal"
payoutDetails:
  - stripe: (auto, uses connected account)
  - bank: bankName, accountNumber, iban
  - paypal: paypalEmail
```

### Order List Columns
```
orderId, date, customer name, items (vendor's only), vendorTotal, status
```

### Real-time Notifications
- Connect Socket.io on dashboard init: `socket.emit("join", { userId })`
- Listen for notification events → show toast/bell icon count
- Uses `src/utils/notifications.ts` → `sendRealtimeNotification(userId, payload)`

### Key Implementation Notes
- Access token stored in memory (not localStorage) — refresh token in httpOnly cookie
- On `401` response: call `POST /api/auth/refresh` → retry original request once
- Product image upload uses `FormData`, not JSON body
- Wallet amounts are in cents (Stripe standard) — divide by 100 for display
- Store slug is auto-generated by backend — display as read-only in edit form
- Payout `lockedBalance` means funds are in-flight — show with a lock icon
- `stripeOnboarded = false` → disable "Request Payout" button + show onboarding banner
