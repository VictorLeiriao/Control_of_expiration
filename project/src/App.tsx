import { useState } from 'react';
import {
  LayoutDashboard,
  Package,
  Clock3,
  Tag,
  Bell,
  Settings,
  Menu,
  X,
  Search,
  Plus,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  TrendingDown,
  ChevronRight,
} from 'lucide-react';

type Page =
  | 'dashboard'
  | 'products'
  | 'expiration'
  | 'promotions'
  | 'notifications'
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

const products = [
  {
    name: 'Leite Integral 1L',
    category: 'Laticínios',
    quantity: 24,
    expiration: '08/09/2026',
    status: 'critical',
  },
  {
    name: 'Iogurte Natural',
    category: 'Laticínios',
    quantity: 18,
    expiration: '11/09/2026',
    status: 'warning',
  },
  {
    name: 'Arroz 5kg',
    category: 'Mercearia',
    quantity: 42,
    expiration: '15/12/2026',
    status: 'normal',
  },
  {
    name: 'Molho de Tomate',
    category: 'Mercearia',
    quantity: 31,
    expiration: '22/10/2026',
    status: 'normal',
  },
];

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const currentNavigation = navigation.find(
    (item) => item.id === currentPage
  );

  const handleNavigation = (page: Page) => {
    setCurrentPage(page);
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
            const active = currentPage === item.id;

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

                {item.id === 'expiration' && (
                  <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-error-100 px-1.5 text-xs font-semibold text-error-700">
                    2
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Store */}
        <div className="border-t border-ink-200 p-4">
          <div className="flex items-center gap-3 rounded-lg bg-ink-50 p-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 font-semibold text-brand-700">
              M
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-ink-800">
                Minha Loja
              </p>
              <p className="truncate text-xs text-ink-500">
                Administrador
              </p>
            </div>
          </div>
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
                {currentNavigation?.label}
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

              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-error-500" />
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

        <main className="p-4 sm:p-6 lg:p-8">
          {currentPage === 'dashboard' && (
            <Dashboard
              onNavigate={handleNavigation}
            />
          )}

          {currentPage === 'products' && <ProductsPage />}

          {currentPage === 'expiration' && <ExpirationPage />}

          {currentPage === 'promotions' && <PromotionsPage />}

          {currentPage === 'notifications' && <NotificationsPage />}

          {currentPage === 'settings' && <SettingsPage />}
        </main>
      </div>
    </div>
  );
}

