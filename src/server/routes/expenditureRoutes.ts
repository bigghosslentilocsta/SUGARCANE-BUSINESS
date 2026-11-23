import { Router, type Response } from 'express';
import { repo } from '../config/db.ts';
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth.ts';

const router = Router();

router.use(requireAuth);

router.get('/', async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const rows = await repo.listExpenditures();
    res.json(rows);
  } catch (err) {
    console.error('List expenditures error:', err);
    res.status(500).json({ message: 'Failed to fetch expenditures.' });
  }
});

router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { date, truckNumber, driverName, description, amountPaid } =
      req.body as {
        date?: string;
        truckNumber?: string;
        driverName?: string;
        description?: string;
        amountPaid?: number | string;
      };

    if (amountPaid === undefined || amountPaid === '') {
      res.status(400).json({
        message: 'Amount paid is required.',
      });
      return;
    }

    const numericAmount = Number(amountPaid);
    if (Number.isNaN(numericAmount) || numericAmount < 0) {
      res.status(400).json({ message: 'Amount paid must be a valid number.' });
      return;
    }

    const created = await repo.createExpenditure({
      date,
      truckNumber: truckNumber || '',
      driverName: driverName || '',
      description: description || '',
      amountPaid: numericAmount,
    });

    res.status(201).json(created);
  } catch (err) {
    console.error('Create expenditure error:', err);
    res.status(500).json({ message: 'Failed to record expenditure.' });
  }
});

router.put('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const { date, truckNumber, driverName, description, amountPaid } =
      req.body as {
        date?: string;
        truckNumber?: string;
        driverName?: string;
        description?: string;
        amountPaid?: number | string;
      };

    const updated = await repo.updateExpenditure(id, {
      ...(date ? { date } : {}),
      ...(truckNumber !== undefined ? { truckNumber: truckNumber.trim() } : {}),
      ...(driverName !== undefined ? { driverName: driverName.trim() } : {}),
      ...(description !== undefined ? { description: description.trim() } : {}),
      ...(amountPaid !== undefined ? { amountPaid: Number(amountPaid) } : {}),
    });

    if (!updated) {
      res.status(404).json({ message: 'Expenditure record not found.' });
      return;
    }

    res.json(updated);
  } catch (err) {
    console.error('Update expenditure error:', err);
    res.status(500).json({ message: 'Failed to update expenditure.' });
  }
});

router.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const deleted = await repo.deleteExpenditure(id);
    if (!deleted) {
      res.status(404).json({ message: 'Expenditure record not found.' });
      return;
    }
    res.json({ message: 'Expenditure deleted successfully.' });
  } catch (err) {
    console.error('Delete expenditure error:', err);
    res.status(500).json({ message: 'Failed to delete expenditure.' });
  }
});

export default router;
