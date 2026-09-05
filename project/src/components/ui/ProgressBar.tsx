import { cn } from '@/utils/cn';

interface ProgressBarProps {
  value: number;
  max: number;
  label?: string;
  tone?: 'error' | 'warning' | 'brand' | 'success';
  className?: string;
}

const toneColors = {
  error: 'bg-error-500',
  warning: 'bg-warning-500',
  brand: 'bg-brand-500',
  success: 'bg-success-500',
};

export function ProgressBar({ value, max, label, tone = 'brand', className }: ProgressBarProps) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className={cn('w-full', className)}>
      {label && (
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-medium text-ink-500">{label}</span>
          <span className="text-xs font-semibold text-ink-700">{pct}%</span>
        </div>
      )}
      <div className="w-full h-2 rounded-full bg-ink-100 overflow-hidden">
        <div className={cn('h-full rounded-full transition-all duration-500', toneColors[tone])} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
