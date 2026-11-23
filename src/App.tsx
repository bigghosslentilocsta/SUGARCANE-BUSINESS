import { useCallback, useEffect, useState } from 'react';
import {
  api,
  AUTH_TOKEN_KEY,
  registerUnauthorizedHandler,
  setAuthToken,
} from './api/client.ts';
import { OwnerDashboardLayout } from './components/dashboard/OwnerDashboardLayout.tsx';
import { OwnerLoginModal } from './components/OwnerLoginModal.tsx';
import { PublicLandingPage } from './components/PublicLandingPage.tsx';
import { OwnerUser } from './types/index.ts';

const IDLE_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes inactivity timeout
const PROTECTED_PATH_PREFIXES = ['/owner', '/dashboard', '/admin', '/portal'];

function isProtectedPath(pathname: string): boolean {
  const lower = pathname.toLowerCase();
  return PROTECTED_PATH_PREFIXES.some(
    (prefix) => lower === prefix || lower.startsWith(`${prefix}/`)
  );
}

export default function App() {
  const [user, setUser] = useState<OwnerUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [view, setView] = useState<'public' | 'dashboard'>('public');
  const [loginOpen, setLoginOpen] = useState(false);

  const forcePublicReset = useCallback(() => {
    setAuthToken(null);
    setUser(null);
    setView('public');
    if (isProtectedPath(window.location.pathname)) {
      window.history.replaceState(null, '', '/');
    }
  }, []);

  useEffect(() => {
    registerUnauthorizedHandler(forcePublicReset);
    return () => registerUnauthorizedHandler(null);
  }, [forcePublicReset]);

  // Verify session strictly with the backend on load
  useEffect(() => {
    const hasToken = Boolean(localStorage.getItem(AUTH_TOKEN_KEY));
    const wantsProtectedPath = isProtectedPath(window.location.pathname);

    if (!hasToken && !wantsProtectedPath) {
      setAuthChecked(true);
      return;
    }

    let cancelled = false;
    api
      .get<OwnerUser>('/auth/me')
      .then((res) => {
        if (cancelled) return;
        setUser(res.data);
        if (wantsProtectedPath) {
          setView('dashboard');
        }
      })
      .catch(() => {
        if (cancelled) return;
        forcePublicReset();
      })
      .finally(() => {
        if (!cancelled) {
          setAuthChecked(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [forcePublicReset]);

  // Prevent direct browser history/URL access to owner routes when unauthenticated
  useEffect(() => {
    const handleRouteGuard = () => {
      if (isProtectedPath(window.location.pathname)) {
        if (user) {
          setView('dashboard');
        } else {
          window.history.replaceState(null, '', '/');
          setView('public');
        }
      } else if (window.location.pathname === '/' && view === 'dashboard') {
        setView('public');
      }
    };

    window.addEventListener('popstate', handleRouteGuard);
    return () => window.removeEventListener('popstate', handleRouteGuard);
  }, [user, view]);

  // Auto-logout owner after 30 minutes of inactivity while inside dashboard
  useEffect(() => {
    if (view !== 'dashboard' || !user) return;

    let timer: ReturnType<typeof setTimeout>;
    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        api.post('/auth/logout').catch(() => {});
        forcePublicReset();
      }, IDLE_TIMEOUT_MS);
    };

    const events: (keyof WindowEventMap)[] = [
      'mousemove',
      'keydown',
      'click',
      'scroll',
      'touchstart',
    ];
    events.forEach((ev) => window.addEventListener(ev, resetTimer, { passive: true }));
    resetTimer();

    return () => {
      clearTimeout(timer);
      events.forEach((ev) => window.removeEventListener(ev, resetTimer));
    };
  }, [view, user, forcePublicReset]);

  const enterDashboard = () => {
    if (!user) return;
    setView('dashboard');
    if (window.location.pathname !== '/owner') {
      window.history.pushState(null, '', '/owner');
    }
  };

  const exitToPublicSite = () => {
    setView('public');
    if (window.location.pathname !== '/') {
      window.history.pushState(null, '', '/');
    }
  };

  const handleLoginSuccess = (authenticatedUser: OwnerUser) => {
    setUser(authenticatedUser);
    setLoginOpen(false);
    setView('dashboard');
    if (window.location.pathname !== '/owner') {
      window.history.pushState(null, '', '/owner');
    }
  };

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore network error on logout
    }
    forcePublicReset();
  };

  if (!authChecked && isProtectedPath(window.location.pathname)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAFBF9] text-sm text-slate-600">
        Verifying session...
      </div>
    );
  }

  if (view === 'dashboard' && user) {
    return (
      <OwnerDashboardLayout
        user={user}
        onUserUpdated={setUser}
        onBackToSite={exitToPublicSite}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <>
      <PublicLandingPage
        onOpenLogin={() => setLoginOpen(true)}
        isOwnerAuthenticated={Boolean(user)}
        onEnterDashboard={enterDashboard}
      />
      <OwnerLoginModal
        isOpen={loginOpen}
        onClose={() => setLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </>
  );
}
