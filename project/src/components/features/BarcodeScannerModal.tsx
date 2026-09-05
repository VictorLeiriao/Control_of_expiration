import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { ScanLine, Check, Package } from 'lucide-react';
import { productService } from '@/services';
import type { Product } from '@/types';
import { cn } from '@/utils/cn';

interface BarcodeScannerModalProps {
  open: boolean;
  onClose: () => void;
  onProductFound: (product: Product) => void;
}

export function BarcodeScannerModal({ open, onClose, onProductFound }: BarcodeScannerModalProps) {
  const [scanning, setScanning] = useState(false);
  const [found, setFound] = useState<Product | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (open) {
      setScanning(false);
      setFound(null);
      setNotFound(false);
    }
  }, [open]);

  function handleScan() {
    setScanning(true);
    setFound(null);
    setNotFound(false);

    setTimeout(async () => {
      const product = await productService.findByBarcode('789000000001');
      setScanning(false);
      if (product) {
        setFound(product);
      } else {
        setNotFound(true);
      }
    }, 2000);
  }

  return (
    <Modal open={open} onClose={onClose} title="Escanear código de barras" size="sm">
      <div className="space-y-4">
        {!scanning && !found && !notFound && (
          <div className="flex flex-col items-center text-center py-6">
            <div className="relative w-48 h-48 rounded-2xl border-2 border-dashed border-ink-300 bg-ink-50 flex items-center justify-center overflow-hidden">
              <ScanLine className="w-16 h-16 text-ink-400" />
              <div className="absolute inset-x-4 top-1/2 h-0.5 bg-brand-500/50 animate-pulse-soft" />
            </div>
            <p className="text-sm text-ink-500 mt-4">Posicione o código de barras dentro da área.</p>
            <button onClick={handleScan} className="btn-primary mt-4">
              <ScanLine className="w-4 h-4" />
              Escanear
            </button>
          </div>
        )}

        {scanning && (
          <div className="flex flex-col items-center text-center py-6">
            <div className="relative w-48 h-48 rounded-2xl border-2 border-brand-400 bg-brand-50 flex items-center justify-center overflow-hidden">
              <ScanLine className="w-16 h-16 text-brand-500 animate-pulse" />
              <div className="absolute inset-x-4 top-1/2 h-0.5 bg-brand-500 animate-pulse-soft" />
            </div>
            <p className="text-sm text-brand-600 font-medium mt-4">Escaneando...</p>
          </div>
        )}

        {found && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-success-600">
              <Check className="w-5 h-5" />
              <span className="text-sm font-medium">Código encontrado:</span>
            </div>
            <div className="rounded-xl border border-ink-200 p-4 bg-ink-50">
              <p className="text-xs text-ink-400">Código de barras</p>
              <p className="text-sm font-mono font-medium text-ink-700 mt-0.5">{found.barcode}</p>
              <div className="mt-3 pt-3 border-t border-ink-200">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-brand-600" />
                  <p className="text-sm font-semibold text-ink-900">{found.name}</p>
                </div>
                <p className="text-xs text-ink-500 mt-1">{found.brand} • {found.category}</p>
              </div>
            </div>
            <button
              onClick={() => { onProductFound(found); onClose(); }}
              className="btn-primary w-full"
            >
              Usar produto
            </button>
          </div>
        )}

        {notFound && (
          <div className="flex flex-col items-center text-center py-6">
            <div className="w-16 h-16 rounded-2xl bg-error-50 flex items-center justify-center mb-3">
              <ScanLine className="w-8 h-8 text-error-500" />
            </div>
            <p className="text-sm font-medium text-ink-700">Produto não encontrado</p>
            <p className="text-xs text-ink-500 mt-1">O código escaneado não corresponde a nenhum produto cadastrado.</p>
            <button onClick={handleScan} className="btn-secondary mt-4">
              Tentar novamente
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}
