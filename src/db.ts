import { MongoClient, ServerApiVersion, Db } from 'mongodb';

export const client = new MongoClient(process.env.MONGODB_URI as string, {
  serverApi: { version: ServerApiVersion.v1, strict: false, deprecationErrors: true },
});

let db: Db | null = null;

export async function connectDB(): Promise<Db> {
  if (db) return db;
  await client.connect();
  db = client.db(process.env.DB_NAME || 'mentorlagbe');
  return db;
}

export function getDB(): Db {
  if (!db) throw new Error('DB not connected');
  return db;
}
