import bcrypt from 'bcryptjs';
import { Router, type Request, type Response } from 'express';
import { repo } from '../config/db.ts';
import {
  requireAuth,
  signOwnerToken,
  type AuthenticatedRequest,
} from '../middleware/auth.ts';
import {
  clearLoginFailures,
  loginRateLimiter,
  recordLoginFailure,
} from '../middleware/rateLimit.ts';

const router = Router();

const SESSION_MAX_AGE_MS = 12 * 60 * 60 * 1000;

function isHttpsRequest(req: Request): boolean {
  if (req.secure) return true;
  const proto = req.headers['x-forwarded-proto'];
  if (typeof proto === 'string') {
    return proto.split(',')[0].trim() === 'https';
  }
  return false;
}

function setSessionCookie(req: Request, res: Response, token: string): void {
  const secure = isHttpsRequest(req);
  res.cookie('mss_token', token, {
    httpOnly: true,
    sameSite: secure ? 'none' : 'lax',
    secure,
    path: '/',
    maxAge: SESSION_MAX_AGE_MS,
  });
}

function clearSessionCookie(req: Request, res: Response): void {
  const secure = isHttpsRequest(req);
  res.clearCookie('mss_token', {
    httpOnly: true,
    sameSite: secure ? 'none' : 'lax',
    secure,
    path: '/',
  });
}

router.use((_req, res, next) => {
  res.setHeader(
    'Cache-Control',
    'no-store, no-cache, must-revalidate, private'
  );
  res.setHeader('Pragma', 'no-cache');
  next();
});

router.post('/login', loginRateLimiter, async (req: Request, res: Response) => {
  try {
    const body = req.body as {
      username?: unknown;
      password?: unknown;
    };

    const username =
      typeof body?.username === 'string' ? body.username.trim() : '';
    const password = typeof body?.password === 'string' ? body.password : '';

    if (!username || !password || username.length > 100 || password.length > 200) {
      res.status(400).json({ message: 'Valid username and password are required.' });
      return;
    }

    const user = await repo.findUserByUsername(username);
    if (!user) {
      recordLoginFailure(req, username);
      res.status(401).json({ message: 'Invalid username or password.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      recordLoginFailure(req, username);
      res.status(401).json({ message: 'Invalid username or password.' });
      return;
    }

    clearLoginFailures(req, username);

    const token = signOwnerToken({
      userId: user._id,
      username: user.username,
      tokenVersion: user.tokenVersion ?? 0,
    });

    setSessionCookie(req, res, token);

    res.json({
      token,
      user: {
        _id: user._id,
        username: user.username,
        fullName: user.fullName,
        businessName: user.businessName,
        role: user.role,
        phone: user.phone,
        email: user.email,
        warehouseAddress: user.warehouseAddress,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Failed to authenticate owner.' });
  }
});

router.post('/logout', (req: Request, res: Response) => {
  clearSessionCookie(req, res);
  res.json({ message: 'Signed out successfully.' });
});

router.post(
  '/logout-all',
  requireAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      await repo.incrementTokenVersion(req.user!.userId);
      clearSessionCookie(req, res);
      res.json({ message: 'All active owner sessions have been signed out.' });
    } catch (err) {
      console.error('Logout all error:', err);
      res.status(500).json({ message: 'Failed to revoke sessions.' });
    }
  }
);

router.get('/me', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await repo.findUserById(req.user!.userId);
    if (!user) {
      res.status(404).json({ message: 'Owner account not found.' });
      return;
    }
    res.json({
      _id: user._id,
      username: user.username,
      fullName: user.fullName,
      businessName: user.businessName,
      role: user.role,
      phone: user.phone,
      email: user.email,
      warehouseAddress: user.warehouseAddress,
    });
  } catch (err) {
    console.error('Auth me error:', err);
    res.status(500).json({ message: 'Failed to fetch owner profile.' });
  }
});

router.put('/profile', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { fullName, businessName, role, phone, email, warehouseAddress } =
      req.body as {
        fullName?: string;
        businessName?: string;
        role?: string;
        phone?: string;
        email?: string;
        warehouseAddress?: string;
      };

    const updated = await repo.updateUserProfile(req.user!.userId, {
      ...(typeof fullName === 'string' && fullName.trim()
        ? { fullName: fullName.trim().slice(0, 120) }
        : {}),
      ...(typeof businessName === 'string' && businessName.trim()
        ? { businessName: businessName.trim().slice(0, 160) }
        : {}),
      ...(typeof role === 'string' && role.trim()
        ? { role: role.trim().slice(0, 80) }
        : {}),
      ...(typeof phone === 'string' && phone.trim()
        ? { phone: phone.trim().slice(0, 30) }
        : {}),
      ...(typeof email === 'string' && email.trim()
        ? { email: email.trim().slice(0, 120) }
        : {}),
      ...(typeof warehouseAddress === 'string' && warehouseAddress.trim()
        ? { warehouseAddress: warehouseAddress.trim().slice(0, 300) }
        : {}),
    });

    if (!updated) {
      res.status(404).json({ message: 'Owner profile not found.' });
      return;
    }

    res.json({
      _id: updated._id,
      username: updated.username,
      fullName: updated.fullName,
      businessName: updated.businessName,
      role: updated.role,
      phone: updated.phone,
      email: updated.email,
      warehouseAddress: updated.warehouseAddress,
    });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ message: 'Failed to update profile.' });
  }
});

router.put(
  '/change-password',
  requireAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { currentPassword, newPassword, confirmPassword } = req.body as {
        currentPassword?: string;
        newPassword?: string;
        confirmPassword?: string;
      };

      if (
        typeof currentPassword !== 'string' ||
        typeof newPassword !== 'string' ||
        typeof confirmPassword !== 'string' ||
        !currentPassword ||
        !newPassword ||
        !confirmPassword
      ) {
        res.status(400).json({ message: 'All password fields are required.' });
        return;
      }

      if (newPassword.length < 6 || newPassword.length > 200) {
        res
          .status(400)
          .json({ message: 'New password must be between 6 and 200 characters.' });
        return;
      }

      if (newPassword !== confirmPassword) {
        res
          .status(400)
          .json({ message: 'New password and confirmation do not match.' });
        return;
      }

      if (newPassword === currentPassword) {
        res
          .status(400)
          .json({ message: 'New password must differ from your current password.' });
        return;
      }

      const user = await repo.findUserById(req.user!.userId);
      if (!user) {
        res.status(404).json({ message: 'Owner account not found.' });
        return;
      }

      const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isValid) {
        res.status(400).json({ message: 'Current password is incorrect.' });
        return;
      }

      const nextHash = await bcrypt.hash(newPassword, 10);
      const { updated, tokenVersion } = await repo.updateUserPassword(
        user._id,
        nextHash
      );
      if (!updated) {
        res.status(500).json({ message: 'Failed to update password.' });
        return;
      }

      const freshToken = signOwnerToken({
        userId: user._id,
        username: user.username,
        tokenVersion,
      });
      setSessionCookie(req, res, freshToken);

      res.json({
        message: 'Password updated successfully. Other sessions have been signed out.',
        token: freshToken,
      });
    } catch (err) {
      console.error('Change password error:', err);
      res.status(500).json({ message: 'Failed to update password.' });
    }
  }
);

export default router;
