import { Router, type Response } from 'express';
import { repo } from '../config/db.ts';
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth.ts';

const router = Router();

router.get(
  '/metrics',
  requireAuth,
  async (_req: AuthenticatedRequest, res: Response) => {
    try {
      const [{ rows: allTransactions }, allExpenditures, clients, carousel] =
        await Promise.all([
          repo.listTransactions(),
          repo.listExpenditures(),
          repo.listClients(),
          repo.listCarouselImages(),
        ]);

      const now = new Date();
      const todayKey = now.toISOString().slice(0, 10);
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();

      let todaysRevenue = 0;
      let thisMonthsRevenue = 0;
      let totalCredits = 0;
      let settledCredits = 0;
      let pendingReceivables = 0;
      let totalTonnage = 0;

      for (const txn of allTransactions) {
        const d = new Date(txn.date);
        const txnDayKey = d.toISOString().slice(0, 10);

        if (txnDayKey === todayKey) {
          todaysRevenue += txn.amount;
        }
        if (
          d.getFullYear() === currentYear &&
          d.getMonth() === currentMonth
        ) {
          thisMonthsRevenue += txn.amount;
        }

        totalCredits += txn.amount;
        totalTonnage += txn.quantity;

        const paid = txn.status === 'Paid' ? txn.amount : Math.min(txn.amount, txn.paidAmount || 0);
        settledCredits += paid;
        pendingReceivables += Math.max(0, txn.amount - paid);
      }

      const totalDebits = allExpenditures.reduce(
        (sum, exp) => sum + exp.amountPaid,
        0
      );

      res.json({
        todaysRevenue,
        thisMonthsRevenue,
        totalCredits,
        settledCredits,
        pendingReceivables,
        totalDebits,
        netOperatingPosition: settledCredits - totalDebits,
        totalClients: clients.length,
        totalTonnage: Number(totalTonnage.toFixed(2)),
        carouselCount: carousel.length,
        recentPendingTransactions: allTransactions
          .filter((t) => t.status === 'Not Paid')
          .slice(0, 5),
        recentExpenditures: allExpenditures.slice(0, 4),
      });
    } catch (err) {
      console.error('Dashboard metrics error:', err);
      res.status(500).json({ message: 'Failed to compute dashboard metrics.' });
    }
  }
);

export default router;
