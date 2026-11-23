import { Collection } from 'mongodb';

export async function getUserByEmail(usersCol: Collection, email: string) {
  return usersCol.findOne({ email: (email || '').toLowerCase() });
}

export async function ensureUser(usersCol: Collection, email: string, patch: Record<string, any> = {}) {
  const e = (email || '').toLowerCase();
  if (!e) return null;
  const now = new Date();
  const setOnInsert: Record<string, any> = { email: e, role: 'student', plan: 'free', createdAt: now };
  const set: Record<string, any> = { updatedAt: now, ...patch };
  for (const k of Object.keys(set)) delete setOnInsert[k];
  await usersCol.updateOne({ email: e }, { $setOnInsert: setOnInsert, $set: set }, { upsert: true });
  return getUserByEmail(usersCol, e);
}
