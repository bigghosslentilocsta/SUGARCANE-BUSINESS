import { Lock, X } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { api, setAuthToken } from '../api/client.ts';
import { OwnerUser } from '../types/index.ts';

interface OwnerLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: OwnerUser) => void;
}

export function OwnerLoginModal({
  isOpen,
  onClose,
  onLoginSuccess,
}: OwnerLoginModalProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setUsername('');
      setPassword('');
      setError('');
      setLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!username.trim() || !password) {
      setError('Enter both username and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post<{ token: string; user: OwnerUser }>(
        '/auth/login',
        {
          username: username.trim(),
          password,
        }
      );
      setAuthToken(res.data.token);
      setUsername('');
      setPassword('');
      onLoginSuccess(res.data.user);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Invalid credentials. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="owner-login-title"
    >
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-900 text-white">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <h2
                id="owner-login-title"
                className="font-display text-xl font-bold text-slate-900"
              >
                Owner Login
              </h2>
              <p className="text-xs text-slate-500">
                Authorized Personnel Only
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close login modal"
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="login-username"
              className="block text-sm font-medium text-slate-700"
            >
              Username
            </label>
            <input
              id="login-username"
              type="text"
              autoComplete="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter owner username"
              className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-800/20"
            />
          </div>

          <div>
            <label
              htmlFor="login-password"
              className="block text-sm font-medium text-slate-700"
            >
              Password
            </label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter owner password"
              className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-800/20"
            />
          </div>

          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-emerald-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60 transition-colors cursor-pointer"
          >
            {loading ? 'Verifying...' : 'Sign In to Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
}
