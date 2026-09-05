import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardService } from '@/services';
import { useAuth } from '@/contexts/AuthContext';
import type { DashboardSummary, DashboardAlert, CriticalProduct } from '@/types';
import { DashboardCard } from '@/components/ui/DashboardCard';
import { AlertCard } from '@/components/ui/AlertCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ExpirationBadge } from '@/components/ui/ExpirationBadge';
import { LoadingState } from '@/components/ui/LoadingState';
import { RegisterActionModal } from '@/components/features/RegisterActionModal';
import { formatCurrency, formatDate, getGreeting, getDaysRemainingLabel } from '@/utils/format';
import { AlertTriangle, Clock, CalendarClock, DollarSign, Package, Boxes, Layers, Eye, Zap } from 'lucide-react';
import type { ActionType } from '@/types';

export function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [critical, setCritical] = useState<CriticalProduct[]>([]);
  const [alerts, setAlerts] = useState<DashboardAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionModal, setActionModal] = useState<{ open: boolean; item: CriticalProduct | null }>({ open: false, item: null });

  useEffect(() => {
    dashboardService.getDashboard().then((data) => {
      setSummary(data.summary);
      setCritical(data.criticalProducts);
      setAlerts(data.alerts);
      setLoading(false);
    });
  }, []);

  function dismissAlert(id: string) {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }

  function handleActionConfirm(_type: ActionType) {
    setActionModal({ open: false, item: null });
  }

  if (loading) return <LoadingState />;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ink-900">{getGreeting()}, {user?.name?.split(' ')[0]}!</h1>
        <p className="text-sm text-ink-500 mt-1">Aqui está o resumo do seu estoque.</p>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-3 mb-6">
          {alerts.map((alert) => (
            <AlertCard
              key={alert.id}
              level={alert.level}
              title={alert.title}
              message={alert.message}
              actionLabel={alert.actionLabel}
              onAction={() => navigate(alert.actionLink)}
              onDismiss={() => dismissAlert(alert.id)}
            />
          ))}
        </div>
      )}

      {/* Main cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <DashboardCard
          icon={AlertTriangle}
          label="Produtos vencidos"
          value={summary?.expiredCount ?? 0}
          tone="error"
        />
        <DashboardCard
          icon={Clock}
          label="Vencendo em 7 dias"
          value={summary?.expiring7Days ?? 0}
          tone="warning"
        />
        <DashboardCard
          icon={CalendarClock}
          label="Vencendo em 30 dias"
          value={summary?.expiring30Days ?? 0}
          tone="brand"
        />
        <DashboardCard
          icon={DollarSign}
          label="Estoque em risco"
          value={formatCurrency(summary?.riskValue ?? 0)}
          tone="error"
        />
      </div>

      {/* Stock summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg bg-brand-100 flex items-center justify-center">
              <Package className="w-4.5 h-4.5 text-brand-600" />
            </div>
            <span className="text-sm font-medium text-ink-600">Total de produtos</span>
          </div>
          <p className="text-2xl font-bold text-ink-900">{summary?.totalProducts ?? 0}</p>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg bg-accent-100 flex items-center justify-center">
              <Boxes className="w-4.5 h-4.5 text-accent-600" />
            </div>
            <span className="text-sm font-medium text-ink-600">Total de unidades</span>
          </div>
          <p className="text-2xl font-bold text-ink-900">{summary?.totalUnits ?? 0}</p>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg bg-warning-100 flex items-center justify-center">
              <Layers className="w-4.5 h-4.5 text-warning-600" />
            </div>
            <span className="text-sm font-medium text-ink-600">Total de lotes</span>
          </div>
          <p className="text-2xl font-bold text-ink-900">{summary?.totalLots ?? 0}</p>
        </div>
      </div>

      {/* Critical products table */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-ink-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-ink-900">Produtos que precisam da sua atenção</h2>
            <p className="text-xs text-ink-500 mt-0.5">Ordenados por proximidade do vencimento</p>
          </div>
          <button onClick={() => navigate('/expirations')} className="btn-ghost text-sm">
            Ver todas
          </button>
        </div>

        {critical.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="text-sm text-ink-500">Nenhum produto próximo do vencimento no momento.</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-ink-50 text-ink-500 text-xs uppercase tracking-wide">
                    <th className="px-5 py-3 text-left font-medium">Produto</th>
                    <th className="px-5 py-3 text-left font-medium">Lote</th>
                    <th className="px-5 py-3 text-right font-medium">Qtd.</th>
                    <th className="px-5 py-3 text-left font-medium">Validade</th>
                    <th className="px-5 py-3 text-left font-medium">Dias restantes</th>
                    <th className="px-5 py-3 text-right font-medium">Valor em risco</th>
                    <th className="px-5 py-3 text-left font-medium">Status</th>
                    <th className="px-5 py-3 text-right font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-100">
                  {critical.slice(0, 8).map((item) => (
                    <tr key={item.lot.id} className="hover:bg-ink-50/50 transition-colors">
                      <td className="px-5 py-3 font-medium text-ink-800">{item.product.name}</td>
                      <td className="px-5 py-3 text-ink-600 font-mono text-xs">{item.lot.lotNumber}</td>
                      <td className="px-5 py-3 text-right text-ink-600">{item.lot.currentQuantity}</td>
                      <td className="px-5 py-3 text-ink-600">{formatDate(item.lot.expirationDate)}</td>
                      <td className="px-5 py-3">
                        <ExpirationBadge expirationDate={item.lot.expirationDate} daysRemaining={item.daysRemaining} />
                      </td>
                      <td className="px-5 py-3 text-right font-medium text-ink-800">{formatCurrency(item.riskValue)}</td>
                      <td className="px-5 py-3">
                        <StatusBadge status={item.status} size="sm" />
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => navigate(`/products/${item.product.id}`)}
                            className="p-1.5 rounded-lg text-ink-500 hover:bg-ink-100 hover:text-ink-700 transition-colors"
                            title="Ver"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setActionModal({ open: true, item })}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-brand-50 text-brand-700 text-xs font-medium hover:bg-brand-100 transition-colors"
                          >
                            <Zap className="w-3.5 h-3.5" />
                            Registrar ação
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="lg:hidden divide-y divide-ink-100">
              {critical.slice(0, 8).map((item) => (
                <div key={item.lot.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-ink-800 text-sm">{item.product.name}</p>
                      <p className="text-xs text-ink-500 mt-0.5">Lote {item.lot.lotNumber} • {item.lot.currentQuantity} unidades</p>
                    </div>
                    <StatusBadge status={item.status} size="sm" />
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-ink-500">Validade: {formatDate(item.lot.expirationDate)}</span>
                    <span className="font-medium text-ink-700">{formatCurrency(item.riskValue)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ExpirationBadge expirationDate={item.lot.expirationDate} daysRemaining={item.daysRemaining} />
                    <button
                      onClick={() => setActionModal({ open: true, item })}
                      className="ml-auto inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-brand-50 text-brand-700 text-xs font-medium"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      Registrar ação
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <RegisterActionModal
        open={actionModal.open}
        onClose={() => setActionModal({ open: false, item: null })}
        item={actionModal.item}
        onConfirm={handleActionConfirm}
      />
    </div>
  );
}
