import type { Product, ProductLot, Entry, Notification, Company, User, ActionRecord, LossRecord } from '@/types';

export const mockCompany: Company = {
  id: 'comp-1',
  name: 'Pet Shop Amigo Fiel',
  document: '12.345.678/0001-90',
  segment: 'Pet Shop',
  logoBase64: null,
  createdAt: '2026-01-15T10:00:00Z',
};

export const mockUser: User = {
  id: 'user-1',
  name: 'Carlos Mendes',
  email: 'carlos@amigofiel.com.br',
  avatar: null,
  role: 'admin',
};

export const mockProducts: Product[] = [
  { id: 'p1', name: 'Ração Golden 15kg', barcode: '789000000001', category: 'Ração', brand: 'Golden', unit: 'pacote', totalStock: 32, createdAt: '2026-01-20T10:00:00Z' },
  { id: 'p2', name: 'Ração Premier 15kg', barcode: '789000000002', category: 'Ração', brand: 'Premier', unit: 'pacote', totalStock: 24, createdAt: '2026-02-01T10:00:00Z' },
  { id: 'p3', name: 'Ração Pedigree 10kg', barcode: '789000000003', category: 'Ração', brand: 'Pedigree', unit: 'pacote', totalStock: 18, createdAt: '2026-02-10T10:00:00Z' },
  { id: 'p4', name: 'Petisco Premier', barcode: '789000000004', category: 'Petisco', brand: 'Premier', unit: 'unidade', totalStock: 45, createdAt: '2026-02-15T10:00:00Z' },
  { id: 'p5', name: 'Areia Higiênica', barcode: '789000000005', category: 'Higiene', brand: 'Mega Clean', unit: 'pacote', totalStock: 60, createdAt: '2026-03-01T10:00:00Z' },
  { id: 'p6', name: 'Shampoo Pet', barcode: '789000000006', category: 'Higiene', brand: 'Sanol Dog', unit: 'unidade', totalStock: 28, createdAt: '2026-03-05T10:00:00Z' },
  { id: 'p7', name: 'Sachê Whiskas', barcode: '789000000007', category: 'Alimento', brand: 'Whiskas', unit: 'unidade', totalStock: 120, createdAt: '2026-03-10T10:00:00Z' },
  { id: 'p8', name: 'Ração Whiskas 3kg', barcode: '789000000008', category: 'Ração', brand: 'Whiskas', unit: 'pacote', totalStock: 15, createdAt: '2026-03-15T10:00:00Z' },
  { id: 'p9', name: 'Antipulgas Frontline', barcode: '789000000009', category: 'Medicamento', brand: 'Frontline', unit: 'unidade', totalStock: 22, createdAt: '2026-03-20T10:00:00Z' },
  { id: 'p10', name: 'Coleira de Segurança', barcode: '789000000010', category: 'Acessório', brand: 'Pet Safe', unit: 'unidade', totalStock: 35, createdAt: '2026-04-01T10:00:00Z' },
  { id: 'p11', name: 'Brinquedo Mordedor', barcode: '789000000011', category: 'Brinquedo', brand: 'Pet Fun', unit: 'unidade', totalStock: 50, createdAt: '2026-04-05T10:00:00Z' },
  { id: 'p12', name: 'Ração Special Dog 20kg', barcode: '789000000012', category: 'Ração', brand: 'Special Dog', unit: 'pacote', totalStock: 10, createdAt: '2026-04-10T10:00:00Z' },
];

function daysFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

