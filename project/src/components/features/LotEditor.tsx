import { useState, type FormEvent } from 'react';
import { Modal } from '@/components/ui/Modal';
import { useInventoryScope } from '@/hooks/useInventory';
import { inventoryService, type InventoryLot, type InventoryProduct } from '@/services/inventory';

interface LotEditorProps {
  product: InventoryProduct;
  lot?: InventoryLot;
  onClose: () => void;
  onSaved: () => void;
}

export function LotEditor({ product, lot, onClose, onSaved }: LotEditorProps) {
  const { token } = useInventoryScope();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    const lotNumber = String(fields.get('lotNumber') ?? '').trim();
    if (!lotNumber) {
      setError('Informe a identificação do lote.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await inventoryService.saveLot(token, product.id, {
        lotNumber,
        expirationDate: product.hasExpirationControl ? String(fields.get('expirationDate')) : null,
      }, lot?.id);
      onSaved();
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Não foi possível salvar o lote.');
      setSaving(false);
    }
  }

  return (
    <Modal open onClose={() => !saving && onClose()} title={lot ? 'Editar lote' : 'Adicionar lote'}>
      <form onSubmit={submit} className="space-y-4">
        <fieldset disabled={saving} className="space-y-4">
          <label className="block text-sm font-medium">
            Identificação do lote
            <input className="input-field mt-1" name="lotNumber" defaultValue={lot?.lotNumber} maxLength={60} required />
          </label>
          {product.hasExpirationControl && (
            <label className="block text-sm font-medium">
              Validade
              <input className="input-field mt-1" name="expirationDate" type="date" defaultValue={lot?.expirationDate ?? ''} required />
            </label>
          )}
        </fieldset>
        {!lot && <p className="text-sm text-ink-600">Após salvar o lote, registre a entrada para adicionar saldo.</p>}
        {error && <p role="alert" className="text-sm text-error-700">{error}</p>}
        <div className="flex flex-wrap justify-end gap-2">
          <button type="button" className="btn-secondary" disabled={saving} onClick={onClose}>Cancelar</button>
          <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Salvando…' : 'Salvar lote'}</button>
        </div>
      </form>
    </Modal>
  );
}
