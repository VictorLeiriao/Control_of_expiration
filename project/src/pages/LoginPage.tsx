import { useState } from 'react';
import { sessionService, type TenantOption } from '@/services/session';
import { useAuth } from '@/contexts/AuthContext';
import { Boxes, Loader2 } from 'lucide-react';

export function LoginPage() {
  const { signIn } = useAuth();
  const [registering, setRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [tenants, setTenants] = useState<TenantOption[]>([]);
  const [tenantId, setTenantId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = registering
        ? await sessionService.register({ name: name.trim(), companyName: companyName.trim(), email: email.trim(), password })
        : await sessionService.login(email.trim(), password, tenantId || undefined);
      if (Array.isArray(result)) {
        setTenants(result);
        setTenantId('');
      } else {
        setPassword('');
        signIn(result);
      }
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Não foi possível entrar.');
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setPassword('');
    setTenants([]);
    setTenantId('');
    setError('');
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute bottom-20 right-20 w-80 h-80 rounded-full bg-white/10 blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Boxes className="w-6 h-6" />
            </div>
            <span className="text-lg font-semibold">Controle de estoque</span>
          </div>
          <div>
            <h1 className="text-4xl font-bold leading-tight mb-4">
              Não deixe seu estoque virar prejuízo.
            </h1>
            <p className="text-lg text-white/80 max-w-md">
              Uma camada inteligente que ajuda sua empresa a evitar perdas e agir antes que seus produtos vençam.
            </p>
          </div>
          <div className="flex items-center gap-6 text-sm text-white/60">
            <span>Controle de validades</span>
            <span>•</span>
            <span>Gestão de lotes</span>
            <span>•</span>
            <span>Promoções automáticas</span>
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-ink-50">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-11 h-11 rounded-xl bg-brand-600 flex items-center justify-center">
              <Boxes className="w-6 h-6 text-white" />
            </div>
            <span className="text-lg font-semibold text-ink-900">Controle de estoque</span>
          </div>

          <h2 className="text-2xl font-bold text-ink-900">
            {registering ? 'Criar conta' : tenants.length ? 'Selecione sua empresa' : 'Entrar'}
          </h2>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {tenants.length ? (
              <label className="block text-sm font-medium">
                Empresa
                <select className="input-field mt-1" value={tenantId} onChange={(event) => setTenantId(event.target.value)} required>
                  <option value="">Selecione uma empresa</option>
                  {tenants.map((tenant) => <option key={tenant.tenantId} value={tenant.tenantId}>{tenant.name}</option>)}
                </select>
              </label>
            ) : (
              <>
                {registering && (
                  <>
                    <label className="block text-sm font-medium">
                      Nome
                      <input className="input-field mt-1" autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} required />
                    </label>
                    <label className="block text-sm font-medium">
                      Nome da empresa
                      <input className="input-field mt-1" autoComplete="organization" value={companyName} onChange={(event) => setCompanyName(event.target.value)} required />
                    </label>
                  </>
                )}
                <label className="block text-sm font-medium">
                  E-mail
                  <input className="input-field mt-1" type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} required />
                </label>
                <label className="block text-sm font-medium">
                  Senha
                  <input className="input-field mt-1" type="password" autoComplete={registering ? 'new-password' : 'current-password'} minLength={registering ? 12 : undefined} value={password} onChange={(event) => setPassword(event.target.value)} required />
                  {registering && <span className="text-xs text-ink-500">Use pelo menos 12 caracteres.</span>}
                </label>
              </>
            )}

            {error && <p role="alert" className="text-sm text-error-700">{error}</p>}
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {registering ? 'Criar conta' : 'Entrar'}
            </button>
            <button type="button" className="btn-ghost w-full" disabled={loading} onClick={() => {
              if (!tenants.length) setRegistering(!registering);
              resetForm();
            }}>
              {tenants.length || registering ? 'Voltar para entrar' : 'Criar conta'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
