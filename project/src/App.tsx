import { useCallback, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useStore } from '@/contexts/StoreContext';
import { Link, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { ProductsPage } from '@/pages/ProductsPage';
import { ProductDetailPage } from '@/pages/ProductDetailPage';
import { NewProductPage } from '@/pages/NewProductPage';
import { ExpirationsPage } from '@/pages/ExpirationsPage';
import { EntriesPage } from '@/pages/EntriesPage';
import { NewEntryPage } from '@/pages/NewEntryPage';
import { LiveNotificationsPage } from '@/pages/management/LiveNotificationsPage';
import { LivePromotionsPage } from '@/pages/management/LivePromotionsPage';
import { LiveReportsPage } from '@/pages/management/LiveReportsPage';
import { LiveSettingsPage } from '@/pages/management/LiveSettingsPage';
import { LoadingState } from '@/components/ui/LoadingState';
import { useInventoryOverview, useInventoryRequest, useInventoryScope } from '@/hooks/useInventory';
import { inventoryService, type ExpirationItem } from '@/services/inventory';
import { formatCurrency, formatDate, formatNumber } from '@/utils/format';
import {
  LayoutDashboard,
  Package,
  Clock3,
  ArrowLeftRight,
  Tag,
  Bell,
  Settings,
  Menu,
  ChartNoAxesCombined,
  X,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';

type Page =
  | 'dashboard'
  | 'products'
  | 'expiration'
  | 'entries'
  | 'promotions'
  | 'notifications'
  | 'reports'
  | 'settings';

const navigation = [
  {
    id: 'dashboard' as Page,
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    id: 'products' as Page,
    label: 'Produtos',
    icon: Package,
  },
  {
    id: 'entries' as Page,
    label: 'Movimentações',
    icon: ArrowLeftRight,
  },
  {
    id: 'expiration' as Page,
    label: 'Vencimentos',
    icon: Clock3,
  },
  {
    id: 'promotions' as Page,
    label: 'Promoções',
    icon: Tag,
  },
  {
    id: 'reports' as Page,
    label: 'Relatórios',
    icon: ChartNoAxesCombined,
  },
  {
    id: 'notifications' as Page,
    label: 'Notificações',
    icon: Bell,
  },
  {
    id: 'settings' as Page,
    label: 'Configurações',
    icon: Settings,
  },
];

const paths: Record<Page, string> = {
  dashboard: '/',
  products: '/products',
  expiration: '/expirations',
  entries: '/entries',
  promotions: '/promotions',
  reports: '/reports',
  notifications: '/notifications',
  settings: '/settings',
};

function App() {
  const { user, logout } = useAuth();
  const { store, stores, selectStore } = useStore();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const currentNavigation = navigation.find(({ id }) => {
    const path = paths[id];
    return pathname === path || (path !== '/' && pathname.startsWith(path + '/'));
  });

  const handleNavigation = (page: Page) => {
    navigate(paths[page]);
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-ink-50 text-ink-900">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Fechar menu"
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex w-64 flex-col
          border-r border-ink-200 bg-white
          transition-transform duration-200
          lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-ink-200 px-5">
          <button
            type="button"
            onClick={() => handleNavigation('dashboard')}
            className="flex items-center gap-3"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white">
              <Package size={20} />
            </div>

            <div className="text-left">
              <p className="text-sm font-bold text-ink-900">
                Controle de Estoque
              </p>
              <p className="text-xs text-ink-500">Gestão inteligente</p>
            </div>
          </button>

          <button
            type="button"
            className="rounded-lg p-2 text-ink-500 hover:bg-ink-100 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Fechar menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-3">
          <p className="mb-3 px-3 pt-2 text-xs font-semibold uppercase tracking-wider text-ink-400">
            Menu
          </p>

          {navigation.map((item) => {
            const Icon = item.icon;
            const active = currentNavigation?.id === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavigation(item.id)}
                className={`
                  flex w-full items-center gap-3 rounded-lg px-3 py-2.5
                  text-sm font-medium transition-colors
                  ${
                    active
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-ink-600 hover:bg-ink-50 hover:text-ink-900'
                  }
                `}
              >
                <Icon size={19} />
                <span>{item.label}</span>

              </button>
            );
          })}
        </nav>

        {/* Store */}
        <div className="border-t border-ink-200 p-4 space-y-2">
          <label className="block text-xs font-medium text-ink-600">
            Loja ativa
            <select className="input-field mt-1" value={store.id} onChange={(event) => selectStore(event.target.value)}>
              {stores.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </label>
          <p className="truncate text-xs text-ink-500" title={user?.email}>{user?.email}</p>
          <button type="button" className="btn-ghost text-xs" onClick={logout}>Sair</button>
        </div>
      </aside>

      {/* Main */}
      <div className="lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-ink-200 bg-white/95 px-4 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-lg p-2 text-ink-600 hover:bg-ink-100 lg:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Abrir menu"
            >
              <Menu size={22} />
            </button>

            <div>
              <h1 className="text-lg font-semibold text-ink-900">
                {currentNavigation?.label ?? 'Entradas'}
              </h1>

              <p className="hidden text-xs text-ink-500 sm:block">
                Gestão do seu estoque
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="relative rounded-lg p-2 text-ink-500 hover:bg-ink-100"
              onClick={() => handleNavigation('notifications')}
              aria-label="Notificações"
            >
              <Bell size={20} />
            </button>

            <button
              type="button"
              onClick={() => handleNavigation('settings')}
              className="hidden items-center gap-2 rounded-lg border border-ink-200 px-3 py-2 text-sm font-medium text-ink-600 hover:bg-ink-50 sm:flex"
            >
              <Settings size={17} />
              Configurações
            </button>
          </div>
        </header>

        <main className={currentNavigation?.id === 'dashboard' ? 'p-4 sm:p-6 lg:p-8' : ''}>
          <Routes key={store.id}>
            <Route index element={<Dashboard />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="products/new" element={<NewProductPage />} />
            <Route path="products/:id" element={<ProductDetailPage />} />
            <Route path="products/:id/edit" element={<NewProductPage />} />
            <Route path="expirations" element={<ExpirationsPage />} />
            <Route path="entries" element={<EntriesPage />} />
            <Route path="entries/new" element={<NewEntryPage />} />
            <Route path="promotions" element={<LivePromotionsPage />} />
            <Route path="reports" element={<LiveReportsPage />} />
            <Route path="notifications" element={<LiveNotificationsPage />} />
            <Route path="settings" element={<LiveSettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function Dashboard() {
  const navigate = useNavigate();
  const { token, storeId } = useInventoryScope();
  const { data: overview, error: overviewError, reload: reloadOverview } = useInventoryOverview();
  const { data: summary, error, reload } = useInventoryRequest(useCallback(
    (signal) => inventoryService.dashboard(token, storeId, signal), [token, storeId],
  ));

  if (error || overviewError) return (
    <div className="card p-5">
      <p role="alert" className="text-error-700">{error ?? overviewError}</p>
      <button className="btn-secondary mt-3" onClick={() => { reload(); reloadOverview(); }}>Tentar novamente</button>
    </div>
  );
  if (!summary || !overview) return <LoadingState />;

  const expiring = summary.criticalLots + summary.attentionLots;
  const controlledLots = summary.normalLots + summary.expiredLots + expiring;
  const healthy = controlledLots > 0 ? Math.round(100 * summary.normalLots / controlledLots) : null;
  const criticalProducts = overview.items.filter((item) => item.lot.quantity > 0 && (item.status === 'critical' || item.status === 'warning'));
  return (
    <div className="mx-auto max-w-7xl space-y-6 animate-fade-in">
      {/* Welcome */}
      <section>
        <p className="text-sm font-medium text-brand-600">Visão geral</p>

        <h2 className="mt-1 text-2xl font-bold tracking-tight text-ink-900">
          Olá 👋
        </h2>

        <p className="mt-1 text-sm text-ink-500">
          Aqui está um resumo do seu estoque hoje.
        </p>
      </section>

      {/* KPI cards */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total de produtos"
          value={formatNumber(summary.stockedProducts)}
          description="Produtos com saldo na loja ativa"
          icon={Package}
        />

        <StatCard
          title="Próximos do vencimento"
          value={formatNumber(expiring)}
          description="Lotes com saldo nos próximos 30 dias"
          icon={Clock3}
          variant="warning"
        />

        <StatCard
          title="Vencidos"
          value={formatNumber(summary.expiredLots)}
          description="Lotes vencidos com saldo"
          icon={AlertCircle}
          variant="error"
        />

        <StatCard
          title="Estoque saudável"
          value={healthy === null ? '—' : `${healthy}%`}
          description="Lotes com saldo e mais de 30 dias de validade"
          icon={CheckCircle2}
          variant="success"
        />
      </section>

      <p className="rounded-lg bg-brand-50 px-4 py-3 text-sm text-ink-700">
        Valor em estoque <strong>{summary.stockValue === null ? 'Custo incompleto' : formatCurrency(summary.stockValue)}</strong>
      </p>

      {/* Alert */}
      <section className="card border-warning-200 bg-warning-50 p-4 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-warning-100 text-warning-700">
              <AlertTriangle size={20} />
            </div>

            <div>
              <h3 className="font-semibold text-warning-900">
                Atenção aos vencimentos
              </h3>

              <p className="mt-1 text-sm text-warning-800">
                {summary.criticalLots > 0
                  ? `${formatNumber(summary.criticalLots)} lote(s) com saldo vencem nos próximos 7 dias.`
                  : 'Nenhum lote com saldo vence nos próximos 7 dias.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate('/expirations?status=critical&stock=available')}
            className="btn-secondary whitespace-nowrap"
          >
            Ver vencimentos
            <ChevronRight size={16} />
          </button>
        </div>
      </section>

      {/* Products */}
      <section className="card overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-ink-200 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-semibold text-ink-900">
              Produtos próximos do vencimento
            </h3>

            <p className="mt-1 text-sm text-ink-500">
              Priorize esses produtos para evitar perdas.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate('/expirations?period=30&stock=available')}
            className="btn-ghost"
          >
            Ver todos
            <ChevronRight size={16} />
          </button>
        </div>

        <ProductTable items={criticalProducts} />
      </section>
    </div>
  );
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  variant = 'default',
}: {
  title: string;
  value: string;
  description: string;
  icon: typeof Package;
  variant?: 'default' | 'warning' | 'error' | 'success';
}) {
  const iconClasses = {
    default: 'bg-brand-50 text-brand-600',
    warning: 'bg-warning-50 text-warning-600',
    error: 'bg-error-50 text-error-600',
    success: 'bg-success-50 text-success-600',
  };

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-ink-500">{title}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-ink-900">
            {value}
          </p>
        </div>

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconClasses[variant]}`}
        >
          <Icon size={20} />
        </div>
      </div>

      <p className="mt-3 text-xs text-ink-500">{description}</p>
    </div>
  );
}

function ProductTable({ items }: { items: ExpirationItem[] }) {
  if (items.length === 0) return <p className="p-5 text-sm text-ink-500">Nenhum produto próximo do vencimento.</p>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[650px] text-left text-sm">
        <thead className="bg-ink-50 text-xs uppercase tracking-wide text-ink-500">
          <tr>
            <th className="px-5 py-3 font-semibold">Produto</th>
            <th className="px-5 py-3 font-semibold">Categoria</th>
            <th className="px-5 py-3 font-semibold">Quantidade</th>
            <th className="px-5 py-3 font-semibold">Vencimento</th>
            <th className="px-5 py-3 font-semibold">Status</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-ink-100">
          {items.map(({ product, lot, status }) => (
            <tr key={lot.id} className="hover:bg-ink-50">
              <td className="px-5 py-4 font-medium text-ink-900">
                <Link className="hover:underline" to={`/products/${product.id}`}>{product.name}</Link>
                <p className="text-xs text-ink-500">Lote {lot.lotNumber}</p>
              </td>

              <td className="px-5 py-4 text-ink-600">
                {product.category}
              </td>

              <td className="px-5 py-4 text-ink-600">
                {formatNumber(lot.quantity)} {product.unit}
              </td>

              <td className="px-5 py-4 font-medium text-ink-700">
                {formatDate(lot.expirationDate ?? undefined)}
              </td>

              <td className="px-5 py-4">
                <StatusBadge status={status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config = {
    critical: {
      label: 'Crítico',
      className: 'bg-error-50 text-error-700',
    },
    warning: {
      label: 'Atenção',
      className: 'bg-warning-50 text-warning-700',
    },
    normal: {
      label: 'Normal',
      className: 'bg-success-50 text-success-700',
    },
  };

  const current =
    config[status as keyof typeof config] ?? config.normal;

  return (
    <span className={`badge ${current.className}`}>
      {current.label}
    </span>
  );
}

export default App;
