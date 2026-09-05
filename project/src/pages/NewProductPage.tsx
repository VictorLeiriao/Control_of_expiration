import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { productService, lotService, aiProductService } from '@/services';
import type { Unit } from '@/types';
import { PageHeader } from '@/components/layouts/PageHeader';
import { CurrencyInput } from '@/components/ui/CurrencyInput';
import { Camera, Image as ImageIcon, Loader2, Check, Sparkles, ArrowLeft, Plus, Trash2 } from 'lucide-react';

interface LotFormItem {
  lotNumber: string;
  quantity: string;
  expirationDate: string;
  purchasePrice: string;
}

export function NewProductPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiDetected, setAiDetected] = useState(false);

  const [name, setName] = useState('');
  const [barcode, setBarcode] = useState('');
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [unit, setUnit] = useState<Unit>('unidade');
  const [lots, setLots] = useState<LotFormItem[]>([
    { lotNumber: '', quantity: '', expirationDate: '', purchasePrice: '' },
  ]);

  function addLot() {
    setLots([...lots, { lotNumber: '', quantity: '', expirationDate: '', purchasePrice: '' }]);
  }

  function removeLot(index: number) {
    setLots(lots.filter((_, i) => i !== index));
  }

  function updateLot(index: number, field: keyof LotFormItem, value: string) {
    setLots(lots.map((l, i) => (i === index ? { ...l, [field]: value } : l)));
  }

  async function handleAiAnalyze() {
    setAnalyzing(true);
    const result = await aiProductService.analyzeImage();
    if (result) {
      setName(result.name);
      setBrand(result.brand);
      setBarcode(result.barcode);
      setLots([{ lotNumber: result.lotNumber, quantity: '', expirationDate: result.expirationDate, purchasePrice: '' }]);
      setAiDetected(true);
    }
    setAnalyzing(false);
  }

  async function handleSave() {
    setSaving(true);
    const product = await productService.createProduct({
      name,
      barcode,
      category,
      brand,
      unit,
    });

    for (const lot of lots) {
      if (lot.lotNumber && lot.quantity) {
        await lotService.createLot({
          productId: product.id,
          lotNumber: lot.lotNumber,
          initialQuantity: parseInt(lot.quantity),
          currentQuantity: parseInt(lot.quantity),
          entryDate: new Date().toISOString(),
          expirationDate: lot.expirationDate || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
          purchasePrice: parseFloat(lot.purchasePrice.replace(',', '.')) || 0,
        });
      }
    }

    setSaving(false);
    setSuccess(true);
    setTimeout(() => navigate('/products'), 1500);
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-16 h-16 rounded-2xl bg-success-50 flex items-center justify-center mb-4">
          <Check className="w-8 h-8 text-success-600" />
        </div>
        <h2 className="text-lg font-semibold text-ink-900">Produto cadastrado com sucesso!</h2>
        <p className="text-sm text-ink-500 mt-1">Redirecionando para a lista de produtos...</p>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      <PageHeader title="Novo produto" description="Cadastre um produto e seus lotes">
        <button onClick={() => navigate('/products')} className="btn-secondary">
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </button>
      </PageHeader>

      {/* Cadastro inteligente */}
      <div className="card p-5 mb-6 bg-gradient-to-br from-brand-50 to-accent-50 border-brand-200">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-brand-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-ink-800">Cadastro inteligente</h3>
            <p className="text-xs text-ink-500 mt-0.5 mb-3">
              Cadastre seu produto mais rapidamente usando uma imagem. No futuro, poderemos identificar automaticamente o produto, lote e validade usando inteligência artificial.
            </p>
            <div className="flex items-center gap-3">
              <button onClick={handleAiAnalyze} disabled={analyzing} className="btn-secondary text-sm">
                {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                {analyzing ? 'Analisando...' : 'Usar câmera'}
              </button>
              <button onClick={handleAiAnalyze} disabled={analyzing} className="btn-secondary text-sm">
                <ImageIcon className="w-4 h-4" />
                Importar imagem
              </button>
            </div>
            {aiDetected && (
              <div className="mt-3 flex items-center gap-2 text-xs text-success-600">
                <Check className="w-4 h-4" />
                Produto identificado! Confirme os dados abaixo.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-6">
        <div className={`flex items-center gap-2 ${step >= 1 ? 'text-brand-600' : 'text-ink-400'}`}>
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${step >= 1 ? 'bg-brand-600 text-white' : 'bg-ink-200 text-ink-500'}`}>1</div>
          <span className="text-sm font-medium">Informações</span>
        </div>
        <div className="flex-1 h-px bg-ink-200" />
        <div className={`flex items-center gap-2 ${step >= 2 ? 'text-brand-600' : 'text-ink-400'}`}>
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${step >= 2 ? 'bg-brand-600 text-white' : 'bg-ink-200 text-ink-500'}`}>2</div>
          <span className="text-sm font-medium">Estoque inicial</span>
        </div>
      </div>

      {step === 1 && (
        <div className="card p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">Nome do produto *</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Ração Golden 15kg" className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">Código de barras</label>
            <input type="text" value={barcode} onChange={(e) => setBarcode(e.target.value)} placeholder="Ex: 789000000001" className="input-field" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">Categoria</label>
              <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Ex: Ração" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">Marca</label>
              <input type="text" value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Ex: Golden" className="input-field" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">Unidade de medida</label>
            <select value={unit} onChange={(e) => setUnit(e.target.value as Unit)} className="input-field">
              <option value="unidade">Unidade</option>
              <option value="kg">Quilograma (kg)</option>
              <option value="g">Grama (g)</option>
              <option value="litro">Litro</option>
              <option value="ml">Mililitro (ml)</option>
              <option value="caixa">Caixa</option>
              <option value="pacote">Pacote</option>
            </select>
          </div>
          <div className="flex items-center justify-end pt-2">
            <button onClick={() => setStep(2)} disabled={!name} className="btn-primary">
              Próximo
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-ink-800">Estoque inicial — Lotes</h3>
            <button onClick={addLot} className="btn-ghost text-sm">
              <Plus className="w-4 h-4" />
              Adicionar lote
            </button>
          </div>

          {lots.map((lot, index) => (
            <div key={index} className="rounded-xl border border-ink-200 p-4 space-y-3 bg-ink-50/50">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-ink-500">Lote {index + 1}</span>
                {lots.length > 1 && (
                  <button onClick={() => removeLot(index)} className="p-1 rounded-lg text-ink-400 hover:text-error-600 hover:bg-error-50">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-ink-600 mb-1">Número do lote</label>
                  <input type="text" value={lot.lotNumber} onChange={(e) => updateLot(index, 'lotNumber', e.target.value)} placeholder="Ex: ABC123" className="input-field" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-ink-600 mb-1">Quantidade</label>
                  <input type="number" value={lot.quantity} onChange={(e) => updateLot(index, 'quantity', e.target.value)} placeholder="Ex: 20" className="input-field" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-ink-600 mb-1">Validade</label>
                  <input type="date" value={lot.expirationDate} onChange={(e) => updateLot(index, 'expirationDate', e.target.value)} className="input-field" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-ink-600 mb-1">Preço de compra</label>
                  <CurrencyInput value={lot.purchasePrice} onChange={(v) => updateLot(index, 'purchasePrice', v)} placeholder="0,00" />
                </div>
              </div>
            </div>
          ))}

          <div className="flex items-center justify-between pt-2">
            <button onClick={() => setStep(1)} className="btn-secondary">
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </button>
            <button onClick={handleSave} disabled={saving || !name} className="btn-primary">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              {saving ? 'Salvando...' : 'Salvar produto'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
