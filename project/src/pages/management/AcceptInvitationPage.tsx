import { type FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { managementService } from '@/services/management';

export function AcceptInvitationPage() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    setBusy(true);
    setError('');
    try {
      await managementService.accept(String(fields.get('code')).trim().toUpperCase(),
        String(fields.get('password')), String(fields.get('name')).trim());
      navigate('/', { replace: true });
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Não foi possível aceitar o convite.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen grid place-items-center bg-ink-50 p-4">
      <section className="card w-full max-w-md p-6">
        <h1 className="text-xl font-bold">Aceitar convite</h1>
        <form className="mt-5 space-y-4" onSubmit={submit}>
          <label className="block text-sm font-medium">Código do convite
            <input className="input-field mt-1" name="code" maxLength={64} minLength={64} pattern="[0-9A-Fa-f]{64}" required />
          </label>
          <label className="block text-sm font-medium">Nome (para contas novas)
            <input className="input-field mt-1" name="name" autoComplete="name" maxLength={200} />
          </label>
          <label className="block text-sm font-medium">Senha
            <input className="input-field mt-1" name="password" type="password" autoComplete="current-password" required />
            <span className="text-xs text-ink-500">Use sua senha atual ou crie uma com pelo menos 12 caracteres se ainda não tiver conta.</span>
          </label>
          {error && <p role="alert" className="text-sm text-error-700">{error}</p>}
          <div className="flex flex-wrap gap-2">
            <button className="btn-primary" disabled={busy}>Aceitar convite</button>
            <Link className="btn-secondary" to="/">Voltar</Link>
          </div>
        </form>
      </section>
    </main>
  );
}
