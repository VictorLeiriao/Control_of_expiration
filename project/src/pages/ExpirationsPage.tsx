import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { expirationService } from '@/services';
import type { CriticalProduct, ActionType } from '@/types';
import { PageHeader } from '@/components/layouts/PageHeader';
import { DashboardCard } from '@/components/ui/DashboardCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ExpirationBadge } from '@/components/ui/ExpirationBadge';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { SearchInput } from '@/components/ui/SearchInput';
import { FilterDropdown } from '@/components/ui/FilterDropdown';
import { RegisterActionModal } from '@/components/features/RegisterActionModal';
import { formatCurrency, formatDate } from '@/utils/format';
import { AlertTriangle, Clock, CalendarClock, CalendarCheck, Zap, Eye } from 'lucide-react';

type Tab = 'all' | 'expired' | '7days' | '30days' | 'normal';

export function ExpirationsPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<CriticalProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [periodFilter, setPeriodFilter] = useState<Tab>('all');
  const [actionModal, setActionModal] = useState<{ open: boolean; item: CriticalProduct | null }>({ open: false, item: null });

  useEffect(() => {
    expirationService.getExpiringProducts(365).then((data) => {
      setItems(data);
      setLoading(false);
    });
  }, []);

  const counts = {
    expired: items.filter((i) => i.daysRemaining < 0).length,
    '7days': items.filter((i) => i.daysRemaining >= 0 && i.daysRemaining <= 7).length,
    '30days': items.filter((i) => i.daysRemaining > 7 && i.daysRemaining <= 30).length,
    normal: items.filter((i) => i.daysRemaining > 30).length,
  };

  const categories = ['all', ...Array.from(new Set(items.map((i) => i.product.category)))];

  const filtered = items.filter((item) => {
    if (search && !item.product.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (categoryFilter !== 'all' && item.product.category !== categoryFilter) return false;
    if (periodFilter === 'expired' && item.daysRemaining >= 0) return false;
    if (periodFilter === '7days' && (item.daysRemaining < 0 || item.daysRemaining > 7)) return false;
    if (periodFilter === '30days' && (item.daysRemaining < 0 || item.daysRemaining <= 7 || item.daysRemaining > 30)) return false;
    if (periodFilter === 'normal' && item.daysRemaining <= 30) return false;
    return true;
  });

  if (loading) return <LoadingState />;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <PageHeader title="Validades" description="Controle de produtos por proximidade do vencimento" />

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <button onClick={() => setPeriodFilter(periodFilter === 'expired' ? 'all' : 'expired')}>
          <DashboardCard icon={AlertTriangle} label="Vencidos" value={counts.expired} tone="error" />
        </button>
        <button onClick={() => setPeriodFilter(periodFilter === '7days' ? 'all' : '7days')}>
          <DashboardCard icon={Clock} label="Até 7 dias" value={counts['7days']} tone="warning" />
        </button>
        <button onClick={() => setPeriodFilter(periodFilter === '30days' ? 'all' : '30days')}>
          <DashboardCard icon={CalendarClock} label="Até 30 dias" value={counts['30days']} tone="brand" />
        </button>
        <button onClick={() => setPeriodFilter(periodFilter === 'normal' ? 'all' : 'normal')}>
          <DashboardCard icon={CalendarCheck} label="Acima de 30 dias" value={counts.normal} tone="success" />
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1">
          <SearchInput value={search} onChange={setSearch} placeholder="Buscar produto..." />
        </div>
        <FilterDropdown
          value={categoryFilter}
          onChange={setCategoryFilter}
          options={categories.map((c) => ({ value: c, label: c === 'all' ? 'Todas as categorias' : c }))}
        />
        <FilterDropdown
          value={periodFilter}
          onChange={(v) => setPeriodFilter(v as Tab)}
          options={[
            { value: 'all', label: 'Todos os períodos' },
            { value: 'expired', label: 'Vencidos' },
            { value: '7days', label: 'Até 7 dias' },
            { value: '30days', label: 'Até 30 dias' },
            { value: 'normal', label: 'Acima de 30 dias' },
          ]}
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title="Nenhum produto encontrado"
          description="Não há produtos que correspondam aos filtros selecionados."
        />
      ) : (
        <div className="card overflow-hidden">
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
                  <th className="px-5 py-3 text-right font-medium">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {filtered.map((item) => (
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
                        <button onClick={() => navigate(`/products/${item.product.id}`)} className="p-1.5 rounded-lg text-ink-500 hover:bg-ink-100 hover:text-ink-700 transition-colors" title="Ver">
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
            {filtered.map((item) => (
              <div key={item.lot.id} className="p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-ink-800 text-sm">{item.product.name}</p>
                    <p className="text-xs text-ink-500 mt-0.5">Lote {item.lot.lotNumber} • {item.lot.currentQuantity} un.</p>
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
        </div>
      )}

      <RegisterActionModal
        open={actionModal.open}
        onClose={() => setActionModal({ open: false, item: null })}
        item={actionModal.item}
        onConfirm={(_type: ActionType) => setActionModal({ open: false, item: null })}
      />
    </div>
  );
}
