import type { ExpirationStatus } from '@/types';

export function formatDate(date?: string | Date): string {
  if (!date) return '—';
  if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) return date.split('-').reverse().join('/');
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

export function dateKey(date?: string | Date): string | undefined {
  if (!date) return undefined;
  if (typeof date === 'string') {
    const key = date.slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) return undefined;
    const parsed = new Date(key);
    return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === key ? key : undefined;
  }
  if (!Number.isFinite(date.getTime())) return undefined;
  return [
    String(date.getFullYear()).padStart(4, '0'),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
}

export function daysUntil(date?: string | Date, today = new Date()): number {
  const key = dateKey(date);
  if (!key) return Infinity;
  return (Date.parse(key) - Date.parse(dateKey(today)!)) / 86_400_000;
}

export function getExpirationStatus(expirationDate?: string | Date, today = new Date()): ExpirationStatus {
  const days = daysUntil(expirationDate, today);
  if (!Number.isFinite(days)) return 'uncontrolled';
  if (days < 0) return 'expired';
  if (days <= 7) return 'critical';
  if (days <= 30) return 'warning';
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
    case 'uncontrolled':
      return 'Validade não controlada';
    case 'normal':
      return 'Normal';
  }
}

export function getDaysRemainingLabel(days: number): string {
  if (!Number.isFinite(days)) return 'Validade não controlada';
  if (days < 0) return `Vencido há ${Math.abs(days)} ${Math.abs(days) === 1 ? 'dia' : 'dias'}`;
  if (days === 0) return 'Vence hoje';
  if (days === 1) return 'Vence em 1 dia';
  return `Vence em ${days} dias`;
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
