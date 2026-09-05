import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Tag, Undo2, ArrowLeftRight, ShoppingCart, Trash2, Pencil } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { ActionType, CriticalProduct, PromotionData } from '@/types';
import { formatCurrency } from '@/utils/format';
import { CurrencyInput } from '@/components/ui/CurrencyInput';
import { PromotionPreview } from '@/components/features/PromotionPreview';

interface RegisterActionModalProps {
  open: boolean;
  onClose: () => void;
  item: CriticalProduct | null;
  onConfirm: (type: ActionType, data?: { oldPrice?: number; newPrice?: number; promotionDate?: string }) => void;
}

const actionTypes: { type: ActionType; label: string; icon: typeof Tag }[] = [
  { type: 'promotion', label: 'Promoção', icon: Tag },
  { type: 'return', label: 'Devolução', icon: Undo2 },
  { type: 'transfer', label: 'Transferência', icon: ArrowLeftRight },
  { type: 'sale', label: 'Venda normal', icon: ShoppingCart },
  { type: 'discard', label: 'Descarte', icon: Trash2 },
  { type: 'other', label: 'Outro', icon: Pencil },
];

export function RegisterActionModal({ open, onClose, item, onConfirm }: RegisterActionModalProps) {
  const [selectedType, setSelectedType] = useState<ActionType | null>(null);
  const [oldPrice, setOldPrice] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [promotionDate, setPromotionDate] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  if (!item) return null;

  const currentPriceStr = item.lot.purchasePrice.toFixed(2).replace('.', ',');

  function handleOpenPromotion() {
    setOldPrice(currentPriceStr);
    setShowPreview(false);
  }

  function handleGeneratePromotion() {
    const oldVal = parseFloat(oldPrice.replace(',', '.')) || 0;
    const newVal = parseFloat(newPrice.replace(',', '.')) || 0;
    onConfirm('promotion', { oldPrice: oldVal, newPrice: newVal, promotionDate });
    setShowPreview(true);
  }

  function handleClose() {
    setSelectedType(null);
    setOldPrice('');
    setNewPrice('');
    setPromotionDate('');
    setShowPreview(false);
    onClose();
  }

  const promotionData: PromotionData | null = item && oldPrice && newPrice ? {
    productName: item.product.name,
    oldPrice: parseFloat(oldPrice.replace(',', '.')) || 0,
    newPrice: parseFloat(newPrice.replace(',', '.')) || 0,
    lotNumber: item.lot.lotNumber,
    quantity: item.lot.currentQuantity,
  } : null;

  return (
    <Modal open={open} onClose={handleClose} title="Registrar ação" size={selectedType === 'promotion' && showPreview ? 'lg' : 'md'}>
      {!selectedType && (
        <div>
          <p className="text-sm text-ink-600 mb-4">Qual ação foi tomada?</p>
          <div className="grid grid-cols-2 gap-3">
            {actionTypes.map(({ type, label, icon: Icon }) => (
              <button
                key={type}
                onClick={() => {
                  setSelectedType(type);
                  if (type === 'promotion') handleOpenPromotion();
                }}
                className="flex items-center gap-3 p-4 rounded-xl border border-ink-200 hover:border-brand-300 hover:bg-brand-50 transition-all text-left"
              >
                <Icon className="w-5 h-5 text-ink-500" />
                <span className="text-sm font-medium text-ink-700">{label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedType === 'promotion' && !showPreview && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1">Produto</label>
            <div className="px-3.5 py-2.5 rounded-lg bg-ink-50 border border-ink-200 text-sm text-ink-800">
              {item.product.name}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1">Quantidade</label>
            <div className="px-3.5 py-2.5 rounded-lg bg-ink-50 border border-ink-200 text-sm text-ink-800">
              {item.lot.currentQuantity} unidades
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1">Preço atual</label>
              <CurrencyInput value={oldPrice} onChange={setOldPrice} />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1">Novo preço</label>
              <CurrencyInput value={newPrice} onChange={setNewPrice} placeholder="0,00" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1">Data da promoção</label>
            <input
              type="date"
              value={promotionDate}
              onChange={(e) => setPromotionDate(e.target.value)}
              className="input-field"
            />
          </div>
          <div className="flex items-center justify-end gap-3 pt-2">
            <button onClick={() => setSelectedType(null)} className="btn-secondary">Voltar</button>
            <button
              onClick={handleGeneratePromotion}
              disabled={!oldPrice || !newPrice}
              className="btn-primary"
            >
              <Tag className="w-4 h-4" />
              Gerar promoção
            </button>
          </div>
        </div>
      )}

      {selectedType === 'promotion' && showPreview && promotionData && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-success-600">
            <Check className="w-5 h-5" />
            <span className="text-sm font-medium">Promoção gerada com sucesso!</span>
          </div>
          <PromotionPreview data={promotionData} />
          <div className="flex items-center justify-end gap-3 pt-2">
            <button onClick={handleClose} className="btn-primary">Concluir</button>
          </div>
        </div>
      )}

      {selectedType && selectedType !== 'promotion' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-ink-200 p-4 bg-ink-50">
            <p className="text-sm font-medium text-ink-800">{item.product.name}</p>
            <p className="text-xs text-ink-500 mt-1">
              Lote {item.lot.lotNumber} • {item.lot.currentQuantity} unidades • {formatCurrency(item.lot.currentQuantity * item.lot.purchasePrice)} em risco
            </p>
          </div>
          <p className="text-sm text-ink-600">
            {selectedType === 'return' && 'A devolução será registrada para este lote. O fornecedor deverá ser contatado para o processo de devolução.'}
            {selectedType === 'transfer' && 'A transferência será registrada. Selecione a loja de destino (em uma versão futura, múltiplas lojas estarão disponíveis).'}
            {selectedType === 'sale' && 'A venda será registrada como ação tomada para este lote próximo do vencimento.'}
            {selectedType === 'discard' && 'O descarte será registrado. Certifique-se de seguir as normas ambientais para o descarte de produtos vencidos.'}
            {selectedType === 'other' && 'Descreva a ação tomada para este lote.'}
          </p>
          {selectedType === 'other' && (
            <textarea
              placeholder="Descreva a ação tomada..."
              className="input-field min-h-[80px] resize-none"
            />
          )}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button onClick={() => setSelectedType(null)} className="btn-secondary">Voltar</button>
            <button onClick={() => { onConfirm(selectedType); handleClose(); }} className="btn-primary">
              Confirmar ação
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}

import { Check } from 'lucide-react';
