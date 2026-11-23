import { Router, type Response } from 'express';
import { repo } from '../config/db.ts';
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth.ts';

const router = Router();

router.use(requireAuth);

router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const q = typeof req.query.q === 'string' ? req.query.q : undefined;
    const [clients, { rows: transactions }] = await Promise.all([
      repo.listClients(q),
      repo.listTransactions(),
    ]);

    const summaryByClient = new Map<
      string,
      { totalAmount: number; unpaidAmount: number; totalTonnage: number; ordersCount: number }
    >();

    for (const t of transactions) {
      const current = summaryByClient.get(t.clientId) || {
        totalAmount: 0,
        unpaidAmount: 0,
        totalTonnage: 0,
        ordersCount: 0,
      };
      current.totalAmount += t.amount;
      const paid = t.status === 'Paid' ? t.amount : Math.min(t.amount, t.paidAmount || 0);
      current.unpaidAmount += Math.max(0, t.amount - paid);
      current.totalTonnage += t.quantity;
      current.ordersCount += 1;
      summaryByClient.set(t.clientId, current);
    }

    const enriched = clients.map((c) => {
      const stats = summaryByClient.get(c._id) || {
        totalAmount: 0,
        unpaidAmount: 0,
        totalTonnage: 0,
        ordersCount: 0,
      };
      return {
        ...c,
        ...stats,
      };
    });

    res.json(enriched);
  } catch (err) {
    console.error('List clients error:', err);
    res.status(500).json({ message: 'Failed to fetch clients.' });
  }
});

router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, phone, address } = req.body as {
      name?: string;
      phone?: string;
      address?: string;
    };

    if (!name?.trim() || !phone?.trim() || !address?.trim()) {
      res
        .status(400)
        .json({ message: 'Client name, phone number, and address are required.' });
      return;
    }

    const created = await repo.createClient({ name, phone, address });
    res.status(201).json({
      ...created,
      totalAmount: 0,
      unpaidAmount: 0,
      totalTonnage: 0,
      ordersCount: 0,
    });
  } catch (err) {
    console.error('Create client error:', err);
    res.status(500).json({ message: 'Failed to create client.' });
  }
});

router.put('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const { name, phone, address } = req.body as {
      name?: string;
      phone?: string;
      address?: string;
    };

    if (!name?.trim() || !phone?.trim() || !address?.trim()) {
      res
        .status(400)
        .json({ message: 'Client name, phone number, and address are required.' });
      return;
    }

    const updated = await repo.updateClient(id, {
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim(),
    });

    if (!updated) {
      res.status(404).json({ message: 'Client not found.' });
      return;
    }

    res.json(updated);
  } catch (err) {
    console.error('Update client error:', err);
    res.status(500).json({ message: 'Failed to update client.' });
  }
});

router.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const deleted = await repo.deleteClient(id);
    if (!deleted) {
      res.status(404).json({ message: 'Client not found.' });
      return;
    }
    res.json({ message: 'Client deleted successfully.' });
  } catch (err) {
    console.error('Delete client error:', err);
    res.status(500).json({ message: 'Failed to delete client.' });
  }
});

export default router;
