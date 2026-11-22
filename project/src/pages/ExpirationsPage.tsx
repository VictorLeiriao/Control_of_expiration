import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useManagementCapabilities } from '@/hooks/useManagementCapabilities';
import { useInventoryOverview, useInventoryScope } from '@/hooks/useInventory';
import { PageHeader } from '@/components/layouts/PageHeader';
import { DashboardCard } from '@/components/ui/DashboardCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ExpirationBadge } from '@/components/ui/ExpirationBadge';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { SearchInput } from '@/components/ui/SearchInput';
import { FilterDropdown } from '@/components/ui/FilterDropdown';
import { dateKey, formatCurrency, formatDate, getExpirationLabel } from '@/utils/format';
import { fefoExplanation } from '@/utils/lots';
import { AlertTriangle, Clock, CalendarClock, CalendarCheck, Zap, Eye } from 'lucide-react';

const indicators = [
  { status: 'expired', label: 'Vencidos', icon: AlertTriangle, tone: 'error' },
  { status: 'critical', label: 'Críticos', icon: Clock, tone: 'warning' },
  { status: 'warning', label: 'Atenção', icon: CalendarClock, tone: 'brand' },
  { status: 'normal', label: 'Normais', icon: CalendarCheck, tone: 'success' },
] as const;

