import { Express } from 'express';
import { Collection } from 'mongodb';
import Stripe from 'stripe';
import { verifyToken, AuthRequest } from '../middleware';
import { getUserByEmail, ensureUser } from '../utils';

export default function registerPayments(app: Express, { usersCol, paymentsCol, stripe, clientUrl }: { usersCol: Collection; paymentsCol: Collection; stripe: Stripe | null; clientUrl: string }) {
  app.post('/api/create-checkout-session', verifyToken, async (req: AuthRequest, res) => {
    if (!stripe) return res.status(500).send({ message: 'Stripe not configured' });
    const user: any = await getUserByEmail(usersCol, req.user!.email);
    if (!user) return res.status(404).send({ message: 'User not found' });
    const plan = user.role === 'tutor'
      ? { name: 'Pro Tutor', amount: Number(process.env.STRIPE_TUTOR_PRICE || 1500) }
      : { name: 'Pro Student', amount: Number(process.env.STRIPE_STUDENT_PRICE || 1000) };
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [{ price_data: { currency: 'usd', product_data: { name: plan.name, description: 'MentorLagbe Pro Plan' }, unit_amount: plan.amount }, quantity: 1 }],
      customer_email: user.email,
      metadata: { email: user.email, name: user.name || '', role: user.role, planName: plan.name },
      success_url: `${clientUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${clientUrl}/payment/cancel`,
    });
    res.send({ url: session.url });
  });

  app.post('/api/payments/confirm', verifyToken, async (req: AuthRequest, res) => {
    if (!stripe) return res.status(500).send({ message: 'Stripe not configured' });
    const { sessionId } = req.body || {};
    if (!sessionId) return res.status(400).send({ message: 'sessionId required' });
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== 'paid') return res.status(400).send({ message: 'Payment not completed' });
    const email = (session.metadata?.email || req.user!.email).toLowerCase();
    await ensureUser(usersCol, email, { plan: 'pro' });
    await paymentsCol.updateOne({ stripeSessionId: session.id }, { $set: {
      userEmail: email, userName: session.metadata?.name || '', userRole: session.metadata?.role || req.user!.role,
      planName: session.metadata?.planName || 'Pro', amount: (session.amount_total || 0) / 100, currency: session.currency || 'usd',
      transactionId: (session.payment_intent as string) || session.id, stripeSessionId: session.id, paymentStatus: 'paid', paidAt: new Date(),
    } }, { upsert: true });
    const user = await getUserByEmail(usersCol, email);
    res.send({ ok: true, plan: (user as any)?.plan || 'pro' });
  });
}
