import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { LoadingState } from '@/components/ui/LoadingState';
import { useAuth } from '@/contexts/AuthContext';
import { sessionService, type Session, type StoreOption } from '@/services/session';

interface StoreContextValue {
  store: StoreOption;
  stores: StoreOption[];
  selectStore: (id: string) => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore deve ser usado dentro de StoreProvider.');
  return context;
}

export function StoreProvider({ session, children }: { session: Session; children: ReactNode }) {
  const { logout } = useAuth();
  const storageKey = `controle-estoque-loja:${session.userId}:${session.tenantId}`;
  const [selectedId, setSelectedId] = useState(() => sessionStorage.getItem(storageKey) ?? '');
  const [stores, setStores] = useState<StoreOption[] | null>(null);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    sessionService.stores(session.accessToken, controller.signal).then((items) => {
      if (!controller.signal.aborted) setStores(items);
    }).catch((failure: unknown) => {
      if (!controller.signal.aborted) setError(failure instanceof Error ? failure.message : 'Não foi possível carregar as lojas.');
    });
    return () => controller.abort();
  }, [session.accessToken, attempt]);

  function selectStore(id: string) {
    if (!stores?.some((store) => store.id === id)) return;
    sessionStorage.setItem(storageKey, id);
    setSelectedId(id);
  }

  async function createStore(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setCreating(true);
    setError('');
    try {
      const store = await sessionService.createStore(session.accessToken, String(data.get('code')).trim(), String(data.get('name')).trim());
      setStores([store]);
      sessionStorage.setItem(storageKey, store.id);
      setSelectedId(store.id);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Não foi possível cadastrar a loja.');
    } finally {
      setCreating(false);
    }
  }

  if (!stores && !error) return <LoadingState />;
  const store = stores?.find((item) => item.id === selectedId) ?? (stores?.length === 1 ? stores[0] : undefined);
  if (store && stores) return <StoreContext.Provider value={{ store, stores, selectStore }}>{children}</StoreContext.Provider>;

  return (
    <main className="min-h-screen bg-ink-50 grid place-items-center p-4">
      <section className="card w-full max-w-md p-6 space-y-4">
        <h1 className="text-xl font-bold">{stores?.length === 0 ? 'Cadastre sua primeira loja' : 'Selecione a loja'}</h1>
        {error && <p role="alert" className="text-sm text-error-700">{error}</p>}
        {!stores ? (
          <button className="btn-primary" onClick={() => { setError(''); setAttempt((value) => value + 1); }}>Tentar novamente</button>
        ) : stores.length ? (
          <label className="block text-sm font-medium">
            Loja
            <select className="input-field mt-1" value="" onChange={(event) => selectStore(event.target.value)}>
              <option value="">Selecione uma loja</option>
              {stores.map((item) => <option key={item.id} value={item.id}>{item.name} ({item.code})</option>)}
            </select>
          </label>
        ) : (
          <form className="space-y-3" onSubmit={createStore}>
            <label className="block text-sm font-medium">Código<input name="code" className="input-field mt-1" maxLength={60} required /></label>
            <label className="block text-sm font-medium">Nome da loja<input name="name" className="input-field mt-1" maxLength={200} required /></label>
            <button className="btn-primary" disabled={creating}>Cadastrar loja</button>
          </form>
        )}
        <button className="btn-ghost" onClick={logout}>Sair</button>
      </section>
    </main>
  );
}
