// Domain types for Controle de Estoque

export type Unit = 'unidade' | 'kg' | 'g' | 'litro' | 'ml' | 'caixa' | 'pacote';

export type ExpirationStatus = 'expired' | 'critical' | 'warning' | 'soon' | 'normal';

export type ActionType = 'promotion' | 'return' | 'transfer' | 'sale' | 'discard' | 'other';

export type NotificationType = 'expired' | 'expiring_7' | 'expiring_30' | 'entry' | 'insight';

export type ChannelType = 'EMAIL' | 'TELEGRAM';

export interface Tenant {
  id: string;
  name: string;
  createdAt: string;
}

export interface Company {
  id: string;
  name: string;
  document: string;
  segment: string;
  logoBase64: string | null;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  role: 'admin' | 'manager' | 'viewer';
}

export interface Store {
  id: string;
  tenantId: string;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  barcode: string;
  category: string;
  brand: string;
  unit: Unit;
  totalStock: number;
  createdAt: string;
}

export interface ProductLot {
  id: string;
  productId: string;
  lotNumber: string;
  initialQuantity: number;
  currentQuantity: number;
  entryDate: string;
  expirationDate: string;
  purchasePrice: number;
  createdAt: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  lotId: string;
  type: 'entry' | 'exit' | 'adjustment' | 'discard' | 'transfer';
  quantity: number;
  reason: string;
  createdAt: string;
}

export interface Entry {
  id: string;
  productId: string;
  lotId: string;
  quantity: number;
  lotNumber: string;
  expirationDate: string;
  entryDate: string;
  purchasePrice: number;
  status: 'confirmed' | 'pending';
}

export interface ActionRecord {
  id: string;
  lotId: string;
  productId: string;
  type: ActionType;
  quantity: number;
  notes: string;
  oldPrice?: number;
  newPrice?: number;
  promotionDate?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  date: string;
  read: boolean;
  productId?: string;
  lotId?: string;
}

export interface NotificationChannel {
  id: string;
  tenantId: string;
  type: ChannelType;
  destination: string;
  enabled: boolean;
  createdAt: string;
}

export interface DashboardSummary {
  expiredCount: number;
  expiring7Days: number;
  expiring30Days: number;
  riskValue: number;
  totalProducts: number;
  totalUnits: number;
  totalLots: number;
}

export interface DashboardAlert {
  id: string;
  level: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  actionLabel: string;
  actionLink: string;
  dismissed: boolean;
}

export interface CriticalProduct {
  lot: ProductLot;
  product: Product;
  daysRemaining: number;
  riskValue: number;
  status: ExpirationStatus;
}

export interface ReportSummary {
  expiredProducts: number;
  lostValue: number;
  productsAtRisk: number;
  discards: number;
  promotionsCreated: number;
}

export interface LossRecord {
  id: string;
  productName: string;
  quantity: number;
  value: number;
  reason: string;
  date: string;
}

export interface AssistantMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface PromotionData {
  productName: string;
  oldPrice: number;
  newPrice: number;
  lotNumber: string;
  quantity: number;
}
