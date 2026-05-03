# PropFlow Deployment Guide - Full Walkthrough

## Step 1: Supabase Setup (10 minutes)

### 1.1 Create Supabase Project
```
1. Go to https://supabase.com
2. Sign up / log in
3. Click "New project"
4. Name: "propflow"
5. Database password: (generate + save securely)
6. Region: Europe (or closest to Morocco - check available)
7. Click "Create new project" (takes ~2 min)
```

### 1.2 Get API Keys
```
In Supabase dashboard:
1. Go to Settings > API
2. Copy these to .env.local:
   - Project URL → NEXT_PUBLIC_SUPABASE_URL
   - Anon key → NEXT_PUBLIC_SUPABASE_ANON_KEY
   - Service role → SUPABASE_SERVICE_ROLE_KEY
```

### 1.3 Run Database Migration
```
In Supabase dashboard:
1. Go to SQL Editor
2. New Query
3. Copy ENTIRE content of: supabase/migrations/001_init_schema.sql
4. Paste into editor
5. Click "Run"
6. Wait for success ✓

This creates:
- 8 tables (users, items, bookings, etc.)
- All indexes
- RLS policies
```

### 1.4 Enable Google OAuth
```
In Supabase:
1. Go to Authentication > Providers
2. Find "Google"
3. Click Enable
4. Leave "Client ID" + "Client Secret" empty (we'll add later)
5. Copy the "Redirect URL" (ends with /auth/callback)
```

**Save that redirect URL.** You'll need it for Google OAuth setup.

---

## Step 2: Google OAuth Setup (5 minutes)

### 2.1 Create Google Cloud Project
```
1. Go to https://console.cloud.google.com
2. Create new project "PropFlow"
3. Wait for creation
```

### 2.2 Enable Google+ API
```
1. In Google Cloud Console, search "Google+ API"
2. Click "Google+ API" result
3. Click "Enable"
4. Wait for confirmation
```

### 2.3 Create OAuth Credentials
```
1. Go to Credentials (left menu)
2. Click "Create Credentials" > "OAuth client ID"
3. Application type: "Web application"
4. Name: "propflow-web"
5. Add Authorized redirect URIs:
   - http://localhost:3000/auth/callback (dev)
   - https://propflow.vercel.app/auth/callback (production)
   (You'll update domain later)
6. Click "Create"
7. Copy Client ID + Client Secret
```

### 2.4 Add to Supabase
```
In Supabase:
1. Go to Authentication > Providers > Google
2. Paste Client ID
3. Paste Client Secret
4. Click "Save"
```

---

## Step 3: Environment Variables

### 3.1 Update .env.local
```bash
# Supabase (from Step 1.2)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxxxx

# Google (from Step 2.3)
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxx

# YouCanPay (get from merchant account - can test with dummy for now)
NEXT_PUBLIC_YOUCANPAY_PUBLIC_KEY=pk_test_xxxxx
YOUCANPAY_SECRET_KEY=sk_test_xxxxx

# Vercel Blob (add after Vercel setup)
BLOB_READ_WRITE_TOKEN=vercel_blob_xxxxx

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3.2 Test Locally
```bash
npm run dev
# Open http://localhost:3000
# Test: Sign up with Google → Should redirect to Google login → Should create account
```

---

## Step 4: Vercel Deployment (5 minutes)

### 4.1 Connect GitHub to Vercel
```
1. Go to https://vercel.com
2. Sign up / log in
3. Click "Add New..." > "Project"
4. Select "Import Git Repository"
5. Search "propflow"
6. Click your "werni10/propflow" repo
7. Click "Import"
```

### 4.2 Configure Environment Variables
```
Vercel will show "Configure Project" screen:

1. Framework: "Next.js" (should auto-detect)
2. Root Directory: "./" (default)
3. Environment Variables: Add these from .env.local:

NEXT_PUBLIC_SUPABASE_URL = (paste)
NEXT_PUBLIC_SUPABASE_ANON_KEY = (paste)
SUPABASE_SERVICE_ROLE_KEY = (paste)
GOOGLE_CLIENT_ID = (paste)
GOOGLE_CLIENT_SECRET = (paste)
NEXT_PUBLIC_YOUCANPAY_PUBLIC_KEY = (paste)
YOUCANPAY_SECRET_KEY = (paste)
NEXT_PUBLIC_APP_URL = https://propflow.vercel.app

