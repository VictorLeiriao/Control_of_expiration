import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useStore } from '@/contexts/StoreContext';
import { useManagementCapabilities } from '@/hooks/useManagementCapabilities';
import { PageHeader } from '@/components/layouts/PageHeader';
import { ApiError } from '@/services/api';
import { managementService, type TenantSettings } from '@/services/management';
import { Employees } from './Employees';

export function LiveSettingsPage() {
  const { session, user } = useAuth();
  const capabilities = useManagementCapabilities(session?.accessToken);
  if (!session || !user) return null;
  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-6">
      <PageHeader title="Configurações" description="Gerencie a empresa, os canais de alerta e os funcionários." />
      <div className="space-y-6">
        <Stores canCreate={Boolean(capabilities?.inventoryCatalogWrite)} />
        {capabilities === undefined && <p className="text-sm text-ink-500">Carregando permissões...</p>}
        {capabilities === null && <p role="alert" className="text-sm text-error-700">Não foi possível consultar as permissões da empresa.</p>}
        {capabilities?.tenantSettingsManage && <CompanySettings token={session.accessToken} />}
        {capabilities?.membersRead && (
          <Employees token={session.accessToken} canInvite={capabilities.membersInvite} canManage={capabilities.membersManage} />
        )}
      </div>
    </div>
  );
}

function Stores({ canCreate }: { canCreate: boolean }) {
  const { addStore, store, stores } = useStore();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setBusy(true);
    setMessage('');
    setError('');
    try {
      const created = await addStore(String(data.get('code')).trim(), String(data.get('name')).trim());
      form.reset();
      setMessage(`Loja ${created.name} cadastrada.`);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Não foi possível cadastrar a loja.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="card p-5">
      <h2 className="font-semibold">Lojas</h2>
      <ul className="mt-3 divide-y divide-ink-100">
        {stores.map((option) => (
          <li className="flex flex-wrap items-center gap-2 py-2 text-sm" key={option.id}>
            <span className="font-medium">{option.name}</span><span className="text-ink-500">{option.code}</span>
            {option.id === store.id && <span className="badge bg-brand-50 text-brand-700">Loja ativa</span>}
          </li>
        ))}
      </ul>
      {canCreate && (
        <form className="mt-3" onSubmit={save}>
          <fieldset disabled={busy} className="flex flex-wrap items-end gap-2">
            <label className="text-sm font-medium">Código<input name="code" className="input-field mt-1" maxLength={60} required /></label>
            <label className="flex-1 text-sm font-medium">Nome da loja<input name="name" className="input-field mt-1" maxLength={200} required /></label>
            <button className="btn-primary">{busy ? 'Salvando?' : 'Cadastrar loja'}</button>
          </fieldset>
          {error && <p role="alert" className="mt-2 text-sm text-error-700">{error}</p>}
          {message && <p role="status" className="mt-2 text-sm text-success-700">{message}</p>}
        </form>
      )}
    </section>
  );
}

function CompanySettings({ token }: { token: string }) {
  const [settings, setSettings] = useState<TenantSettings | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [saving, setSaving] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    managementService.settings(token, controller.signal).then(setSettings).catch((failure: unknown) => {
      if (controller.signal.aborted) return;
      setError(failure instanceof ApiError && failure.status === 403
        ? 'Seu perfil não pode editar os dados e alertas da empresa.'
        : failure instanceof Error ? failure.message : 'Não foi possível carregar as configurações.');
    });
    return () => controller.abort();
  }, [token, attempt]);

  function update<V extends keyof TenantSettings>(key: V, value: TenantSettings[V]) {
    setSettings((current) => current ? { ...current, [key]: value } : current);
    setNotice('');
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!settings) return;
    setSaving(true);
    setError('');
    setNotice('');
    try {
      setSettings(await managementService.saveSettings(token, settings));
      setNotice('Configurações salvas.');
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Não foi possível salvar.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="card p-5">
      <h2 className="font-semibold">Empresa e alertas</h2>
      {error && <p role="alert" className="mt-2 text-sm text-error-700">{error}</p>}
      {notice && <p role="status" className="mt-2 text-sm text-success-700">{notice}</p>}
      {!settings && !error && <p className="mt-2 text-sm text-ink-500">Carregando configurações…</p>}
      {!settings && error && <button className="btn-secondary mt-2" onClick={() => { setError(''); setAttempt((value) => value + 1); }}>Tentar novamente</button>}
      {settings && (
        <form className="mt-4" onSubmit={save}>
          <fieldset disabled={saving} className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm font-medium">Nome da empresa
                <input className="input-field mt-1" value={settings.companyName} onChange={(event) => update('companyName', event.target.value)} maxLength={200} required />
              </label>
              <label className="text-sm font-medium">Documento
                <input className="input-field mt-1" value={settings.document ?? ''} onChange={(event) => update('document', event.target.value)} maxLength={40} />
              </label>
              <label className="text-sm font-medium">Segmento
                <input className="input-field mt-1" value={settings.segment ?? ''} onChange={(event) => update('segment', event.target.value)} maxLength={120} />
              </label>
              <label className="text-sm font-medium">URL HTTPS do logo
                <input className="input-field mt-1" type="url" value={settings.logoUrl ?? ''} onChange={(event) => update('logoUrl', event.target.value)} maxLength={2048} />
              </label>
            </div>
            <div className="grid gap-3 border-t border-ink-100 pt-4 sm:grid-cols-2">
              <label className="text-sm font-medium">E-mail de destino
                <input className="input-field mt-1" type="email" value={settings.email ?? ''} onChange={(event) => update('email', event.target.value)} maxLength={320} required={settings.emailEnabled} />
              </label>
              <label className="text-sm font-medium">ID do chat Telegram
                <input className="input-field mt-1" value={settings.telegramChatId ?? ''} onChange={(event) => update('telegramChatId', event.target.value)} pattern="-?[0-9]+" maxLength={32} required={settings.telegramEnabled} />
              </label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={settings.emailEnabled} onChange={(event) => update('emailEnabled', event.target.checked)} /> Ativar e-mail</label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={settings.telegramEnabled} onChange={(event) => update('telegramEnabled', event.target.checked)} /> Ativar Telegram</label>
              <label className="text-sm font-medium">Antecedência do alerta em dias
                <input className="input-field mt-1" type="number" min={0} max={365} value={settings.expirationDays} onChange={(event) => update('expirationDays', Number(event.target.value))} required />
              </label>
              <label className="text-sm font-medium">Hora de envio em Brasília (0 a 23)
                <input className="input-field mt-1" type="number" min={0} max={23} value={settings.alertHour} onChange={(event) => update('alertHour', Number(event.target.value))} required />
              </label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={settings.automaticAlerts} onChange={(event) => update('automaticAlerts', event.target.checked)} /> Programar envio diário</label>
            </div>
            <div className="flex flex-wrap gap-2">
              <button className="btn-primary">{saving ? 'Salvando…' : 'Salvar configurações'}</button>
              <Link className="btn-secondary" to="/notifications">Ver notificações</Link>
            </div>
          </fieldset>
        </form>
      )}
    </section>
  );
}
