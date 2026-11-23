import {
  ArrowLeft,
  CreditCard,
  LayoutDashboard,
  LogOut,
  MessageSquareText,
  Settings,
  User,
  Users,
  X,
} from 'lucide-react';

export type DashboardTab =
  | 'dashboard'
  | 'clients'
  | 'payments'
  | 'quotes'
  | 'profile'
  | 'settings';

interface SidebarProps {
  activeTab: DashboardTab;
  onSelectTab: (tab: DashboardTab) => void;
  onBackToSite: () => void;
  onLogout: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  newQuotesCount?: number;
}

const NAV_ITEMS: { id: DashboardTab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'clients', label: 'Clients', icon: Users },
  { id: 'payments', label: 'Payments & Expenditures', icon: CreditCard },
  { id: 'quotes', label: 'Quotes', icon: MessageSquareText },
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function Sidebar({
  activeTab,
  onSelectTab,
  onBackToSite,
  onLogout,
  mobileOpen,
  onCloseMobile,
  newQuotesCount = 0,
}: SidebarProps) {
  const content = (
    <div className="flex h-full w-64 flex-col border-r border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <div>
          <p className="font-display text-base font-bold tracking-tight text-slate-900">
            Mallikarjuna
          </p>
          <p className="text-xs text-slate-500">Sugarcane Suppliers</p>
        </div>
        <button
          type="button"
          onClick={onCloseMobile}
          aria-label="Close sidebar"
          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 lg:hidden cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 p-3" aria-label="Owner dashboard navigation">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                onSelectTab(item.id);
                onCloseMobile();
              }}
              className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors cursor-pointer ${
                active
                  ? 'bg-emerald-900 text-white'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span className="flex min-w-0 items-center gap-3">
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </span>
              {item.id === 'quotes' && newQuotesCount > 0 && (
                <span
                  className={`font-mono-tabular text-xs font-semibold ${
                    active ? 'text-emerald-200' : 'text-emerald-800'
                  }`}
                >
                  {newQuotesCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="space-y-1 border-t border-slate-200 p-3">
        <button
          type="button"
          onClick={onBackToSite}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" />
          <span>Public Website</span>
        </button>
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop fixed sidebar */}
      <aside className="hidden lg:block lg:shrink-0">{content}</aside>

      {/* Mobile slide-over drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs"
            onClick={onCloseMobile}
          />
          <div className="relative z-10 flex h-full">{content}</div>
        </div>
      )}
    </>
  );
}
