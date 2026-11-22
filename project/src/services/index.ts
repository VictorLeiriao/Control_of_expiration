import { mockProducts, mockLots, mockEntries, mockNotifications, mockCompany, mockUser, mockActions, mockLosses } from '@/mocks';
import type { Product, ProductWithStock, ProductLot, Entry, Notification, Company, User, ActionRecord, LossRecord, DashboardSummary, DashboardAlert, CriticalProduct, ReportSummary, PromotionData } from '@/types';
import { dateKey, daysUntil, getExpirationStatus } from '@/utils/format';

import { calculateLotInventoryValue, calculateStock, compareLots, getFefoPriority } from '@/utils/lots';

type LotInput = Omit<ProductLot, 'id' | 'createdAt'>;
type LotUpdate = Omit<LotInput, 'productId'>;

function withStock(product: Product): ProductWithStock {
  return { ...product, totalStock: calculateStock(mockLots.filter((lot) => lot.productId === product.id)) };
}

function validateLot(data: LotInput, product = mockProducts.find((item) => item.id === data.productId)): LotInput {
  if (!product) throw new Error('Produto não encontrado.');
  const lotNumber = data.lotNumber.trim();
  if (!lotNumber) throw new Error('Informe a identificação do lote.');
  if ([data.initialQuantity, data.currentQuantity, data.purchasePrice].some((value) => !Number.isFinite(value) || value < 0)) {
    throw new Error('Informe quantidades e preço de compra válidos e não negativos.');
  }
  const entryDate = dateKey(data.entryDate);
  if (!entryDate) throw new Error('Informe uma data de entrada válida.');
  const expirationDate = dateKey(data.expirationDate);
  if ((data.expirationDate || product.hasExpirationControl === true) && !expirationDate) {
    throw new Error('Informe uma data de validade válida.');
  }
  if (product.hasExpirationControl === false && expirationDate) {
    throw new Error('Este produto não possui controle de validade.');
  }
  return { ...data, lotNumber, entryDate, expirationDate };
}

function addLot(data: LotInput): ProductLot {
  const lot = { ...validateLot(data), id: crypto.randomUUID(), createdAt: new Date().toISOString() };
  mockLots.push(lot);
  return lot;
}

export interface ExpirationLot extends CriticalProduct {
  isFefo: boolean;
}

function getExpirationRows(): ExpirationLot[] {
  const today = new Date();
  const lotsByProduct = new Map<string, ProductLot[]>();
  for (const lot of mockLots) {
    const lots = lotsByProduct.get(lot.productId) ?? [];
    lots.push(lot);
    lotsByProduct.set(lot.productId, lots);
  }
  return mockProducts.flatMap((product) => {
    const lots = lotsByProduct.get(product.id) ?? [];
    const priority = getFefoPriority(lots, today);
    return lots.map((lot) => ({
      lot,
      product,
      daysRemaining: daysUntil(lot.expirationDate, today),
      riskValue: calculateLotInventoryValue(lot),
      status: getExpirationStatus(lot.expirationDate, today),
      isFefo: lot.id === priority?.id,
    }));
  }).sort((a, b) => compareLots(a.lot, b.lot));
}

