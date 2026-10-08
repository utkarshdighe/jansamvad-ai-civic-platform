import type { ReactNode } from 'react';
import { useState } from 'react';
import { Bell, LogOut, Menu, X, Building2 } from 'lucide-react';
import { useStore } from '@/lib/store';
import { timeAgo } from '@/lib/utils';
import type { Role } from '@/lib/types';
import AIChatbot from './AIChatbot';

export interface NavItem {
  id: string;
  label: string;
  icon: ReactNode;
}

interface DashboardLayoutProps {
  navItems: NavItem[];
  activeNav: string;
  onNavChange: (id: string) => void;
  title: string;
  subtitle: string;
  children: ReactNode;
  role: Role;
}

const roleColors: Record<Role, string> = {
  citizen: 'from-blue-600 to-blue-700',
  authority: 'from-teal-600 to-teal-700',
  workforce: 'from-orange-600 to-orange-700',
  influencer: 'from-fuchsia-600 to-fuchsia-700',
};

const roleLabels: Record<Role, string> = {
  citizen: 'Citizen',
  authority: 'Municipal Authority',
  workforce: 'Field Workforce',
  influencer: 'Influencer',
};

export default function DashboardLayout({
  navItems,
  activeNav,
  onNavChange,
  title,
  subtitle,
  children,
  role,
}: DashboardLayoutProps) {
  const { currentUser, logout, notifications, markNotificationRead, markAllNotificationsRead } = useStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const userNotifs = notifications.filter((n) => n.role === role && n.userId === currentUser?.id);
  const unreadCount = userNotifs.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-white border-r border-gray-200 flex flex-col z-40 transition-transform ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className={`px-5 py-5 bg-gradient-to-br ${roleColors[role]}`}>
          <div className="flex items-center gap-2.5 text-white">
            <div className="p-1.5 bg-white/20 rounded-lg">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">JanSamvad</h1>
              <p className="text-xs text-white/80">{roleLabels[role]} Portal</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onNavChange(item.id);
                setMobileOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium mb-1 transition-colors ${
                activeNav === item.id
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        <div className="border-t border-gray-200 p-3">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${roleColors[role]} text-white flex items-center justify-center font-semibold text-sm`}>
              {currentUser?.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{currentUser?.name}</p>
              <p className="text-xs text-gray-400 truncate">{currentUser?.area}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 mt-2 rounded-lg text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>

      {mobileOpen && <div className="fixed inset-0 bg-gray-900/40 z-30 lg:hidden" onClick={() => setMobileOpen(false)} />}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TopBar */}
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b border-gray-200 px-4 lg:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 text-gray-600">
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div>
              <h2 className="text-lg font-bold text-gray-900">{title}</h2>
              <p className="text-xs text-gray-400 hidden sm:block">{subtitle}</p>
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative p-2 rounded-lg hover:bg-gray-100 text-gray-600"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setNotifOpen(false)} />
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-40 max-h-96 overflow-y-auto">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                    <p className="font-semibold text-sm text-gray-900">Notifications</p>
                    {unreadCount > 0 && (
                      <button
                        onClick={() => markAllNotificationsRead(role, currentUser?.id || '')}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  {userNotifs.length === 0 ? (
                    <p className="px-4 py-6 text-sm text-gray-400 text-center">No notifications</p>
                  ) : (
                    userNotifs.slice(0, 15).map((n) => (
                      <button
                        key={n.id}
                        onClick={() => markNotificationRead(n.id)}
                        className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 ${!n.read ? 'bg-blue-50/40' : ''}`}
                      >
                        <p className="text-sm font-medium text-gray-900">{n.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                        <p className="text-[10px] text-gray-400 mt-1">{timeAgo(n.timestamp)}</p>
                      </button>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">{children}</main>
      </div>

      <AIChatbot />
    </div>
  );
}
