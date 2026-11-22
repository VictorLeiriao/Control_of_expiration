import { useState, type FormEvent } from 'react';
import { Modal } from '@/components/ui/Modal';
import type { Product, ProductLot } from '@/types';
import { lotService } from '@/services';
import { dateKey } from '@/utils/format';

interface LotEditorProps {
  product: Product;
  lot?: ProductLot;
  onClose: () => void;
  onSaved: (lot: ProductLot) => void;
}

export function LotEditor({ product, lot, onClose, onSaved }: LotEditorProps) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    const data = {
      lotNumber: String(fields.get('lotNumber') ?? ''),
      initialQuantity: Number(fields.get('initialQuantity')),
      currentQuantity: Number(fields.get('currentQuantity')),
      entryDate: String(fields.get('entryDate') ?? ''),
      expirationDate: String(fields.get('expirationDate') ?? '') || undefined,
      purchasePrice: Number(fields.get('purchasePrice')),
    };

    setSaving(true);
    setError('');
    try {
      const saved = lot
        ? await lotService.updateLot(lot.id, data)
        : await lotService.createLot({ ...data, productId: product.id });
      onSaved(saved);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Não foi possível salvar o lote.');
      setSaving(false);
    }
  }

  return (
    <Modal open onClose={() => !saving && onClose()} title={lot ? 'Editar lote' : 'Adicionar lote'}>
      <form onSubmit={submit} className="space-y-4">
        <fieldset disabled={saving} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="sm:col-span-2 text-sm font-medium">
            Identificação do lote
            <input className="input-field mt-1" name="lotNumber" defaultValue={lot?.lotNumber} required />
          </label>
          <label className="text-sm font-medium">
            Quantidade inicial
            <input className="input-field mt-1" name="initialQuantity" type="number" min="0" step="any" defaultValue={lot?.initialQuantity} required />
          </label>
          <label className="text-sm font-medium">
            Quantidade atual
            <input className="input-field mt-1" name="currentQuantity" type="number" min="0" step="any" defaultValue={lot?.currentQuantity} required />
          </label>
          <label className="text-sm font-medium min-w-0">
            Data de entrada
            <input className="input-field mt-1 min-w-0" name="entryDate" type="date" defaultValue={dateKey(lot?.entryDate ?? new Date())} required />
          </label>
          {product.hasExpirationControl !== false && (
            <label className="text-sm font-medium min-w-0">
              Validade {product.hasExpirationControl !== true && '(opcional)'}
              <input className="input-field mt-1 min-w-0" name="expirationDate" type="date" defaultValue={dateKey(lot?.expirationDate)} required={product.hasExpirationControl === true} />
            </label>
          )}
          <label className="text-sm font-medium">
            Preço de compra unitário (R$)
            <input className="input-field mt-1" name="purchasePrice" type="number" min="0" step="0.01" defaultValue={lot?.purchasePrice} required />
          </label>
        </fieldset>
        {error && <p role="alert" className="text-sm text-error-700">{error}</p>}
        <div className="flex flex-wrap justify-end gap-2">
          <button type="button" className="btn-secondary" disabled={saving} onClick={onClose}>Cancelar</button>
          <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Salvando...' : 'Salvar lote'}</button>
        </div>
      </form>
    </Modal>
  );
}
