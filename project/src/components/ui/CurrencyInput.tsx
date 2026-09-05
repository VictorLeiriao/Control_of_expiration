import { cn } from '@/utils/cn';

interface CurrencyInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function CurrencyInput({ value, onChange, placeholder = '0,00', className }: CurrencyInputProps) {
  function formatCurrencyInput(val: string): string {
    const digits = val.replace(/\D/g, '');
    if (!digits) return '';
    const num = parseInt(digits) / 100;
    return new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num);
  }

  return (
    <div className={cn('relative', className)}>
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink-400 font-medium pointer-events-none">R$</span>
      <input
        type="text"
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange(formatCurrencyInput(e.target.value))}
        placeholder={placeholder}
        className="input-field pl-10"
      />
    </div>
  );
}
