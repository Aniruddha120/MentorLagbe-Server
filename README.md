# MentorLagbe Server

Express + TypeScript + MongoDB backend for **MentorLagbe**. Handles BetterAuth, JWT role checks, tuition/application/admin APIs, Stripe checkout/webhook, and image upload proxy.

## Live URL
- Server: https://mentorlagbe-server-66nj.onrender.com
- Client: https://mentor-lagbe-client-kohl.vercel.app

## Setup
1. `cp .env.example .env`
2. Fill required env values:
   - `PORT=5000`
   - `CLIENT_URL=http://localhost:3001`
   - `MONGODB_URI=...`
   - `DB_NAME=mentorlagbe`
   - `BETTER_AUTH_SECRET=...`
   - `BETTER_AUTH_URL=http://localhost:5000`
   - `JWT_SECRET=...`
   - `STRIPE_SECRET_KEY=...`
   - `STRIPE_WEBHOOK_SECRET=...`
   - `IMGBB_API_KEY=...`
3. `npm install`
4. `npm run seed` (optional demo tutors/tuitions)
5. `npm run dev`

## Scripts
- `npm run dev` - start dev server with tsx watch
- `npm run build` - compile TypeScript
- `npm start` - run compiled server
- `npm run seed` - seed demo tutors and approved tuitions

## API Highlights
- Auth: `/api/auth/*` (BetterAuth), `POST /api/jwt`
- Users: `GET/PATCH /api/users/me`
- Upload: `POST /api/upload` (authenticated, ImgBB proxy)
- Public: `GET /api/tuitions`, `GET /api/tuitions/:id`
- Student: `POST /api/applications`, `GET /api/applications/my`, `DELETE /api/applications/:id`, `GET /api/student/stats`
- Tutor: `/api/tutor/stats`, `/api/tutor/tuitions`, `/api/tutor/applicants`, `/api/tutor/applications/:id`
- Admin: `/api/admin/stats`, `/api/admin/users`, `/api/admin/users/:id/role`, `/api/admin/tuitions`, `/api/admin/tuitions/:id/status`, `/api/admin/transactions`
- Payments: `POST /api/create-checkout-session`, `POST /api/payments/confirm`, `POST /api/webhook/stripe`

## Security / Notes
- JWT verification middleware and role middlewares: `verifyStudent`, `verifyTutor`, `verifyAdmin`.
- Stripe webhook uses raw body and is mounted before `express.json()`.
- CORS origin is controlled by `CLIENT_URL`.
- Secrets are loaded from environment variables; do not commit `.env`.
