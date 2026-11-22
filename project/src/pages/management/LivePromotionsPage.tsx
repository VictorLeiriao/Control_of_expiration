import { useEffect, useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useManagementCapabilities } from '@/hooks/useManagementCapabilities';
import { PageHeader } from '@/components/layouts/PageHeader';
import { managementService, type CatalogLot, type CatalogProduct, type Promotion } from '@/services/management';
import { formatDateTime, formatNumber } from '@/utils/format';

function loadError(failure: unknown) {
  return failure instanceof Error ? failure.message : 'Não foi possível carregar as promoções.';
}

export function LivePromotionsPage() {
  const { session } = useAuth();
  const [query, setQuery] = useSearchParams();
  const token = session?.accessToken;
  const capabilities = useManagementCapabilities(token);
  const productId = query.get('product') ?? '';
  const lotId = query.get('lot') ?? '';
  const [products, setProducts] = useState<CatalogProduct[] | null>(null);
  const [lots, setLots] = useState<CatalogLot[] | null>(null);
  const [promotions, setPromotions] = useState<Promotion[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [productError, setProductError] = useState('');
  const [lotError, setLotError] = useState('');
  const [promotionError, setPromotionError] = useState('');
  const [actionError, setActionError] = useState('');
  const [notice, setNotice] = useState('');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!token) return;
    const controller = new AbortController();
    managementService.products(token, controller.signal).then(setProducts).catch((failure: unknown) => {
      if (!controller.signal.aborted) setProductError(loadError(failure));
    });
    return () => controller.abort();
  }, [token, attempt]);

  useEffect(() => {
    if (!token || !productId) return;
    const controller = new AbortController();
    managementService.lots(token, productId, controller.signal).then(setLots).catch((failure: unknown) => {
      if (!controller.signal.aborted) setLotError(loadError(failure));
    });
    return () => controller.abort();
  }, [token, productId, attempt]);

  useEffect(() => {
    if (!token || !productId || !lotId) return;
    const controller = new AbortController();
    managementService.promotions(token, productId, lotId, controller.signal).then(setPromotions).catch((failure: unknown) => {
      if (!controller.signal.aborted) setPromotionError(loadError(failure));
    });
    return () => controller.abort();
  }, [token, productId, lotId, attempt]);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;
    const form = event.currentTarget;
    const fields = new FormData(form);
    setBusy(true);
    setActionError('');
    setNotice('');
    try {
      const startsAt = new Date(String(fields.get('startsAt')));
      const endsAt = new Date(String(fields.get('endsAt')));
      if (endsAt <= startsAt || endsAt <= new Date()) throw new Error('O término deve ocorrer depois do início e estar no futuro.');
      const created = await managementService.createPromotion(token, productId, lotId, {
        name: String(fields.get('name')).trim(), discountPercent: Number(fields.get('discount')),
        startsAt: startsAt.toISOString(), endsAt: endsAt.toISOString(),
      });
      setPromotions((current) => [created, ...(current ?? [])]);
      form.reset();
      setNotice('Promoção cadastrada.');
    } catch (failure) {
      setActionError(loadError(failure));
    } finally {
      setBusy(false);
    }
  }

  const error = productError || lotError || promotionError;
  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-6">
      <PageHeader title="Promoções" description="Consulte e cadastre promoções por lote." />
      <section className="card p-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm font-medium">Produto
            <select className="input-field mt-1" value={productId} disabled={busy || !products} onChange={(event) => {
              setLots(null); setPromotions(null); setLotError(''); setPromotionError(''); setActionError(''); setNotice('');
              setQuery(event.target.value ? { product: event.target.value } : {});
            }}>
              <option value="">{products ? 'Selecione o produto' : 'Carregando produtos…'}</option>
              {products?.map((product) => <option key={product.id} value={product.id}>{product.name} ({product.sku})</option>)}
            </select>
          </label>
          <label className="text-sm font-medium">Lote
            <select className="input-field mt-1" value={lotId} disabled={busy || !productId || !lots} onChange={(event) => {
              setPromotions(null); setPromotionError(''); setActionError(''); setNotice('');
              setQuery(event.target.value ? { product: productId, lot: event.target.value } : { product: productId });
            }}>
              <option value="">{productId && !lots ? 'Carregando lotes…' : 'Selecione o lote'}</option>
              {lots?.map((lot) => <option key={lot.id} value={lot.id}>{lot.lotNumber}</option>)}
            </select>
          </label>
        </div>
        {error && (
          <div className="mt-3">
            <p role="alert" className="text-sm text-error-700">{error}</p>
            <button className="btn-secondary mt-2" onClick={() => {
              setProductError(''); setLotError(''); setPromotionError(''); setAttempt((value) => value + 1);
            }}>Tentar novamente</button>
          </div>
        )}
        {productId && lotId && !promotions && !error && <p className="mt-3 text-sm text-ink-500">Carregando promoções…</p>}
        {productId && lotId && promotions && (
          <>
            {capabilities?.promotionsWrite && <form key={lotId} className="mt-5" onSubmit={save}>
              <h2 className="font-semibold">Nova promoção</h2>
              <fieldset disabled={busy} className="mt-3 grid gap-3 sm:grid-cols-2">
                <label className="text-sm font-medium">Nome<input className="input-field mt-1" name="name" maxLength={120} required /></label>
                <label className="text-sm font-medium">Desconto (%)<input className="input-field mt-1" name="discount" type="number" min="0.01" max="100" step="0.01" required /></label>
                <label className="min-w-0 text-sm font-medium">Início<input className="input-field mt-1" name="startsAt" type="datetime-local" required /></label>
                <label className="min-w-0 text-sm font-medium">Término<input className="input-field mt-1" name="endsAt" type="datetime-local" required /></label>
                <button className="btn-primary sm:w-fit">{busy ? 'Salvando…' : 'Cadastrar promoção'}</button>
              </fieldset>
              {actionError && <p role="alert" className="mt-2 text-sm text-error-700">{actionError}</p>}
              {notice && <p role="status" className="mt-2 text-sm text-success-700">{notice}</p>}
            </form>}
            <h2 className="mt-5 border-t border-ink-100 pt-4 font-semibold">Promoções deste lote</h2>
            {!promotions.length && <p className="mt-3 text-sm text-ink-500">Nenhuma promoção cadastrada.</p>}
            <ul className="divide-y divide-ink-100">
              {promotions.map((promotion) => (
                <li className="py-3 text-sm" key={promotion.id}>
                  <p className="font-medium">{promotion.name} · {formatNumber(promotion.discountPercent)}%</p>
                  <p className="text-ink-500">{formatDateTime(promotion.startsAt)} a {formatDateTime(promotion.endsAt)}</p>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
    </div>
  );
}
