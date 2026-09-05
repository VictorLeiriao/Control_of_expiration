import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { entryService, productService } from '@/services';
import type { Entry, Product } from '@/types';
import { PageHeader } from '@/components/layouts/PageHeader';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatCurrency, formatDate, getExpirationStatus } from '@/utils/format';
import { Plus, ArrowDownToLine, Check } from 'lucide-react';

export function EntriesPage() {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([entryService.getEntries(), productService.getProducts()]).then(([e, p]) => {
      setEntries(e.sort((a, b) => new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime()));
      setProducts(p);
      setLoading(false);
    });
  }, []);

  function getProductName(productId: string): string {
    return products.find((p) => p.id === productId)?.name || 'Produto';
  }

  if (loading) return <LoadingState />;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <PageHeader title="Entradas de estoque" description="Registre e acompanhe as entradas de produtos">
        <button onClick={() => navigate('/entries/new')} className="btn-primary">
          <Plus className="w-4 h-4" />
          Nova entrada
        </button>
      </PageHeader>

      {entries.length === 0 ? (
        <EmptyState
          icon={ArrowDownToLine}
          title="Nenhuma entrada registrada"
          description="Registre a primeira entrada de estoque para começar."
          actionLabel="+ Nova entrada"
          onAction={() => navigate('/entries/new')}
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-ink-50 text-ink-500 text-xs uppercase tracking-wide">
                  <th className="px-5 py-3 text-left font-medium">Produto</th>
                  <th className="px-5 py-3 text-right font-medium">Quantidade</th>
                  <th className="px-5 py-3 text-left font-medium">Lote</th>
                  <th className="px-5 py-3 text-left font-medium">Validade</th>
                  <th className="px-5 py-3 text-left font-medium">Data de entrada</th>
                  <th className="px-5 py-3 text-right font-medium">Preço de compra</th>
                  <th className="px-5 py-3 text-left font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {entries.map((entry) => {
                  const status = getExpirationStatus(entry.expirationDate);
                  return (
                    <tr key={entry.id} className="hover:bg-ink-50/50 transition-colors">
                      <td className="px-5 py-3 font-medium text-ink-800">{getProductName(entry.productId)}</td>
                      <td className="px-5 py-3 text-right text-ink-600">{entry.quantity}</td>
                      <td className="px-5 py-3 text-ink-600 font-mono text-xs">{entry.lotNumber}</td>
                      <td className="px-5 py-3 text-ink-600">{formatDate(entry.expirationDate)}</td>
                      <td className="px-5 py-3 text-ink-600">{formatDate(entry.entryDate)}</td>
                      <td className="px-5 py-3 text-right text-ink-600">{formatCurrency(entry.purchasePrice)}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <StatusBadge status={status} size="sm" />
                          {entry.status === 'confirmed' && (
                            <span className="inline-flex items-center gap-1 text-xs text-success-600">
                              <Check className="w-3 h-3" />
                              Confirmada
                            </span>
                          )}
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
            {entries.map((entry) => {
              const status = getExpirationStatus(entry.expirationDate);
              return (
                <div key={entry.id} className="p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-ink-800 text-sm">{getProductName(entry.productId)}</p>
                      <p className="text-xs text-ink-500 mt-0.5">Lote {entry.lotNumber} • {entry.quantity} un.</p>
                    </div>
                    <StatusBadge status={status} size="sm" />
                  </div>
                  <div className="flex items-center justify-between text-xs text-ink-500">
                    <span>Entrada: {formatDate(entry.entryDate)}</span>
                    <span>Validade: {formatDate(entry.expirationDate)}</span>
                  </div>
                  <p className="text-xs font-medium text-ink-700">{formatCurrency(entry.purchasePrice)}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
