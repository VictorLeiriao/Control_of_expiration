import { useEffect, useState } from 'react';
import { apiRequest } from '@/services/api';

interface ManagementCapabilities {
  tenantSettingsManage: boolean;
  membersRead: boolean;
  membersInvite: boolean;
  membersDeactivate: boolean;
  alertsDispatch: boolean;
  promotionsWrite: boolean;
  reportsRead: boolean;
  inventoryCatalogWrite: boolean;
  inventoryStockWrite: boolean;
}

export function useManagementCapabilities(token?: string) {
  const [response, setResponse] = useState<{ token: string; capabilities: ManagementCapabilities | null } | null>(null);

  useEffect(() => {
    if (!token) return;
    const controller = new AbortController();
    apiRequest<ManagementCapabilities>('/tenant/management-capabilities', { token, signal: controller.signal })
      .then((capabilities) => {
        if (!controller.signal.aborted) setResponse({ token, capabilities });
      })
      .catch(() => {
        if (!controller.signal.aborted) setResponse({ token, capabilities: null });
      });
    return () => controller.abort();
  }, [token]);

  return response?.token === token ? response?.capabilities : undefined;
}
