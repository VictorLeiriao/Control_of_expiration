import { cn } from '@/utils/cn';
import type { ExpirationStatus } from '@/types';
import { getExpirationLabel } from '@/utils/format';

interface StatusBadgeProps {
  status: ExpirationStatus;
  label?: string;
  size?: 'sm' | 'md';
}

const statusConfig: Record<ExpirationStatus, { dot: string; bg: string; text: string; border: string }> = {
  expired: { dot: 'bg-error-500', bg: 'bg-error-50', text: 'text-error-700', border: 'border-error-200' },
  critical: { dot: 'bg-orange-500', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  warning: { dot: 'bg-warning-500', bg: 'bg-warning-50', text: 'text-warning-700', border: 'border-warning-200' },
  soon: { dot: 'bg-brand-500', bg: 'bg-brand-50', text: 'text-brand-700', border: 'border-brand-200' },
  normal: { dot: 'bg-success-500', bg: 'bg-success-50', text: 'text-success-700', border: 'border-success-200' },
};

export function StatusBadge({ status, label, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <span className={cn('badge border', config.bg, config.text, config.border, size === 'sm' && 'text-[11px] px-2 py-0.5')}>
      <span className={cn('w-1.5 h-1.5 rounded-full', config.dot)} />
      {label || getExpirationLabel(status)}
    </span>
  );
}
