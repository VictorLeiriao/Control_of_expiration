import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';
import type { LucideIcon } from 'lucide-react';

interface DashboardCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  tone?: 'error' | 'warning' | 'brand' | 'success' | 'neutral';
  subtitle?: string;
}

const toneConfig = {
  error: { bg: 'bg-error-50', iconBg: 'bg-error-100', iconColor: 'text-error-600', value: 'text-error-700' },
  warning: { bg: 'bg-orange-50', iconBg: 'bg-orange-100', iconColor: 'text-orange-600', value: 'text-orange-700' },
  brand: { bg: 'bg-brand-50', iconBg: 'bg-brand-100', iconColor: 'text-brand-600', value: 'text-brand-700' },
  success: { bg: 'bg-success-50', iconBg: 'bg-success-100', iconColor: 'text-success-600', value: 'text-success-700' },
  neutral: { bg: 'bg-ink-50', iconBg: 'bg-ink-100', iconColor: 'text-ink-600', value: 'text-ink-900' },
};

export function DashboardCard({ icon: Icon, label, value, tone = 'neutral', subtitle }: DashboardCardProps) {
  const config = toneConfig[tone];
  return (
    <div className={cn('rounded-xl border border-ink-200 p-5 transition-all hover:shadow-soft', config.bg)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-ink-500">{label}</p>
          <p className={cn('text-2xl font-bold mt-1', config.value)}>{value}</p>
          {subtitle && <p className="text-xs text-ink-400 mt-1">{subtitle}</p>}
        </div>
        <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', config.iconBg)}>
          <Icon className={cn('w-5 h-5', config.iconColor)} />
        </div>
      </div>
    </div>
  );
}
