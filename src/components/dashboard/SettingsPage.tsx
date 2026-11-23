import { CheckCircle2, KeyRound, LogOut, ShieldCheck } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { api, setAuthToken } from '../../api/client.ts';

interface SettingsPageProps {
  onForceLogout: () => void;
}

export function SettingsPage({ onForceLogout }: SettingsPageProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [revokingAll, setRevokingAll] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('All password fields are required.');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }

    setSaving(true);
    try {
      const res = await api.put<{ message: string; token?: string }>(
        '/auth/change-password',
        {
          currentPassword,
          newPassword,
          confirmPassword,
        }
      );
      if (res.data.token) {
        setAuthToken(res.data.token);
      }
      setSuccess(
        res.data.message ||
          'Password updated successfully. Other sessions signed out.'
      );
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Failed to update password.';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleLogoutAllSessions = async () => {
    setRevokingAll(true);
    setError('');
    try {
      await api.post('/auth/logout-all');
      onForceLogout();
    } catch {
      setError('Unable to revoke all sessions. Please try again.');
      setRevokingAll(false);
    }
  };

  return (
    <div className="max-w-xl space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8">
        <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-[#FAFBF9] text-emerald-900">
            <KeyRound className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-display text-lg font-semibold text-slate-900">
              Change Owner Password
            </h2>
            <p className="text-xs text-slate-500">
              Updating your password automatically signs out all other active devices
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="current-password"
              className="block text-sm font-medium text-slate-700"
            >
              Current Password
            </label>
            <input
              id="current-password"
              type="password"
              required
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-800/20"
            />
          </div>

          <div>
            <label
              htmlFor="new-password"
              className="block text-sm font-medium text-slate-700"
            >
              New Password
            </label>
            <input
              id="new-password"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-800/20"
            />
          </div>

          <div>
            <label
              htmlFor="confirm-password"
              className="block text-sm font-medium text-slate-700"
            >
              Confirm New Password
            </label>
            <input
              id="confirm-password"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-800/20"
            />
          </div>

          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          {success && (
            <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-900">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-700" />
              <span>{success}</span>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-emerald-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-60 transition-colors cursor-pointer"
            >
              {saving ? 'Updating Password...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8">
        <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-[#FAFBF9] text-emerald-900">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-display text-lg font-semibold text-slate-900">
              Session Security
            </h2>
            <p className="text-xs text-slate-500">
              Sessions expire automatically after 30 minutes of inactivity or 12 hours
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <p className="text-sm text-slate-600">
            Revoke access across all browsers and phones where you previously signed in.
          </p>
          <button
            type="button"
            onClick={handleLogoutAllSessions}
            disabled={revokingAll}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-60 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <LogOut className="h-4 w-4" />
            <span>{revokingAll ? 'Signing Out...' : 'Sign Out All Devices'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
