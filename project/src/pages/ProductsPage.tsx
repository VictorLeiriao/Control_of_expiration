import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productService, lotService } from '@/services';
import type { Product, ProductLot } from '@/types';
import { PageHeader } from '@/components/layouts/PageHeader';
import { SearchInput } from '@/components/ui/SearchInput';
import { FilterDropdown } from '@/components/ui/FilterDropdown';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDate, getExpirationStatus, daysUntil } from '@/utils/format';
import { Plus, Package, Eye, ScanLine, ChevronRight } from 'lucide-react';
import { BarcodeScannerModal } from '@/components/features/BarcodeScannerModal';

export function ProductsPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [lots, setLots] = useState<ProductLot[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [scannerOpen, setScannerOpen] = useState(false);

  useEffect(() => {
    Promise.all([productService.getProducts(), lotService.getLots()]).then(([p, l]) => {
      setProducts(p);
      setLots(l);
      setLoading(false);
    });
  }, []);

  const categories = ['all', ...Array.from(new Set(products.map((p) => p.category)))];

  function getProductLots(productId: string): ProductLot[] {
    return lots.filter((l) => l.productId === productId);
  }

  function getNextExpiration(productId: string): ProductLot | null {
    return getProductLots(productId)
      .filter((l) => daysUntil(l.expirationDate) >= 0)
      .sort((a, b) => daysUntil(a.expirationDate) - daysUntil(b.expirationDate))[0] || null;
  }

  function getProductStatus(productId: string): 'expired' | 'critical' | 'warning' | 'normal' {
    const productLots = getProductLots(productId);
    if (productLots.some((l) => daysUntil(l.expirationDate) < 0)) return 'expired';
    if (productLots.some((l) => daysUntil(l.expirationDate) <= 7)) return 'critical';
    if (productLots.some((l) => daysUntil(l.expirationDate) <= 30)) return 'warning';
    return 'normal';
  }

  const filtered = products.filter((p) => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.barcode.includes(search)) return false;
    if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
    if (statusFilter !== 'all') {
      const status = getProductStatus(p.id);
      if (status !== statusFilter) return false;
    }
    return true;
  });

  if (loading) return <LoadingState />;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <PageHeader title="Produtos" description="Gerencie seus produtos e lotes">
        <button onClick={() => setScannerOpen(true)} className="btn-secondary">
          <ScanLine className="w-4 h-4" />
          Escanear código
        </button>
        <button onClick={() => navigate('/products/new')} className="btn-primary">
          <Plus className="w-4 h-4" />
          Novo produto
        </button>
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
          ]}
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Package}
          title="Você ainda não possui produtos cadastrados."
          description="Cadastre seu primeiro produto para começar a controlar validades."
          actionLabel="+ Cadastrar primeiro produto"
          onAction={() => navigate('/products/new')}
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
                  const nextExp = getNextExpiration(p.id);
                  const status = getProductStatus(p.id);
                  const lotCount = getProductLots(p.id).length;
                  return (
                    <tr key={p.id} className="hover:bg-ink-50/50 transition-colors cursor-pointer" onClick={() => navigate(`/products/${p.id}`)}>
                      <td className="px-5 py-3 font-medium text-ink-800">{p.name}</td>
                      <td className="px-5 py-3 text-ink-500 font-mono text-xs">{p.barcode}</td>
                      <td className="px-5 py-3 text-ink-600">{p.category}</td>
                      <td className="px-5 py-3 text-right text-ink-600">{p.totalStock} {p.unit === 'pacote' ? 'un' : p.unit === 'unidade' ? 'un' : p.unit}</td>
                      <td className="px-5 py-3 text-center text-ink-600">{lotCount} {lotCount === 1 ? 'lote' : 'lotes'}</td>
                      <td className="px-5 py-3 text-ink-600">{nextExp ? formatDate(nextExp.expirationDate) : '—'}</td>
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
              const nextExp = getNextExpiration(p.id);
              const status = getProductStatus(p.id);
              const lotCount = getProductLots(p.id).length;
              return (
                <div key={p.id} className="p-4 cursor-pointer hover:bg-ink-50/50" onClick={() => navigate(`/products/${p.id}`)}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-ink-800 text-sm">{p.name}</p>
                      <p className="text-xs text-ink-500 mt-0.5">{p.barcode} • {p.category}</p>
                    </div>
                    <StatusBadge status={status} size="sm" />
                  </div>
                  <div className="flex items-center justify-between text-xs text-ink-500">
                    <span>{p.totalStock} unidades • {lotCount} lotes</span>
                    <span>{nextExp ? formatDate(nextExp.expirationDate) : '—'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <BarcodeScannerModal
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onProductFound={(product) => navigate(`/products/${product.id}`)}
      />
    </div>
  );
}
