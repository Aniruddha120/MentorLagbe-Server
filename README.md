# MentorLagbe Server

Express + MongoDB + BetterAuth + JWT + Stripe backend for MentorLagbe.

## Setup
1. `cp .env.example .env` and fill values.
2. `npm install`
3. `npm run seed` (optional, seeds approved tuitions)
4. `npm run dev`

## Env
See `.env.example`. Required: `MONGODB_URI`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `JWT_SECRET`, `CLIENT_URL`. Stripe/ImgBB keys needed for payments/uploads.

## API highlights
- Auth: `/api/auth/*` (BetterAuth), `/api/jwt`
- Public: `/api/tuitions`, `/api/tuitions/:id`
- Student: `/api/applications`, `/api/applications/my`, `/api/student/stats`
- Tutor: `/api/tutor/*`
- Admin: `/api/admin/*`
- Stripe: `/api/create-checkout-session`, `/api/payments/confirm`, `/api/webhook/stripe`

## Notes
- Stripe webhook requires raw body; mounted before `express.json()`.
- Role checks: `verifyToken`, `verifyStudent`, `verifyTutor`, `verifyAdmin`.
