import { Pencil, Plus, Search, Trash2, Users, X } from 'lucide-react';
import { FormEvent, useCallback, useEffect, useState } from 'react';
import { api } from '../../api/client.ts';
import { ClientItem } from '../../types/index.ts';
import { formatINR } from '../../utils/format.ts';

export function ClientsManager() {
  const [clients, setClients] = useState<ClientItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchClients = useCallback(async (q: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get<ClientItem[]>('/clients', {
        params: q.trim() ? { q: q.trim() } : undefined,
      });
      setClients(res.data);
    } catch {
      setError('Failed to load clients list.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchClients(searchQuery);
    }, 150);
    return () => clearTimeout(timer);
  }, [searchQuery, fetchClients]);

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setPhone('');
    setAddress('');
    setFormError('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!name.trim() || !phone.trim() || !address.trim()) {
      setFormError('Client name, phone number, and address are required.');
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/clients/${editingId}`, {
          name: name.trim(),
          phone: phone.trim(),
          address: address.trim(),
        });
      } else {
        await api.post('/clients', {
          name: name.trim(),
          phone: phone.trim(),
          address: address.trim(),
        });
      }
      resetForm();
      await fetchClients(searchQuery);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Failed to save client details.';
      setFormError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (client: ClientItem) => {
    setEditingId(client._id);
    setName(client.name);
    setPhone(client.phone);
    setAddress(client.address);
    setFormError('');
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/clients/${id}`);
      if (editingId === id) resetForm();
      await fetchClients(searchQuery);
    } catch {
      setError('Failed to remove client.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Add / Edit Client Form */}
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <h2 className="font-display text-lg font-semibold text-slate-900">
            {editingId ? 'Edit Client Record' : 'Add New Client'}
          </h2>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
              Cancel Edit
            </button>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-12 md:items-end"
        >
          <div className="md:col-span-3">
            <label
              htmlFor="client-name"
              className="block text-sm font-medium text-slate-700"
            >
              Client Name
            </label>
            <input
              id="client-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Shri Renuka Agro Mills"
              className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-800/20"
            />
          </div>

          <div className="md:col-span-3">
            <label
              htmlFor="client-phone"
              className="block text-sm font-medium text-slate-700"
            >
              Phone Number
            </label>
            <input
              id="client-phone"
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 9845011234"
              className="font-mono-tabular mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-800/20"
            />
          </div>

          <div className="md:col-span-4">
            <label
              htmlFor="client-address"
              className="block text-sm font-medium text-slate-700"
            >
              Address
            </label>
            <input
              id="client-address"
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Mill or warehouse location"
              className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-800/20"
            />
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-900 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-60 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <Plus className="h-4 w-4" />
              <span>{saving ? 'Saving...' : editingId ? 'Update' : 'Add Client'}</span>
            </button>
          </div>
        </form>

        {formError && (
          <p className="mt-3 text-sm font-medium text-red-700">{formError}</p>
        )}
      </section>

      {/* Clients Table & Search */}
      <section className="rounded-xl border border-slate-200 bg-white">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-200 p-6 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-display text-lg font-semibold text-slate-900">
              Registered Clients
            </h2>
            <p className="text-xs text-slate-500">
              Search immediately by client name or phone number
            </p>
          </div>

          <div className="relative w-full sm:w-80">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search name or phone..."
              aria-label="Search clients by name or phone number"
              className="w-full rounded-lg border border-slate-300 bg-[#FAFBF9] py-2 pr-3 pl-9 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-800/20"
            />
          </div>
        </div>

        {error && (
          <div className="border-b border-red-200 bg-red-50 px-6 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-[#FAFBF9] text-xs font-semibold text-slate-600">
                <th className="px-6 py-3">Client Name</th>
                <th className="px-6 py-3">Phone Number</th>
                <th className="px-6 py-3">Address</th>
                <th className="px-6 py-3 text-right">Supplied</th>
                <th className="px-6 py-3 text-right">Pending Due</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                [0, 1, 2].map((i) => (
                  <tr key={i}>
                    <td colSpan={6} className="px-6 py-4">
                      <div className="h-5 animate-pulse rounded bg-slate-100" />
                    </td>
                  </tr>
                ))
              ) : clients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Users className="mx-auto h-8 w-8 text-slate-400" />
                    <p className="mt-2 font-medium text-slate-700">
                      {searchQuery
                        ? 'No clients match your search'
                        : 'No clients registered yet'}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {searchQuery
                        ? 'Try a different name or phone number.'
                        : 'Use the form above to add your first mill or buyer.'}
                    </p>
                  </td>
                </tr>
              ) : (
                clients.map((client) => (
                  <tr
                    key={client._id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="px-6 py-3.5 font-medium text-slate-900">
                      {client.name}
                    </td>
                    <td className="font-mono-tabular px-6 py-3.5 text-slate-700 whitespace-nowrap">
                      {client.phone}
                    </td>
                    <td className="max-w-xs truncate px-6 py-3.5 text-slate-600">
                      {client.address}
                    </td>
                    <td className="font-mono-tabular px-6 py-3.5 text-right text-slate-700 whitespace-nowrap">
                      {client.totalTonnage.toFixed(1)} Tons
                    </td>
                    <td className="font-mono-tabular px-6 py-3.5 text-right font-medium whitespace-nowrap">
                      <span
                        className={
                          client.unpaidAmount > 0
                            ? 'text-amber-700'
                            : 'text-emerald-700'
                        }
                      >
                        {formatINR(client.unpaidAmount)}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleEdit(client)}
                          aria-label={`Edit ${client.name}`}
                          className="inline-flex items-center gap-1 text-xs font-medium text-slate-700 hover:text-emerald-900 cursor-pointer"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(client._id)}
                          aria-label={`Delete ${client.name}`}
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
    </div>
  );
}
