import { useCallback, useRef, useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useStore } from '@/contexts/StoreContext';
import { PageHeader } from '@/components/layouts/PageHeader';
import { LoadingState } from '@/components/ui/LoadingState';
import { useManagementCapabilities } from '@/hooks/useManagementCapabilities';
import { useInventoryRequest, useInventoryScope } from '@/hooks/useInventory';
import { inventoryService, type InventoryMovement, type StockMovementInputType } from '@/services/inventory';
import { formatNumber } from '@/utils/format';

type MovementMode = StockMovementInputType | 'FEFO' | 'TRANSFER';

const movementModes = {
  ENTRY: 'Entrada',
  EXIT: 'Saída por lote',
  ADJUSTMENT: 'Ajuste de saldo',
  FEFO: 'Saída FEFO',
  DISCARD: 'Descarte',
  RETURN: 'Devolução ao fornecedor',
  TRANSFER: 'Transferência entre lojas',
};

export function NewEntryPage() {
  const [query] = useSearchParams();
  const { token, storeId } = useInventoryScope();
  const { stores } = useStore();
  const capabilities = useManagementCapabilities(token);
  const { data: products, error: productError, reload: reloadProducts } = useInventoryRequest(useCallback(
    (signal) => inventoryService.products(token, signal), [token],
  ));
  const initialProduct = query.get('product') ?? '';
  const [productId, setProductId] = useState(initialProduct);
  const [quantityValue, setQuantityValue] = useState('');
  const [lotId, setLotId] = useState(query.get('lot') ?? '');
  const [mode, setMode] = useState<MovementMode>(query.get('type') === 'fefo' ? 'FEFO' : 'ENTRY');
  const [saving, setSaving] = useState(false);
  const [destinationStoreId, setDestinationStoreId] = useState('');
  const [movements, setMovements] = useState<InventoryMovement[] | null>(null);
  const [error, setError] = useState('');
  const operation = useRef<{ fingerprint: string; id: string } | null>(null);
  const { data: lotData, error: lotError, reload: reloadLots } = useInventoryRequest(useCallback(
    async (signal) => productId ? inventoryService.detail(token, storeId, productId, signal) : null,
    [token, storeId, productId],
  ));

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!lotData || lotData.product.id !== productId || (mode !== 'FEFO' && !lotData.lots.some((lot) => lot.id === lotId))) return;
    const data = new FormData(event.currentTarget);
    const quantity = Number(data.get('quantity'));
    const reason = String(data.get('reason') ?? '').trim();
    const unitCost = data.get('unitCost') ? Number(data.get('unitCost')) : undefined;
    if (!reason || !Number.isFinite(quantity) || quantity === 0 || (mode !== 'ADJUSTMENT' && quantity < 0)) {
      setError('Informe um motivo e uma quantidade válida.');
      return;
    }

    const destination = mode === 'TRANSFER' ? destinationStoreId : undefined;
    if (mode === 'TRANSFER' && !stores.some((store) => store.id === destination && store.id !== storeId)) {
      setError('Selecione uma loja de destino diferente da loja ativa.');
      return;
    }

    const fingerprint = JSON.stringify([storeId, productId, mode === 'FEFO' ? null : lotId, mode, quantity, reason, unitCost, destination]);
    if (operation.current?.fingerprint !== fingerprint) {
      operation.current = { fingerprint, id: crypto.randomUUID() };
    }
    const operationId = operation.current.id;

    setSaving(true);
    setError('');
    try {
      const body = { operationId, quantity, reason };
      if (mode === 'FEFO') {
        const result = await inventoryService.exitFefo(token, storeId, productId, body);
        setMovements(result.movements);
      } else if (mode === 'TRANSFER') {
        const result = await inventoryService.transfer(token, storeId, productId, lotId, { ...body, destinationStoreId });
        setMovements([result.sourceMovement, result.destinationMovement]);
      } else {
        const result = await inventoryService.move(token, storeId, productId, lotId, { ...body, movementType: mode, unitCost });
        setMovements([result]);
      }
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Não foi possível registrar a movimentação.');
    } finally {
      setSaving(false);
    }
  }

  if (capabilities === undefined) return <LoadingState />;
  if (capabilities === null) return <p role="alert" className="p-6 text-error-700">Não foi possível verificar suas permissões.</p>;
  if (!capabilities.inventoryStockWrite) return <div className="p-6"><p role="alert" className="text-error-700">Você não tem permissão para movimentar o estoque.</p><Link className="btn-secondary mt-3" to="/entries">Voltar</Link></div>;
  if (productError) return <div className="p-6"><p role="alert" className="text-error-700">{productError}</p><button className="btn-secondary mt-3" onClick={reloadProducts}>Tentar novamente</button></div>;
  if (!products) return <LoadingState />;

  return (
    <div className="mx-auto max-w-3xl p-6 lg:p-8">
      <PageHeader title="Nova movimentação" description="A movimentação usa o saldo da loja ativa.">
        <Link to="/entries" className="btn-secondary">Histórico</Link>
        {productId && <Link to={`/products/${productId}`} className="btn-secondary">Ver produto</Link>}
      </PageHeader>
      {movements ? (
        <section className="card space-y-3 p-5">
          <h2 role="status" className="font-semibold text-success-700">Movimentação registrada.</h2>
          <ul className="space-y-2 text-sm">
            {movements.map((movement) => {
              const lot = lotData?.lots.find((item) => item.id === movement.lotId);
              const storeName = mode === 'TRANSFER' ? stores.find((store) => store.id === movement.storeId)?.name : undefined;
              return <li key={movement.id}>{storeName && `${storeName} · `}Lote {lot?.lotNumber ?? movement.lotId} · {movement.quantityDelta > 0 ? '+' : ''}{formatNumber(movement.quantityDelta)} · Saldo {formatNumber(movement.quantityAfter)}</li>;
            })}
          </ul>
          <Link to="/entries" className="btn-primary">Ver movimentações</Link>
        </section>
      ) : (
        <form onSubmit={submit} className="card p-6 space-y-4">
          <fieldset disabled={saving} className="space-y-4">
            <label className="block text-sm font-medium">Tipo
              <select className="input-field mt-1" value={mode} onChange={(event) => setMode(event.target.value as MovementMode)}>
                {Object.entries(movementModes).map(([key, label]) => <option key={key} value={key} disabled={key === 'TRANSFER' && stores.length < 2}>{label}</option>)}
              </select>
            </label>
            <label className="block text-sm font-medium">Produto
              <select className="input-field mt-1" value={productId} onChange={(event) => { setProductId(event.target.value); setLotId(''); }} required>
                <option value="">Selecione o produto</option>
                {products.map((product) => <option key={product.id} value={product.id}>{product.name} ({product.sku})</option>)}
              </select>
            </label>
            {mode !== 'FEFO' && <label className="block text-sm font-medium">Lote
              <select className="input-field mt-1" value={lotId} onChange={(event) => setLotId(event.target.value)} required disabled={!lotData}>
                <option value="">Selecione o lote</option>
                {lotData?.lots.map((lot) => <option key={lot.id} value={lot.id}>{lot.lotNumber} · saldo {formatNumber(lot.quantity)}</option>)}
              </select>
            </label>}
            {mode === 'TRANSFER' && <label className="block text-sm font-medium">Loja de destino
              <select className="input-field mt-1" value={destinationStoreId} onChange={(event) => setDestinationStoreId(event.target.value)} required>
                <option value="">Selecione a loja de destino</option>
                {stores.filter((store) => store.id !== storeId).map((store) => <option key={store.id} value={store.id}>{store.name}</option>)}
              </select>
            </label>}
            {lotError && <div><p role="alert" className="text-sm text-error-700">{lotError}</p><button type="button" className="btn-secondary mt-2" onClick={reloadLots}>Tentar novamente</button></div>}
            {mode !== 'FEFO' && lotData?.lots.length === 0 && <Link to={`/products/${productId}`} className="text-brand-700 underline">Cadastre um lote para movimentar este produto.</Link>}
            <label className="block text-sm font-medium">Quantidade
              <input className="input-field mt-1" name="quantity" type="number" min={mode === 'ADJUSTMENT' ? undefined : 0.001} step="0.001" value={quantityValue} onChange={(event) => setQuantityValue(event.target.value)} required />
              {mode === 'ADJUSTMENT' && <span className="text-xs text-ink-500">Use um valor negativo para reduzir o saldo.</span>}
            </label>
            {(mode === 'ENTRY' || (mode === 'ADJUSTMENT' && Number(quantityValue) > 0)) && <label className="block text-sm font-medium">Custo unitário (R$)
              <input className="input-field mt-1" name="unitCost" type="number" min="0" max="999999999.999999" step="0.000001" required={mode === 'ENTRY'} />
            </label>}
            <label className="block text-sm font-medium">Motivo
              <input className="input-field mt-1" name="reason" maxLength={300} required />
            </label>
          </fieldset>
          {error && <p role="alert" className="text-sm text-error-700">{error}</p>}
          <button type="submit" className="btn-primary" disabled={saving || !lotData || (mode !== 'FEFO' && !lotId) || (mode === 'TRANSFER' && !destinationStoreId)}>
            {saving ? 'Registrando…' : 'Registrar movimentação'}
          </button>
        </form>
      )}
    </div>
  );
}
