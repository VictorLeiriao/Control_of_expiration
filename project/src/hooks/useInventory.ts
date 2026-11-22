import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useStore } from '@/contexts/StoreContext';
import { inventoryService } from '@/services/inventory';

export function useInventoryScope() {
  const { session } = useAuth();
  const { store } = useStore();
  if (!session) throw new Error('O estoque exige uma sessão válida.');
  return { token: session.accessToken, storeId: store.id };
}

interface RequestState<T> {
  data?: T;
  error?: string;
}

export function useInventoryRequest<T>(load: (signal: AbortSignal) => Promise<T>) {
  const [result, setResult] = useState<{
    load: typeof load;
    revision: number;
    state: RequestState<T>;
  }>();
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal).then((data) => {
      if (!controller.signal.aborted) setResult({ load, revision, state: { data } });
    }, (error: unknown) => {
      if (!controller.signal.aborted) {
        const message = error instanceof Error ? error.message : 'Não foi possível carregar os dados.';
        setResult({ load, revision, state: { error: message } });
      }
    });
    return () => controller.abort();
  }, [load, revision]);

  const reload = useCallback(() => setRevision((value) => value + 1), []);
  const state = result?.load === load && result.revision === revision ? result.state : {};
  return { ...state, reload };
}

export function useInventoryOverview() {
  const { token, storeId } = useInventoryScope();
  return useInventoryRequest(useCallback(
    (signal: AbortSignal) => inventoryService.overview(token, storeId, signal),
    [token, storeId],
  ));
}
