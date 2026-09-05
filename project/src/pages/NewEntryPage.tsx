import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { productService, entryService } from '@/services';
import type { Product } from '@/types';
import { PageHeader } from '@/components/layouts/PageHeader';
import { CurrencyInput } from '@/components/ui/CurrencyInput';
import { ArrowLeft, Check, Loader2, Plus } from 'lucide-react';

export function NewEntryPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [lotNumber, setLotNumber] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [loaded, setLoaded] = useState(false);

  useState(() => {
    productService.getProducts().then((p) => {
      setProducts(p);
      setLoaded(true);
    });
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!productId || !quantity || !lotNumber) return;
    setLoading(true);
    await entryService.createEntry({
      productId,
      lotId: `l${Date.now()}`,
      quantity: parseInt(quantity),
      lotNumber,
      expirationDate: expirationDate || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      entryDate: new Date().toISOString(),
      purchasePrice: parseFloat(purchasePrice.replace(',', '.')) || 0,
    });
    setLoading(false);
    setSuccess(true);
    setTimeout(() => navigate('/entries'), 1500);
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-16 h-16 rounded-2xl bg-success-50 flex items-center justify-center mb-4">
          <Check className="w-8 h-8 text-success-600" />
        </div>
        <h2 className="text-lg font-semibold text-ink-900">Entrada registrada com sucesso!</h2>
        <p className="text-sm text-ink-500 mt-1">Redirecionando para a lista de entradas...</p>
      </div>
    );
  }

  if (!loaded) return <div className="p-8 text-center text-sm text-ink-500">Carregando...</div>;

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto">
      <PageHeader title="Nova entrada" description="Registre uma entrada de estoque">
        <button onClick={() => navigate('/entries')} className="btn-secondary">
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </button>
      </PageHeader>

      <form onSubmit={handleSubmit} className="card p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-ink-700 mb-1.5">Produto *</label>
          <select value={productId} onChange={(e) => setProductId(e.target.value)} className="input-field">
            <option value="">Selecione um produto</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-ink-700 mb-1.5">Quantidade *</label>
          <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="Ex: 20" className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink-700 mb-1.5">Lote *</label>
          <input type="text" value={lotNumber} onChange={(e) => setLotNumber(e.target.value)} placeholder="Ex: ABC123" className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink-700 mb-1.5">Validade</label>
          <input type="date" value={expirationDate} onChange={(e) => setExpirationDate(e.target.value)} className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink-700 mb-1.5">Preço de compra</label>
          <CurrencyInput value={purchasePrice} onChange={setPurchasePrice} placeholder="0,00" />
        </div>
        <div className="flex items-center justify-end gap-3 pt-2">
          <button type="button" onClick={() => navigate('/entries')} className="btn-secondary">Cancelar</button>
          <button type="submit" disabled={loading || !productId || !quantity || !lotNumber} className="btn-primary">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            {loading ? 'Confirmando...' : 'Confirmar entrada'}
          </button>
        </div>
      </form>
    </div>
  );
}
