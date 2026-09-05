import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { PageHeader } from '@/components/layouts/PageHeader';
import { getNotificationTypeLabel, getRelativeTime } from '@/utils/format';
import { cn } from '@/utils/cn';
import { Bell, AlertTriangle, Clock, CalendarClock, ArrowDownToLine, Sparkles, CheckCheck } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { NotificationType } from '@/types';

const typeIcons: Record<NotificationType, LucideIcon> = {
  expired: AlertTriangle,
  expiring_7: Clock,
  expiring_30: CalendarClock,
  entry: ArrowDownToLine,
  insight: Sparkles,
};

const typeColors: Record<NotificationType, string> = {
  expired: 'bg-error-100 text-error-600',
  expiring_7: 'bg-orange-100 text-orange-600',
  expiring_30: 'bg-warning-100 text-warning-600',
  entry: 'bg-brand-100 text-brand-600',
  insight: 'bg-accent-100 text-accent-600',
};

export function NotificationsPage() {
  const navigate = useNavigate();
  const { notifications, markNotificationRead, markAllNotificationsRead, unreadCount } = useApp();

  const sorted = [...notifications].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      <PageHeader title="Notificações" description={unreadCount > 0 ? `${unreadCount} não lidas` : 'Todas as notificações foram lidas'}>
        {unreadCount > 0 && (
          <button onClick={markAllNotificationsRead} className="btn-secondary">
            <CheckCheck className="w-4 h-4" />
            Marcar todas como lidas
          </button>
        )}
      </PageHeader>

      {sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-ink-100 flex items-center justify-center mb-4">
            <Bell className="w-8 h-8 text-ink-400" />
          </div>
          <p className="text-sm text-ink-500">Nenhuma notificação no momento.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sorted.map((notif) => {
            const Icon = typeIcons[notif.type];
            return (
              <div
                key={notif.id}
                onClick={() => {
                  markNotificationRead(notif.id);
                  if (notif.productId) navigate(`/products/${notif.productId}`);
                }}
                className={cn(
                  'card p-4 flex items-start gap-3 cursor-pointer transition-all hover:shadow-soft',
                  !notif.read && 'border-brand-200 bg-brand-50/30'
                )}
              >
                <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0', typeColors[notif.type])}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-ink-500">{getNotificationTypeLabel(notif.type)}</span>
                    {!notif.read && <span className="w-2 h-2 rounded-full bg-brand-500" />}
                  </div>
                  <p className="text-sm text-ink-800 mt-0.5">{notif.message}</p>
                  <p className="text-xs text-ink-400 mt-1">{getRelativeTime(notif.date)}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
