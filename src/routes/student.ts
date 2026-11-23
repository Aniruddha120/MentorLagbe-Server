import { Express } from 'express';
import { Collection, ObjectId } from 'mongodb';
import { verifyToken, verifyStudent, AuthRequest } from '../middleware';
import { getUserByEmail } from '../utils';

export default function registerStudent(app: Express, { tuitionsCol, applicationsCol, usersCol }: { tuitionsCol: Collection; applicationsCol: Collection; usersCol: Collection }) {
  app.post('/api/applications', verifyToken, verifyStudent, async (req: AuthRequest, res) => {
    const { tuitionId, studentPhone, preferredSchedule, studentNote } = req.body || {};
    if (!ObjectId.isValid(tuitionId)) return res.status(400).send({ message: 'Invalid tuition' });
    const tuition = await tuitionsCol.findOne({ _id: new ObjectId(tuitionId), approvalStatus: 'approved', isActive: true });
    if (!tuition) return res.status(404).send({ message: 'Tuition not available' });
    const email = req.user!.email.toLowerCase();
    if (await applicationsCol.findOne({ tuitionId: tuition._id, studentEmail: email })) return res.status(409).send({ message: 'Already applied' });
    const student = await getUserByEmail(usersCol, email);
    const doc = {
      tuitionId: tuition._id, tuitionTitle: tuition.title, subject: tuition.subject, monthlyFee: tuition.monthlyFee,
      tutorEmail: tuition.tutorEmail, tutorName: tuition.tutorName, studentName: (student as any)?.name || email, studentEmail: email,
      studentPhone: studentPhone || (student as any)?.phone || '', preferredSchedule: preferredSchedule || '', studentNote: studentNote || '',
      status: 'pending', appliedAt: new Date(),
    };
    const result = await applicationsCol.insertOne(doc);
    res.send({ ...doc, _id: result.insertedId });
  });

  app.get('/api/applications/my', verifyToken, verifyStudent, async (req: AuthRequest, res) => {
    res.send(await applicationsCol.find({ studentEmail: req.user!.email.toLowerCase() }).sort({ appliedAt: -1 }).toArray());
  });

  app.delete('/api/applications/:id', verifyToken, verifyStudent, async (req: AuthRequest, res) => {
    if (!ObjectId.isValid(req.params.id)) return res.status(400).send({ message: 'Invalid id' });
    const appDoc: any = await applicationsCol.findOne({ _id: new ObjectId(req.params.id), studentEmail: req.user!.email.toLowerCase() });
    if (!appDoc) return res.status(404).send({ message: 'Not found' });
    if (appDoc.status !== 'pending') return res.status(400).send({ message: 'Only pending applications can be cancelled' });
    await applicationsCol.deleteOne({ _id: appDoc._id });
    res.send({ ok: true });
  });

  app.get('/api/student/stats', verifyToken, verifyStudent, async (req: AuthRequest, res) => {
    const email = req.user!.email.toLowerCase();
    const [totalApplied, accepted, pending, user] = await Promise.all([
      applicationsCol.countDocuments({ studentEmail: email }),
      applicationsCol.countDocuments({ studentEmail: email, status: 'accepted' }),
      applicationsCol.countDocuments({ studentEmail: email, status: 'pending' }),
      getUserByEmail(usersCol, email),
    ]);
    res.send({ totalApplied, accepted, pending, plan: (user as any)?.plan || 'free' });
  });
}
