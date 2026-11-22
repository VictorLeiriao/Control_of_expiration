import { StrictMode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { createRoot } from 'react-dom/client';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { StoreProvider } from '@/contexts/StoreContext';
import { LoadingState } from '@/components/ui/LoadingState';
import { LoginPage } from '@/pages/LoginPage';
import App from './App.tsx';
import './index.css';

function SessionGate() {
  const { user, session, loading, error, retry, logout } = useAuth();
  if (loading) return <LoadingState />;
  if (error) return (
    <main className="min-h-screen bg-ink-50 grid place-items-center p-4">
      <section className="card w-full max-w-md p-6 space-y-4">
        <h1 className="font-bold">Não foi possível verificar a sessão</h1>
        <p role="alert" className="text-sm text-error-700">{error}</p>
        <div className="flex flex-wrap gap-2">
          <button className="btn-primary" onClick={retry}>Tentar novamente</button>
          <button className="btn-ghost" onClick={logout}>Sair</button>
        </div>
      </section>
    </main>
  );
  if (!session || !user) return <LoginPage />;
  return (
    <StoreProvider key={session.accessToken} session={session}>
      <App />
    </StoreProvider>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider><SessionGate /></AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
