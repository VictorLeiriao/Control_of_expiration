import { ApiError, apiRequest } from './api';

export interface Session {
  accessToken: string;
  expiresAt: string;
  userId: string;
  tenantId: string;
}

export interface Identity {
  userId: string;
  tenantId: string;
  email: string;
}

export interface TenantOption { tenantId: string; name: string }

export interface StoreOption { id: string; code: string; name: string }

interface Registration { name: string; companyName: string; email: string; password: string }

export const sessionService = {
  async login(email: string, password: string, tenantId?: string): Promise<Session | TenantOption[]> {
    try {
      return await apiRequest<Session>('/auth/login', { body: { email, password, tenantId } });
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        const result = error.body as { code?: string; tenants?: TenantOption[] } | null;
        if (result?.code === 'tenant_selection_required' && Array.isArray(result.tenants)) return result.tenants;
      }
      throw error;
    }
  },

  register(data: Registration) {
    return apiRequest<Session>('/auth/register', { body: data });
  },

  me(token: string, signal?: AbortSignal) {
    return apiRequest<Identity>('/auth/me', { token, signal });
  },

  async stores(token: string, signal: AbortSignal): Promise<StoreOption[]> {
    const limit = 100;
    const stores: StoreOption[] = [];
    for (let offset = 0; ; offset += limit) {
      const page = await apiRequest<StoreOption[]>(`/inventory/stores?limit=${limit}&offset=${offset}`, { token, signal });
      stores.push(...page);
      if (page.length < limit) return stores;
    }
  },

  createStore(token: string, code: string, name: string) {
    return apiRequest<StoreOption>('/inventory/stores', { token, body: { code, name } });
  },
};
