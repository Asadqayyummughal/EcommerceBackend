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