export const mockLots: ProductLot[] = [
  // Ração Golden 15kg - p1
  { id: 'l1', productId: 'p1', lotNumber: 'ABC123', initialQuantity: 20, currentQuantity: 12, entryDate: '2026-08-01T10:00:00Z', expirationDate: daysFromNow(3), purchasePrice: 90, createdAt: '2026-08-01T10:00:00Z' },
  { id: 'l2', productId: 'p1', lotNumber: 'DEF456', initialQuantity: 30, currentQuantity: 20, entryDate: '2026-08-15T10:00:00Z', expirationDate: daysFromNow(90), purchasePrice: 92, createdAt: '2026-08-15T10:00:00Z' },

  // Ração Premier 15kg - p2
  { id: 'l3', productId: 'p2', lotNumber: 'PRE001', initialQuantity: 15, currentQuantity: 8, entryDate: '2026-07-20T10:00:00Z', expirationDate: daysFromNow(6), purchasePrice: 85, createdAt: '2026-07-20T10:00:00Z' },
  { id: 'l4', productId: 'p2', lotNumber: 'PRE002', initialQuantity: 20, currentQuantity: 16, entryDate: '2026-08-10T10:00:00Z', expirationDate: daysFromNow(120), purchasePrice: 87, createdAt: '2026-08-10T10:00:00Z' },

  // Ração Pedigree 10kg - p3
  { id: 'l5', productId: 'p3', lotNumber: 'PED001', initialQuantity: 12, currentQuantity: 5, entryDate: '2026-07-15T10:00:00Z', expirationDate: daysFromNow(-2), purchasePrice: 75, createdAt: '2026-07-15T10:00:00Z' },
  { id: 'l6', productId: 'p3', lotNumber: 'PED002', initialQuantity: 15, currentQuantity: 13, entryDate: '2026-08-20T10:00:00Z', expirationDate: daysFromNow(150), purchasePrice: 78, createdAt: '2026-08-20T10:00:00Z' },

  // Petisco Premier - p4
  { id: 'l7', productId: 'p4', lotNumber: 'PET001', initialQuantity: 30, currentQuantity: 15, entryDate: '2026-07-25T10:00:00Z', expirationDate: daysFromNow(9), purchasePrice: 12, createdAt: '2026-07-25T10:00:00Z' },
  { id: 'l8', productId: 'p4', lotNumber: 'PET002', initialQuantity: 40, currentQuantity: 30, entryDate: '2026-08-18T10:00:00Z', expirationDate: daysFromNow(200), purchasePrice: 12.5, createdAt: '2026-08-18T10:00:00Z' },

  // Areia Higiênica - p5
  { id: 'l9', productId: 'p5', lotNumber: 'ARE001', initialQuantity: 40, currentQuantity: 25, entryDate: '2026-06-01T10:00:00Z', expirationDate: daysFromNow(-5), purchasePrice: 25, createdAt: '2026-06-01T10:00:00Z' },
  { id: 'l10', productId: 'p5', lotNumber: 'ARE002', initialQuantity: 40, currentQuantity: 35, entryDate: '2026-08-01T10:00:00Z', expirationDate: daysFromNow(300), purchasePrice: 26, createdAt: '2026-08-01T10:00:00Z' },

  // Shampoo Pet - p6
  { id: 'l11', productId: 'p6', lotNumber: 'SHA001', initialQuantity: 20, currentQuantity: 12, entryDate: '2026-07-10T10:00:00Z', expirationDate: daysFromNow(15), purchasePrice: 18, createdAt: '2026-07-10T10:00:00Z' },
  { id: 'l12', productId: 'p6', lotNumber: 'SHA002', initialQuantity: 20, currentQuantity: 16, entryDate: '2026-08-05T10:00:00Z', expirationDate: daysFromNow(250), purchasePrice: 19, createdAt: '2026-08-05T10:00:00Z' },

  // Sachê Whiskas - p7
  { id: 'l13', productId: 'p7', lotNumber: 'SAC001', initialQuantity: 60, currentQuantity: 40, entryDate: '2026-07-18T10:00:00Z', expirationDate: daysFromNow(5), purchasePrice: 3.5, createdAt: '2026-07-18T10:00:00Z' },
  { id: 'l14', productId: 'p7', lotNumber: 'SAC002', initialQuantity: 50, currentQuantity: 45, entryDate: '2026-08-22T10:00:00Z', expirationDate: daysFromNow(180), purchasePrice: 3.6, createdAt: '2026-08-22T10:00:00Z' },
  { id: 'l15', productId: 'p7', lotNumber: 'SAC003', initialQuantity: 40, currentQuantity: 35, entryDate: '2026-08-25T10:00:00Z', expirationDate: daysFromNow(25), purchasePrice: 3.5, createdAt: '2026-08-25T10:00:00Z' },

  // Ração Whiskas 3kg - p8
  { id: 'l16', productId: 'p8', lotNumber: 'WHI001', initialQuantity: 10, currentQuantity: 6, entryDate: '2026-07-05T10:00:00Z', expirationDate: daysFromNow(-10), purchasePrice: 45, createdAt: '2026-07-05T10:00:00Z' },
  { id: 'l17', productId: 'p8', lotNumber: 'WHI002', initialQuantity: 12, currentQuantity: 9, entryDate: '2026-08-12T10:00:00Z', expirationDate: daysFromNow(100), purchasePrice: 46, createdAt: '2026-08-12T10:00:00Z' },

  // Antipulgas Frontline - p9
  { id: 'l18', productId: 'p9', lotNumber: 'FRO001', initialQuantity: 15, currentQuantity: 10, entryDate: '2026-07-22T10:00:00Z', expirationDate: daysFromNow(20), purchasePrice: 55, createdAt: '2026-07-22T10:00:00Z' },
  { id: 'l19', productId: 'p9', lotNumber: 'FRO002', initialQuantity: 15, currentQuantity: 12, entryDate: '2026-08-28T10:00:00Z', expirationDate: daysFromNow(365), purchasePrice: 56, createdAt: '2026-08-28T10:00:00Z' },

  // Coleira de Segurança - p10
  { id: 'l20', productId: 'p10', lotNumber: 'COL001', initialQuantity: 25, currentQuantity: 20, entryDate: '2026-06-15T10:00:00Z', expirationDate: daysFromNow(500), purchasePrice: 30, createdAt: '2026-06-15T10:00:00Z' },

  // Brinquedo Mordedor - p11
  { id: 'l21', productId: 'p11', lotNumber: 'BRI001', initialQuantity: 30, currentQuantity: 25, entryDate: '2026-07-01T10:00:00Z', expirationDate: daysFromNow(720), purchasePrice: 15, createdAt: '2026-07-01T10:00:00Z' },

  // Ração Special Dog 20kg - p12
  { id: 'l22', productId: 'p12', lotNumber: 'SPD001', initialQuantity: 8, currentQuantity: 4, entryDate: '2026-06-20T10:00:00Z', expirationDate: daysFromNow(-1), purchasePrice: 110, createdAt: '2026-06-20T10:00:00Z' },
  { id: 'l23', productId: 'p12', lotNumber: 'SPD002', initialQuantity: 8, currentQuantity: 6, entryDate: '2026-08-15T10:00:00Z', expirationDate: daysFromNow(80), purchasePrice: 112, createdAt: '2026-08-15T10:00:00Z' },
];

