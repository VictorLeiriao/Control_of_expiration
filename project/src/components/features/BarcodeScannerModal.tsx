import { useState, type FormEvent } from 'react';
import { Modal } from '@/components/ui/Modal';
import type { InventoryProduct } from '@/services/inventory';

interface BarcodeScannerModalProps {
  open: boolean;
  products: InventoryProduct[];
  onClose: () => void;
  onProductFound: (product: InventoryProduct) => void;
}

export function BarcodeScannerModal({ open, products, onClose, onProductFound }: BarcodeScannerModalProps) {
  return <Modal open={open} onClose={onClose} title="Buscar por código" size="sm">
    {open && <BarcodeLookup products={products} onFound={onProductFound} onClose={onClose} />}
  </Modal>;
}

function BarcodeLookup({ products, onFound, onClose }: {
  products: InventoryProduct[];
  onFound: (product: InventoryProduct) => void;
  onClose: () => void;
}) {
  const [message, setMessage] = useState('');

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const code = String(new FormData(event.currentTarget).get('code') ?? '').trim();
    const normalized = code.toLocaleLowerCase('pt-BR');
    const matches = products.filter((item) => item.barcode === code || item.sku.toLocaleLowerCase('pt-BR') === normalized);
    if (matches.length !== 1) {
      setMessage(matches.length ? 'Mais de um produto corresponde a este código. Use o SKU.' : 'Produto não encontrado.');
      return;
    }
    onFound(matches[0]);
    onClose();
  }

  return (
    <form className="space-y-3" onSubmit={submit}>
      <label className="block text-sm font-medium">
        Código de barras ou SKU
        <input className="input-field mt-1" name="code" autoFocus required />
      </label>
      <p className="text-sm text-ink-600">Digite o código ou use um leitor conectado como teclado.</p>
      {message && <p role="alert" className="text-sm text-error-700">{message}</p>}
      <button className="btn-primary">Buscar produto</button>
    </form>
  );
}
