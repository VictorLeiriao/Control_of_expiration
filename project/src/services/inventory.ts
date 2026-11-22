import { apiRequest, listAll } from './api';
import type { ExpirationStatus, Unit } from '@/types';
import { daysUntil, getExpirationStatus } from '@/utils/format';

export interface InventoryProduct {
  id: string;
  sku: string;
  name: string;
  barcode?: string | null;
  category?: string | null;
  brand?: string | null;
  unit?: Unit | null;
  hasExpirationControl: boolean;
}

export interface InventoryLot {
  id: string;
  productId: string;
  lotNumber: string;
  expirationDate: string | null;
}

interface StockBalance {
  lotId: string;
  quantity: number;
  averageUnitCost: number | null;
  value: number | null;
}

export interface StockedLot extends InventoryLot {
  quantity: number;
  averageUnitCost: number | null;
  value: number | null;
}

export type StockMovementInputType = 'ENTRY' | 'EXIT' | 'ADJUSTMENT' | 'DISCARD' | 'RETURN';

export interface InventoryMovement {
  id: string;
  operationId: string;
  storeId: string;
  productId: string;
  lotId: string;
  movementType: StockMovementInputType | 'TRANSFER_OUT' | 'TRANSFER_IN';
  quantityDelta: number;
  quantityAfter: number;
  reason: string;
  occurredAt: string;
  unitCost?: number | null;
}

interface MovementInput {
  operationId: string;
  movementType: StockMovementInputType;
  quantity: number;
  reason: string;
  unitCost?: number;
}

export interface ExpirationItem {
  product: InventoryProduct;
  lot: StockedLot;
  status: ExpirationStatus;
  daysRemaining: number;
  isFefo: boolean;
}

export interface InventoryDashboard {
  stockedProducts: number;
  expiredLots: number;
  criticalLots: number;
  attentionLots: number;
  normalLots: number;
  uncontrolledLots: number;
  stockValue: number | null;
}

const base = '/inventory';
const productPath = (id: string) => `${base}/products/${id}`;
const lotPath = (id: string, lotId?: string) => `${productPath(id)}/lots${lotId ? '/' + lotId : ''}`;
const storePath = (id: string) => `${base}/stores/${id}`;

function stocked(lot: InventoryLot, balance?: StockBalance): StockedLot {
  return {
    ...lot,
    quantity: balance?.quantity ?? 0,
    averageUnitCost: balance?.averageUnitCost ?? null,
    value: balance?.value ?? null,
  };
}

export function sortByExpiration(a: InventoryLot, b: InventoryLot): number {
  if (a.expirationDate === b.expirationDate) return a.id.localeCompare(b.id);
  if (a.expirationDate === null) return 1;
  if (b.expirationDate === null) return -1;
  return a.expirationDate.localeCompare(b.expirationDate);
}

export function summarizeValue(lots: StockedLot[]): number | null {
  const valued = lots.filter((lot) => lot.quantity > 0);
  if (valued.some((lot) => lot.value === null)) return null;
  return valued.reduce((sum, lot) => sum + (lot.value ?? 0), 0);
}

