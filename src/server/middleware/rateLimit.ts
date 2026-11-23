import type { NextFunction, Request, Response } from 'express';

interface AttemptBucket {
  count: number;
  firstAttemptAt: number;
  blockedUntil: number;
}

const LOGIN_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const LOGIN_LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes lockout
const MAX_FAILED_ATTEMPTS_PER_ACCOUNT = 5;
const MAX_FAILED_ATTEMPTS_PER_IP = 15;

const INQUIRY_WINDOW_MS = 15 * 60 * 1000;
const MAX_INQUIRIES_PER_IP = 10;

const loginAccountBuckets = new Map<string, AttemptBucket>();
const loginIpBuckets = new Map<string, AttemptBucket>();
const inquiryIpBuckets = new Map<string, AttemptBucket>();

function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim()) {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.socket.remoteAddress || 'unknown';
}

function getAccountKey(req: Request, username?: string): string {
  const ip = getClientIp(req);
  const cleanUser =
    typeof username === 'string' ? username.trim().toLowerCase() : '';
  return `${ip}:${cleanUser}`;
}

function isBlocked(bucket: AttemptBucket | undefined, now: number): number {
  if (!bucket) return 0;
  if (bucket.blockedUntil > now) {
    return Math.ceil((bucket.blockedUntil - now) / 1000);
  }
  return 0;
}

function bumpFailure(
  store: Map<string, AttemptBucket>,
  key: string,
  maxAttempts: number,
  now: number
): void {
  const existing = store.get(key);
  if (!existing || now - existing.firstAttemptAt > LOGIN_WINDOW_MS) {
    store.set(key, {
      count: 1,
      firstAttemptAt: now,
      blockedUntil: 0,
    });
    return;
  }

  existing.count += 1;
  if (existing.count >= maxAttempts) {
    existing.blockedUntil = now + LOGIN_LOCKOUT_MS;
  }
  store.set(key, existing);
}

export function loginRateLimiter(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const now = Date.now();
  const ip = getClientIp(req);
  const username =
    typeof (req.body as { username?: unknown })?.username === 'string'
      ? (req.body as { username: string }).username
      : '';
  const accountKey = getAccountKey(req, username);

  const retrySeconds = Math.max(
    isBlocked(loginAccountBuckets.get(accountKey), now),
    isBlocked(loginIpBuckets.get(ip), now)
  );

  if (retrySeconds > 0) {
    const retryMinutes = Math.max(1, Math.ceil(retrySeconds / 60));
    res.setHeader('Retry-After', String(retrySeconds));
    res.status(429).json({
      message: `Too many failed login attempts. Please try again in ${retryMinutes} minute${
        retryMinutes === 1 ? '' : 's'
      }.`,
    });
    return;
  }

  next();
}

export function recordLoginFailure(req: Request, username?: string): void {
  const now = Date.now();
  const ip = getClientIp(req);
  const accountKey = getAccountKey(req, username);
  bumpFailure(
    loginAccountBuckets,
    accountKey,
    MAX_FAILED_ATTEMPTS_PER_ACCOUNT,
    now
  );
  bumpFailure(loginIpBuckets, ip, MAX_FAILED_ATTEMPTS_PER_IP, now);
}

export function clearLoginFailures(req: Request, username?: string): void {
  const ip = getClientIp(req);
  const accountKey = getAccountKey(req, username);
  loginAccountBuckets.delete(accountKey);
  loginIpBuckets.delete(ip);
}

export function inquiryRateLimiter(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const now = Date.now();
  const ip = getClientIp(req);
  const existing = inquiryIpBuckets.get(ip);

  if (!existing || now - existing.firstAttemptAt > INQUIRY_WINDOW_MS) {
    inquiryIpBuckets.set(ip, {
      count: 1,
      firstAttemptAt: now,
      blockedUntil: 0,
    });
    next();
    return;
  }

  if (existing.count >= MAX_INQUIRIES_PER_IP) {
    const retrySeconds = Math.max(
      1,
      Math.ceil((existing.firstAttemptAt + INQUIRY_WINDOW_MS - now) / 1000)
    );
    res.setHeader('Retry-After', String(retrySeconds));
    res.status(429).json({
      message: 'Too many inquiries submitted. Please wait a few minutes and try again.',
    });
    return;
  }

  existing.count += 1;
  inquiryIpBuckets.set(ip, existing);
  next();
}
