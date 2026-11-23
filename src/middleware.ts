import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: { email: string; role: string; id: string };
}

export function signToken(user: any) {
  return jwt.sign(
    { email: user.email, role: user.role, id: String(user._id || user.id || '') },
    process.env.JWT_SECRET as string,
    { expiresIn: '7d' }
  );
}

export function verifyToken(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).send({ message: 'Unauthorized' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET as string) as any;
    next();
  } catch {
    return res.status(401).send({ message: 'Invalid token' });
  }
}

const verifyRole = (...roles: string[]) => (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user || !roles.includes(req.user.role)) return res.status(403).send({ message: 'Forbidden' });
  next();
};

export const verifyStudent = verifyRole('student');
export const verifyTutor = verifyRole('tutor');
export const verifyAdmin = verifyRole('admin');
