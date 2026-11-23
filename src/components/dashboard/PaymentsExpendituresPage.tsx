import {
  CheckCircle2,
  Clock,
  IndianRupee,
  Pencil,
  Plus,
  RotateCcw,
  Trash2,
  X,
} from 'lucide-react';
import { FormEvent, useCallback, useEffect, useState } from 'react';
import { api } from '../../api/client.ts';
import {
  ClientItem,
  ExpenditureItem,
  SettlementStatus,
  TransactionItem,
} from '../../types/index.ts';
import {
  formatDateShort,
  formatINR,
  toDateInputValue,
} from '../../utils/format.ts';

export function PaymentsExpendituresPage() {
  const [clients, setClients] = useState<ClientItem[]>([]);

  // --- Client Transactions State ---
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [txnTotalCount, setTxnTotalCount] = useState(0);
  const [isDefaultLatestFive, setIsDefaultLatestFive] = useState(true);
  const [txnLoading, setTxnLoading] = useState(true);

  // Filters
  const [filterClientId, setFilterClientId] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterStatus, setFilterStatus] = useState<'All' | SettlementStatus>(
    'All'
  );
  const [showAllUnfiltered, setShowAllUnfiltered] = useState(false);

  // Transaction Form
  const [editingTxnId, setEditingTxnId] = useState<string | null>(null);
  const [txnClientId, setTxnClientId] = useState('');
  const [txnQuantity, setTxnQuantity] = useState('');
  const [txnAmount, setTxnAmount] = useState('');
  const [txnStatus, setTxnStatus] = useState<SettlementStatus>('Not Paid');
  const [txnDate, setTxnDate] = useState(toDateInputValue());
  const [txnNotes, setTxnNotes] = useState('');
  const [txnSaving, setTxnSaving] = useState(false);
  const [txnError, setTxnError] = useState('');

  // Partial Payment Modal State
  const [partialTarget, setPartialTarget] = useState<TransactionItem | null>(
    null
  );
  const [partialInput, setPartialInput] = useState('');
  const [partialSaving, setPartialSaving] = useState(false);
  const [partialError, setPartialError] = useState('');

  // --- Truck / Warehouse Expenditures State ---
  const [expenditures, setExpenditures] = useState<ExpenditureItem[]>([]);
  const [expLoading, setExpLoading] = useState(true);

  // Expenditure Form
  const [editingExpId, setEditingExpId] = useState<string | null>(null);
  const [expDate, setExpDate] = useState(toDateInputValue());
  const [expTruckNumber, setExpTruckNumber] = useState('');
  const [expDriverName, setExpDriverName] = useState('');
  const [expDescription, setExpDescription] = useState('');
  const [expAmountPaid, setExpAmountPaid] = useState('');
  const [expSaving, setExpSaving] = useState(false);
  const [expError, setExpError] = useState('');

  const loadClients = useCallback(async () => {
    try {
      const res = await api.get<ClientItem[]>('/clients');
      setClients(res.data);
      if (res.data.length > 0) {
        setTxnClientId((prev) => prev || res.data[0]._id);
      }
    } catch {
      // handled gracefully
    }
  }, []);

  const loadTransactions = useCallback(async () => {
    setTxnLoading(true);
    try {
      const params: Record<string, string> = {};
      if (filterClientId) params.clientId = filterClientId;
      if (filterDate) params.date = filterDate;
      if (filterStatus !== 'All') params.status = filterStatus;
      if (showAllUnfiltered) params.showAll = 'true';

      const res = await api.get<{
        transactions: TransactionItem[];
        totalCount: number;
        isDefaultLatestFive: boolean;
      }>('/transactions', { params });

      setTransactions(res.data.transactions);
      setTxnTotalCount(res.data.totalCount);
      setIsDefaultLatestFive(res.data.isDefaultLatestFive);
    } catch {
      setTxnError('Failed to fetch client transactions.');
    } finally {
      setTxnLoading(false);
    }
  }, [filterClientId, filterDate, filterStatus, showAllUnfiltered]);

  const loadExpenditures = useCallback(async () => {
    setExpLoading(true);
    try {
      const res = await api.get<ExpenditureItem[]>('/expenditures');
      setExpenditures(res.data);
    } catch {
      setExpError('Failed to fetch truck & warehouse expenditures.');
    } finally {
      setExpLoading(false);
    }
  }, []);

  useEffect(() => {
    loadClients();
    loadExpenditures();
  }, [loadClients, loadExpenditures]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  // --- Transaction Handlers ---
  const resetTxnForm = () => {
    setEditingTxnId(null);
    setTxnClientId(clients[0]?._id || '');
    setTxnQuantity('');
    setTxnAmount('');
    setTxnStatus('Not Paid');
    setTxnDate(toDateInputValue());
    setTxnNotes('');
    setTxnError('');
  };

  const handleSaveTransaction = async (e: FormEvent) => {
    e.preventDefault();
    setTxnError('');
    if (!txnClientId) {
      setTxnError('Select a client from the dropdown.');
      return;
    }
    if (!txnQuantity || Number(txnQuantity) <= 0) {
      setTxnError('Enter a valid sugarcane quantity.');
      return;
    }
    if (!txnAmount || Number(txnAmount) < 0) {
      setTxnError('Enter a valid transaction amount.');
      return;
    }

    setTxnSaving(true);
    try {
      const payload = {
        clientId: txnClientId,
        quantity: Number(txnQuantity),
        unit: 'Tons',
        amount: Number(txnAmount),
        status: txnStatus,
        date: txnDate,
        notes: txnNotes.trim(),
      };
      if (editingTxnId) {
        await api.put(`/transactions/${editingTxnId}`, payload);
      } else {
        await api.post('/transactions', payload);
      }
      resetTxnForm();
      await loadTransactions();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Failed to save transaction.';
      setTxnError(msg);
    } finally {
      setTxnSaving(false);
    }
  };

  const handleEditTransaction = (t: TransactionItem) => {
    setEditingTxnId(t._id);
    setTxnClientId(t.clientId);
    setTxnQuantity(String(t.quantity));
    setTxnAmount(String(t.amount));
    setTxnStatus(t.status);
    setTxnDate(toDateInputValue(t.date));
    setTxnNotes(t.notes || '');
    setTxnError('');
  };

  const handleSettleTransaction = async (id: string) => {
    try {
      await api.patch(`/transactions/${id}/settle`);
      await loadTransactions();
    } catch {
      setTxnError('Failed to settle transaction.');
    }
  };

  const openPartialModal = (txn: TransactionItem) => {
    setPartialTarget(txn);
    setPartialInput('');
    setPartialError('');
  };

  const handleRecordPartialPayment = async (e: FormEvent) => {
    e.preventDefault();
    if (!partialTarget) return;
    setPartialError('');

    const entered = Number(partialInput);
    const remainingDue = Math.max(
      0,
      partialTarget.amount - (partialTarget.paidAmount || 0)
    );

    if (Number.isNaN(entered) || entered <= 0) {
      setPartialError('Enter a payment amount greater than zero.');
      return;
    }
    if (entered > remainingDue) {
      setPartialError(
        `Amount cannot exceed remaining due (${formatINR(remainingDue)}).`
      );
      return;
    }

    setPartialSaving(true);
    try {
      await api.patch(`/transactions/${partialTarget._id}/partial-payment`, {
        paymentAmount: entered,
      });
      setPartialTarget(null);
      setPartialInput('');
      await loadTransactions();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Failed to record partial payment.';
      setPartialError(msg);
    } finally {
      setPartialSaving(false);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    try {
      await api.delete(`/transactions/${id}`);
      if (editingTxnId === id) resetTxnForm();
      await loadTransactions();
    } catch {
      setTxnError('Failed to delete transaction.');
    }
  };

  const clearFilters = () => {
    setFilterClientId('');
    setFilterDate('');
    setFilterStatus('All');
    setShowAllUnfiltered(false);
  };

  // --- Expenditure Handlers ---
  const resetExpForm = () => {
    setEditingExpId(null);
    setExpDate(toDateInputValue());
    setExpTruckNumber('');
    setExpDriverName('');
    setExpDescription('');
    setExpAmountPaid('');
    setExpError('');
  };

  const handleSaveExpenditure = async (e: FormEvent) => {
    e.preventDefault();
    setExpError('');
    if (expAmountPaid === '' || Number(expAmountPaid) < 0) {
      setExpError('Enter a valid amount paid.');
      return;
    }

    setExpSaving(true);
    try {
      const payload = {
        date: expDate,
        truckNumber: expTruckNumber.trim(),
        driverName: expDriverName.trim(),
        description: expDescription.trim(),
        amountPaid: Number(expAmountPaid),
      };
      if (editingExpId) {
        await api.put(`/expenditures/${editingExpId}`, payload);
      } else {
        await api.post('/expenditures', payload);
      }
      resetExpForm();
      await loadExpenditures();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Failed to save expenditure.';
      setExpError(msg);
    } finally {
      setExpSaving(false);
    }
  };

  const handleEditExpenditure = (exp: ExpenditureItem) => {
    setEditingExpId(exp._id);
    setExpDate(toDateInputValue(exp.date));
    setExpTruckNumber(exp.truckNumber || '');
    setExpDriverName(exp.driverName || '');
    setExpDescription(exp.description || '');
    setExpAmountPaid(String(exp.amountPaid));
    setExpError('');
  };

  const handleDeleteExpenditure = async (id: string) => {
    try {
      await api.delete(`/expenditures/${id}`);
      if (editingExpId === id) resetExpForm();
      await loadExpenditures();
    } catch {
      setExpError('Failed to delete expenditure.');
    }
  };

  const hasActiveFilters = Boolean(
    filterClientId || filterDate || filterStatus !== 'All'
  );

  return (
    <div className="space-y-10">
      {/* =====================================================================
          TABLE 1: CLIENT TRANSACTIONS
      ===================================================================== */}
      <section className="rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 p-6">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-display text-lg font-semibold text-slate-900">
                1. Client Transactions Ledger
              </h2>
              <p className="mt-0.5 text-sm text-slate-600">
                Record sugarcane supply batches, track full or partial payments,
                and filter by client, date, or status.
              </p>
            </div>
            {editingTxnId && (
              <button
                type="button"
                onClick={resetTxnForm}
                className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
                Cancel Edit
              </button>
            )}
          </div>

          {/* Add / Edit Transaction Form */}
          <form
            onSubmit={handleSaveTransaction}
            className="mt-5 grid grid-cols-1 gap-4 rounded-lg border border-slate-200 bg-[#FAFBF9] p-4 md:grid-cols-12 md:items-end"
          >
            <div className="md:col-span-3">
              <label
                htmlFor="txn-client"
                className="block text-xs font-medium text-slate-700"
              >
                Client Name
              </label>
              <select
                id="txn-client"
                required
                value={txnClientId}
                onChange={(e) => setTxnClientId(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-800/20"
              >
                {clients.length === 0 ? (
                  <option value="">No clients available</option>
                ) : (
                  clients.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="txn-qty"
                className="block text-xs font-medium text-slate-700"
              >
                Quantity (Tons)
              </label>
              <input
                id="txn-qty"
                type="number"
                step="0.1"
                min="0.1"
                required
                value={txnQuantity}
                onChange={(e) => setTxnQuantity(e.target.value)}
                placeholder="e.g. 24.5"
                className="font-mono-tabular mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-800/20"
              />
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="txn-amount"
                className="block text-xs font-medium text-slate-700"
              >
                Amount (₹)
              </label>
              <input
                id="txn-amount"
                type="number"
                min="0"
                required
                value={txnAmount}
                onChange={(e) => setTxnAmount(e.target.value)}
                placeholder="e.g. 83300"
                className="font-mono-tabular mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-800/20"
              />
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="txn-date"
                className="block text-xs font-medium text-slate-700"
              >
                Supply Date
              </label>
              <input
                id="txn-date"
                type="date"
                value={txnDate}
                onChange={(e) => setTxnDate(e.target.value)}
                className="font-mono-tabular mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-800/20"
              />
            </div>

            <div className="md:col-span-1">
              <label className="block text-xs font-medium text-slate-700">
                Status
              </label>
              <label className="mt-1 flex h-[38px] items-center gap-2 rounded-lg border border-slate-300 bg-white px-2.5 text-xs font-medium text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={txnStatus === 'Paid'}
                  onChange={(e) =>
                    setTxnStatus(e.target.checked ? 'Paid' : 'Not Paid')
                  }
                  className="h-4 w-4 rounded border-slate-300 text-emerald-800 focus:ring-emerald-800"
                />
                <span>Paid</span>
              </label>
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={txnSaving || clients.length === 0}
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-emerald-900 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-60 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <Plus className="h-4 w-4" />
                <span>
                  {txnSaving
                    ? 'Saving...'
                    : editingTxnId
                    ? 'Update'
                    : 'Add Entry'}
                </span>
              </button>
            </div>

            <div className="md:col-span-12">
              <input
                type="text"
                value={txnNotes}
                onChange={(e) => setTxnNotes(e.target.value)}
                placeholder="Optional weighbridge slip number or cane variety notes..."
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-emerald-800 focus:outline-none"
              />
            </div>
          </form>

          {txnError && (
            <p className="mt-3 text-sm font-medium text-red-700">{txnError}</p>
          )}

          {/* Filtering Controls */}
          <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
            <div className="flex flex-wrap items-end gap-3">
              <div>
                <label
                  htmlFor="filter-client"
                  className="block text-xs font-medium text-slate-600"
                >
                  Filter by Client
                </label>
                <select
                  id="filter-client"
                  value={filterClientId}
                  onChange={(e) => setFilterClientId(e.target.value)}
                  className="mt-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-800 focus:border-emerald-800 focus:outline-none"
                >
                  <option value="">All Clients</option>
                  {clients.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="filter-date"
                  className="block text-xs font-medium text-slate-600"
                >
                  Filter by Date
                </label>
                <input
                  id="filter-date"
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="font-mono-tabular mt-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-800 focus:border-emerald-800 focus:outline-none"
                />
              </div>

              <div>
                <span className="block text-xs font-medium text-slate-600">
                  Settlement Status
                </span>
                <div className="mt-1 inline-flex rounded-lg border border-slate-200 bg-slate-100 p-0.5">
                  {(['All', 'Paid', 'Not Paid'] as const).map((statusOpt) => (
                    <button
                      key={statusOpt}
                      type="button"
                      onClick={() => setFilterStatus(statusOpt)}
                      className={`rounded-md px-3 py-1 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                        filterStatus === statusOpt
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {statusOpt}
                    </button>
                  ))}
                </div>
              </div>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset Filters
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span>
                {isDefaultLatestFive
                  ? `Showing latest ${transactions.length} of ${txnTotalCount} entries`
                  : `Showing ${transactions.length} matching entries`}
              </span>
              {!hasActiveFilters && txnTotalCount > 5 && (
                <button
                  type="button"
                  onClick={() => setShowAllUnfiltered((prev) => !prev)}
                  className="font-medium text-emerald-800 hover:underline cursor-pointer"
                >
                  {showAllUnfiltered ? 'Show Latest 5' : 'View All'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-[#FAFBF9] text-xs font-semibold text-slate-600">
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Client Name</th>
                <th className="px-6 py-3 text-right">Quantity</th>
                <th className="px-6 py-3 text-right">Amount</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {txnLoading ? (
                [0, 1, 2].map((i) => (
                  <tr key={i}>
                    <td colSpan={6} className="px-6 py-4">
                      <div className="h-5 animate-pulse rounded bg-slate-100" />
                    </td>
                  </tr>
                ))
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-500">
                    No transactions match the selected criteria.
                  </td>
                </tr>
              ) : (
                transactions.map((txn) => {
                  const paidAmt =
                    txn.status === 'Paid' ? txn.amount : txn.paidAmount || 0;
                  const remainingDue = Math.max(0, txn.amount - paidAmt);

                  return (
                    <tr
                      key={txn._id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="font-mono-tabular px-6 py-3.5 text-slate-600 whitespace-nowrap">
                        {formatDateShort(txn.date)}
                      </td>
                      <td className="px-6 py-3.5">
                        <p className="font-medium text-slate-900">
                          {txn.clientName}
                        </p>
                        {txn.notes && (
                          <p className="mt-0.5 text-xs text-slate-500">
                            {txn.notes}
                          </p>
                        )}
                      </td>
                      <td className="font-mono-tabular px-6 py-3.5 text-right text-slate-700 whitespace-nowrap">
                        {txn.quantity} {txn.unit}
                      </td>
                      <td className="font-mono-tabular px-6 py-3.5 text-right whitespace-nowrap">
                        <p className="font-semibold text-slate-900">
                          {formatINR(txn.amount)}
                        </p>
                        {txn.status === 'Not Paid' && paidAmt > 0 && (
                          <p className="mt-0.5 text-[11px] text-slate-500">
                            Paid {formatINR(paidAmt)} · Due{' '}
                            <span className="font-semibold text-amber-700">
                              {formatINR(remainingDue)}
                            </span>
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-3.5 whitespace-nowrap">
                        {txn.status === 'Paid' ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                            <CheckCircle2 className="h-4 w-4" />
                            Paid
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700">
                            <Clock className="h-4 w-4" />
                            {paidAmt > 0 ? 'Partial Due' : 'Not Paid (Due)'}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-3.5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-2.5">
                          {txn.status === 'Not Paid' && (
                            <>
                              <button
                                type="button"
                                onClick={() => openPartialModal(txn)}
                                className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                              >
                                <IndianRupee className="h-3 w-3" />
                                <span>Partial Pay</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSettleTransaction(txn._id)}
                                className="rounded-md bg-emerald-900 px-2.5 py-1 text-xs font-medium text-white hover:bg-emerald-800 transition-colors cursor-pointer"
                              >
                                Settle Payment
                              </button>
                            </>
                          )}
                          <button
                            type="button"
                            onClick={() => handleEditTransaction(txn)}
                            aria-label={`Edit transaction for ${txn.clientName}`}
                            className="inline-flex items-center gap-1 text-xs font-medium text-slate-700 hover:text-emerald-900 cursor-pointer"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteTransaction(txn._id)}
                            aria-label={`Delete transaction for ${txn.clientName}`}
                            className="inline-flex items-center gap-1 text-xs font-medium text-red-700 hover:text-red-900 cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* =====================================================================
          TABLE 2: TRUCK / WAREHOUSE EXPENDITURES
      ===================================================================== */}
      <section className="rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 p-6">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-display text-lg font-semibold text-slate-900">
                2. Truck &amp; Warehouse Expenditures
              </h2>
              <p className="mt-0.5 text-sm text-slate-600">
                Record cash or bank payouts made to truck drivers or warehouse
                expenses. Only Date and Amount Paid are required; truck, driver,
                and description are optional.
              </p>
            </div>
            {editingExpId && (
              <button
                type="button"
                onClick={resetExpForm}
                className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
                Cancel Edit
              </button>
            )}
          </div>

          <form
            onSubmit={handleSaveExpenditure}
            className="mt-5 grid grid-cols-1 gap-4 rounded-lg border border-slate-200 bg-[#FAFBF9] p-4 md:grid-cols-12 md:items-end"
          >
            <div className="md:col-span-2">
              <label
                htmlFor="exp-date"
                className="block text-xs font-medium text-slate-700"
              >
                Date
              </label>
              <input
                id="exp-date"
                type="date"
                required
                value={expDate}
                onChange={(e) => setExpDate(e.target.value)}
                className="font-mono-tabular mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-800/20"
              />
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="exp-truck"
                className="block text-xs font-medium text-slate-700"
              >
                Truck Number <span className="text-slate-400">(Optional)</span>
              </label>
              <input
                id="exp-truck"
                type="text"
                value={expTruckNumber}
                onChange={(e) => setExpTruckNumber(e.target.value)}
                placeholder="KA-22-C-4821"
                className="font-mono-tabular mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-800/20"
              />
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="exp-driver"
                className="block text-xs font-medium text-slate-700"
              >
                Driver Name <span className="text-slate-400">(Optional)</span>
              </label>
              <input
                id="exp-driver"
                type="text"
                value={expDriverName}
                onChange={(e) => setExpDriverName(e.target.value)}
                placeholder="Basavaraj Patil"
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-800/20"
              />
            </div>

            <div className="md:col-span-3">
              <label
                htmlFor="exp-desc"
                className="block text-xs font-medium text-slate-700"
              >
                Description <span className="text-slate-400">(Optional)</span>
              </label>
              <input
                id="exp-desc"
                type="text"
                value={expDescription}
                onChange={(e) => setExpDescription(e.target.value)}
                placeholder="Warehouse unloading & haulage"
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-800/20"
              />
            </div>

            <div className="md:col-span-1">
              <label
                htmlFor="exp-amount"
                className="block text-xs font-medium text-slate-700"
              >
                Paid (₹)
              </label>
              <input
                id="exp-amount"
                type="number"
                min="0"
                required
                value={expAmountPaid}
                onChange={(e) => setExpAmountPaid(e.target.value)}
                placeholder="14500"
                className="font-mono-tabular mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-sm text-slate-900 focus:border-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-800/20"
              />
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={expSaving}
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <Plus className="h-4 w-4" />
                <span>
                  {expSaving
                    ? 'Saving...'
                    : editingExpId
                    ? 'Update'
                    : 'Add Payout'}
                </span>
              </button>
            </div>
          </form>

          {expError && (
            <p className="mt-3 text-sm font-medium text-red-700">{expError}</p>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-[#FAFBF9] text-xs font-semibold text-slate-600">
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Truck Number / Driver</th>
                <th className="px-6 py-3">Expense Description</th>
                <th className="px-6 py-3 text-right">Amount Paid</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {expLoading ? (
                [0, 1, 2].map((i) => (
                  <tr key={i}>
                    <td colSpan={5} className="px-6 py-4">
                      <div className="h-5 animate-pulse rounded bg-slate-100" />
                    </td>
                  </tr>
                ))
              ) : expenditures.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-500">
                    No truck or warehouse payouts recorded yet.
                  </td>
                </tr>
              ) : (
                expenditures.map((exp) => (
                  <tr
                    key={exp._id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="font-mono-tabular px-6 py-3.5 text-slate-600 whitespace-nowrap">
                      {formatDateShort(exp.date)}
                    </td>
                    <td className="px-6 py-3.5 whitespace-nowrap">
                      {exp.truckNumber || exp.driverName ? (
                        <>
                          {exp.truckNumber && (
                            <span className="font-mono-tabular font-medium text-slate-900">
                              {exp.truckNumber}
                            </span>
                          )}
                          {exp.truckNumber && exp.driverName && (
                            <span className="mx-1.5 text-slate-300">·</span>
                          )}
                          {exp.driverName && (
                            <span className="text-slate-700">
                              {exp.driverName}
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-3.5 text-slate-600">
                      {exp.description || (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="font-mono-tabular px-6 py-3.5 text-right font-semibold text-amber-800 whitespace-nowrap">
                      {formatINR(exp.amountPaid)}
                    </td>
                    <td className="px-6 py-3.5 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleEditExpenditure(exp)}
                          aria-label={`Edit expenditure ${exp.truckNumber || exp._id}`}
                          className="inline-flex items-center gap-1 text-xs font-medium text-slate-700 hover:text-emerald-900 cursor-pointer"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteExpenditure(exp._id)}
                          aria-label={`Delete expenditure ${exp.truckNumber || exp._id}`}
                          className="inline-flex items-center gap-1 text-xs font-medium text-red-700 hover:text-red-900 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* =====================================================================
          PARTIAL PAYMENT MODAL
      ===================================================================== */}
      {partialTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="partial-pay-title"
        >
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <h3
                  id="partial-pay-title"
                  className="font-display text-lg font-bold text-slate-900"
                >
                  Record Partial Payment
                </h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  {partialTarget.clientName} ·{' '}
                  {formatDateShort(partialTarget.date)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPartialTarget(null)}
                aria-label="Close partial payment dialog"
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3 rounded-lg border border-slate-200 bg-[#FAFBF9] p-3 text-xs">
              <div>
                <p className="text-slate-500">Total Bill</p>
                <p className="font-mono-tabular mt-0.5 font-semibold text-slate-900">
                  {formatINR(partialTarget.amount)}
                </p>
              </div>
              <div>
                <p className="text-slate-500">Paid So Far</p>
                <p className="font-mono-tabular mt-0.5 font-semibold text-emerald-700">
                  {formatINR(partialTarget.paidAmount || 0)}
                </p>
              </div>
              <div>
                <p className="text-slate-500">Remaining Due</p>
                <p className="font-mono-tabular mt-0.5 font-semibold text-amber-700">
                  {formatINR(
                    Math.max(
                      0,
                      partialTarget.amount - (partialTarget.paidAmount || 0)
                    )
                  )}
                </p>
              </div>
            </div>

            <form onSubmit={handleRecordPartialPayment} className="mt-5 space-y-4">
              <div>
                <label
                  htmlFor="partial-amount-input"
                  className="block text-sm font-medium text-slate-700"
                >
                  Amount Received Now (₹)
                </label>
                <input
                  id="partial-amount-input"
                  type="number"
                  min="1"
                  max={Math.max(
                    1,
                    partialTarget.amount - (partialTarget.paidAmount || 0)
                  )}
                  required
                  autoFocus
                  value={partialInput}
                  onChange={(e) => setPartialInput(e.target.value)}
                  placeholder="Enter partial amount received"
                  className="font-mono-tabular mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-800/20"
                />
              </div>

              {partialError && (
                <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                  {partialError}
                </p>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setPartialTarget(null)}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={partialSaving}
                  className="rounded-lg bg-emerald-900 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-60 cursor-pointer"
                >
                  {partialSaving ? 'Saving...' : 'Save Partial Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
