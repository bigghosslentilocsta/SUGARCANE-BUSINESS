import { Menu } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '../../api/client.ts';
import { InquiryItem, OwnerUser } from '../../types/index.ts';
import { ClientsManager } from './ClientsManager.tsx';
import { DashboardOverview } from './DashboardOverview.tsx';
import { PaymentsExpendituresPage } from './PaymentsExpendituresPage.tsx';
import { ProfilePage } from './ProfilePage.tsx';
import { QuotesPage } from './QuotesPage.tsx';
import { SettingsPage } from './SettingsPage.tsx';
import { DashboardTab, Sidebar } from './Sidebar.tsx';

interface OwnerDashboardLayoutProps {
  user: OwnerUser;
  onUserUpdated: (user: OwnerUser) => void;
  onBackToSite: () => void;
  onLogout: () => void;
}

const TAB_TITLES: Record<DashboardTab, string> = {
  dashboard: 'Dashboard',
  clients: 'Clients',
  payments: 'Payments & Expenditures',
  quotes: 'Quotes',
  profile: 'Profile',
  settings: 'Settings',
};

export function OwnerDashboardLayout({
  user,
  onUserUpdated,
  onBackToSite,
  onLogout,
}: OwnerDashboardLayoutProps) {
  const [activeTab, setActiveTab] = useState<DashboardTab>('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [newQuotesCount, setNewQuotesCount] = useState(0);

  useEffect(() => {
    document.documentElement.lang = 'en';
  }, []);

  useEffect(() => {
    api
      .get<{ quotes: InquiryItem[] }>('/inquiries')
      .then((res) => {
        const rows = res.data.quotes || [];
        setNewQuotesCount(rows.filter((q) => q.status === 'New').length);
      })
      .catch(() => {});
  }, [activeTab]);

  return (
    <div className="flex min-h-screen bg-[#FAFBF9] text-slate-900">
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onBackToSite={onBackToSite}
        onLogout={onLogout}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        newQuotesCount={newQuotesCount}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-6 py-3.5">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open sidebar navigation"
              className="rounded-lg border border-slate-200 p-2 text-slate-700 hover:bg-slate-100 lg:hidden cursor-pointer"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-500">Owner Portal</span>
              <span className="text-slate-300">/</span>
              <h1 className="font-display font-semibold text-slate-900">
                {TAB_TITLES[activeTab]}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4 text-right">
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-slate-900">
                {user.fullName}
              </p>
              <p className="text-xs text-slate-500">{user.role}</p>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {activeTab === 'dashboard' && (
              <DashboardOverview
                onNavigatePayments={() => setActiveTab('payments')}
              />
            )}
            {activeTab === 'clients' && <ClientsManager />}
            {activeTab === 'payments' && <PaymentsExpendituresPage />}
            {activeTab === 'quotes' && (
              <QuotesPage onNewCountChange={setNewQuotesCount} />
            )}
            {activeTab === 'profile' && (
              <ProfilePage user={user} onUserUpdated={onUserUpdated} />
            )}
            {activeTab === 'settings' && <SettingsPage onForceLogout={onLogout} />}
          </div>
        </main>
      </div>
    </div>
  );
}
