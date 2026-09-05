import { cn } from '@/utils/cn';
import { getExpirationStatus, getDaysRemainingLabel } from '@/utils/format';
import type { LucideIcon } from 'lucide-react';
import { AlertTriangle, Clock, CalendarClock, CalendarCheck } from 'lucide-react';

interface ExpirationBadgeProps {
  expirationDate: string;
  daysRemaining: number;
  showLabel?: boolean;
}

export function ExpirationBadge({ expirationDate, daysRemaining, showLabel = true }: ExpirationBadgeProps) {
  const status = getExpirationStatus(expirationDate);

  const config: Record<string, { color: string; bg: string; icon: LucideIcon }> = {
    expired: { color: 'text-error-600', bg: 'bg-error-50', icon: AlertTriangle },
    critical: { color: 'text-orange-600', bg: 'bg-orange-50', icon: AlertTriangle },
    warning: { color: 'text-warning-600', bg: 'bg-warning-50', icon: Clock },
    soon: { color: 'text-brand-600', bg: 'bg-brand-50', icon: CalendarClock },
    normal: { color: 'text-success-600', bg: 'bg-success-50', icon: CalendarCheck },
  };

  const { color, bg, icon: Icon } = config[status];

  return (
    <div className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium', bg, color)}>
      <Icon className="w-3.5 h-3.5" />
      {showLabel && getDaysRemainingLabel(daysRemaining)}
    </div>
  );
}
