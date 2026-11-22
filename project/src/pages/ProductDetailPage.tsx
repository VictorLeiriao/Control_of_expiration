import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productService, lotService } from '@/services';
import type { Product, ProductLot, CriticalProduct } from '@/types';
import { PageHeader } from '@/components/layouts/PageHeader';
import { LoadingState } from '@/components/ui/LoadingState';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ExpirationBadge } from '@/components/ui/ExpirationBadge';
import { RegisterActionModal } from '@/components/features/RegisterActionModal';
import { formatCurrency, formatDate, daysUntil, getExpirationStatus } from '@/utils/format';
import { calculateLotInventoryValue, calculateProductInventoryValue, calculateStock, compareLots, fefoExplanation, getFefoPriority, getNextExpiration } from '@/utils/lots';
import { LotEditor } from '@/components/features/LotEditor';
import { Modal } from '@/components/ui/Modal';
import { ArrowLeft, Package, Tag, Calendar, Layers, DollarSign, Zap, Plus } from 'lucide-react';

export function ProductDetailPage({ onLotsChanged }: { onLotsChanged?: () => void }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [lots, setLots] = useState<ProductLot[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionModal, setActionModal] = useState<{ open: boolean; item: CriticalProduct | null }>({ open: false, item: null });

  const [editor, setEditor] = useState<{ lot?: ProductLot } | null>(null);
  const [deleting, setDeleting] = useState<ProductLot | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (!id) return;
    let active = true;
    setLoading(true);
    setNotice('');
    setEditor(null);
    setDeleting(null);
    setError('');
    Promise.all([
      productService.getProductById(id),
      lotService.getLotsByProduct(id),
    ]).then(([p, l]) => {
      if (!active) return;
      setProduct(p);
      setLots(l);
      setLoading(false);
    });
    return () => { active = false; };
  }, [id]);

  async function deleteLot() {
    if (!deleting) return;
    setBusy(true);
    setError('');
    try {
      await lotService.deleteLot(deleting.id);
      setLots((current) => current.filter((lot) => lot.id !== deleting.id));
      setNotice('Lote excluído com sucesso.');
      setDeleting(null);
      onLotsChanged?.();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Não foi possível excluir o lote.');
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <LoadingState />;
  if (!product) return <div className="p-8 text-center text-ink-500">Produto não encontrado.</div>;

  const sortedLots = [...lots].sort(compareLots);
  const fefoLot = getFefoPriority(lots);

  const priorityBadge = (
    <span className="badge bg-brand-50 text-brand-700 border border-brand-200">
      <Zap className="w-3 h-3" /> Prioridade
    </span>
  );

  function describeLot(lot: ProductLot, product: Product): CriticalProduct {
    return {
      lot,
      product,
      daysRemaining: daysUntil(lot.expirationDate),
      riskValue: calculateLotInventoryValue(lot),
      status: getExpirationStatus(lot.expirationDate),
    };
  }

  function lotActions(item: CriticalProduct) {
    const { lot, status } = item;
    return (
      <div className="flex flex-wrap items-center gap-1">
        <button className="btn-ghost text-xs" onClick={() => { setNotice(''); setEditor({ lot }); }}>Editar</button>
        <button className="btn-ghost text-xs text-error-700" onClick={() => { setNotice(''); setError(''); setDeleting(lot); }}>Excluir</button>
        {(status === 'critical' || status === 'warning' || status === 'expired') && (
          <button onClick={() => setActionModal({ open: true, item })} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-50 text-brand-700 text-xs font-medium hover:bg-brand-100">
            <Zap className="w-3.5 h-3.5" /> Registrar ação
          </button>
        )}
      </div>
    );
  }

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
          <InfoRow icon={Package} label="Estoque total" value={`${calculateStock(lots)} ${product.unit}`} />
          <InfoRow icon={DollarSign} label="Valor em estoque" value={formatCurrency(calculateProductInventoryValue(lots))} />
          <InfoRow icon={Calendar} label="Próxima validade" value={formatDate(getNextExpiration(lots))} />
          <InfoRow icon={Layers} label="Quantidade de lotes" value={String(lots.length)} />
        </div>
      </div>

      {/* Lots */}
      <div className="mb-4">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <h2 className="text-base font-semibold text-ink-900">Lotes</h2>
          <button className="btn-primary" onClick={() => { setNotice(''); setEditor({}); }}>
            <Plus className="w-4 h-4" /> Adicionar lote
          </button>
        </div>
        {notice && <p role="status" className="mb-3 text-sm text-success-700">{notice}</p>}
        {lots.length === 0 && <p className="card p-5 text-sm text-ink-500">Nenhum lote cadastrado.</p>}
        {lots.length > 0 && (
          <div className="card hidden lg:block overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-ink-50 text-xs text-ink-500">
                <tr>
                  {['Lote', 'Qtd. inicial', 'Qtd. atual', 'Entrada', 'Validade', 'Preço unitário', 'Em estoque', 'Ações'].map((label) => (
                    <th key={label} scope="col" className="px-3 py-3 font-medium">{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {sortedLots.map((lot) => {
                  const item = describeLot(lot, product);
                  return (
                    <tr key={lot.id} className="align-top text-ink-700">
                      <td className="px-3 py-3">
                        <span className="break-all font-semibold">{lot.lotNumber}</span>
                        {lot.id === fefoLot?.id && <div className="mt-1">{priorityBadge}</div>}
                      </td>
                      <td className="px-3 py-3">{lot.initialQuantity}</td>
                      <td className="px-3 py-3">{lot.currentQuantity}</td>
                      <td className="px-3 py-3">{formatDate(lot.entryDate)}</td>
                      <td className="px-3 py-3">
                        {formatDate(lot.expirationDate)}
                        <div className="mt-1"><StatusBadge status={item.status} size="sm" /></div>
                        {lot.expirationDate && <div className="mt-1"><ExpirationBadge expirationDate={lot.expirationDate} daysRemaining={item.daysRemaining} /></div>}
                      </td>
                      <td className="px-3 py-3">{formatCurrency(lot.purchasePrice)}</td>
                      <td className="px-3 py-3">{formatCurrency(item.riskValue)}</td>
                      <td className="px-3 py-3">{lotActions(item)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {fefoLot && <p className="hidden lg:block mt-3 text-sm text-ink-600">{fefoExplanation}</p>}
        <div className="space-y-3 lg:hidden">
          {sortedLots.map((lot) => {
            const item = describeLot(lot, product);
            const isFefo = lot.id === fefoLot?.id;

            return (
              <div key={lot.id} className="card p-5">
                <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-ink-800 break-all">Lote {lot.lotNumber}</span>
                    {isFefo && priorityBadge}
                  </div>
                  <StatusBadge status={item.status} size="sm" />
                </div>

                {isFefo && <p className="mb-3 text-xs text-ink-600">{fefoExplanation}</p>}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-ink-400">Quantidade inicial</p>
                    <p className="font-medium text-ink-700 mt-0.5">{lot.initialQuantity} {product.unit}</p>
                  </div>
                  <div>
                    <p className="text-xs text-ink-400">Quantidade atual</p>
                    <p className="font-medium text-ink-700 mt-0.5">{lot.currentQuantity} {product.unit}</p>
                  </div>
                  <div>
                    <p className="text-xs text-ink-400">Entrada</p>
                    <p className="font-medium text-ink-700 mt-0.5">{formatDate(lot.entryDate)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-ink-400">Preço de compra unitário</p>
                    <p className="font-medium text-ink-700 mt-0.5">{formatCurrency(lot.purchasePrice)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-ink-400">Validade</p>
                    <p className="font-medium text-ink-700 mt-0.5">{formatDate(lot.expirationDate)}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 mt-4 pt-4 border-t border-ink-100">
                  <div className="flex flex-wrap items-center gap-2">
                    <ExpirationBadge expirationDate={lot.expirationDate} daysRemaining={item.daysRemaining} />
                    <div className="flex items-center gap-1.5 text-sm">
                      <DollarSign className="w-3.5 h-3.5 text-ink-400" />
                      <span className="text-ink-600">{formatCurrency(item.riskValue)} em estoque</span>
                    </div>
                  </div>
                  {lotActions(item)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {editor && (
        <LotEditor
          product={product}
          lot={editor.lot}
          onClose={() => setEditor(null)}
          onSaved={(lot) => {
            setLots((current) => editor.lot ? current.map((item) => item.id === lot.id ? lot : item) : [...current, lot]);
            setNotice(editor.lot ? 'Lote atualizado com sucesso.' : 'Lote adicionado com sucesso.');
            setEditor(null);
            onLotsChanged?.();
          }}
        />
      )}
      {deleting && (
        <Modal open title="Excluir lote" onClose={() => !busy && setDeleting(null)}>
          <p className="text-sm text-ink-700 break-words">Confirma a exclusão do lote {deleting.lotNumber}?</p>
          {error && <p role="alert" className="mt-3 text-sm text-error-700">{error}</p>}
          <div className="mt-4 flex flex-wrap justify-end gap-2">
            <button type="button" className="btn-secondary" disabled={busy} onClick={() => setDeleting(null)}>Cancelar</button>
            <button type="button" className="btn-primary" disabled={busy} onClick={deleteLot}>{busy ? 'Excluindo...' : 'Excluir lote'}</button>
          </div>
        </Modal>
      )}
      <RegisterActionModal
        open={actionModal.open}
        onClose={() => setActionModal({ open: false, item: null })}
        item={actionModal.item}
        onConfirm={() => setActionModal({ open: false, item: null })}
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
