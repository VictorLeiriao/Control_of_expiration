import { cn } from '@/utils/cn';
import type { LucideIcon } from 'lucide-react';
import { X, AlertTriangle, Info, AlertCircle } from 'lucide-react';

interface AlertCardProps {
  level: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  onDismiss?: () => void;
}

const levelConfig = {
  critical: { bg: 'bg-error-50', border: 'border-error-200', icon: AlertCircle, iconColor: 'text-error-600', titleColor: 'text-error-800' },
  warning: { bg: 'bg-warning-50', border: 'border-warning-200', icon: AlertTriangle, iconColor: 'text-warning-600', titleColor: 'text-warning-800' },
  info: { bg: 'bg-brand-50', border: 'border-brand-200', icon: Info, iconColor: 'text-brand-600', titleColor: 'text-brand-800' },
};

export function AlertCard({ level, title, message, actionLabel, onAction, onDismiss }: AlertCardProps) {
  const config = levelConfig[level];
  const Icon: LucideIcon = config.icon;

  return (
    <div className={cn('rounded-xl border p-4 flex items-start gap-3 animate-slide-up', config.bg, config.border)}>
      <Icon className={cn('w-5 h-5 flex-shrink-0 mt-0.5', config.iconColor)} />
      <div className="flex-1 min-w-0">
        <p className={cn('text-sm font-semibold', config.titleColor)}>{title}</p>
        <p className="text-sm text-ink-600 mt-0.5">{message}</p>
        {actionLabel && onAction && (
          <button onClick={onAction} className="mt-2 text-sm font-medium text-ink-700 hover:text-ink-900 underline underline-offset-2">
            {actionLabel}
          </button>
        )}
      </div>
      {onDismiss && (
        <button onClick={onDismiss} className="p-1 rounded-lg text-ink-400 hover:bg-white/60 hover:text-ink-600 transition-colors flex-shrink-0">
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
