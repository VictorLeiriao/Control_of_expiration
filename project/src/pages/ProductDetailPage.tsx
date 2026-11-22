import { useCallback, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import { LotEditor } from '@/components/features/LotEditor';
import { PageHeader } from '@/components/layouts/PageHeader';
import { LoadingState } from '@/components/ui/LoadingState';
import { Modal } from '@/components/ui/Modal';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useManagementCapabilities } from '@/hooks/useManagementCapabilities';
import { useInventoryRequest, useInventoryScope } from '@/hooks/useInventory';
import { inventoryService, summarizeValue, type StockedLot } from '@/services/inventory';
import { formatCurrency, formatDate, formatNumber, getDaysRemainingLabel } from '@/utils/format';

export function ProductDetailPage({ onLotsChanged }: { onLotsChanged?: () => void }) {
  const { id = '' } = useParams();
  const { token, storeId } = useInventoryScope();
  const capabilities = useManagementCapabilities(token);
  const { data, error, reload } = useInventoryRequest(useCallback(
    (signal) => inventoryService.detail(token, storeId, id, signal), [token, storeId, id],
  ));
  const [editor, setEditor] = useState<{ lot?: StockedLot } | null>(null);
  const [deleting, setDeleting] = useState<StockedLot | null>(null);
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState('');
  const [notice, setNotice] = useState('');

  function refresh(message: string) {
    setNotice(message);
    reload();
    onLotsChanged?.();
  }

  async function deleteLot() {
    if (!deleting) return;
    setBusy(true);
    setFailure('');
    try {
      await inventoryService.deleteLot(token, id, deleting.id);
      setDeleting(null);
      refresh('Lote excluído com sucesso.');
    } catch (error) {
      setFailure(error instanceof Error ? error.message : 'Não foi possível excluir o lote.');
    } finally {
      setBusy(false);
    }
  }

  if (error) return <div className="p-6"><p role="alert" className="text-error-700">{error}</p><button className="btn-secondary mt-3" onClick={reload}>Tentar novamente</button></div>;
  if (!data) return <LoadingState />;

  const { product, lots, items } = data;
  const stock = lots.reduce((total, lot) => total + lot.quantity, 0);
  const next = items.find(({ lot }) => lot.quantity > 0 && lot.expirationDate);
  const value = summarizeValue(lots);

  return (
    <div className="mx-auto max-w-6xl p-6 lg:p-8">
      <PageHeader title={product.name} description="Detalhes do produto e saldo da loja ativa">
        <Link to="/products" className="btn-secondary"><ArrowLeft className="w-4 h-4" /> Voltar</Link>
        {capabilities?.inventoryCatalogWrite && <Link to={`/products/${id}/edit`} className="btn-secondary">Editar produto</Link>}
        {capabilities?.inventoryStockWrite && product.hasExpirationControl && <Link to={`/entries/new?product=${id}&type=fefo`} className="btn-primary">Saída FEFO</Link>}
      </PageHeader>

      <dl className="card mb-6 grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ['SKU', product.sku],
          ['Código de barras', product.barcode],
          ['Marca', product.brand],
          ['Categoria', product.category],
          ['Estoque total', `${formatNumber(stock)} ${product.unit ?? 'unidade'}`],
          ['Valor em estoque', value === null ? 'Custo não informado' : formatCurrency(value)],
          ['Próxima validade', formatDate(next?.lot.expirationDate ?? undefined)],
          ['Lotes cadastrados', lots.length],
        ].map(([label, item]) => (
          <div key={label} className="min-w-0 break-words"><dt className="text-xs text-ink-500">{label}</dt><dd className="text-sm font-medium">{item ?? '—'}</dd></div>
        ))}
      </dl>

      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-semibold">Lotes</h2>
        {capabilities?.inventoryCatalogWrite && <button className="btn-primary" onClick={() => setEditor({})}><Plus className="w-4 h-4" /> Adicionar lote</button>}
      </div>
      {notice && <p role="status" className="mb-3 text-sm text-success-700">{notice}</p>}
      {!items.length && <p className="card p-5 text-sm text-ink-600">Nenhum lote cadastrado.</p>}
      <div className="space-y-3">
        {items.map(({ lot, status, isFefo, daysRemaining }) => (
          <article key={lot.id} className="card grid gap-3 p-4 text-sm lg:grid-cols-[1fr_1fr_1fr_1fr_auto] lg:items-center">
            <div><strong>Lote {lot.lotNumber}</strong>{isFefo && <span className="ml-2 badge bg-brand-50 text-brand-700">Prioridade FEFO</span>}</div>
            <div><span className="text-ink-500">Saldo</span><br />{formatNumber(lot.quantity)} {product.unit ?? 'unidade'}</div>
            <div><span className="text-ink-500">Validade</span><br />{formatDate(lot.expirationDate ?? undefined)} <StatusBadge status={status} size="sm" /><p className="text-xs text-ink-500">{getDaysRemainingLabel(daysRemaining)}</p></div>
            <div><span className="text-ink-500">Valor em estoque</span><br />{lot.value === null ? '—' : formatCurrency(lot.value)}</div>
            <div className="flex flex-wrap gap-1">
              {capabilities?.inventoryStockWrite && <Link className="btn-ghost text-xs" to={`/entries/new?product=${id}&lot=${lot.id}`}>Movimentar</Link>}
              {capabilities?.inventoryCatalogWrite && <>
                <button className="btn-ghost text-xs" onClick={() => setEditor({ lot })}>Editar</button>
                <button className="btn-ghost text-xs text-error-700" onClick={() => { setFailure(''); setDeleting(lot); }}>Excluir</button>
              </>}
            </div>
          </article>
        ))}
      </div>

      {editor && <LotEditor product={product} lot={editor.lot} onClose={() => setEditor(null)} onSaved={() => {
        setEditor(null);
        refresh(editor.lot ? 'Lote atualizado com sucesso.' : 'Lote cadastrado com sucesso.');
      }} />}
      {deleting && (
        <Modal open title="Excluir lote" onClose={() => !busy && setDeleting(null)}>
          <p className="text-sm text-ink-700 break-words">Confirma a exclusão do lote {deleting.lotNumber}?</p>
          {failure && <p role="alert" className="mt-3 text-sm text-error-700">{failure}</p>}
          <div className="mt-4 flex flex-wrap justify-end gap-2">
            <button type="button" className="btn-secondary" disabled={busy} onClick={() => setDeleting(null)}>Cancelar</button>
            <button type="button" className="btn-primary" disabled={busy} onClick={deleteLot}>{busy ? 'Excluindo…' : 'Excluir lote'}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
