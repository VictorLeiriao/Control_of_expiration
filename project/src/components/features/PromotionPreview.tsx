import { useRef } from 'react';
import { Download, Share2, Flame } from 'lucide-react';
import type { PromotionData } from '@/types';
import { formatCurrency } from '@/utils/format';

interface PromotionPreviewProps {
  data: PromotionData;
}

export function PromotionPreview({ data }: PromotionPreviewProps) {
  const posterRef = useRef<HTMLDivElement>(null);

  function handleDownload() {
    if (!posterRef.current) return;
    const svgString = new XMLSerializer().serializeToString(posterRef.current);
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `promocao-${data.lotNumber}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleShare() {
    if (navigator.share) {
      navigator.share({
        title: 'Promoção',
        text: `${data.productName} — De ${formatCurrency(data.oldPrice)} por ${formatCurrency(data.newPrice)}!`,
      }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(`${data.productName} — De ${formatCurrency(data.oldPrice)} por ${formatCurrency(data.newPrice)}!`);
    }
  }

  const discount = Math.round(((data.oldPrice - data.newPrice) / data.oldPrice) * 100);

  return (
    <div className="space-y-4">
      <div
        ref={posterRef}
        className="relative w-full max-w-sm mx-auto rounded-2xl overflow-hidden bg-gradient-to-br from-error-500 via-error-600 to-orange-600 p-8 text-white shadow-elevated"
      >
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12" />

        <div className="relative z-10 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Flame className="w-6 h-6" />
            <span className="text-2xl font-extrabold tracking-tight">PROMOÇÃO</span>
            <Flame className="w-6 h-6" />
          </div>

          <div className="inline-block px-4 py-1 rounded-full bg-white/20 backdrop-blur-sm mb-6">
            <span className="text-sm font-semibold">-{discount}%</span>
          </div>

          <h3 className="text-2xl font-extrabold uppercase tracking-tight mb-1">{data.productName}</h3>
          <p className="text-sm text-white/80 mb-6">Lote {data.lotNumber} • {data.quantity} unidades</p>

          <div className="space-y-2 mb-6">
            <div className="text-white/70 text-lg font-medium line-through">
              De {formatCurrency(data.oldPrice)}
            </div>
            <div className="text-5xl font-extrabold">
              {formatCurrency(data.newPrice)}
            </div>
          </div>

          <div className="inline-block px-6 py-2 rounded-full bg-white text-error-600 text-sm font-bold uppercase tracking-wide">
            Aproveite!
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-3">
        <button onClick={handleDownload} className="btn-secondary">
          <Download className="w-4 h-4" />
          Baixar imagem
        </button>
        <button onClick={handleShare} className="btn-primary">
          <Share2 className="w-4 h-4" />
          Compartilhar
        </button>
      </div>
    </div>
  );
}