export const mockEntries: Entry[] = [
  { id: 'e1', productId: 'p1', lotId: 'l1', quantity: 20, lotNumber: 'ABC123', expirationDate: daysFromNow(3), entryDate: '2026-08-01T10:00:00Z', purchasePrice: 90, status: 'confirmed' },
  { id: 'e2', productId: 'p1', lotId: 'l2', quantity: 30, lotNumber: 'DEF456', expirationDate: daysFromNow(90), entryDate: '2026-08-15T10:00:00Z', purchasePrice: 92, status: 'confirmed' },
  { id: 'e3', productId: 'p2', lotId: 'l3', quantity: 15, lotNumber: 'PRE001', expirationDate: daysFromNow(6), entryDate: '2026-07-20T10:00:00Z', purchasePrice: 85, status: 'confirmed' },
  { id: 'e4', productId: 'p3', lotId: 'l5', quantity: 12, lotNumber: 'PED001', expirationDate: daysFromNow(-2), entryDate: '2026-07-15T10:00:00Z', purchasePrice: 75, status: 'confirmed' },
  { id: 'e5', productId: 'p4', lotId: 'l7', quantity: 30, lotNumber: 'PET001', expirationDate: daysFromNow(9), entryDate: '2026-07-25T10:00:00Z', purchasePrice: 12, status: 'confirmed' },
  { id: 'e6', productId: 'p5', lotId: 'l9', quantity: 40, lotNumber: 'ARE001', expirationDate: daysFromNow(-5), entryDate: '2026-06-01T10:00:00Z', purchasePrice: 25, status: 'confirmed' },
  { id: 'e7', productId: 'p7', lotId: 'l13', quantity: 60, lotNumber: 'SAC001', expirationDate: daysFromNow(5), entryDate: '2026-07-18T10:00:00Z', purchasePrice: 3.5, status: 'confirmed' },
  { id: 'e8', productId: 'p8', lotId: 'l16', quantity: 10, lotNumber: 'WHI001', expirationDate: daysFromNow(-10), entryDate: '2026-07-05T10:00:00Z', purchasePrice: 45, status: 'confirmed' },
  { id: 'e9', productId: 'p12', lotId: 'l22', quantity: 8, lotNumber: 'SPD001', expirationDate: daysFromNow(-1), entryDate: '2026-06-20T10:00:00Z', purchasePrice: 110, status: 'confirmed' },
];