function Dashboard({ onNavigate }: { onNavigate: (page: Page) => void }) {
  return (
    <div className="mx-auto max-w-7xl space-y-6 animate-fade-in">
      {/* Welcome */}
      <section>
        <p className="text-sm font-medium text-brand-600">Visão geral</p>

        <h2 className="mt-1 text-2xl font-bold tracking-tight text-ink-900">
          Olá, administrador 👋
        </h2>

        <p className="mt-1 text-sm text-ink-500">
          Aqui está um resumo do seu estoque hoje.
        </p>
      </section>

      {/* KPI cards */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total de produtos"
          value="248"
          description="Produtos cadastrados"
          icon={Package}
        />

        <StatCard
          title="Próximos do vencimento"
          value="18"
          description="Nos próximos 30 dias"
          icon={Clock3}
          variant="warning"
        />

        <StatCard
          title="Vencidos"
          value="4"
          description="Precisam de atenção"
          icon={AlertCircle}
          variant="error"
        />

        <StatCard
          title="Estoque saudável"
          value="91%"
          description="Produtos dentro da validade"
          icon={CheckCircle2}
          variant="success"
        />
      </section>

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
                Existem <strong>2 produtos</strong> vencendo nos próximos
                7 dias.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('expiration')}
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
            onClick={() => onNavigate('expiration')}
            className="btn-ghost"
          >
            Ver todos
            <ChevronRight size={16} />
          </button>
        </div>

        <ProductTable />
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

function ProductTable() {
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
          {products.map((product) => (
            <tr key={product.name} className="hover:bg-ink-50">
              <td className="px-5 py-4 font-medium text-ink-900">
                {product.name}
              </td>

              <td className="px-5 py-4 text-ink-600">
                {product.category}
              </td>

              <td className="px-5 py-4 text-ink-600">
                {product.quantity} un.
              </td>

              <td className="px-5 py-4 font-medium text-ink-700">
                {product.expiration}
              </td>

              <td className="px-5 py-4">
                <StatusBadge status={product.status} />
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

function ProductsPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6 animate-fade-in">
      <PageHeader
        title="Produtos"
        description="Gerencie os produtos cadastrados no seu estoque."
        action={
          <button type="button" className="btn-primary">
            <Plus size={18} />
            Novo produto
          </button>
        }
      />

      <div className="card p-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400"
            />

            <input
              className="input-field pl-10"
              placeholder="Buscar produto..."
            />
          </div>

          <button type="button" className="btn-secondary">
            Todas as categorias
          </button>
        </div>
      </div>

      <div className="card p-8 text-center">
        <Package
          size={42}
          className="mx-auto text-ink-300"
        />

        <h3 className="mt-4 font-semibold text-ink-800">
          Área de produtos
        </h3>

        <p className="mx-auto mt-2 max-w-md text-sm text-ink-500">
          A estrutura da tela já está preparada. A próxima etapa será
          conectar o cadastro e gerenciamento dos produtos ao backend.
        </p>
      </div>
    </div>
  );
}

function ExpirationPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6 animate-fade-in">
      <PageHeader
        title="Vencimentos"
        description="Acompanhe os lotes e produtos que estão próximos da validade."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          title="Vencidos"
          value="4"
          description="Precisam de ação imediata"
          icon={AlertCircle}
          variant="error"
        />

        <StatCard
          title="Próximos 7 dias"
          value="2"
          description="Prioridade máxima"
          icon={AlertTriangle}
          variant="warning"
        />

        <StatCard
          title="Próximos 30 dias"
          value="18"
          description="Planeje a saída"
          icon={Clock3}
          variant="warning"
        />
      </div>

      <div className="card p-8 text-center">
        <Clock3
          size={42}
          className="mx-auto text-ink-300"
        />

        <h3 className="mt-4 font-semibold text-ink-800">
          Controle de validade
        </h3>

        <p className="mx-auto mt-2 max-w-md text-sm text-ink-500">
          Aqui teremos o controle por lote, datas de validade e
          priorização FEFO — First Expire, First Out.
        </p>
      </div>
    </div>
  );
}

function PromotionsPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6 animate-fade-in">
      <PageHeader
        title="Promoções"
        description="Crie promoções para produtos próximos do vencimento."
        action={
          <button type="button" className="btn-primary">
            <Plus size={18} />
            Nova promoção
          </button>
        }
      />

      <div className="card p-8 text-center">
        <Tag
          size={42}
          className="mx-auto text-ink-300"
        />

        <h3 className="mt-4 font-semibold text-ink-800">
          Aumente suas vendas e reduza perdas
        </h3>

        <p className="mx-auto mt-2 max-w-lg text-sm text-ink-500">
          Produtos próximos do vencimento poderão ser selecionados
          para criação de promoções e cartazes para a loja.
        </p>
      </div>
    </div>
  );
}

function NotificationsPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6 animate-fade-in">
      <PageHeader
        title="Notificações"
        description="Configure como você deseja receber alertas do estoque."
      />

      <div className="grid gap-4 md:grid-cols-2">
        <NotificationCard
          title="E-mail"
          description="Receba alertas de produtos próximos do vencimento."
          enabled
        />

        <NotificationCard
          title="Telegram"
          description="Receba notificações diretamente pelo Telegram."
          enabled={false}
        />
      </div>
    </div>
  );
}

function NotificationCard({
  title,
  description,
  enabled,
}: {
  title: string;
  description: string;
  enabled: boolean;
}) {
  return (
    <div className="card flex items-start justify-between gap-4 p-5">
      <div className="flex gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
          <Bell size={20} />
        </div>

        <div>
          <h3 className="font-semibold text-ink-900">{title}</h3>
          <p className="mt-1 text-sm text-ink-500">{description}</p>
        </div>
      </div>

      <span
        className={`badge ${
          enabled
            ? 'bg-success-50 text-success-700'
            : 'bg-ink-100 text-ink-500'
        }`}
      >
        {enabled ? 'Ativo' : 'Inativo'}
      </span>
    </div>
  );
}

function SettingsPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 animate-fade-in">
      <PageHeader
        title="Configurações"
        description="Configure os dados e preferências da sua loja."
      />

      <div className="card p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
            <Package size={32} />
          </div>

          <div>
            <h3 className="font-semibold text-ink-900">
              Identidade da loja
            </h3>

            <p className="mt-1 text-sm text-ink-500">
              Adicione o logo da sua loja para personalizar o sistema.
            </p>

            <button
              type="button"
              className="btn-secondary mt-3"
            >
              Alterar imagem
            </button>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="font-semibold text-ink-900">
          Informações da loja
        </h3>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-700">
              Nome da loja
            </label>

            <input
              className="input-field"
              defaultValue="Minha Loja"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-700">
              E-mail
            </label>

            <input
              className="input-field"
              placeholder="contato@minhaloja.com"
            />
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button type="button" className="btn-primary">
            Salvar alterações
          </button>
        </div>
      </div>
    </div>
  );
}

function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-ink-900">
          {title}
        </h2>

        <p className="mt-1 text-sm text-ink-500">
          {description}
        </p>
      </div>

      {action}
    </div>
  );
}

export default App;