4. Click "Deploy"
5. Wait ~3 min for build + deployment
```

### 4.3 Update Google OAuth for Production
```
Back in Google Cloud Console:
1. Go to Credentials
2. Find your OAuth client
3. Add redirect URI: https://propflow.vercel.app/auth/callback
4. Save
```

### 4.4 Update Supabase Redirect
```
In Supabase:
1. Authentication > URL Configuration
2. Site URL: https://propflow.vercel.app
3. Redirect URLs: Add https://propflow.vercel.app/auth/callback
4. Save
```

---

## Step 5: Test Full Flow

### 5.1 Local Testing
```bash
npm run dev
# 1. Sign up with email
# 2. Sign up with Google
# 3. Create item listing (as decorator)
# 4. Search for props (as renter)
# 5. Book prop → Checkout
```

### 5.2 Production Testing
```
1. Open https://propflow.vercel.app
2. Repeat steps 5.1
3. Check: Auth works, props load, booking forms work
```

---

## Step 6: Vercel Blob Setup (for images) - Optional but Recommended

### 6.1 In Vercel
```
1. Go to your Project > Settings > Storage
2. Create new > Blob
3. Region: Auto or closest to users
4. Click "Create"
5. Go to .env.local to copy BLOB_READ_WRITE_TOKEN
```

### 6.2 Add to Code
```typescript
// In app/items/new/page.tsx, add image upload:
import { put } from '@vercel/blob';

const file = new File([imageData], 'prop-photo.jpg');
const blob = await put('props/' + Date.now(), file, { access: 'public' });
// Then save blob.url to database
```

---

## Common Issues & Fixes

### "Google login fails"
- [ ] Google Client ID in Supabase?
- [ ] Google redirect URI includes yourdomain?
- [ ] Supabase Site URL set?

### "Props not showing up"
- [ ] Database migration ran successfully?
- [ ] Can you see tables in Supabase SQL Editor?
- [ ] RLS policies enabled?

### "Booking fails"
- [ ] All env vars set in Vercel?
- [ ] Supabase API keys correct?
- [ ] User verified in Supabase auth_users table?

### "Images not uploading"
- [ ] Vercel Blob token set?
- [ ] BLOB_READ_WRITE_TOKEN in Vercel env vars?
- [ ] @vercel/blob package installed?

---

## Checklist Before Launch

- [ ] Supabase project created + migration run
- [ ] Google OAuth credentials created + added to Supabase
- [ ] Vercel project deployed with all env vars
- [ ] .env.local has all keys
- [ ] Email signup works
- [ ] Google signup works
- [ ] Can create item listing
- [ ] Can search props
- [ ] Can complete booking
- [ ] Admin dashboard loads
- [ ] Production domain works

---

## YouCanPay Integration (Live Payments)

For now, checkout flow is skeleton. To enable real payments:

### Get YouCanPay Account
```
1. Contact YouCanPay (Morocco/Yemen payments)
2. Get merchant credentials
3. Add to .env.local:
   - NEXT_PUBLIC_YOUCANPAY_PUBLIC_KEY
   - YOUCANPAY_SECRET_KEY
```

### Implement Payment Flow
```typescript
// In app/api/payments/checkout/route.ts:
const response = await fetch('https://api.youcanpay.com/v1/checkout', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${YOUCANPAY_SECRET_KEY}`,
  },
  body: JSON.stringify({
    amount: totalPrice,
    currency: 'MAD',
    description: `Prop booking: ${itemTitle}`,
    customer: { email: userEmail },
    return_url: `https://yourdomain/bookings/${bookingId}`,
  }),
});
```

---

## Timeline

| Step | Time | Status |
|------|------|--------|
| Supabase setup | 10 min | ⏱️ |
| Google OAuth | 5 min | ⏱️ |
| Vercel deploy | 5 min | ⏱️ |
| Test full flow | 10 min | ⏱️ |
| YouCanPay (optional) | 15 min | 🔜 |
| **Total** | **35 min** | ✅ |

---

## You're Live When...

✅ Home page loads
✅ Can sign up / log in
✅ Can create item listing
✅ Can search props
✅ Can book prop + checkout
✅ Admin dashboard shows verification queue
✅ Decorator dashboard shows inventory

**After this:** Invite Hiba + Amine for beta testing.
