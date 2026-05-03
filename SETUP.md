# PropFlow Setup Guide

## Prerequisites
- Node.js 18+
- Supabase account
- Google OAuth credentials
- YouCanPay merchant account (Morocco)
- Vercel account (for Blob storage)

## Environment Setup

1. **Create `.env.local` file with:**
   - Supabase credentials
   - Google OAuth keys
   - YouCanPay keys
   - Vercel Blob token

2. **Supabase Setup:**
   - Create new Supabase project
   - Run migration: `supabase/migrations/001_init_schema.sql`
   - Enable Auth (Google provider)
   - Enable RLS policies

3. **Google OAuth:**
   - Go to Google Cloud Console
   - Create OAuth credentials (Web application)
   - Redirect URIs: `http://localhost:3000/auth/callback`, `https://yourdomain.com/auth/callback`

## Installation

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`

## Feature Status

### ✅ Complete
- Auth flow (signup/login with Google + email)
- Database schema + migrations
- Item listing CRUD
- Search & filters
- Booking flow
- Payment API skeleton (YouCanPay)
- Admin dashboard (verification + payouts)
- Decorator dashboard

### 🚧 TODO
- **Image uploads** → Vercel Blob integration
- **YouCanPay integration** → Live payment processing
- **Email notifications** → SendGrid/Resend
- **Reviews & ratings** → Post-rental reviews
- **Availability calendar** → Calendar widget for dates
- **Mobile responsiveness** → Full responsive design
- **Error handling** → Toast notifications
- **Tests** → Unit + integration tests
- **Analytics** → GMV, active listings metrics
- **Dispute system** → TBD with team

## Deployment

1. Push to GitHub
2. Connect Vercel
3. Set environment variables in Vercel
4. Deploy

## Testing

1. Create decorator account (Hiba + Amine test accounts)
2. List props with photos
3. Create renter account
4. Search & book props
5. Test YouCanPay sandbox payments
6. Verify admin queue

## Notes

- Payment integration needs YouCanPay API keys
- Photo uploads need Vercel Blob setup
- Email notifications require SendGrid/Resend setup
- Admin accounts must be manually created in database
