import type { ProductLot } from '@/types';
import { dateKey, daysUntil } from './format';

export const fefoExplanation = 'Este lote deve ser priorizado na saída porque possui a validade mais próxima.';

export function compareLots(a: ProductLot, b: ProductLot): number {
  return (dateKey(a.expirationDate) ?? '99999').localeCompare(dateKey(b.expirationDate) ?? '99999')
    || (dateKey(a.entryDate) ?? '').localeCompare(dateKey(b.entryDate) ?? '')
    || a.id.localeCompare(b.id);
}

export function getNextExpiration(lots: ProductLot[]): string | undefined {
  return lots.filter((lot) => lot.currentQuantity > 0 && dateKey(lot.expirationDate)).sort(compareLots)[0]?.expirationDate;
}

export function getFefoPriority(lots: ProductLot[], today = new Date()): ProductLot | undefined {
  return lots.filter((lot) =>
    lot.currentQuantity > 0 && dateKey(lot.expirationDate) && daysUntil(lot.expirationDate, today) >= 0,
  ).sort(compareLots)[0];
}

export function calculateLotInventoryValue(lot: ProductLot): number {
  return lot.currentQuantity * lot.purchasePrice;
}

export function calculateProductInventoryValue(lots: ProductLot[]): number {
  return lots.reduce((total, lot) => total + calculateLotInventoryValue(lot), 0);
}

export function calculateStock(lots: ProductLot[]): number {
  return lots.reduce((total, lot) => total + lot.currentQuantity, 0);
}