export const mockNotifications: Notification[] = [
  { id: 'n1', type: 'expired', title: 'Produto vencido', message: 'Ração Pedigree 10kg (Lote PED001) está vencido há 2 dias. 5 unidades em estoque.', date: daysFromNow(-2), read: false, productId: 'p3', lotId: 'l5' },
  { id: 'n2', type: 'expired', title: 'Produto vencido', message: 'Areia Higiênica (Lote ARE001) está vencida há 5 dias. 25 unidades em estoque.', date: daysFromNow(-5), read: false, productId: 'p5', lotId: 'l9' },
  { id: 'n3', type: 'expired', title: 'Produto vencido', message: 'Ração Whiskas 3kg (Lote WHI001) está vencida há 10 dias. 6 unidades em estoque.', date: daysFromNow(-10), read: true, productId: 'p8', lotId: 'l16' },
  { id: 'n4', type: 'expired', title: 'Produto vencido', message: 'Ração Special Dog 20kg (Lote SPD001) está vencida há 1 dia. 4 unidades em estoque.', date: daysFromNow(-1), read: false, productId: 'p12', lotId: 'l22' },
  { id: 'n5', type: 'expiring_7', title: 'Vencendo em 7 dias', message: 'Ração Golden 15kg (Lote ABC123) vence em 3 dias. 12 unidades em estoque. Valor: R$ 1.080,00.', date: daysFromNow(0), read: false, productId: 'p1', lotId: 'l1' },
  { id: 'n6', type: 'expiring_7', title: 'Vencendo em 7 dias', message: 'Ração Premier 15kg (Lote PRE001) vence em 6 dias. 8 unidades em estoque.', date: daysFromNow(0), read: false, productId: 'p2', lotId: 'l3' },
  { id: 'n7', type: 'expiring_7', title: 'Vencendo em 7 dias', message: 'Sachê Whiskas (Lote SAC001) vence em 5 dias. 40 unidades em estoque.', date: daysFromNow(0), read: true, productId: 'p7', lotId: 'l13' },
  { id: 'n8', type: 'expiring_30', title: 'Vencendo em 30 dias', message: 'Petisco Premier (Lote PET001) vence em 9 dias. 15 unidades em estoque.', date: daysFromNow(0), read: false, productId: 'p4', lotId: 'l7' },
  { id: 'n9', type: 'expiring_30', title: 'Vencendo em 30 dias', message: 'Shampoo Pet (Lote SHA001) vence em 15 dias. 12 unidades em estoque.', date: daysFromNow(0), read: true, productId: 'p6', lotId: 'l11' },
  { id: 'n10', type: 'expiring_30', title: 'Vencendo em 30 dias', message: 'Sachê Whiskas (Lote SAC003) vence em 25 dias. 35 unidades em estoque.', date: daysFromNow(0), read: true, productId: 'p7', lotId: 'l15' },
  { id: 'n11', type: 'entry', title: 'Nova entrada', message: 'Entrada registrada: 30 unidades de Ração Golden 15kg (Lote DEF456).', date: daysFromNow(-21), read: true, productId: 'p1', lotId: 'l2' },
  { id: 'n12', type: 'insight', title: 'Insight do sistema', message: 'Você possui R$ 2.340,00 em produtos que vencem nos próximos 30 dias. Considere criar promoções.', date: daysFromNow(0), read: false },
];

export const mockActions: ActionRecord[] = [
  { id: 'a1', lotId: 'l5', productId: 'p3', type: 'discard', quantity: 7, notes: 'Produto vencido, descarte obrigatório', createdAt: daysFromNow(-1) },
  { id: 'a2', lotId: 'l9', productId: 'p5', type: 'return', quantity: 15, notes: 'Devolução para fornecedor', createdAt: daysFromNow(-3) },
];

export const mockLosses: LossRecord[] = [
  { id: 'loss1', productName: 'Ração Pedigree 10kg', quantity: 7, value: 525, reason: 'Vencimento', date: daysFromNow(-1) },
  { id: 'loss2', productName: 'Areia Higiênica', quantity: 15, value: 375, reason: 'Vencimento', date: daysFromNow(-3) },
  { id: 'loss3', productName: 'Ração Whiskas 3kg', quantity: 4, value: 180, reason: 'Vencimento', date: daysFromNow(-8) },
  { id: 'loss4', productName: 'Ração Special Dog 20kg', quantity: 2, value: 220, reason: 'Vencimento', date: daysFromNow(-1) },
];
