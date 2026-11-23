import {
  Phone,
  RefreshCw,
  Search,
  Trash2,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '../../api/client.ts';
import { InquiryItem, QuoteStatus } from '../../types/index.ts';
import { formatDateShort } from '../../utils/format.ts';

interface QuotesPageProps {
  onNewCountChange?: (count: number) => void;
}

const STATUS_OPTIONS: QuoteStatus[] = ['New', 'Contacted', 'Quoted', 'Closed'];

const STATUS_TEXT_COLOR: Record<QuoteStatus, string> = {
  New: 'text-emerald-800 border-emerald-200 bg-emerald-50',
  Contacted: 'text-amber-800 border-amber-200 bg-amber-50',
  Quoted: 'text-sky-800 border-sky-200 bg-sky-50',
  Closed: 'text-slate-600 border-slate-200 bg-slate-100',
};

export function QuotesPage({ onNewCountChange }: QuotesPageProps) {
  const [quotes, setQuotes] = useState<InquiryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | QuoteStatus>('ALL');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const loadQuotes = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get<{ quotes: InquiryItem[] }>('/inquiries');
      const rows = res.data.quotes || [];
      setQuotes(rows);
      if (onNewCountChange) {
        onNewCountChange(rows.filter((q) => q.status === 'New').length);
      }
    } catch {
      setError('Unable to load customer quote requests.');
    } finally {
      setLoading(false);
    }
  }, [onNewCountChange]);

  useEffect(() => {
    loadQuotes();
  }, [loadQuotes]);

  const handleStatusChange = async (id: string, nextStatus: QuoteStatus) => {
    setBusyId(id);
    setError('');
    try {
      const res = await api.patch<InquiryItem>(`/inquiries/${id}/status`, {
        status: nextStatus,
      });
      setQuotes((prev) => {
        const next = prev.map((q) => (q._id === id ? res.data : q));
        if (onNewCountChange) {
          onNewCountChange(next.filter((q) => q.status === 'New').length);
        }
        return next;
      });
    } catch {
      setError('Failed to update quote status.');
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (id: string) => {
    setBusyId(id);
    setError('');
    try {
      await api.delete(`/inquiries/${id}`);
      setQuotes((prev) => {
        const next = prev.filter((q) => q._id !== id);
        if (onNewCountChange) {
          onNewCountChange(next.filter((q) => q.status === 'New').length);
        }
        return next;
      });
      setConfirmDeleteId(null);
    } catch {
      setError('Failed to delete quote.');
    } finally {
      setBusyId(null);
    }
  };

  const filteredQuotes = useMemo(() => {
    const q = search.trim().toLowerCase();
    return quotes.filter((item) => {
      if (statusFilter !== 'ALL' && item.status !== statusFilter) return false;
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        item.phone.toLowerCase().includes(q) ||
        item.company.toLowerCase().includes(q) ||
        item.message.toLowerCase().includes(q)
      );
    });
  }, [quotes, search, statusFilter]);

  const newCount = quotes.filter((q) => q.status === 'New').length;

  return (
    <div className="space-y-6">
      {/* Top Summary Strip */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-medium text-slate-500">Total Quotes</p>
          <p className="font-mono-tabular mt-2 text-2xl font-semibold text-slate-900">
            {quotes.length}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Submitted via public quote form
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-medium text-slate-500">
            New / Pending Follow-up
          </p>
          <p className="font-mono-tabular mt-2 text-2xl font-semibold text-emerald-800">
            {newCount}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Quotes awaiting owner callback
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-4 sm:flex-row sm:items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search quotes by name, phone, mill, or requirement..."
              className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-800/20"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              aria-label="Filter quotes by status"
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as 'ALL' | QuoteStatus)
              }
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-800/20"
            >
              <option value="ALL">All Statuses</option>
              {STATUS_OPTIONS.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={loadQuotes}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 cursor-pointer whitespace-nowrap shrink-0"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}
              />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Quote List */}
        {loading ? (
          <div className="space-y-3 pt-4">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-28 animate-pulse rounded-lg border border-slate-200 bg-slate-50"
              />
            ))}
          </div>
        ) : filteredQuotes.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm font-medium text-slate-700">
              {quotes.length === 0
                ? 'No quote requests received yet'
                : 'No quotes match your search or status filter'}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Public inquiries submitted from the website contact form appear
              here automatically.
            </p>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {filteredQuotes.map((quote) => {
              const isBusy = busyId === quote._id;
              return (
                <div
                  key={quote._id}
                  className="rounded-lg border border-slate-200 bg-[#FAFBF9] p-4 sm:p-5"
                >
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-display text-base font-semibold text-slate-900">
                          {quote.name}
                        </h3>
                        {quote.company && (
                          <span className="text-xs font-medium text-slate-600">
                            · {quote.company}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                        <a
                          href={`tel:${quote.phone}`}
                          className="font-mono-tabular inline-flex items-center gap-1 font-medium text-emerald-800 hover:underline"
                        >
                          <Phone className="h-3.5 w-3.5" />
                          <span>{quote.phone}</span>
                        </a>
                        <span className="font-mono-tabular text-slate-500">
                          Received {formatDateShort(quote.createdAt)} ·{' '}
                          {new Date(quote.createdAt).toLocaleTimeString(
                            'en-IN',
                            { hour: '2-digit', minute: '2-digit' }
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <select
                        aria-label={`Status for ${quote.name}`}
                        disabled={isBusy}
                        value={quote.status}
                        onChange={(e) =>
                          handleStatusChange(
                            quote._id,
                            e.target.value as QuoteStatus
                          )
                        }
                        className={`rounded-md border px-2.5 py-1 text-xs font-medium focus:outline-none ${
                          STATUS_TEXT_COLOR[quote.status] ||
                          STATUS_TEXT_COLOR.New
                        }`}
                      >
                        {STATUS_OPTIONS.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>

                      {confirmDeleteId === quote._id ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => handleDelete(quote._id)}
                            className="rounded-md bg-red-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-red-700 cursor-pointer"
                          >
                            Confirm
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(null)}
                            className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-600 hover:bg-slate-50 cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => setConfirmDeleteId(quote._id)}
                          aria-label={`Delete quote from ${quote.name}`}
                          className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-red-700 hover:bg-red-50 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Delete</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="mt-3 rounded-md border border-slate-200/80 bg-white px-3.5 py-2.5 text-sm leading-relaxed text-slate-800 whitespace-pre-wrap">
                    {quote.message}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