export function ExpirationsPage() {
  const navigate = useNavigate();
  const { token } = useInventoryScope();
  const canMoveStock = useManagementCapabilities(token)?.inventoryStockWrite;
  const { data, error, reload } = useInventoryOverview();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [params, setParams] = useSearchParams();
  const [productFilter, setProductFilter] = useState('all');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [priorityOnly, setPriorityOnly] = useState(false);
  const statusFilter = params.get('status') ?? 'all';
  const periodFilter = params.get('period') ?? 'all';
  const availableOnly = params.get('stock') === 'available';

  function setFilter(key: string, value: string) {
    const next = new URLSearchParams(params);
    if (value === 'all') next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
  }
  if (error) return <div className="p-6"><p role="alert" className="text-error-700">{error}</p><button className="btn-secondary mt-3" onClick={reload}>Tentar novamente</button></div>;
  if (!data) return <LoadingState />;

  const items = data.items;
  const categories = [...new Set(data.products.flatMap(({ category }) => category ? [category] : []))].sort();
  const products = [...new Map(items.map(({ product }) => [product.id, product])).values()]
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  const query = search.trim().toLocaleLowerCase('pt-BR');

  const filtered = items.filter((item) => {
    const { product, lot } = item;
    if (query && ![product.name, lot.lotNumber, product.barcode, product.sku].some((value) => value?.toLocaleLowerCase('pt-BR').includes(query))) return false;
    if (categoryFilter !== 'all' && product.category !== categoryFilter) return false;
    if (productFilter !== 'all' && product.id !== productFilter) return false;
    if (statusFilter !== 'all' && item.status !== statusFilter) return false;
    if (priorityOnly && !item.isFefo) return false;
    if (availableOnly && lot.quantity === 0) return false;
    if (periodFilter === '30' && (item.daysRemaining < 0 || item.daysRemaining > 30)) return false;
    const date = dateKey(lot.expirationDate ?? undefined);
    if (from && (!date || date < from)) return false;
    if (to && (!date || date > to)) return false;
    return true;
  });

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <PageHeader title="Validades" description="Controle de lotes por proximidade do vencimento" />

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {indicators.map(({ status, label, tone, icon }) => (
          <button key={status} aria-pressed={statusFilter === status} onClick={() => setFilter('status', statusFilter === status ? 'all' : status)}>
            <DashboardCard icon={icon} label={label} tone={tone} value={items.filter((item) => item.status === status && item.lot.quantity > 0).length} />
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 mb-3">
        <SearchInput value={search} onChange={setSearch} placeholder="Buscar produto, lote ou código de barras" />
        <FilterDropdown
          value={productFilter}
          onChange={setProductFilter}
          options={[{ value: 'all', label: 'Todos os produtos' }, ...products.map((product) => ({ value: product.id, label: product.name }))]}
        />
        <FilterDropdown
          value={categoryFilter}
          onChange={setCategoryFilter}
          options={[{ value: 'all', label: 'Todas as categorias' }, ...categories.map((category) => ({ value: category, label: category }))]}
        />
        <FilterDropdown
          value={statusFilter}
          onChange={(value) => setFilter('status', value)}
          options={[
            { value: 'all', label: 'Todos os status' },
            ...indicators.map(({ status }) => ({ value: status, label: getExpirationLabel(status) })),
            { value: 'uncontrolled', label: getExpirationLabel('uncontrolled') },
          ]}
        />
      </div>
      <div className="flex flex-wrap items-end gap-3 mb-6">
        <label className="text-sm text-ink-700 min-w-0">
          Validade a partir de
          <input className="input-field mt-1" type="date" value={from} max={to || undefined} onChange={(event) => setFrom(event.target.value)} />
        </label>
        <label className="text-sm text-ink-700 min-w-0">
          Validade até
          <input className="input-field mt-1" type="date" value={to} min={from || undefined} onChange={(event) => setTo(event.target.value)} />
        </label>
        <label className="flex items-center gap-2 text-sm text-ink-700 py-2">
          <input type="checkbox" checked={priorityOnly} onChange={(event) => setPriorityOnly(event.target.checked)} />
          Somente lotes prioritários
        </label>
        {periodFilter === '30' && (
          <button className="btn-secondary" onClick={() => setFilter('period', 'all')}>Remover período de 30 dias</button>
        )}
        {availableOnly && (
          <button className="btn-secondary" onClick={() => setFilter('stock', 'all')}>Incluir lotes sem saldo</button>
        )}
      </div>

      {filtered.some((item) => item.isFefo) && <p className="mb-3 text-sm text-ink-600">{fefoExplanation}</p>}

      {filtered.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title="Nenhum lote encontrado"
          description="Não há lotes que correspondam aos filtros selecionados."
        />
      ) : (
        <div className="card overflow-hidden">
          {/* Desktop table */}
          <div className="hidden xl:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-ink-50 text-ink-500 text-xs uppercase tracking-wide">
                  <th className="px-5 py-3 text-left font-medium">Produto</th>
                  <th className="px-5 py-3 text-left font-medium">Lote</th>
                  <th className="px-5 py-3 text-right font-medium">Qtd.</th>
                  <th className="px-5 py-3 text-left font-medium">Validade</th>
                  <th className="px-5 py-3 text-left font-medium">Dias restantes</th>
                  <th className="px-5 py-3 text-right font-medium">Valor em estoque</th>
                  <th className="px-5 py-3 text-left font-medium">Status</th>
                  <th className="px-5 py-3 text-right font-medium">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {filtered.map((item) => (
                  <tr key={item.lot.id} className="hover:bg-ink-50/50 transition-colors">
                    <td className="px-5 py-3 font-medium text-ink-800">{item.product.name}</td>
                    <td className="px-5 py-3 text-ink-600 font-mono text-xs break-all">{item.lot.lotNumber}{item.isFefo && <PriorityBadge />}</td>
                    <td className="px-5 py-3 text-right text-ink-600">{item.lot.quantity}</td>
                    <td className="px-5 py-3 text-ink-600">{formatDate(item.lot.expirationDate ?? undefined)}</td>
                    <td className="px-5 py-3">
                      <ExpirationBadge expirationDate={item.lot.expirationDate ?? undefined} daysRemaining={item.daysRemaining} />
                    </td>
                    <td className="px-5 py-3 text-right font-medium text-ink-800">{item.lot.value === null ? '—' : formatCurrency(item.lot.value)}</td>
                    <td className="px-5 py-3">
                      <StatusBadge status={item.status} size="sm" />
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => navigate(`/products/${item.product.id}`)} className="p-1.5 rounded-lg text-ink-500 hover:bg-ink-100 hover:text-ink-700 transition-colors" title="Ver">
                          <Eye className="w-4 h-4" />
                        </button>
                        {canMoveStock && <button
                          onClick={() => navigate(`/entries/new?product=${item.product.id}&lot=${item.lot.id}${item.isFefo ? '&type=fefo' : ''}`)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-brand-50 text-brand-700 text-xs font-medium hover:bg-brand-100 transition-colors"
                        >
                          <Zap className="w-3.5 h-3.5" />
                          Movimentar
                        </button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="xl:hidden divide-y divide-ink-100">
            {filtered.map((item) => (
              <div key={item.lot.id} className="p-4 space-y-2">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-ink-800 text-sm">{item.product.name}</p>
                    <p className="text-xs text-ink-500 mt-0.5 break-all">Lote {item.lot.lotNumber} • {item.lot.quantity} {item.product.unit}</p>
                  </div>
                  <StatusBadge status={item.status} size="sm" />
                  {item.isFefo && <PriorityBadge />}
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-ink-500">Validade: {formatDate(item.lot.expirationDate ?? undefined)}</span>
                  <span className="font-medium text-ink-700">{item.lot.value === null ? '—' : formatCurrency(item.lot.value)}</span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <ExpirationBadge expirationDate={item.lot.expirationDate ?? undefined} daysRemaining={item.daysRemaining} />
                  <button className="btn-ghost text-xs" onClick={() => navigate(`/products/${item.product.id}`)}>Ver produto</button>
                  {canMoveStock && <button
                    onClick={() => navigate(`/entries/new?product=${item.product.id}&lot=${item.lot.id}${item.isFefo ? '&type=fefo' : ''}`)}
                    className="ml-auto inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-brand-50 text-brand-700 text-xs font-medium"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    Movimentar
                  </button>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

function PriorityBadge() {
  return (
    <span className="badge bg-brand-50 text-brand-700 border border-brand-200" title={fefoExplanation}>
      <Zap className="w-3 h-3" />
      Prioridade
    </span>
  );
}
