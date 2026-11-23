import { Router, type Response } from 'express';
import { repo } from '../config/db.ts';
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth.ts';
import type { SettlementStatus } from '../models/Transaction.ts';

const router = Router();

router.use(requireAuth);

router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clientId =
      typeof req.query.clientId === 'string' && req.query.clientId.trim()
        ? req.query.clientId.trim()
        : undefined;
    const date =
      typeof req.query.date === 'string' && req.query.date.trim()
        ? req.query.date.trim()
        : undefined;
    const status =
      typeof req.query.status === 'string' &&
      (req.query.status === 'Paid' || req.query.status === 'Not Paid')
        ? req.query.status
        : undefined;
    const showAll = req.query.showAll === 'true';

    const hasFilters = Boolean(clientId || date || status);
    // Default to latest 5 transactions when no filters are applied
    const limit = !hasFilters && !showAll ? 5 : undefined;

    const result = await repo.listTransactions({
      clientId,
      date,
      status,
      limit,
    });

    res.json({
      transactions: result.rows,
      totalCount: result.totalCount,
      isDefaultLatestFive: !hasFilters && !showAll,
    });
  } catch (err) {
    console.error('List transactions error:', err);
    res.status(500).json({ message: 'Failed to fetch transactions.' });
  }
});

router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { clientId, quantity, unit, amount, status, date, notes } =
      req.body as {
        clientId?: string;
        quantity?: number | string;
        unit?: string;
        amount?: number | string;
        status?: SettlementStatus;
        date?: string;
        notes?: string;
      };

    if (!clientId) {
      res.status(400).json({ message: 'Please select a client from the list.' });
      return;
    }

    const client = await repo.getClientById(clientId);
    if (!client) {
      res.status(404).json({ message: 'Selected client not found.' });
      return;
    }

    const numQty = Number(quantity);
    const numAmount = Number(amount);
    if (Number.isNaN(numQty) || numQty <= 0) {
      res.status(400).json({ message: 'Quantity must be greater than zero.' });
      return;
    }
    if (Number.isNaN(numAmount) || numAmount < 0) {
      res.status(400).json({ message: 'Amount must be a valid number.' });
      return;
    }

    const validStatus: SettlementStatus =
      status === 'Paid' ? 'Paid' : 'Not Paid';

    const created = await repo.createTransaction({
      clientId: client._id,
      clientName: client.name,
      quantity: numQty,
      unit: unit || 'Tons',
      amount: numAmount,
      status: validStatus,
      date,
      notes,
    });

    res.status(201).json(created);
  } catch (err) {
    console.error('Create transaction error:', err);
    res.status(500).json({ message: 'Failed to record transaction.' });
  }
});

router.put('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const { clientId, quantity, unit, amount, status, date, notes } =
      req.body as {
        clientId?: string;
        quantity?: number | string;
        unit?: string;
        amount?: number | string;
        status?: SettlementStatus;
        date?: string;
        notes?: string;
      };

    let clientName: string | undefined;
    if (clientId) {
      const client = await repo.getClientById(clientId);
      if (!client) {
        res.status(404).json({ message: 'Selected client not found.' });
        return;
      }
      clientName = client.name;
    }

    const updated = await repo.updateTransaction(id, {
      ...(clientId ? { clientId, clientName } : {}),
      ...(quantity !== undefined ? { quantity: Number(quantity) } : {}),
      ...(unit ? { unit } : {}),
      ...(amount !== undefined ? { amount: Number(amount) } : {}),
      ...(status === 'Paid' || status === 'Not Paid' ? { status } : {}),
      ...(date ? { date } : {}),
      ...(notes !== undefined ? { notes } : {}),
    });

    if (!updated) {
      res.status(404).json({ message: 'Transaction not found.' });
      return;
    }

    res.json(updated);
  } catch (err) {
    console.error('Update transaction error:', err);
    res.status(500).json({ message: 'Failed to update transaction.' });
  }
});

router.patch('/:id/settle', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const settled = await repo.settleTransaction(id);
    if (!settled) {
      res.status(404).json({ message: 'Transaction not found.' });
      return;
    }
    res.json(settled);
  } catch (err) {
    console.error('Settle transaction error:', err);
    res.status(500).json({ message: 'Failed to settle transaction.' });
  }
});

router.patch(
  '/:id/partial-payment',
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const id = String(req.params.id);
      const { paymentAmount } = req.body as {
        paymentAmount?: number | string;
      };

      const numPayment = Number(paymentAmount);
      if (Number.isNaN(numPayment) || numPayment <= 0) {
        res
          .status(400)
          .json({ message: 'Partial payment amount must be greater than zero.' });
        return;
      }

      const updated = await repo.recordPartialPayment(id, numPayment);
      if (!updated) {
        res.status(404).json({ message: 'Transaction not found.' });
        return;
      }
      res.json(updated);
    } catch (err) {
      console.error('Partial payment error:', err);
      res.status(500).json({ message: 'Failed to record partial payment.' });
    }
  }
);

router.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const deleted = await repo.deleteTransaction(id);
    if (!deleted) {
      res.status(404).json({ message: 'Transaction not found.' });
      return;
    }
    res.json({ message: 'Transaction deleted successfully.' });
  } catch (err) {
    console.error('Delete transaction error:', err);
    res.status(500).json({ message: 'Failed to delete transaction.' });
  }
});

export default router;
