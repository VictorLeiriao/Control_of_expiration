import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader } from '@/components/layouts/PageHeader';
import { managementService, type Losses } from '@/services/management';
import { formatCurrency, formatDate, formatNumber } from '@/utils/format';

export function LiveReportsPage() {
  const { session } = useAuth();
  const token = session?.accessToken;
  const [days, setDays] = useState(30);
  const [offset, setOffset] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const [report, setReport] = useState<Losses | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    const controller = new AbortController();
    managementService.losses(token, days, offset, controller.signal).then(setReport).catch((failure: unknown) => {
      if (!controller.signal.aborted) setError(failure instanceof Error ? failure.message : 'Não foi possível carregar o relatório.');
    });
    return () => controller.abort();
  }, [token, offset, days, attempt]);

  function load(nextOffset: number, nextDays = days) {
    setError('');
    setReport(null);
    setDays(nextDays);
    setOffset(nextOffset);
    setAttempt((value) => value + 1);
  }

  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-6">
      <PageHeader title="Relatório de perdas" description="Consulte ajustes negativos de estoque por loja e produto." />
      <section className="card p-5">
        <label className="inline-block text-sm font-medium">Período
          <select className="input-field mt-1" value={days} onChange={(event) => load(0, Number(event.target.value))}>
            {[7, 30, 90, 365].map((period) => <option key={period} value={period}>Últimos {period} dias</option>)}
          </select>
        </label>
        {error && (
          <div className="mt-3">
            <p role="alert" className="text-sm text-error-700">{error}</p>
            <button className="btn-secondary mt-2" onClick={() => load(offset)}>Tentar novamente</button>
          </div>
        )}
        {!report && !error && <p className="mt-3 text-sm text-ink-500">Carregando perdas…</p>}
        {report && (
          <>
            <p className="mt-3 text-sm text-ink-500">{formatDate(report.lossFrom)} a {formatDate(report.lossThrough)}</p>
            {!report.items.length && <p className="mt-3 text-sm text-ink-500">Nenhuma perda nesta página.</p>}
            <div className="mt-3 space-y-3">
              {report.items.map((item) => (
                <article key={`${item.storeId}:${item.productId}`} className="grid grid-cols-2 gap-3 rounded-lg border border-ink-100 p-3 text-sm sm:grid-cols-4">
                  <div><p className="font-medium">{item.productName}</p><p className="text-ink-500">{item.storeName}</p></div>
                  <div><p className="text-ink-500">Quantidade perdida</p><p>{formatNumber(item.lostQuantity)}</p></div>
                  <div><p className="text-ink-500">Movimentações</p><p>{formatNumber(item.movementCount)}</p></div>
                  <div><p className="text-ink-500">Valor da perda</p><p>{item.lostValue == null ? 'Custo indisponível' : formatCurrency(item.lostValue)}</p></div>
                </article>
              ))}
            </div>
          </>
        )}
        <div className="mt-3 flex flex-wrap gap-2">
          {offset > 0 && <button className="btn-secondary" onClick={() => load(Math.max(0, offset - 25))}>Anterior</button>}
          {report?.items.length === 25 && <button className="btn-secondary" onClick={() => load(offset + 25)}>Próxima</button>}
        </div>
      </section>
    </div>
  );
}
