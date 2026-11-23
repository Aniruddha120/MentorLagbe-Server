import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import Stripe from 'stripe';
import { toNodeHandler } from 'better-auth/node';
import { client, connectDB } from './db';
import { createAuth } from './auth';
import { signToken, verifyToken, AuthRequest } from './middleware';
import { getUserByEmail, ensureUser } from './utils';
import registerPublic from './routes/public';
import registerStudent from './routes/student';
import registerTutor from './routes/tutor';
import registerAdmin from './routes/admin';
import registerPayments from './routes/payments';

const app = express();
const port = Number(process.env.PORT || 5000);
const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

app.use(cors({ origin: [clientUrl, 'http://localhost:3000'], credentials: true }));

async function main() {
  const db = await connectDB();
  const usersCol = db.collection('user');
  const tuitionsCol = db.collection('tuitions');
  const applicationsCol = db.collection('applications');
  const paymentsCol = db.collection('payments');
  const auth = createAuth(db, client, clientUrl);

  app.post('/api/webhook/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
    if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) return res.status(400).send('Webhook not configured');
    let event: Stripe.Event;
    try { event = stripe.webhooks.constructEvent(req.body, req.headers['stripe-signature'] as string, process.env.STRIPE_WEBHOOK_SECRET); }
    catch (err: any) { return res.status(400).send(`Webhook Error: ${err.message}`); }
    if (event.type === 'checkout.session.completed') {
      const s = event.data.object as Stripe.Checkout.Session;
      const email = (s.metadata?.email || s.customer_details?.email || '').toLowerCase();
      if (email) {
        await ensureUser(usersCol, email, { plan: 'pro' });
        await paymentsCol.updateOne({ stripeSessionId: s.id }, { $set: {
          userEmail: email, userName: s.metadata?.name || s.customer_details?.name || '', userRole: s.metadata?.role || 'student',
          planName: s.metadata?.planName || 'Pro', amount: (s.amount_total || 0) / 100, currency: s.currency || 'usd',
          transactionId: (s.payment_intent as string) || s.id, stripeSessionId: s.id, paymentStatus: 'paid', paidAt: new Date(),
        } }, { upsert: true });
      }
    }
    res.json({ received: true });
  });

  app.use(express.json({ limit: '2mb' }));
  app.all('/api/auth/*', toNodeHandler(auth));
  app.get('/', (_req, res) => res.send({ ok: true, name: 'MentorLagbe API' }));

  app.post('/api/jwt', async (req, res) => {
    const email = ((req.body?.email as string) || '').toLowerCase();
    if (!email) return res.status(400).send({ message: 'Email required' });
    const user: any = await ensureUser(usersCol, email);
    res.send({ token: signToken(user), user: { name: user.name, email: user.email, role: user.role, plan: user.plan, image: user.image } });
  });

  app.get('/api/users/me', verifyToken, async (req: AuthRequest, res) => {
    const user = await getUserByEmail(usersCol, req.user!.email);
    if (!user) return res.status(404).send({ message: 'User not found' });
    res.send(user);
  });

  app.patch('/api/users/me', verifyToken, async (req: AuthRequest, res) => {
    const patch: any = {};
    ['name', 'phone', 'bio', 'image'].forEach(k => { if (req.body?.[k] !== undefined) patch[k] = req.body[k]; });
    if (req.body?.role && ['student', 'tutor'].includes(req.body.role)) patch.role = req.body.role;
    await usersCol.updateOne({ email: req.user!.email.toLowerCase() }, { $set: patch });
    res.send(await getUserByEmail(usersCol, req.user!.email));
  });

  registerPublic(app, { tuitionsCol, usersCol });
  registerStudent(app, { tuitionsCol, applicationsCol, usersCol });
  registerTutor(app, { tuitionsCol, applicationsCol, usersCol });
  registerAdmin(app, { usersCol, tuitionsCol, paymentsCol });
  registerPayments(app, { usersCol, paymentsCol, stripe, clientUrl });

  app.listen(port, () => console.log(`MentorLagbe server on ${port}`));
}

main().catch((err) => { console.error(err); process.exit(1); });
