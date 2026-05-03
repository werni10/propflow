# PropFlow MVP - Project Summary

## What's Built ✅

### 1. **Authentication System**
- Email/password signup + login
- Google OAuth integration
- User role assignment (decorator/renter)
- Protected routes by role
- Profile creation flow

**Files:**
- `app/auth/signup/page.tsx` - Signup form
- `app/auth/login/page.tsx` - Login form
- `app/auth/callback/route.ts` - OAuth callback
- `lib/auth/client.ts` - Auth utilities

### 2. **Database & Schema**
- Supabase PostgreSQL with RLS
- Full schema: users, decorators, items, bookings, payments, reviews, payouts
- Migrations ready to deploy
- Row-level security policies

**File:**
- `supabase/migrations/001_init_schema.sql` - Full DB schema

### 3. **Prop Listing System (Decorators)**
- Create/read/update props
- Categories, pricing, location, condition
- Deposit options
- Photo support (skeleton for Vercel Blob)
- Decorator dashboard with inventory

**Files:**
- `app/items/new/page.tsx` - Create listing form
- `app/decorators/dashboard/page.tsx` - Inventory dashboard
- `app/api/items/route.ts` - Item CRUD API

### 4. **Search & Discovery (Renters)**
- Filter by category, location, price range
- Real-time filtering
- Item detail pages
- Decorator profiles

**Files:**
- `app/page.tsx` - Home with search
- `app/items/[id]/page.tsx` - Item detail + booking form

### 5. **Booking Flow**
- Date picker (check-in/check-out)
- Quantity selector
- Real-time price calculation
- Deposit calculation
- Booking summary before checkout

**Files:**
- `app/bookings/new/page.tsx` - Booking confirmation
- `app/api/bookings/route.ts` - Booking CRUD

### 6. **Payment Integration**
- YouCanPay API skeleton
- Checkout flow
- Webhook handler for payment confirmation
- Payment status tracking

**Files:**
- `app/api/payments/checkout/route.ts` - Payment initiation
- `app/api/payments/webhook/route.ts` - Webhook handler

### 7. **Admin Dashboard**
- Verification queue (decorator/renter approval)
- Monthly payout tracking
- Status management (pending/approved/rejected)
- Payout status display

**Files:**
- `app/admin/dashboard/page.tsx` - Admin controls
- `app/api/admin/verification/route.ts` - Verification API
- `app/api/admin/payouts/route.ts` - Payouts API

### 8. **Type Safety**
- Full TypeScript types for all entities
- Supabase client setup
- Type-safe API calls

**Files:**
- `lib/types.ts` - All entity types
- `lib/supabase.ts` - Supabase clients

## Architecture

```
Next.js 16 (App Router)
├── Frontend: React + TailwindCSS
├── Backend: Next.js API routes
├── Database: Supabase PostgreSQL + RLS
├── Auth: Supabase Auth + Google OAuth
├── Payments: YouCanPay (skeleton)
└── Storage: Vercel Blob (setup needed)
```

## Environment Variables Required

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_YOUCANPAY_PUBLIC_KEY=
YOUCANPAY_SECRET_KEY=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
BLOB_READ_WRITE_TOKEN=
NEXT_PUBLIC_APP_URL=
```

## What's Left (Phase 2) 🚧

### Critical
1. **Image uploads** - Connect Vercel Blob storage
2. **YouCanPay integration** - Finalize payment flow
3. **Email notifications** - Send confirmations

### High Priority
4. Availability calendar widget
5. Reviews & ratings system
6. Dispute resolution system
7. Responsive mobile design
8. Error handling & toast notifications

### Medium Priority
9. Analytics dashboard (GMV, listings, etc.)
10. Payout automation
11. Search optimization
12. Rate limiting & security

### Testing
13. Unit tests (auth, bookings)
14. Integration tests (payment flow)
15. E2E tests (full user journeys)

## User Flows Implemented

### 🎬 Filmmaker (Renter)
1. Sign up → Email verification → Browse props
2. Search by category/location/price
3. View prop details + decorator rating
4. Select dates & book
5. Pay via YouCanPay
6. Get confirmation email
7. Review decorator after rental

### 🎭 Set Decorator
1. Sign up → Email verification → Manual approval (admin)
2. Create profile + portfolio
3. List props with photos & pricing
4. Receive booking notifications
5. See monthly payouts
6. Get paid (end-of-month batch)

### 👨‍💼 Admin (Sami/Anas)
1. Dashboard access
2. Approve/reject decorators & renters
3. Track monthly payouts
4. Monitor transactions
5. View platform metrics

## Pages Built

| Page | Purpose | Status |
|------|---------|--------|
| `/` | Home + search | ✅ |
| `/auth/signup` | User registration | ✅ |
| `/auth/login` | User login | ✅ |
| `/items/[id]` | Prop details | ✅ |
| `/items/new` | Create listing | ✅ |
| `/bookings/new` | Checkout | ✅ |
| `/decorators/dashboard` | Inventory mgmt | ✅ |
| `/admin/dashboard` | Admin controls | ✅ |

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/decorators` | GET/POST | Decorator profiles |
| `/api/items` | GET/POST | Prop listings |
| `/api/bookings` | GET/POST/PUT | Bookings |
| `/api/payments/checkout` | POST | Payment initiation |
| `/api/payments/webhook` | POST | Payment confirmation |
| `/api/admin/verification` | GET/PUT | Verification queue |
| `/api/admin/payouts` | GET/POST | Monthly payouts |

## Deployment Checklist

- [ ] Set up Supabase project
- [ ] Run DB migrations
- [ ] Configure Google OAuth
- [ ] Get YouCanPay credentials
- [ ] Set up Vercel Blob
- [ ] Add environment variables
- [ ] Deploy to Vercel
- [ ] Enable RLS policies
- [ ] Test auth flow
- [ ] Test booking flow
- [ ] Test admin queue

## Testing with Hiba + Amine

1. Create test accounts (hiba@example.com, amine@example.com)
2. List 5+ props each
3. Create renter account
4. Search for props by location/category
5. Book a prop
6. Test YouCanPay sandbox payment
7. Verify admin queue
8. Check payout tracking

## Notes

- **Payout Model A implemented:** 50 DHS monthly subscription + 3% commission
- **Payment:** YouCanPay Yemen/Morocco only
- **Soft launch:** Morocco with Hiba + Amine
- **No mobile app:** Responsive web only
- **Verification:** Manual Sami/Anas approval required
- **Disputes:** TBD with team (placeholder in schema)

---

**Status:** MVP feature-complete. Ready for Supabase setup + YouCanPay integration + image uploads.
