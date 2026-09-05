import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productService, lotService, actionService } from '@/services';
import type { Product, ProductLot, CriticalProduct, ActionType } from '@/types';
import { PageHeader } from '@/components/layouts/PageHeader';
import { LoadingState } from '@/components/ui/LoadingState';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ExpirationBadge } from '@/components/ui/ExpirationBadge';
import { RegisterActionModal } from '@/components/features/RegisterActionModal';
import { formatCurrency, formatDate, daysUntil, getExpirationStatus } from '@/utils/format';
import { ArrowLeft, Package, Tag, Calendar, Layers, DollarSign, Zap, AlertTriangle } from 'lucide-react';

export function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [lots, setLots] = useState<ProductLot[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionModal, setActionModal] = useState<{ open: boolean; item: CriticalProduct | null }>({ open: false, item: null });

  useEffect(() => {
    if (!id) return;
    Promise.all([
      productService.getProductById(id),
      lotService.getLotsByProductId(id),
    ]).then(([p, l]) => {
      setProduct(p);
      setLots(l.sort((a, b) => daysUntil(a.expirationDate) - daysUntil(b.expirationDate)));
      setLoading(false);
    });
  }, [id]);

  function handleActionConfirm(type: ActionType) {
    setActionModal({ open: false, item: null });
  }

  if (loading) return <LoadingState />;
  if (!product) return <div className="p-8 text-center text-ink-500">Produto não encontrado.</div>;

  const sortedLots = [...lots].sort((a, b) => daysUntil(a.expirationDate) - daysUntil(b.expirationDate));
  const fefoLot = sortedLots[0];

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <PageHeader title={product.name} description={`Detalhes do produto`}>
        <button onClick={() => navigate('/products')} className="btn-secondary">
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </button>
      </PageHeader>

      {/* Product info */}
      <div className="card p-6 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <InfoRow icon={Package} label="Nome" value={product.name} />
          <InfoRow icon={Tag} label="Marca" value={product.brand} />
          <InfoRow icon={Layers} label="Código de barras" value={product.barcode} mono />
          <InfoRow icon={Package} label="Categoria" value={product.category} />
          <InfoRow icon={Layers} label="Unidade" value={product.unit} />
          <InfoRow icon={Package} label="Estoque total" value={`${product.totalStock} ${product.unit}`} />
        </div>
      </div>

      {/* Lots */}
      <div className="mb-4">
        <h2 className="text-base font-semibold text-ink-900 mb-3">Lotes</h2>
        <div className="space-y-3">
          {sortedLots.map((lot) => {
            const days = daysUntil(lot.expirationDate);
            const status = getExpirationStatus(lot.expirationDate);
            const isFefo = lot.id === fefoLot?.id && days >= 0;

            const criticalItem: CriticalProduct = {
              lot,
              product,
              daysRemaining: days,
              riskValue: lot.currentQuantity * lot.purchasePrice,
              status,
            };

            return (
              <div key={lot.id} className="card p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-ink-800">Lote {lot.lotNumber}</span>
                    {isFefo && (
                      <span className="badge bg-brand-50 text-brand-700 border border-brand-200">
                        <Zap className="w-3 h-3" />
                        PRIORIDADE FEFO
                      </span>
                    )}
                  </div>
                  <StatusBadge status={status} size="sm" />
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-ink-400">Quantidade inicial</p>
                    <p className="font-medium text-ink-700 mt-0.5">{lot.initialQuantity} unidades</p>
                  </div>
                  <div>
                    <p className="text-xs text-ink-400">Quantidade atual</p>
                    <p className="font-medium text-ink-700 mt-0.5">{lot.currentQuantity} unidades</p>
                  </div>
                  <div>
                    <p className="text-xs text-ink-400">Entrada</p>
                    <p className="font-medium text-ink-700 mt-0.5">{formatDate(lot.entryDate)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-ink-400">Validade</p>
                    <p className="font-medium text-ink-700 mt-0.5">{formatDate(lot.expirationDate)}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-ink-100">
                  <div className="flex items-center gap-4">
                    <ExpirationBadge expirationDate={lot.expirationDate} daysRemaining={days} />
                    <div className="flex items-center gap-1.5 text-sm">
                      <DollarSign className="w-3.5 h-3.5 text-ink-400" />
                      <span className="text-ink-600">{formatCurrency(lot.currentQuantity * lot.purchasePrice)} em risco</span>
                    </div>
                  </div>
                  {(status === 'critical' || status === 'warning' || status === 'expired') && (
                    <button
                      onClick={() => setActionModal({ open: true, item: criticalItem })}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-50 text-brand-700 text-xs font-medium hover:bg-brand-100 transition-colors"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      Registrar ação
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
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

function InfoRow({ icon: Icon, label, value, mono }: { icon: typeof Package; label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg bg-ink-100 flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-ink-500" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-ink-400">{label}</p>
        <p className={`text-sm font-medium text-ink-800 mt-0.5 ${mono ? 'font-mono' : ''}`}>{value}</p>
      </div>
    </div>
  );
}
