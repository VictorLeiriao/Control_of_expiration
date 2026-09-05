import { useState } from 'react';
import { cn } from '@/utils/cn';
import { Upload, ImageIcon, X } from 'lucide-react';

interface ImageUploaderProps {
  value: string | null;
  onChange: (base64: string | null) => void;
  label?: string;
  hint?: string;
}

export function ImageUploader({ value, onChange, label = 'Arraste sua imagem aqui', hint = 'PNG, JPG ou WEBP' }: ImageUploaderProps) {
  const [dragging, setDragging] = useState(false);

  function handleFile(file: File) {
    if (!file.type.match(/image\/(png|jpe?g|webp)/)) return;
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result as string);
    reader.readAsDataURL(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  return (
    <div>
      {value ? (
        <div className="relative w-full max-w-xs">
          <img src={value} alt="Preview" className="w-full h-40 object-contain rounded-xl border border-ink-200 bg-ink-50" />
          <button
            onClick={() => onChange(null)}
            className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/90 text-ink-500 hover:text-error-600 shadow-card transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <label
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={cn(
            'flex flex-col items-center justify-center w-full max-w-xs h-40 rounded-xl border-2 border-dashed cursor-pointer transition-all',
            dragging ? 'border-brand-400 bg-brand-50' : 'border-ink-300 bg-ink-50 hover:bg-ink-100'
          )}
        >
          <ImageIcon className="w-8 h-8 text-ink-400 mb-2" />
          <p className="text-sm font-medium text-ink-600">{label}</p>
          <p className="text-xs text-ink-400 mt-1">ou</p>
          <span className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-ink-200 text-xs font-medium text-ink-700">
            <Upload className="w-3.5 h-3.5" />
            Selecionar imagem
          </span>
          <p className="text-xs text-ink-400 mt-2">{hint}</p>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
          />
        </label>
      )}
    </div>
  );
}
