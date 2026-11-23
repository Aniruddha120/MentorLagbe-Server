import { Express } from 'express';
import { Collection, ObjectId } from 'mongodb';
import { verifyToken, verifyAdmin } from '../middleware';

export default function registerAdmin(app: Express, { usersCol, tuitionsCol, paymentsCol }: { usersCol: Collection; tuitionsCol: Collection; paymentsCol: Collection }) {
  app.get('/api/admin/stats', verifyToken, verifyAdmin, async (_req, res) => {
    const [totalUsers, totalTutors, pendingTuitions, approvedTuitions, revenueAgg] = await Promise.all([
      usersCol.countDocuments({}), usersCol.countDocuments({ role: 'tutor' }),
      tuitionsCol.countDocuments({ approvalStatus: 'pending' }), tuitionsCol.countDocuments({ approvalStatus: 'approved' }),
      paymentsCol.aggregate([{ $match: { paymentStatus: 'paid' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]).toArray(),
    ]);
    res.send({ totalUsers, totalTutors, pendingTuitions, approvedTuitions, totalRevenue: (revenueAgg[0] as any)?.total || 0 });
  });

  app.get('/api/admin/users', verifyToken, verifyAdmin, async (_req, res) => {
    res.send(await usersCol.find({}, { projection: { name: 1, email: 1, role: 1, plan: 1, image: 1, createdAt: 1 } }).sort({ createdAt: -1 }).toArray());
  });

  app.patch('/api/admin/users/:id/role', verifyToken, verifyAdmin, async (req, res) => {
    const { role } = req.body || {};
    if (!['student','tutor','admin'].includes(role)) return res.status(400).send({ message: 'Invalid role' });
    if (!ObjectId.isValid(req.params.id)) return res.status(400).send({ message: 'Invalid id' });
    await usersCol.updateOne({ _id: new ObjectId(req.params.id) }, { $set: { role } });
    res.send({ ok: true });
  });

  app.get('/api/admin/tuitions', verifyToken, verifyAdmin, async (_req, res) => {
    res.send(await tuitionsCol.find({}).sort({ createdAt: -1 }).toArray());
  });

  app.patch('/api/admin/tuitions/:id/status', verifyToken, verifyAdmin, async (req, res) => {
    const { approvalStatus } = req.body || {};
    if (!['approved','rejected','pending'].includes(approvalStatus)) return res.status(400).send({ message: 'Invalid status' });
    if (!ObjectId.isValid(req.params.id)) return res.status(400).send({ message: 'Invalid id' });
    await tuitionsCol.updateOne({ _id: new ObjectId(req.params.id) }, { $set: { approvalStatus } });
    res.send({ ok: true });
  });

  app.get('/api/admin/transactions', verifyToken, verifyAdmin, async (_req, res) => {
    res.send(await paymentsCol.find({}).sort({ paidAt: -1 }).toArray());
  });
}
