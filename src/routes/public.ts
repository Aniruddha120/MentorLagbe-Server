import { Express } from 'express';
import { Collection, ObjectId } from 'mongodb';

export default function registerPublic(app: Express, { tuitionsCol, usersCol }: { tuitionsCol: Collection; usersCol: Collection }) {
  app.get('/api/tuitions', async (req, res) => {
    const { search = '', subject, classLevel, mode, sort = 'latest', page = '1', limit = '12' } = req.query as any;
    const query: any = { approvalStatus: 'approved', isActive: true };
    if (search) query.$or = [{ title: { $regex: search, $options: 'i' } }, { subject: { $regex: search, $options: 'i' } }];
    if (subject) query.subject = { $regex: `^${subject}$`, $options: 'i' };
    if (classLevel) query.classLevel = { $regex: classLevel, $options: 'i' };
    if (mode) query.mode = mode;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(50, parseInt(limit, 10) || 12));
    const sortObj: any = sort === 'feeAsc' ? { monthlyFee: 1 } : sort === 'feeDesc' ? { monthlyFee: -1 } : { createdAt: -1 };
    const [items, total] = await Promise.all([
      tuitionsCol.find(query).sort(sortObj).skip((pageNum - 1) * limitNum).limit(limitNum).toArray(),
      tuitionsCol.countDocuments(query),
    ]);
    res.send({ items, total, page: pageNum, pages: Math.ceil(total / limitNum) });
  });

  app.get('/api/tuitions/:id', async (req, res) => {
    if (!ObjectId.isValid(req.params.id)) return res.status(400).send({ message: 'Invalid id' });
    const tuition = await tuitionsCol.findOne({ _id: new ObjectId(req.params.id) });
    if (!tuition) return res.status(404).send({ message: 'Not found' });
    const tutor = await usersCol.findOne({ email: (tuition.tutorEmail || '').toLowerCase() }, { projection: { name: 1, email: 1, image: 1, bio: 1, plan: 1 } });
    res.send({ ...tuition, tutor });
  });
}
