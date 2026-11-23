import { betterAuth } from 'better-auth';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import { admin } from 'better-auth/plugins';
import { MongoClient, Db } from 'mongodb';

export function createAuth(db: Db, mongoClient: MongoClient, clientUrl: string) {
  const prod = process.env.NODE_ENV === 'production';
  return betterAuth({
    baseURL: process.env.BETTER_AUTH_URL || `http://localhost:${process.env.PORT || 5000}`,
    secret: process.env.BETTER_AUTH_SECRET,
    trustedOrigins: [clientUrl, 'http://localhost:3000', 'http://localhost:3001'],
    database: mongodbAdapter(db, { client: mongoClient }),
    emailAndPassword: { enabled: true, minPasswordLength: 6 },
    advanced: {
      defaultCookieAttributes: {
        sameSite: prod ? 'none' : 'lax',
        secure: prod,
        httpOnly: true,
      },
    },
    user: {
      additionalFields: {
        role: { type: 'string', required: false, defaultValue: 'student', input: true },
        phone: { type: 'string', required: false, input: true },
        bio: { type: 'string', required: false, input: true },
        plan: { type: 'string', required: false, defaultValue: 'free', input: false },
      },
    },
    plugins: [admin()],
  });
}
