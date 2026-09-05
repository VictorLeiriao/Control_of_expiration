import { mockProducts, mockLots, mockEntries, mockNotifications, mockCompany, mockUser, mockActions, mockLosses } from '@/mocks';
import type { Product, ProductLot, Entry, Notification, Company, User, ActionRecord, LossRecord, DashboardSummary, DashboardAlert, CriticalProduct, ReportSummary, PromotionData } from '@/types';
import { daysUntil, getExpirationStatus } from '@/utils/format';

function delay(ms: number = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const productService = {
  async getProducts(): Promise<Product[]> {
    await delay();
    return [...mockProducts];
  },

  async getProductById(id: string): Promise<Product | null> {
    await delay(200);
    return mockProducts.find((p) => p.id === id) || null;
  },

  async createProduct(data: Omit<Product, 'id' | 'createdAt' | 'totalStock'>): Promise<Product> {
    await delay(500);
    const product: Product = {
      ...data,
      id: `p${Date.now()}`,
      totalStock: 0,
      createdAt: new Date().toISOString(),
    };
    mockProducts.push(product);
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

  async getLotsByProductId(productId: string): Promise<ProductLot[]> {
    await delay(200);
    return mockLots.filter((l) => l.productId === productId);
  },

  async createLot(data: Omit<ProductLot, 'id' | 'createdAt'>): Promise<ProductLot> {
    await delay(500);
    const lot: ProductLot = {
      ...data,
      id: `l${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    mockLots.push(lot);
    return lot;
  },
};

export const entryService = {
  async getEntries(): Promise<Entry[]> {
    await delay();
    return [...mockEntries];
  },

  async createEntry(data: Omit<Entry, 'id' | 'status'>): Promise<Entry> {
    await delay(500);
    const entry: Entry = {
      ...data,
      id: `e${Date.now()}`,
      status: 'confirmed',
    };
    mockEntries.push(entry);
    return entry;
  },
};

export const expirationService = {
  async getExpiringProducts(days: number = 30): Promise<CriticalProduct[]> {
    await delay();
    const result: CriticalProduct[] = [];
    for (const lot of mockLots) {
      const daysRem = daysUntil(lot.expirationDate);
      if (daysRem <= days) {
        const product = mockProducts.find((p) => p.id === lot.productId);
        if (product) {
          result.push({
            lot,
            product,
            daysRemaining: daysRem,
            riskValue: lot.currentQuantity * lot.purchasePrice,
            status: getExpirationStatus(lot.expirationDate),
          });
        }
      }
    }
    return result.sort((a, b) => a.daysRemaining - b.daysRemaining);
  },

  async getExpiredProducts(): Promise<CriticalProduct[]> {
    await delay();
    const result: CriticalProduct[] = [];
    for (const lot of mockLots) {
      const daysRem = daysUntil(lot.expirationDate);
      if (daysRem < 0) {
        const product = mockProducts.find((p) => p.id === lot.productId);
        if (product) {
          result.push({
            lot,
            product,
            daysRemaining: daysRem,
            riskValue: lot.currentQuantity * lot.purchasePrice,
            status: 'expired',
          });
        }
      }
    }
    return result.sort((a, b) => a.daysRemaining - b.daysRemaining);
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
    let expiredCount = 0;
    let expiring7Days = 0;
    let expiring30Days = 0;
    let riskValue = 0;
    const criticalProducts: CriticalProduct[] = [];

    for (const lot of mockLots) {
      const days = daysUntil(lot.expirationDate);
      const product = mockProducts.find((p) => p.id === lot.productId);
      if (!product) continue;

      const riskVal = lot.currentQuantity * lot.purchasePrice;
      const critical: CriticalProduct = {
        lot,
        product,
        daysRemaining: days,
        riskValue: riskVal,
        status: getExpirationStatus(lot.expirationDate),
      };

      if (days < 0) {
        expiredCount++;
      } else if (days <= 7) {
        expiring7Days++;
        riskValue += riskVal;
        criticalProducts.push(critical);
      } else if (days <= 30) {
        expiring30Days++;
        riskValue += riskVal;
        criticalProducts.push(critical);
      }
    }

    criticalProducts.sort((a, b) => a.daysRemaining - b.daysRemaining);

    const summary: DashboardSummary = {
      expiredCount,
      expiring7Days,
      expiring30Days,
      riskValue,
      totalProducts: mockProducts.length,
      totalUnits: mockProducts.reduce((sum, p) => sum + p.totalStock, 0),
      totalLots: mockLots.length,
    };

    const alerts: DashboardAlert[] = [
      {
        id: 'alert-1',
        level: 'critical',
        title: 'ATENÇÃO',
        message: `${expiring7Days} produtos vencem nos próximos 7 dias.`,
        actionLabel: 'Ver produtos',
        actionLink: '/expirations',
        dismissed: false,
      },
      {
        id: 'alert-2',
        level: 'warning',
        title: 'ESTOQUE EM RISCO',
        message: `${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(riskValue)} em produtos próximos do vencimento.`,
        actionLabel: 'Ver detalhes',
        actionLink: '/expirations',
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
          return d >= 0;
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
