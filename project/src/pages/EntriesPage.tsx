import { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/layouts/PageHeader';
import { LoadingState } from '@/components/ui/LoadingState';
import { useManagementCapabilities } from '@/hooks/useManagementCapabilities';
import { useInventoryRequest, useInventoryScope } from '@/hooks/useInventory';
import { inventoryService } from '@/services/inventory';
import { formatCurrency, formatDateTime, formatNumber } from '@/utils/format';

const labels = {
  ENTRY: 'Entrada', EXIT: 'Saída', ADJUSTMENT: 'Ajuste', DISCARD: 'Descarte', RETURN: 'Devolução ao fornecedor',
  TRANSFER_IN: 'Transferência recebida', TRANSFER_OUT: 'Transferência enviada',
};

export function EntriesPage() {
  const { token, storeId } = useInventoryScope();
  const canMoveStock = useManagementCapabilities(token)?.inventoryStockWrite;
  const { data, error, reload } = useInventoryRequest(useCallback(async (signal) => {
    const [movements, inventory] = await Promise.all([
      inventoryService.movements(token, storeId, signal),
      inventoryService.overview(token, storeId, signal),
    ]);
    return {
      movements,
      products: new Map(inventory.products.map((product) => [product.id, product.name])),
      lots: new Map(inventory.lots.map((lot) => [lot.id, lot.lotNumber])),
    };
  }, [token, storeId]));

  return (
    <div className="mx-auto max-w-6xl p-6 lg:p-8">
      <PageHeader title="Movimentações" description="Histórico de entradas, saídas e ajustes da loja ativa.">
        {canMoveStock && <Link to="/entries/new" className="btn-primary">Nova movimentação</Link>}
      </PageHeader>
      {error && <div><p role="alert" className="text-sm text-error-700">{error}</p><button className="btn-secondary mt-3" onClick={reload}>Tentar novamente</button></div>}
      {!data && !error && <LoadingState />}
      {data?.movements.length === 0 && <p className="card p-5 text-sm text-ink-600">Nenhuma movimentação registrada.</p>}
      <div className="space-y-3">
        {data?.movements.map((movement) => (
          <article key={movement.id} className="card grid gap-3 p-4 text-sm md:grid-cols-5">
            <div><strong>{data.products.get(movement.productId) ?? movement.productId}</strong><p>Lote {data.lots.get(movement.lotId) ?? movement.lotId}</p></div>
            <div><strong>{labels[movement.movementType] ?? movement.movementType}</strong><p>{movement.reason}</p></div>
            <div>{formatNumber(movement.quantityDelta)}<p className="text-ink-500">Saldo {formatNumber(movement.quantityAfter)}</p></div>
            <div>{movement.unitCost == null ? '—' : formatCurrency(movement.unitCost)}<p className="text-ink-500">Custo unitário</p></div>
            <div>{formatDateTime(movement.occurredAt)}</div>
          </article>
        ))}
      </div>
    </div>
  );
}
