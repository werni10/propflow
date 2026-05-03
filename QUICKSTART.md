# PropFlow Quick Start (2-Week Sprint)

## What You Have
Full Next.js MVP with auth, search, bookings, payments, admin dashboard. Ready to connect to real services.

## This Week (Days 1-3): Setup External Services

### 1. Supabase Setup (30 min)
```bash
# Create new Supabase project at supabase.com
# Copy Project URL + Anon Key + Service Role Key
# Paste into .env.local

# In Supabase dashboard:
# 1. Go to SQL Editor
# 2. Paste entire content of supabase/migrations/001_init_schema.sql
# 3. Execute
# 4. Enable Auth (Project Settings > Auth > Providers > Enable Google)
# 5. Add Google OAuth credentials
```

### 2. Google OAuth Setup (20 min)
```bash
# 1. Visit console.cloud.google.com
# 2. Create new project "PropFlow"
# 3. Enable Google+ API
# 4. Create OAuth credentials (OAuth client ID)
# 5. Set redirect URIs:
#    - http://localhost:3000/auth/callback
#    - https://yourdomain.vercel.app/auth/callback
# 6. Copy Client ID + Secret to .env.local
```

### 3. YouCanPay Setup (20 min)
- Contact YouCanPay (Morocco/Yemen payment)
- Get merchant account credentials
- Test with sandbox first
- Add credentials to .env.local

### 4. Vercel Blob Setup (15 min)
- Connect Vercel account
- Create new project in Vercel
- Set up Blob storage
- Copy token to .env.local

## Day 4-5: Test Core Flows

### Test Script
```bash
# 1. Install dependencies
npm install

# 2. Run dev server
npm run dev

# 3. Test signup → login (email + Google)
# 4. Create decorator account, list prop
# 5. Create renter account, search/book
# 6. Check admin queue
# 7. Verify payment flow (use YouCanPay sandbox)
```

## Week 2: Finalize & Deploy

### Must-Do Before Launch
1. ✅ Image uploads working (Vercel Blob)
2. ✅ Email notifications (SendGrid/Resend)
3. ✅ YouCanPay live payments
4. ✅ Mobile responsive
5. ✅ Error handling/validation
6. ✅ Admin account setup

### Nice-to-Have (Can defer)
- Availability calendar widget
- Reviews system (basic works, just needs UI polish)
- Advanced analytics
- Dispute system

### Deployment
```bash
# 1. Push to GitHub
# 2. Connect to Vercel
# 3. Set environment variables
# 4. Deploy
# 5. Test on production domain
# 6. Set up custom domain
```

## File Structure
```
propflow/
├── app/
│   ├── auth/           # Login/signup pages
│   ├── items/          # Prop listing + detail
│   ├── bookings/       # Checkout flow
│   ├── decorators/     # Dashboard
│   ├── admin/          # Admin panel
│   └── api/            # Backend endpoints
├── lib/
│   ├── auth/           # Auth utilities
│   ├── supabase.ts     # DB client
│   └── types.ts        # TypeScript types
└── supabase/
    └── migrations/     # DB schema
```

## Key URLs
- Home: `/` (browse props)
- Signup: `/auth/signup`
- Login: `/auth/login`
- Decorator dashboard: `/decorators/dashboard`
- New listing: `/items/new`
- Item detail: `/items/[id]`
- Checkout: `/bookings/new?itemId=...&startDate=...&endDate=...`
- Admin: `/admin/dashboard`

## Environment Variables Checklist
```
✓ NEXT_PUBLIC_SUPABASE_URL
✓ NEXT_PUBLIC_SUPABASE_ANON_KEY
✓ SUPABASE_SERVICE_ROLE_KEY
✓ NEXT_PUBLIC_YOUCANPAY_PUBLIC_KEY
✓ YOUCANPAY_SECRET_KEY
✓ GOOGLE_CLIENT_ID
✓ GOOGLE_CLIENT_SECRET
✓ BLOB_READ_WRITE_TOKEN
✓ NEXT_PUBLIC_APP_URL (http://localhost:3000 for dev)
```

## Test Accounts to Create
```
Decorators (for listing props):
- hiba@example.com / password
- amine@example.com / password

Renters (for testing bookings):
- user1@example.com / password
- user2@example.com / password

Admin (manual create in DB):
- admin@example.com (role: decorator, status: verified)
```

## Common Issues & Fixes

**Login failing?**
- Check Supabase Auth enabled + Google provider configured
- Verify redirect URI in Google Cloud Console

**Props not showing?**
- Ensure items table populated with test data
- Check RLS policies enabled

**Payment failing?**
- Use YouCanPay sandbox credentials first
- Check webhook URL configured

**Images not uploading?**
- Verify Vercel Blob token valid
- Check file size limits

## Success Metrics (MVP)
- ✅ 5+ test props listed
- ✅ 1+ successful booking per decorator
- ✅ Zero payment failures (sandbox)
- ✅ Admin queue working
- ✅ Load times < 2s
- ✅ Mobile responsive

---

**Questions?** Check PROJECT_SUMMARY.md for architecture details or SETUP.md for full setup guide.
