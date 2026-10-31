import { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../lib/firebase-admin.ts';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET.length < 32) throw new Error('JWT_SECRET must be configured securely (32+ characters)');

export interface AuthRequest extends Request {
  user?: {
    uid: string;
    email: string;
    displayName?: string;
  };
}

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing token' });
  }

  const token = authHeader.split('Bearer ')[1];
  
  // Try Firebase ID token first
  try {
    const decodedFirebase = await adminAuth.verifyIdToken(token);
    req.user = {
      uid: decodedFirebase.uid,
      email: decodedFirebase.email || '',
      displayName: decodedFirebase.name,
    };
    return next();
  } catch (fbError) {
    // If not Firebase token, check if it's our signed JWT
    try {
      const decodedJwt = jwt.verify(token, JWT_SECRET) as { uid: string; email: string; displayName?: string };
      req.user = {
        uid: decodedJwt.uid,
        email: decodedJwt.email,
        displayName: decodedJwt.displayName,
      };
      return next();
    } catch (jwtError) {
      console.error('Token verification error:', fbError, jwtError);
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
  }
};

export { JWT_SECRET };