function delay(ms: number = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const productService = {
  async getProducts(): Promise<ProductWithStock[]> {
    await delay();
    return mockProducts.map(withStock);
  },

  async getProductById(id: string): Promise<Product | null> {
    await delay(200);
    return mockProducts.find((p) => p.id === id) || null;
  },

  async createProduct(
    data: Omit<Product, 'id' | 'createdAt'>,
    initialLots: LotUpdate[] = [],
  ): Promise<Product> {
    await delay(500);
    const product: Product = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    const lots = initialLots.map((lot) => ({
      ...validateLot({ ...lot, productId: product.id }, product),
      id: crypto.randomUUID(),
      createdAt: product.createdAt,
    }));
    mockProducts.push(product);
    mockLots.push(...lots);
    return product;
  },

  async updateProduct(id: string, data: Partial<Product>): Promise<Product | null> {
    await delay(400);
    const idx = mockProducts.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    mockProducts[idx] = { ...mockProducts[idx], ...data };
    return mockProducts[idx];
  },

  async findByBarcode(barcode: string): Promise<Product | null> {
    await delay(300);
    return mockProducts.find((p) => p.barcode === barcode) || null;
  },
};

export const lotService = {
  async getLots(): Promise<ProductLot[]> {
    await delay();
    return [...mockLots];
  },

  async getLotById(id: string): Promise<ProductLot | null> {
    await delay(200);
    return mockLots.find((l) => l.id === id) || null;
  },

  async getLotsByProduct(productId: string): Promise<ProductLot[]> {
    await delay(200);
    return mockLots.filter((l) => l.productId === productId);
  },

  async createLot(data: LotInput): Promise<ProductLot> {
    await delay(500);
    return addLot(data);
  },

  async updateLot(id: string, data: LotUpdate): Promise<ProductLot> {
    await delay(400);
    const index = mockLots.findIndex((lot) => lot.id === id);
    if (index === -1) throw new Error('Lote não encontrado.');
    const existing = mockLots[index];
    const updated = { ...existing, ...validateLot({ ...data, productId: existing.productId }) };
    mockLots[index] = updated;
    return updated;
  },

  async deleteLot(id: string): Promise<void> {
    await delay(400);
    const index = mockLots.findIndex((lot) => lot.id === id);
    if (index === -1) throw new Error('Lote não encontrado.');
    if (mockEntries.some((entry) => entry.lotId === id && entry.status === 'confirmed')
      || mockActions.some((action) => action.lotId === id)) {
      throw new Error('Este lote possui histórico de movimentação e não pode ser exclu?do.');
    }
    mockLots.splice(index, 1);
  },
};

export const entryService = {
  async getEntries(): Promise<Entry[]> {
    await delay();
    return [...mockEntries];
  },

  async createEntry(data: Omit<Entry, 'id' | 'status' | 'lotId'>): Promise<Entry> {
    await delay(500);
    if (!Number.isFinite(data.quantity) || data.quantity <= 0) throw new Error('Informe uma quantidade maior que zero.');
    const lot = addLot({
      productId: data.productId,
      lotNumber: data.lotNumber,
      entryDate: data.entryDate,
      expirationDate: data.expirationDate,
      initialQuantity: data.quantity,
      currentQuantity: data.quantity,
      purchasePrice: data.purchasePrice,
    });
    const entry: Entry = {
      ...data,
      id: crypto.randomUUID(),
      lotId: lot.id,
      lotNumber: lot.lotNumber,
      entryDate: lot.entryDate,
      expirationDate: lot.expirationDate,
      status: 'confirmed',
    };
    mockEntries.push(entry);
    return entry;
  },
};

export const expirationService = {
  getExpirationStatus,
  getDaysUntilExpiration: daysUntil,

  async getLots(): Promise<ExpirationLot[]> {
    await delay();
    return getExpirationRows();
  },

  async getExpiringLots(days = 30): Promise<ExpirationLot[]> {
    return (await this.getLots()).filter((item) =>
      item.lot.currentQuantity > 0 && Number.isFinite(item.daysRemaining)
      && item.daysRemaining >= 0 && item.daysRemaining <= days,
    );
  },

  async getExpiredLots(): Promise<ExpirationLot[]> {
    return (await this.getLots()).filter((item) => item.lot.currentQuantity > 0 && item.status === 'expired');
  },

  async getCriticalLots(): Promise<ExpirationLot[]> {
    return this.getExpiringLots(7);
  },
};

export const notificationService = {
  async getNotifications(): Promise<Notification[]> {
    await delay();
    return [...mockNotifications];
  },

  async markAsRead(id: string): Promise<void> {
    await delay(200);
    const notif = mockNotifications.find((n) => n.id === id);
    if (notif) notif.read = true;
  },

  async markAllAsRead(): Promise<void> {
    await delay(300);
    mockNotifications.forEach((n) => (n.read = true));
  },
};

export const dashboardService = {
  async getDashboard(): Promise<{ summary: DashboardSummary; criticalProducts: CriticalProduct[]; alerts: DashboardAlert[] }> {
    await delay();
    const activeLots = getExpirationRows().filter((item) => item.lot.currentQuantity > 0);
    const expiredCount = activeLots.filter((item) => item.status === 'expired').length;
    const expiring7Days = activeLots.filter((item) => item.status === 'critical').length;
    const expiring30Days = activeLots.filter((item) => item.status === 'warning').length;
    const atRisk = activeLots.filter((item) => item.status === 'critical' || item.status === 'warning');
    const riskValue = atRisk.reduce((sum, item) => sum + item.riskValue, 0);
    const seenProducts = new Set<string>();
    const criticalProducts = atRisk.filter(({ product }) => {
      if (seenProducts.has(product.id)) return false;
      seenProducts.add(product.id);
      return true;
    });

    const summary: DashboardSummary = {
      expiredCount,
      normalCount: activeLots.filter((item) => item.status === 'normal').length,
      expiring7Days,
      expiring30Days,
      riskValue,
      totalProducts: mockProducts.length,
      totalUnits: calculateStock(mockLots),
      totalLots: mockLots.length,
    };

    const alerts: DashboardAlert[] = [
      {
        id: 'alert-1',
        level: 'critical',
        title: 'ATENÇÃO',
        message: expiring7Days === 1
          ? '1 lote vence nos próximos 7 dias.'
          : `${expiring7Days} lotes vencem nos próximos 7 dias.`,
        actionLabel: 'Ver produtos',
        actionLink: '/expirations?status=critical&stock=available',
        dismissed: false,
      },
      {
        id: 'alert-2',
        level: 'warning',
        title: 'ESTOQUE EM RISCO',
        message: `${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(riskValue)} em produtos próximos do vencimento.`,
        actionLabel: 'Ver detalhes',
        actionLink: '/expirations?period=30&stock=available',
        dismissed: false,
      },
    ];

    return { summary, criticalProducts, alerts };
  },
};

export const assistantService = {
  async ask(question: string): Promise<string> {
    await delay(800);
    const q = question.toLowerCase();

    if (q.includes('semana') || q.includes('7 dias')) {
      const expiring = mockLots.filter((l) => {
        const d = daysUntil(l.expirationDate);
        return d >= 0 && d <= 7;
      });
      const count = expiring.length;
      const top = expiring.sort((a, b) => daysUntil(a.expirationDate) - daysUntil(b.expirationDate))[0];
      const topProduct = top ? mockProducts.find((p) => p.id === top.productId) : null;
      const topRisk = top ? top.currentQuantity * top.purchasePrice : 0;

      return `Você possui ${count} produtos que vencem nos próximos 7 dias.\n\nO maior risco é a ${topProduct?.name || ''},\nlote ${top?.lotNumber || ''}.\n\n${top?.currentQuantity || 0} unidades.\n\nValor estimado em estoque:\n${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(topRisk)}.\n\nSugestão:\npriorize a venda ou crie uma promoção.`;
    }

    if (q.includes('risco') || q.includes('quanto')) {
      let risk = 0;
      mockLots.forEach((l) => {
        const d = daysUntil(l.expirationDate);
        if (d >= 0 && d <= 30) {
          risk += l.currentQuantity * l.purchasePrice;
        }
      });
      return `Atualmente você possui ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(risk)} em produtos que vencem nos próximos 30 dias.`;
    }

    if (q.includes('vender primeiro') || q.includes('priorizar') || q.includes('dev')) {
      const expiring = mockLots
        .filter((l) => {
          const d = daysUntil(l.expirationDate);
          return Number.isFinite(d) && d >= 0;
        })
        .sort((a, b) => daysUntil(a.expirationDate) - daysUntil(b.expirationDate))
        .slice(0, 3);

      let response = 'Com base na validade, recomendo priorizar:\n\n';
      expiring.forEach((lot, i) => {
        const product = mockProducts.find((p) => p.id === lot.productId);
        response += `${i + 1}. ${product?.name || ''} — ${daysUntil(lot.expirationDate)} dias\n`;
      });

      return response;
    }

    if (q.includes('parado') || q.includes('parados')) {
      return 'Identifiquei 3 produtos com baixa rotatividade:\n\n1. Coleira de Segurança — 20 unidades há 80 dias\n2. Brinquedo Mordedor — 25 unidades há 65 dias\n3. Antipulgas Frontline — 10 unidades há 45 dias\n\nSugestão: Considere promoções para liberar capital parado.';
    }

    if (q.includes('perdi') || q.includes('perdas') || q.includes('vencimento')) {
      let totalLoss = 0;
      mockLosses.forEach((l) => (totalLoss += l.value));
      return `Nos últimos 30 dias, você registrou ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalLoss)} em perdas por vencimento.\n\nProdutos mais impactados:\n1. Ração Pedigree 10kg — R$ 525,00\n2. Areia Higiênica — R$ 375,00\n3. Ração Whiskas 3kg — R$ 180,00`;
    }

    return 'Posso ajudar você a identificar produtos próximos do vencimento, entender riscos financeiros e tomar decisões sobre seu estoque. Tente perguntar:\n\n• O que vence esta semana?\n• Quanto tenho em risco?\n• Quais produtos devo vender primeiro?';
  },
};

export const companyService = {
  async getCompany(): Promise<Company> {
    await delay(200);
    return { ...mockCompany };
  },

  async updateCompany(data: Partial<Company>): Promise<Company> {
    await delay(400);
    Object.assign(mockCompany, data);
    return { ...mockCompany };
  },

  async uploadLogo(base64: string): Promise<void> {
    await delay(600);
    mockCompany.logoBase64 = base64;
  },
};

export const userService = {
  async getCurrentUser(): Promise<User> {
    await delay(200);
    return { ...mockUser };
  },
};

export const aiProductService = {
  async analyzeImage(): Promise<{ name: string; brand: string; barcode: string; lotNumber: string; expirationDate: string } | null> {
    await delay(1500);
    return {
      name: 'Ração Golden 15kg',
      brand: 'Golden',
      barcode: '789000000001',
      lotNumber: 'GOLD2026',
      expirationDate: '2027-03-15',
    };
  },
};

export const actionService = {
  async createAction(data: Omit<ActionRecord, 'id' | 'createdAt'>): Promise<ActionRecord> {
    await delay(500);
    const action: ActionRecord = {
      ...data,
      id: `a${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    mockActions.push(action);
    return action;
  },

  async getActions(): Promise<ActionRecord[]> {
    await delay(200);
    return [...mockActions];
  },
};

export const reportService = {
  async getReportSummary(): Promise<ReportSummary> {
    await delay();
    let lostValue = 0;
    mockLosses.forEach((l) => (lostValue += l.value));

    return {
      expiredProducts: mockLosses.length,
      lostValue,
      productsAtRisk: mockLots.filter((l) => {
        const d = daysUntil(l.expirationDate);
        return d >= 0 && d <= 30;
      }).length,
      discards: mockActions.filter((a) => a.type === 'discard').length,
      promotionsCreated: mockActions.filter((a) => a.type === 'promotion').length,
    };
  },

  async getLosses(): Promise<LossRecord[]> {
    await delay();
    return [...mockLosses];
  },
};

export const promotionService = {
  async generatePromotion(data: PromotionData): Promise<{ success: boolean; imageUrl?: string }> {
    await delay(800);
    return { success: true };
  },
};
