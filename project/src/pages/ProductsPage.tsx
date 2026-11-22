import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useManagementCapabilities } from '@/hooks/useManagementCapabilities';
import { useInventoryOverview, useInventoryScope } from '@/hooks/useInventory';
import type { ExpirationItem } from '@/services/inventory';
import { PageHeader } from '@/components/layouts/PageHeader';
import { SearchInput } from '@/components/ui/SearchInput';
import { FilterDropdown } from '@/components/ui/FilterDropdown';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDate, formatNumber } from '@/utils/format';
import { Plus, Package, Eye, ScanLine, ChevronRight } from 'lucide-react';
import { BarcodeScannerModal } from '@/components/features/BarcodeScannerModal';

export function ProductsPage() {
  const navigate = useNavigate();
  const { token } = useInventoryScope();
  const canEditCatalog = useManagementCapabilities(token)?.inventoryCatalogWrite;
  const { data, error, reload } = useInventoryOverview();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [scannerOpen, setScannerOpen] = useState(false);

  if (error) return <div className="p-6"><p role="alert" className="text-error-700">{error}</p><button className="btn-secondary mt-3" onClick={reload}>Tentar novamente</button></div>;
  if (!data) return <LoadingState />;

  const categories = ['all', ...Array.from(new Set(data.products.flatMap((product) => product.category ? [product.category] : [])))];
  const itemsByProduct = new Map<string, ExpirationItem[]>();
  for (const item of data.items) {
    const items = itemsByProduct.get(item.product.id);
    if (items) items.push(item);
    else itemsByProduct.set(item.product.id, [item]);
  }
  const products = data.products.map((product) => {
    const items = itemsByProduct.get(product.id) ?? [];
    const next = items.find(({ lot }) => lot.quantity > 0 && lot.expirationDate);
    return {
      ...product,
      nextExp: next?.lot.expirationDate ?? undefined,
      status: next?.status ?? 'uncontrolled' as const,
      lotCount: items.length,
      totalStock: items.reduce((total, { lot }) => total + lot.quantity, 0),
    };
  });

  const filtered = products.filter((p) => {
    const query = search.trim().toLocaleLowerCase('pt-BR');
    if (query && ![p.name, p.sku, p.barcode].some((value) => value?.toLocaleLowerCase('pt-BR').includes(query))) return false;
    if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
    if (statusFilter !== 'all') {
      if (p.status !== statusFilter) return false;
    }
    return true;
  });

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <PageHeader title="Produtos" description="Gerencie seus produtos e lotes">
        <button onClick={() => setScannerOpen(true)} className="btn-secondary">
          <ScanLine className="w-4 h-4" />
          Buscar por código
        </button>
        {canEditCatalog && <button onClick={() => navigate('/products/new')} className="btn-primary">
          <Plus className="w-4 h-4" />
          Novo produto
        </button>}
      </PageHeader>

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
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: 'all', label: 'Todos os status' },
            { value: 'expired', label: 'Vencidos' },
            { value: 'critical', label: 'Crítico' },
            { value: 'warning', label: 'Atenção' },
            { value: 'normal', label: 'Normal' },
            { value: 'uncontrolled', label: 'Validade não controlada' },
          ]}
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Package}
          title={products.length ? "Nenhum produto encontrado." : "Você ainda não possui produtos cadastrados."}
          description="Cadastre seu primeiro produto para começar a controlar validades."
          actionLabel={canEditCatalog ? '+ Cadastrar primeiro produto' : undefined}
          onAction={canEditCatalog ? () => navigate('/products/new') : undefined}
        />
      ) : (
        <div className="card overflow-hidden">
          {/* Desktop table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-ink-50 text-ink-500 text-xs uppercase tracking-wide">
                  <th className="px-5 py-3 text-left font-medium">Produto</th>
                  <th className="px-5 py-3 text-left font-medium">Código de barras</th>
                  <th className="px-5 py-3 text-left font-medium">Categoria</th>
                  <th className="px-5 py-3 text-right font-medium">Estoque</th>
                  <th className="px-5 py-3 text-center font-medium">Lotes</th>
                  <th className="px-5 py-3 text-left font-medium">Próxima validade</th>
                  <th className="px-5 py-3 text-left font-medium">Status</th>
                  <th className="px-5 py-3 text-right font-medium">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {filtered.map((p) => {
                  const { nextExp, status, lotCount } = p;
                  return (
                    <tr key={p.id} className="hover:bg-ink-50/50 transition-colors cursor-pointer" onClick={() => navigate(`/products/${p.id}`)}>
                      <td className="px-5 py-3 font-medium text-ink-800">{p.name}</td>
                      <td className="px-5 py-3 text-ink-500 font-mono text-xs">{p.barcode ?? p.sku}</td>
                      <td className="px-5 py-3 text-ink-600">{p.category}</td>
                      <td className="px-5 py-3 text-right text-ink-600">{formatNumber(p.totalStock)} {p.unit ?? 'unidade'}</td>
                      <td className="px-5 py-3 text-center text-ink-600">{lotCount} {lotCount === 1 ? 'lote' : 'lotes'}</td>
                      <td className="px-5 py-3 text-ink-600">{formatDate(nextExp)}</td>
                      <td className="px-5 py-3">
                        <StatusBadge status={status} size="sm" />
                      </td>
                      <td className="px-5 py-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => navigate(`/products/${p.id}`)} className="p-1.5 rounded-lg text-ink-500 hover:bg-ink-100 hover:text-ink-700 transition-colors" title="Ver">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button onClick={() => navigate(`/products/${p.id}`)} className="p-1.5 rounded-lg text-ink-400 hover:bg-ink-100 hover:text-ink-700 transition-colors">
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="lg:hidden divide-y divide-ink-100">
            {filtered.map((p) => {
              const { nextExp, status, lotCount } = p;
              return (
                <div key={p.id} className="p-4 cursor-pointer hover:bg-ink-50/50" onClick={() => navigate(`/products/${p.id}`)}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-ink-800 text-sm">{p.name}</p>
                      <p className="text-xs text-ink-500 mt-0.5">{p.barcode ?? p.sku} • {p.category}</p>
                    </div>
                    <StatusBadge status={status} size="sm" />
                  </div>
                  <div className="flex items-center justify-between text-xs text-ink-500">
                    <span>{formatNumber(p.totalStock)} {p.unit ?? 'unidade'} • {lotCount} lotes</span>
                    <span>{formatDate(nextExp)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <BarcodeScannerModal
        products={products}
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onProductFound={(product) => navigate(`/products/${product.id}`)}
      />
    </div>
  );
}
