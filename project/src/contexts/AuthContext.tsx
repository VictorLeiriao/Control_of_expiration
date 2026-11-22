import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { ApiError } from '@/services/api';
import { sessionService, type Identity, type Session } from '@/services/session';

const storageKey = 'controle-estoque-api-session';

function readSession(): Session | null {
  try {
    const session = JSON.parse(sessionStorage.getItem(storageKey) ?? 'null') as Session | null;
    if (session?.accessToken && session.tenantId && session.userId && Date.parse(session.expiresAt) > Date.now()) return session;
  } catch {
    // Start a fresh session when the stored value is unreadable.
  }
  return null;
}

interface AuthContextValue {
  user: (Identity & { name: string }) | null;
  session: Session | null;
  loading: boolean;
  error: string;
  retry: () => void;
  signIn: (session: Session) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState(readSession);
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);

  function signIn(next: Session) {
    sessionStorage.setItem(storageKey, JSON.stringify(next));
    setIdentity(null);
    setError('');
    setSession(next);
  }

  function logout() {
    sessionStorage.removeItem(storageKey);
    setSession(null);
    setIdentity(null);
    setError('');
  }

  useEffect(() => {
    if (!session) return;
    const controller = new AbortController();
    function unauthorized(event: Event) {
      if ((event as CustomEvent<string>).detail === session?.accessToken) logout();
    }
    window.addEventListener('inventory:unauthorized', unauthorized);
    const timer = window.setTimeout(logout, Math.max(0, Date.parse(session.expiresAt) - Date.now()));

    sessionService.me(session.accessToken, controller.signal).then((current) => {
      if (controller.signal.aborted) return;
      if (current.tenantId !== session.tenantId || current.userId !== session.userId) {
        logout();
        return;
      }
      setIdentity(current);
    }).catch((failure: unknown) => {
      if (controller.signal.aborted) return;
      if (failure instanceof ApiError && [401, 403].includes(failure.status)) logout();
      else setError(failure instanceof Error ? failure.message : 'Não foi possível verificar sua sessão.');
    });

    return () => {
      controller.abort();
      window.clearTimeout(timer);
      window.removeEventListener('inventory:unauthorized', unauthorized);
    };
  }, [session, attempt]);

  const user = identity ? { ...identity, name: identity.email.split('@')[0] } : null;
  return (
    <AuthContext.Provider value={{
      user, session, loading: Boolean(session && !user && !error), error,
      retry: () => { setError(''); setAttempt((value) => value + 1); }, signIn, logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser usado dentro de AuthProvider.');
  return context;
}
