import { CheckCircle2 } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { api } from '../../api/client.ts';
import { OwnerUser } from '../../types/index.ts';

interface ProfilePageProps {
  user: OwnerUser;
  onUserUpdated: (user: OwnerUser) => void;
}

export function ProfilePage({ user, onUserUpdated }: ProfilePageProps) {
  const [fullName, setFullName] = useState(user.fullName);
  const [businessName, setBusinessName] = useState(user.businessName);
  const [role, setRole] = useState(user.role);
  const [phone, setPhone] = useState(user.phone);
  const [email, setEmail] = useState(user.email);
  const [warehouseAddress, setWarehouseAddress] = useState(
    user.warehouseAddress
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    try {
      const res = await api.put<OwnerUser>('/auth/profile', {
        fullName,
        businessName,
        role,
        phone,
        email,
        warehouseAddress,
      });
      onUserUpdated(res.data);
      setMessage('Owner profile updated.');
    } catch {
      setError('Failed to update profile details.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl rounded-xl border border-slate-200 bg-white p-6 sm:p-8">
      <div className="border-b border-slate-200 pb-4">
        <h2 className="font-display text-lg font-semibold text-slate-900">
          Owner & Business Profile
        </h2>
        <p className="mt-0.5 text-sm text-slate-600">
          Manage business identity and dispatch yard contact information.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="profile-username"
              className="block text-sm font-medium text-slate-700"
            >
              Username
            </label>
            <input
              id="profile-username"
              type="text"
              disabled
              value={user.username}
              className="font-mono-tabular mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-100 px-3.5 py-2 text-sm text-slate-600"
            />
          </div>

          <div>
            <label
              htmlFor="profile-fullname"
              className="block text-sm font-medium text-slate-700"
            >
              Full Name
            </label>
            <input
              id="profile-fullname"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-800/20"
            />
          </div>

          <div>
            <label
              htmlFor="profile-business"
              className="block text-sm font-medium text-slate-700"
            >
              Business Name
            </label>
            <input
              id="profile-business"
              type="text"
              required
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-800/20"
            />
          </div>

          <div>
            <label
              htmlFor="profile-role"
              className="block text-sm font-medium text-slate-700"
            >
              Role / Designation
            </label>
            <input
              id="profile-role"
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-800/20"
            />
          </div>

          <div>
            <label
              htmlFor="profile-phone"
              className="block text-sm font-medium text-slate-700"
            >
              Contact Phone
            </label>
            <input
              id="profile-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="font-mono-tabular mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-800/20"
            />
          </div>

          <div>
            <label
              htmlFor="profile-email"
              className="block text-sm font-medium text-slate-700"
            >
              Operations Email
            </label>
            <input
              id="profile-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-800/20"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="profile-address"
            className="block text-sm font-medium text-slate-700"
          >
            Warehouse & Weighbridge Address
          </label>
          <textarea
            id="profile-address"
            rows={2}
            value={warehouseAddress}
            onChange={(e) => setWarehouseAddress(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-800/20"
          />
        </div>

        {error && (
          <p className="text-sm font-medium text-red-700">{error}</p>
        )}

        {message && (
          <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-900">
            <CheckCircle2 className="h-4 w-4 text-emerald-700" />
            <span>{message}</span>
          </div>
        )}

        <div>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-emerald-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-60 transition-colors cursor-pointer"
          >
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
}
