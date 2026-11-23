import crypto from 'crypto';
import type { NextFunction, Request, Response } from 'express';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import path from 'path';
import { repo } from '../config/db.ts';

const SECRET_FILE = path.resolve(process.cwd(), 'data', '.jwt_secret');
let cachedSecret: string | null = null;

function getJwtSecret(): string {
  if (cachedSecret) return cachedSecret;

  const envSecret = process.env.JWT_SECRET?.trim();
  if (envSecret && envSecret.length >= 16) {
    cachedSecret = envSecret;
    return cachedSecret;
  }

  try {
    const dir = path.dirname(SECRET_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (fs.existsSync(SECRET_FILE)) {
      const existing = fs.readFileSync(SECRET_FILE, 'utf-8').trim();
      if (existing.length >= 32) {
        cachedSecret = existing;
        return cachedSecret;
      }
    }
    const generated = crypto.randomBytes(48).toString('hex');
    fs.writeFileSync(SECRET_FILE, generated, { mode: 0o600, encoding: 'utf-8' });
    cachedSecret = generated;
    return cachedSecret;
  } catch {
    // Ephemeral cryptographic fallback if filesystem is read-only
    cachedSecret = crypto.randomBytes(48).toString('hex');
    return cachedSecret;
  }
}

export function createScopedHmac(value: string): string {
  return crypto
    .createHmac('sha256', getJwtSecret())
    .update(value)
    .digest('hex');
}

export function verifyScopedHmac(value: string, signature: string): boolean {
  if (typeof signature !== 'string' || !signature) return false;
  const expected = createScopedHmac(value);
  const a = Buffer.from(expected, 'utf8');
  const b = Buffer.from(signature, 'utf8');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export interface AuthPayload {
  userId: string;
  username: string;
  tokenVersion: number;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthPayload;
}

export function signOwnerToken(payload: AuthPayload): string {
  return jwt.sign(
    {
      userId: payload.userId,
      username: payload.username,
      tokenVersion: payload.tokenVersion,
    },
    getJwtSecret(),
    {
      algorithm: 'HS256',
      expiresIn: '12h',
    }
  );
}

export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  res.setHeader(
    'Cache-Control',
    'no-store, no-cache, must-revalidate, private'
  );
  res.setHeader('Pragma', 'no-cache');

  const cookieToken = req.cookies?.mss_token;
  const authHeader = req.headers.authorization;
  const bearerToken =
    authHeader && authHeader.startsWith('Bearer ')
      ? authHeader.slice(7).trim()
      : undefined;

  const token = bearerToken || cookieToken;
  if (!token) {
    res.status(401).json({ message: 'Authentication required.' });
    return;
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret(), {
      algorithms: ['HS256'],
    }) as Partial<AuthPayload>;

    if (!decoded || typeof decoded.userId !== 'string') {
      res.status(401).json({ message: 'Invalid session token.' });
      return;
    }

    const user = await repo.findUserById(decoded.userId);
    if (!user) {
      res.status(401).json({ message: 'Owner account no longer exists.' });
      return;
    }

    const currentVersion = user.tokenVersion ?? 0;
    const tokenVersion =
      typeof decoded.tokenVersion === 'number' ? decoded.tokenVersion : 0;

    if (currentVersion !== tokenVersion) {
      res.status(401).json({
        message: 'Session has been revoked. Please sign in again.',
      });
      return;
    }

    req.user = {
      userId: user._id,
      username: user.username,
      tokenVersion: currentVersion,
    };
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired session token.' });
  }
}
