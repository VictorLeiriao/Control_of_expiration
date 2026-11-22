import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useCallback } from 'react';
import { PageHeader } from '@/components/layouts/PageHeader';
import { LoadingState } from '@/components/ui/LoadingState';
import { useManagementCapabilities } from '@/hooks/useManagementCapabilities';
import { useInventoryRequest, useInventoryScope } from '@/hooks/useInventory';
import { inventoryService, type InventoryProduct } from '@/services/inventory';
import type { Unit } from '@/types';

const units: Unit[] = ['unidade', 'kg', 'g', 'litro', 'ml', 'caixa', 'pacote'];

export function NewProductPage() {
  const { id } = useParams();
  const { token } = useInventoryScope();
  const capabilities = useManagementCapabilities(token);
  const { data, error } = useInventoryRequest(useCallback(async (signal) => (
    id ? inventoryService.product(token, id, signal) : null
  ), [token, id]));
  if (capabilities === undefined) return <LoadingState />;
  if (capabilities === null) return <p role="alert" className="p-6 text-error-700">Não foi possível verificar suas permissões.</p>;
  if (!capabilities.inventoryCatalogWrite) return <div className="p-6"><p role="alert" className="text-error-700">Você não tem permissão para alterar o catálogo.</p><Link className="btn-secondary mt-3" to="/products">Voltar</Link></div>;
  if (error) return <p role="alert" className="p-6 text-error-700">{error}</p>;
  if (data === undefined) return <LoadingState />;
  return <ProductForm key={id ?? 'new'} product={data} token={token} />;
}

function ProductForm({ product, token }: { product: InventoryProduct | null; token: string }) {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const value = (name: string) => String(data.get(name) ?? '').trim();
    if (!value('sku') || !value('name')) {
      setError('Informe o SKU e o nome do produto.');
      return;
    }
    setError('');
    setSaving(true);
    try {
      const saved = await inventoryService.saveProduct(token, {
        sku: value('sku'),
        name: value('name'),
        barcode: value('barcode') || null,
        category: value('category') || null,
        brand: value('brand') || null,
        unit: value('unit') as Unit,
        hasExpirationControl: data.has('hasExpirationControl'),
      }, product?.id);
      navigate(`/products/${saved.id}`);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Não foi possível salvar o produto.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      <PageHeader title={product ? 'Editar produto' : 'Novo produto'}
        description="O catálogo é compartilhado entre as lojas da empresa. As quantidades são registradas em movimentações." />
      <form className="card p-6 space-y-4" onSubmit={submit}>
        <fieldset disabled={saving} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="text-sm font-medium">Nome do produto<input className="input-field mt-1" name="name" defaultValue={product?.name} maxLength={200} required /></label>
          <label className="text-sm font-medium">SKU<input className="input-field mt-1" name="sku" defaultValue={product?.sku} maxLength={60} required /></label>
          <label className="text-sm font-medium">Código de barras<input className="input-field mt-1" name="barcode" defaultValue={product?.barcode ?? ''} maxLength={60} /></label>
          <label className="text-sm font-medium">Categoria<input className="input-field mt-1" name="category" defaultValue={product?.category ?? ''} maxLength={100} /></label>
          <label className="text-sm font-medium">Marca<input className="input-field mt-1" name="brand" defaultValue={product?.brand ?? ''} maxLength={100} /></label>
          <label className="text-sm font-medium">Unidade de medida
            <select className="input-field mt-1" name="unit" defaultValue={product?.unit ?? 'unidade'}>
              {units.map((unit) => <option key={unit} value={unit}>{unit}</option>)}
            </select>
          </label>
          <label className="flex gap-2 items-center text-sm">
            <input type="checkbox" name="hasExpirationControl" defaultChecked={product?.hasExpirationControl ?? true} />
            Controlar validade deste produto
          </label>
        </fieldset>
        {error && <p role="alert" className="text-sm text-error-700">{error}</p>}
        <div className="flex justify-end gap-2">
          <button type="button" disabled={saving} className="btn-secondary" onClick={() => navigate(product ? `/products/${product.id}` : '/products')}>Voltar</button>
          <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Salvando…' : 'Salvar produto'}</button>
        </div>
      </form>
    </div>
  );
}
