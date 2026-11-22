import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useManagementCapabilities } from '@/hooks/useManagementCapabilities';
import { PageHeader } from '@/components/layouts/PageHeader';
import { managementService, type AlertChannel, type DispatchStatus, type InventoryNotice } from '@/services/management';
import { formatDateTime } from '@/utils/format';

const labels: Record<DispatchStatus, string> = {
  Pending: 'Aguardando resultado',
  Unavailable: 'Canal indisponível',
  NoMatchingStock: 'Sem lotes no período',
  Sent: 'Enviado',
  DeliveryFailed: 'Falha no envio',
};
const channels: Record<AlertChannel, string> = { email: 'E-mail', telegram: 'Telegram' };

export function LiveNotificationsPage() {
  const { session } = useAuth();
  const token = session?.accessToken;
  const capabilities = useManagementCapabilities(token);
  const [notices, setNotices] = useState<InventoryNotice[] | null>(null);
  const [offset, setOffset] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const [channel, setChannel] = useState<AlertChannel>('email');
  const [days, setDays] = useState(7);
  const [busy, setBusy] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [actionError, setActionError] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (!token) return;
    const controller = new AbortController();
    managementService.notifications(token, offset, controller.signal).then(setNotices).catch((failure: unknown) => {
      if (!controller.signal.aborted) setLoadError(failure instanceof Error ? failure.message : 'Não foi possível carregar as notificações.');
    });
    return () => controller.abort();
  }, [token, offset, attempt]);

  function refresh(nextOffset: number) {
    setNotices(null);
    setLoadError('');
    setOffset(nextOffset);
    setAttempt((value) => value + 1);
  }

  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;
    setBusy(true);
    setActionError('');
    setStatus('');
    try {
      const result = await managementService.sendAlert(token, channel, days);
      setStatus(result?.sent ? 'Alerta enviado.' : 'Nenhum lote encontrado no período.');
    } catch (failure) {
      setActionError(failure instanceof Error ? failure.message : 'Não foi possível enviar o alerta.');
    } finally {
      refresh(0);
      setBusy(false);
    }
  }

  async function markAsRead(id: string) {
    if (!token) return;
    setActionError('');
    setBusy(true);
    try {
      await managementService.readNotice(token, id);
      setNotices((current) => current?.map((item) => item.id === id ? { ...item, isRead: true } : item) ?? null);
    } catch (failure) {
      setActionError(failure instanceof Error ? failure.message : 'Não foi possível marcar a notificação como lida.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-6">
      <PageHeader title="Notificações" description="Acompanhe as tentativas de envio de alertas da empresa." />
      <div className="grid gap-5">
        {capabilities?.alertsDispatch && <section className="card p-5">
          <h2 className="font-semibold">Enviar alerta de validade</h2>
          <form className="mt-3 flex flex-wrap items-end gap-3" onSubmit={send}>
            <label className="text-sm font-medium">Canal
              <select className="input-field mt-1" value={channel} onChange={(event) => setChannel(event.target.value as AlertChannel)}>
                <option value="email">E-mail</option><option value="telegram">Telegram</option>
              </select>
            </label>
            <label className="text-sm font-medium">Dias de antecedência
              <input className="input-field mt-1" type="number" value={days} onChange={(event) => setDays(Number(event.target.value))} min={0} max={365} required />
            </label>
            <button className="btn-primary" disabled={busy}>{busy ? 'Processando…' : 'Enviar alerta'}</button>
            <Link className="btn-secondary" to="/settings">Configurar canais</Link>
          </form>
          {status && <p role="status" className="mt-3 text-sm text-success-700">{status}</p>}
        </section>}
        {actionError && <p role="alert" className="text-sm text-error-700">{actionError}</p>}
        <section className="card p-5">
          <h2 className="font-semibold">Histórico de alertas</h2>
          {loadError && (
            <div className="mt-3">
              <p role="alert" className="text-sm text-error-700">{loadError}</p>
              <button className="btn-secondary mt-2" onClick={() => refresh(offset)}>Tentar novamente</button>
            </div>
          )}
          {!notices && !loadError && <p className="mt-3 text-sm text-ink-500">Carregando alertas…</p>}
          {notices && (
            <>
              {!notices.length && <p className="mt-3 text-sm text-ink-500">Nenhum alerta nesta página.</p>}
              <ul className="divide-y divide-ink-100">
                {notices.map((notice) => (
                  <li className="flex flex-wrap items-center justify-between gap-2 py-3" key={notice.id}>
                    <div>
                      <p className="text-sm font-medium">{channels[notice.channel]} · {labels[notice.status]}</p>
                      <p className="text-xs text-ink-500">{formatDateTime(notice.createdAt)} · {notice.scheduledDate ? 'Automático' : 'Manual'}</p>
                    </div>
                    {!notice.isRead && (<button className="btn-ghost text-sm" disabled={busy} onClick={() => markAsRead(notice.id)}>Marcar como lida</button>)}
                  </li>
                ))}
              </ul>
            </>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            {offset > 0 && <button className="btn-secondary" disabled={busy} onClick={() => refresh(Math.max(0, offset - 25))}>Anterior</button>}
            {notices?.length === 25 && <button className="btn-secondary" disabled={busy} onClick={() => refresh(offset + 25)}>Próxima</button>}
          </div>
        </section>
      </div>
    </div>
  );
}
