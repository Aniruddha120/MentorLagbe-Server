import { Express } from 'express';
import { Collection, ObjectId } from 'mongodb';
import { verifyToken, verifyTutor, AuthRequest } from '../middleware';
import { getUserByEmail } from '../utils';

export default function registerTutor(app: Express, { tuitionsCol, applicationsCol, usersCol }: { tuitionsCol: Collection; applicationsCol: Collection; usersCol: Collection }) {
  app.get('/api/tutor/stats', verifyToken, verifyTutor, async (req: AuthRequest, res) => {
    const email = req.user!.email.toLowerCase();
    const [totalTuitions, approvedTuitions, applicants, user] = await Promise.all([
      tuitionsCol.countDocuments({ tutorEmail: email }),
      tuitionsCol.countDocuments({ tutorEmail: email, approvalStatus: 'approved', isActive: true }),
      applicationsCol.countDocuments({ tutorEmail: email }),
      getUserByEmail(usersCol, email),
    ]);
    res.send({ totalTuitions, approvedTuitions, applicants, plan: (user as any)?.plan || 'free' });
  });

  app.post('/api/tutor/tuitions', verifyToken, verifyTutor, async (req: AuthRequest, res) => {
    const user: any = await getUserByEmail(usersCol, req.user!.email);
    const count = await tuitionsCol.countDocuments({ tutorEmail: req.user!.email.toLowerCase() });
    if ((user?.plan || 'free') !== 'pro' && count >= 2) return res.status(403).send({ message: 'Free plan limit reached (2 tuitions). Upgrade to Pro.' });
    const b = req.body || {};
    for (const k of ['title','subject','classLevel','mode','location','monthlyFee','daysPerWeek','description']) if (!b[k]) return res.status(400).send({ message: `${k} is required` });
    const doc = {
      title: b.title, subject: b.subject, classLevel: b.classLevel, mode: b.mode, location: b.location,
      monthlyFee: Number(b.monthlyFee), daysPerWeek: Number(b.daysPerWeek), bannerImage: b.bannerImage || '', description: b.description,
      tutorName: user?.name || req.user!.email, tutorEmail: req.user!.email.toLowerCase(), approvalStatus: 'pending', isActive: true, createdAt: new Date(),
    };
    const result = await tuitionsCol.insertOne(doc);
    res.send({ ...doc, _id: result.insertedId });
  });

  app.get('/api/tutor/tuitions', verifyToken, verifyTutor, async (req: AuthRequest, res) => {
    res.send(await tuitionsCol.find({ tutorEmail: req.user!.email.toLowerCase() }).sort({ createdAt: -1 }).toArray());
  });

  app.patch('/api/tutor/tuitions/:id', verifyToken, verifyTutor, async (req: AuthRequest, res) => {
    if (!ObjectId.isValid(req.params.id)) return res.status(400).send({ message: 'Invalid id' });
    const b = req.body || {}; const patch: any = {};
    ['title','subject','classLevel','mode','location','monthlyFee','daysPerWeek','bannerImage','description','isActive'].forEach(k => {
      if (b[k] !== undefined) patch[k] = (k === 'monthlyFee' || k === 'daysPerWeek') ? Number(b[k]) : b[k];
    });
    const result = await tuitionsCol.updateOne({ _id: new ObjectId(req.params.id), tutorEmail: req.user!.email.toLowerCase() }, { $set: patch });
    if (!result.matchedCount) return res.status(404).send({ message: 'Not found' });
    res.send({ ok: true });
  });

  app.delete('/api/tutor/tuitions/:id', verifyToken, verifyTutor, async (req: AuthRequest, res) => {
    if (!ObjectId.isValid(req.params.id)) return res.status(400).send({ message: 'Invalid id' });
    const oid = new ObjectId(req.params.id);
    const result = await tuitionsCol.deleteOne({ _id: oid, tutorEmail: req.user!.email.toLowerCase() });
    if (!result.deletedCount) return res.status(404).send({ message: 'Not found' });
    await applicationsCol.deleteMany({ tuitionId: oid });
    res.send({ ok: true });
  });

  app.get('/api/tutor/applicants', verifyToken, verifyTutor, async (req: AuthRequest, res) => {
    res.send(await applicationsCol.find({ tutorEmail: req.user!.email.toLowerCase() }).sort({ appliedAt: -1 }).toArray());
  });

  app.patch('/api/tutor/applications/:id', verifyToken, verifyTutor, async (req: AuthRequest, res) => {
    const { status } = req.body || {};
    if (!['accepted', 'rejected'].includes(status)) return res.status(400).send({ message: 'Invalid status' });
    if (!ObjectId.isValid(req.params.id)) return res.status(400).send({ message: 'Invalid id' });
    const result = await applicationsCol.updateOne({ _id: new ObjectId(req.params.id), tutorEmail: req.user!.email.toLowerCase() }, { $set: { status } });
    if (!result.matchedCount) return res.status(404).send({ message: 'Not found' });
    res.send({ ok: true });
  });
}
