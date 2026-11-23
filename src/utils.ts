import { Collection } from 'mongodb';

export async function getUserByEmail(usersCol: Collection, email: string) {
  return usersCol.findOne({ email: (email || '').toLowerCase() });
}

export async function ensureUser(usersCol: Collection, email: string, patch: Record<string, any> = {}) {
  const e = (email || '').toLowerCase();
  if (!e) return null;
  const now = new Date();
  await usersCol.updateOne(
    { email: e },
    { $setOnInsert: { email: e, role: 'student', plan: 'free', createdAt: now }, $set: { updatedAt: now, ...patch } },
    { upsert: true }
  );
  return getUserByEmail(usersCol, e);
}
