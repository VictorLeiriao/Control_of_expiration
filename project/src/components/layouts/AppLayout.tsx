import { NavLink, useNavigate } from 'react-router-dom';
import { cn } from '@/utils/cn';
import { useAuth } from '@/contexts/AuthContext';
import { useApp } from '@/contexts/AppContext';
import {
  LayoutDashboard,
  Package,
  CalendarClock,
  ArrowDownToLine,
  BarChart3,
  Bot,
  Settings,
  Bell,
  LogOut,
  User as UserIcon,
  Menu,
  X,
  Boxes,
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/products', label: 'Produtos', icon: Package },
  { to: '/expirations', label: 'Validades', icon: CalendarClock },
  { to: '/entries', label: 'Entradas', icon: ArrowDownToLine },
  { to: '/reports', label: 'Relatórios', icon: BarChart3 },
  { to: '/assistant', label: 'Assistente', icon: Bot },
];

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { company } = useApp();

  return (
    <div className="flex flex-col h-full w-64 bg-white border-r border-ink-200">
      {/* Logo area */}
      <div className="px-5 py-5 border-b border-ink-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center flex-shrink-0">
            {company.logoBase64 ? (
              <img src={company.logoBase64} alt="Logo" className="w-full h-full rounded-xl object-cover" />
            ) : (
              <Boxes className="w-5 h-5 text-white" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-ink-900 truncate">{company.name}</p>
            <p className="text-xs text-ink-400 truncate">Controle de estoque</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                      isActive
                        ? 'bg-brand-50 text-brand-700'
                        : 'text-ink-600 hover:bg-ink-50 hover:text-ink-900'
                    )
                  }
                >
                  <Icon className="w-[18px] h-[18px] flex-shrink-0" />
                  {item.label}
                </NavLink>
              </li>
            );
          })}
        </ul>

        <div className="pt-4 mt-4 border-t border-ink-100">
          <NavLink
            to="/settings"
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                isActive
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-ink-600 hover:bg-ink-50 hover:text-ink-900'
              )
            }
          >
            <Settings className="w-[18px] h-[18px] flex-shrink-0" />
            Configurações
          </NavLink>
          <NavLink
            to="/notifications"
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                isActive
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-ink-600 hover:bg-ink-50 hover:text-ink-900'
              )
            }
          >
            <Bell className="w-[18px] h-[18px] flex-shrink-0" />
            Notificações
          </NavLink>
        </div>
      </nav>

      {/* User area */}
      <div className="px-3 py-3 border-t border-ink-200">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-ink-50 transition-colors group">
          <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center text-sm font-semibold text-brand-700 flex-shrink-0">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-ink-800 truncate">{user?.name}</p>
            <p className="text-xs text-ink-400 truncate">{user?.email}</p>
          </div>
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="p-1.5 rounded-lg text-ink-400 hover:text-error-600 hover:bg-error-50 transition-colors"
            title="Sair"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-ink-50">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-ink-900/50 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative animate-slide-in-right">
            <Sidebar onNavigate={() => setMobileMenuOpen(false)} />
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-4 -right-12 w-10 h-10 rounded-lg bg-white shadow-elevated flex items-center justify-center text-ink-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-ink-200">
          <button onClick={() => setMobileMenuOpen(true)} className="p-2 rounded-lg text-ink-600 hover:bg-ink-100">
            <Menu className="w-5 h-5" />
          </button>
          <span className="text-sm font-semibold text-ink-800">Controle de estoque</span>
          <div className="w-9" />
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
