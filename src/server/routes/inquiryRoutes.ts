import { Router, type Request, type Response } from 'express';
import { repo } from '../config/db.ts';
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth.ts';
import { inquiryRateLimiter } from '../middleware/rateLimit.ts';
import type { QuoteStatus } from '../models/Inquiry.ts';

const router = Router();

const VALID_STATUSES: QuoteStatus[] = ['New', 'Contacted', 'Quoted', 'Closed'];

// Public endpoint: saves quote for the owner Quotes page
router.post('/', inquiryRateLimiter, async (req: Request, res: Response) => {
  try {
    const { name, phone, company, message } = req.body as {
      name?: unknown;
      phone?: unknown;
      company?: unknown;
      message?: unknown;
    };

    const cleanName = typeof name === 'string' ? name.trim() : '';
    const cleanPhone = typeof phone === 'string' ? phone.trim() : '';
    const cleanCompany = typeof company === 'string' ? company.trim() : '';
    const cleanMessage = typeof message === 'string' ? message.trim() : '';

    if (!cleanName || !cleanPhone || !cleanMessage) {
      res
        .status(400)
        .json({ message: 'Name, phone number, and message are required.' });
      return;
    }

    if (
      cleanName.length > 120 ||
      cleanPhone.length > 30 ||
      cleanCompany.length > 160 ||
      cleanMessage.length > 2000
    ) {
      res
        .status(400)
        .json({ message: 'One or more quote fields exceed allowed length.' });
      return;
    }

    const created = await repo.createInquiry({
      name: cleanName,
      phone: cleanPhone,
      company: cleanCompany,
      message: cleanMessage,
    });

    res.status(201).json({
      message:
        'Your quote request has been received. Our team will reach out shortly.',
      inquiryId: created._id,
    });
  } catch (err) {
    console.error('Create inquiry error:', err);
    res.status(500).json({ message: 'Failed to submit quote request.' });
  }
});

// Owner-only endpoints
router.get('/', requireAuth, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const quotes = await repo.listInquiries();
    res.json({ quotes });
  } catch (err) {
    console.error('List inquiries error:', err);
    res.status(500).json({ message: 'Failed to load quotes.' });
  }
});

router.patch(
  '/:id/status',
  requireAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const id = String(req.params.id);
      const { status } = req.body as { status?: unknown };

      if (
        typeof status !== 'string' ||
        !VALID_STATUSES.includes(status as QuoteStatus)
      ) {
        res.status(400).json({ message: 'Invalid quote status.' });
        return;
      }

      const updated = await repo.updateInquiryStatus(id, status as QuoteStatus);
      if (!updated) {
        res.status(404).json({ message: 'Quote not found.' });
        return;
      }
      res.json(updated);
    } catch (err) {
      console.error('Update quote status error:', err);
      res.status(500).json({ message: 'Failed to update quote status.' });
    }
  }
);

router.delete(
  '/:id',
  requireAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const id = String(req.params.id);
      const deleted = await repo.deleteInquiry(id);
      if (!deleted) {
        res.status(404).json({ message: 'Quote not found.' });
        return;
      }
      res.json({ message: 'Quote deleted successfully.' });
    } catch (err) {
      console.error('Delete quote error:', err);
      res.status(500).json({ message: 'Failed to delete quote.' });
    }
  }
);

export default router;