export const inventoryService = {
  products(token: string, signal?: AbortSignal) {
    return listAll<InventoryProduct>(`${base}/products`, { token, signal });
  },

  product(token: string, id: string, signal?: AbortSignal) {
    return apiRequest<InventoryProduct>(productPath(id), { token, signal });
  },

  saveProduct(token: string, body: Omit<InventoryProduct, 'id'>, id?: string) {
    return apiRequest<InventoryProduct>(id ? productPath(id) : `${base}/products`, { token, body, method: id ? 'PUT' : 'POST' });
  },

  lots(token: string, id: string, signal?: AbortSignal) {
    return listAll<InventoryLot>(lotPath(id), { token, signal });
  },

  saveLot(token: string, productId: string, body: Pick<InventoryLot, 'lotNumber' | 'expirationDate'>, id?: string) {
    return apiRequest<InventoryLot>(lotPath(productId, id), { token, body, method: id ? 'PUT' : 'POST' });
  },

  deleteLot(token: string, productId: string, lotId: string) {
    return apiRequest<void>(lotPath(productId, lotId), { token, method: 'DELETE' });
  },

  balances(token: string, storeId: string, signal?: AbortSignal, productId?: string) {
    const filter = productId ? `?productId=${encodeURIComponent(productId)}` : '';
    return listAll<StockBalance>(`${storePath(storeId)}/stock${filter}`, { token, signal });
  },

  movements(token: string, storeId: string, signal?: AbortSignal) {
    return listAll<InventoryMovement>(`${storePath(storeId)}/movements`, { token, signal });
  },

  move(token: string, storeId: string, productId: string, lotId: string, body: MovementInput) {
    return apiRequest<InventoryMovement>(`${storePath(storeId)}/products/${productId}/lots/${lotId}/movements`, { token, body });
  },

  exitFefo(token: string, storeId: string, productId: string, body: Pick<MovementInput, 'operationId' | 'quantity' | 'reason'>) {
    return apiRequest<{ operationId: string; movements: InventoryMovement[] }>(`${storePath(storeId)}/products/${productId}/fefo-exits`, { token, body });
  },

  transfer(token: string, storeId: string, productId: string, lotId: string,
    body: Pick<MovementInput, 'operationId' | 'quantity' | 'reason'> & { destinationStoreId: string },
  ) {
    return apiRequest<{ operationId: string; sourceMovement: InventoryMovement; destinationMovement: InventoryMovement }>(
      `${storePath(storeId)}/products/${productId}/lots/${lotId}/transfers`, { token, body },
    );
  },

  dashboard(token: string, storeId: string, signal?: AbortSignal) {
    return apiRequest<InventoryDashboard>(`${base}/dashboard?storeId=${encodeURIComponent(storeId)}`, { token, signal });
  },

  async detail(token: string, storeId: string, id: string, signal?: AbortSignal) {
    const [product, lots, balances, calendar] = await Promise.all([
      this.product(token, id, signal),
      this.lots(token, id, signal),
      this.balances(token, storeId, signal, id),
      apiRequest<{ asOf: string }>(`${storePath(storeId)}/expiration?days=0&limit=1`, { token, signal }),
    ]);
    const byLot = new Map(balances.map((balance) => [balance.lotId, balance]));
    return { product, ...describeExpiration([product], lots.map((lot) => stocked(lot, byLot.get(lot.id))), calendar.asOf) };
  },

  async overview(token: string, storeId: string, signal?: AbortSignal) {
    const [products, balances, calendar] = await Promise.all([
      this.products(token, signal),
      this.balances(token, storeId, signal),
      apiRequest<{ asOf: string }>(`${storePath(storeId)}/expiration?days=0&limit=1`, { token, signal }),
    ]);
    const byLot = new Map(balances.map((balance) => [balance.lotId, balance]));
    const lots: StockedLot[] = [];
    for (let offset = 0; offset < products.length; offset += 8) {
      const batch = await Promise.all(products.slice(offset, offset + 8).map((product) => this.lots(token, product.id, signal)));
      lots.push(...batch.flat().map((lot) => stocked(lot, byLot.get(lot.id))));
    }
    return { products, ...describeExpiration(products, lots, calendar.asOf) };
  },
};

function describeExpiration(products: InventoryProduct[], lots: StockedLot[], asOf: string) {
  // At local noon, the format utilities preserve the backend's civil date in every browser time zone.
  const today = new Date(`${asOf}T12:00:00`);
  const byProduct = new Map(products.map((product) => [product.id, product]));
  const prioritized = new Set<string>();
  const items: ExpirationItem[] = [...lots].sort(sortByExpiration).flatMap((lot) => {
    const product = byProduct.get(lot.productId);
    if (!product) return [];
    const daysRemaining = daysUntil(lot.expirationDate ?? undefined, today);
    const status = getExpirationStatus(lot.expirationDate ?? undefined, today);
    const isFefo = lot.quantity > 0 && Boolean(lot.expirationDate) && daysRemaining >= 0 && !prioritized.has(lot.productId);
    if (isFefo) prioritized.add(lot.productId);
    return [{ product, lot, daysRemaining, status, isFefo }];
  });
  return { lots, items };
}
