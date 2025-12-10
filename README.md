# Toy Swap Circle — Backend (Node/Express + MongoDB)

- **Live API:** https://toy-marketplace-server-side-omega.vercel.app/
- **Frontend (live):** https://toy-marketplace-client-side-r8j2.vercel.app/
- **Frontend repo:** https://github.com/shafin90/toy-marketplace-client-side
- **Backend repo:** https://github.com/shafin90/toy-marketplace-server-side

This service powers Toy Swap Circle: a toy marketplace and swapping platform with credit-based exchanges, cash purchases, analytics for shop owners, and push-ready alerts.

## Purpose
- Make quality toys affordable and circular by enabling **swaps** and discounted buys.
- Cut waste/clutter by keeping toys in circulation instead of landfills.
- Give shop owners the tools to manage stock, exchanges, and revenue insight.

## Problem We Solve
- **High cost & short lifespan:** Kids outgrow toys quickly; premium toys are pricey.
- **Waste & storage pain:** Unused toys pile up or get trashed.
- **Discovery & trust:** Families need an easy, safe way to trade/buy age-appropriate toys with transparent pricing and stock signals.

## How Swapping Works
- Users list old toys to earn credits/discounts.
- Credits can be applied to other toys or combined with cash checkout.
- Owners can configure exchange/discount rules (trade-in, bulk exchange, old-toy-for-new).

## Impactful Approaches
- **3-layer architecture:** Controller → Service → Model keeps business logic testable and isolated from transport/DB.
- **Optimized analytics:** Mongo aggregation pipelines drive shop dashboards (revenue, orders, inventory split) without over-fetching.
- **Safer indexing:** Text/unique indexes created with try/catch and sparse options to tolerate `apiStrict` and null owner emails.
- **JWT auth everywhere:** Token-based auth protects purchase, exchange, and owner surfaces.
- **Real-time ready:** Socket.io bootstrap for chat/notifications; HTTP APIs stay stateless.

## Core Capabilities
- **Auth & Profiles:** Register/login with hashed passwords; JWT issuance; roles for `user` vs `shop_owner`.
- **Toys & Marketplace:** CRUD for toys, search/filter helpers, pricing, quantity, images served from `/uploads`.
- **Swaps & Credit Flows:** Credit-based swap execution (`/swap`), trade-ins, old-toy intake, bulk exchanges, and quick reorders.
- **Purchases & Transactions:** Cash/Stripe-facing purchase paths, order history, and transaction records.
- **Alerts & Engagement:** Price alerts, back-in-stock hooks, wishlist, shop follow, referrals, and notifications API.
- **Discovery & Personalization:** Recommendations, recently viewed tracking, collections, shop comparison.
- **Analytics for Owners:** Revenue/orders trends and inventory breakdown via aggregation.
- **Sustainability:** Old-toy collection and sustainability metrics endpoints.
- **Chat:** Socket-enabled chat routes for buyer/seller conversations.

## Tech Stack
- Node.js, Express.js
- MongoDB (native driver)
- JWT for auth, bcrypt for hashing
- Socket.io for realtime transport

## API Surface (high level)
- **Auth:** `/auth/register`, `/auth/login`
- **Users:** `/users`, `/users/:email`
- **Toys & Catalog:** `/toys`, `/toys/:id`, `/mytoys`, `/collections`, `/recommendations`, `/recently-viewed`
- **Swaps & Exchanges:** `/swap`, `/exchange`, `/trade-in`, `/bulk-exchange`, `/quick-reorder`
- **Commerce:** `/purchase`, `/transactions`, `/delivery`
- **Ownership & Shops:** `/shops`, `/shop-comparison`, `/shop-follow`
- **Alerts & Social:** `/price-alerts`, `/notifications`, `/wishlist`, `/referral`
- **Reviews:** `/reviews`
- **Analytics:** `/analytics` (aggregated dashboards)
- **Sustainability:** `/sustainability`, `/old-toys`
- **Chat:** `/chat`

## Architecture & Design
- **Controller/Service/Model separation** keeps HTTP thin and business logic reusable.
- **Mongo connection** via `src/utils/db.js`; indexes set in `src/utils/indexes.js`.
- **Aggregation-first analytics** avoids client-side heavy lifting.
- **Static uploads** served from `/uploads` for listing images.

## Running Locally
```bash
git clone https://github.com/shafin90/toy-marketplace-server-side.git
cd toy-marketplace-server-side
npm install
```

Create `.env` (keys are optional defaults but recommended):
```
PORT=5000
JWT_SECRET=change-me
JWT_EXPIRES_IN=7d
```

> MongoDB connection string is currently defined in `src/utils/db.js`. Update it to point to your cluster (or adapt to read `MONGODB_URI`).

Start the server:
```bash
npm start      # or: node index.js
# Health check: GET http://localhost:5000/hi
```

## Deployment
- Deployed API: https://toy-marketplace-server-side-omega.vercel.app/
- Frontend live (consumes this API): https://toy-marketplace-client-side-r8j2.vercel.app/

## Project Structure
```
src/
├─ controllers/   # HTTP adapters
├─ services/      # Business logic
├─ models/        # Data layer helpers
├─ routes/        # Route wiring
├─ utils/         # DB, indexes, JWT
└─ socket/        # Socket.io bootstrap
uploads/          # Served media for toys
```
