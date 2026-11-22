import { apiRequest } from './api';

export interface Member { userId: string; name: string; email: string; roleCode: string; isActive: boolean }
export interface Invitation { token: string; expiresAt: string }
export interface CatalogProduct { id: string; name: string; sku: string }
export interface CatalogLot { id: string; lotNumber: string; expirationDate: string | null }
export interface Promotion { id: string; name: string; discountPercent: number; startsAt: string; endsAt: string }
export interface PromotionInput { name: string; discountPercent: number; startsAt: string; endsAt: string }
export interface Loss { storeId: string; storeName: string; productId: string; productName: string; lostQuantity: number; movementCount: number; lostValue?: number | null }
export interface Losses { lossFrom: string; lossThrough: string; items: Loss[] }
export type AlertChannel = 'email' | 'telegram';
export type DispatchStatus = 'Pending' | 'Unavailable' | 'NoMatchingStock' | 'Sent' | 'DeliveryFailed';
export interface InventoryNotice { id: string; channel: AlertChannel; status: DispatchStatus; scheduledDate: string | null; createdAt: string; isRead: boolean }

export interface TenantSettings {
  companyName: string;
  document: string | null;
  segment: string | null;
  logoUrl: string | null;
  expirationDays: number;
  automaticAlerts: boolean;
  alertHour: number;
  email: string | null;
  telegramChatId: string | null;
  emailEnabled: boolean;
  telegramEnabled: boolean;
}

async function list<T>(path: string, token: string, signal?: AbortSignal): Promise<T[]> {
  const data: T[] = [];
  const limit = 100;
  for (let offset = 0; ; offset += limit) {
    const page = await apiRequest<T[]>(`${path}?offset=${offset}&limit=${limit}`, { token, signal });
    data.push(...page);
    if (page.length < limit) return data;
  }
}

export const managementService = {
  members: (token: string, signal?: AbortSignal) => apiRequest<Member[]>('/tenant/members', { token, signal }),
  invite: (token: string, email: string) => apiRequest<Invitation>('/tenant/invitations', { token, body: { email, roleCode: 'MEMBER' } }),
  accept: (code: string, password: string, name: string) =>
    apiRequest<void>('/tenant/invitations/accept', { body: { token: code, password, name: name || null } }),
  deactivate: (token: string, id: string) => apiRequest<void>(`/tenant/members/${id}/deactivate`, { token, body: {} }),
  settings: (token: string, signal?: AbortSignal) => apiRequest<TenantSettings>('/tenant/settings', { token, signal }),
  saveSettings: (token: string, settings: TenantSettings) => apiRequest<TenantSettings>('/tenant/settings', { token, method: 'PUT', body: settings }),
  notifications: (token: string, offset: number, signal?: AbortSignal) =>
    apiRequest<InventoryNotice[]>(`/tenant/notifications?offset=${offset}&limit=25`, { token, signal }),
  readNotice: (token: string, id: string) => apiRequest<void>(`/tenant/notifications/${id}/read`, { token, body: {} }),
  sendAlert: (token: string, channel: AlertChannel, days: number) =>
    apiRequest<{ sent: boolean } | undefined>('/inventory/alerts/dispatch', { token, body: { channel, days } }),
  losses: (token: string, days: number, offset: number, signal?: AbortSignal) =>
    apiRequest<Losses>(`/inventory/reports/losses?days=${days}&offset=${offset}&limit=25`, { token, signal }),
  products: (token: string, signal?: AbortSignal) => list<CatalogProduct>('/inventory/products', token, signal),
  lots: (token: string, productId: string, signal?: AbortSignal) => list<CatalogLot>(`/inventory/products/${productId}/lots`, token, signal),
  promotions: (token: string, productId: string, lotId: string, signal?: AbortSignal) =>
    list<Promotion>(`/inventory/products/${productId}/lots/${lotId}/promotions`, token, signal),
  createPromotion: (token: string, productId: string, lotId: string, data: PromotionInput) =>
    apiRequest<Promotion>(`/inventory/products/${productId}/lots/${lotId}/promotions`, { token, body: data }),
};
