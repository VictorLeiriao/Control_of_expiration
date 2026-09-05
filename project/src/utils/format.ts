import type { ExpirationStatus } from '@/types';

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const dateStr = formatDate(d);
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${dateStr} às ${hours}:${minutes}`;
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('pt-BR').format(value);
}

export function daysUntil(date: string | Date): number {
  const target = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  const diff = target.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function getExpirationStatus(expirationDate: string | Date): ExpirationStatus {
  const days = daysUntil(expirationDate);
  if (days < 0) return 'expired';
  if (days <= 7) return 'critical';
  if (days <= 30) return 'warning';
  if (days <= 60) return 'soon';
  return 'normal';
}

export function getExpirationLabel(status: ExpirationStatus): string {
  switch (status) {
    case 'expired':
      return 'Vencido';
    case 'critical':
      return 'Crítico';
    case 'warning':
      return 'Atenção';
    case 'soon':
      return 'Em breve';
    case 'normal':
      return 'Normal';
  }
}

export function getDaysRemainingLabel(days: number): string {
  if (days < 0) return `Vencido há ${Math.abs(days)} ${Math.abs(days) === 1 ? 'dia' : 'dias'}`;
  if (days === 0) return 'Vence hoje';
  if (days === 1) return '1 dia restante';
  return `${days} dias restantes`;
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

export function getActionTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    promotion: 'Promoção',
    return: 'Devolução',
    transfer: 'Transferência',
    sale: 'Venda normal',
    discard: 'Descarte',
    other: 'Outro',
  };
  return labels[type] || type;
}

export function getNotificationTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    expired: 'Produto vencido',
    expiring_7: 'Vencendo em 7 dias',
    expiring_30: 'Vencendo em 30 dias',
    entry: 'Nova entrada',
    insight: 'Insight do sistema',
  };
  return labels[type] || type;
}

export function getRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / (1000 * 60));
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffMin < 1) return 'Agora';
  if (diffMin < 60) return `Há ${diffMin} ${diffMin === 1 ? 'minuto' : 'minutos'}`;
  if (diffHour < 24) return `Há ${diffHour} ${diffHour === 1 ? 'hora' : 'horas'}`;
  if (diffDay < 7) return `Há ${diffDay} ${diffDay === 1 ? 'dia' : 'dias'}`;
  return formatDate(d);
}
