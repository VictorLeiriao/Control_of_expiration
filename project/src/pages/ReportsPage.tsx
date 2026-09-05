import { useState, useEffect } from 'react';
import { reportService } from '@/services';
import type { ReportSummary, LossRecord } from '@/types';
import { PageHeader } from '@/components/layouts/PageHeader';
import { DashboardCard } from '@/components/ui/DashboardCard';
import { LoadingState } from '@/components/ui/LoadingState';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { formatCurrency, formatDate } from '@/utils/format';
import { AlertTriangle, DollarSign, Clock, Trash2, Tag, TrendingDown } from 'lucide-react';

export function ReportsPage() {
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [losses, setLosses] = useState<LossRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([reportService.getReportSummary(), reportService.getLosses()]).then(([s, l]) => {
      setSummary(s);
      setLosses(l);
      setLoading(false);
    });
  }, []);

  if (loading) return <LoadingState />;

  const maxLoss = Math.max(...losses.map((l) => l.value), 1);

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <PageHeader title="Relatórios" description="Acompanhe perdas, riscos e ações tomadas" />

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <DashboardCard icon={AlertTriangle} label="Produtos vencidos" value={summary?.expiredProducts ?? 0} tone="error" />
        <DashboardCard icon={DollarSign} label="Valor perdido" value={formatCurrency(summary?.lostValue ?? 0)} tone="error" />
        <DashboardCard icon={Clock} label="Produtos em risco" value={summary?.productsAtRisk ?? 0} tone="warning" />
        <DashboardCard icon={Trash2} label="Descartes" value={summary?.discards ?? 0} tone="neutral" />
        <DashboardCard icon={Tag} label="Promoções realizadas" value={summary?.promotionsCreated ?? 0} tone="success" />
      </div>

      {/* Loss chart */}
      <div className="card p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingDown className="w-5 h-5 text-error-600" />
          <h2 className="text-base font-semibold text-ink-900">Perdas por validade</h2>
        </div>
        <div className="space-y-4">
          {losses.map((loss) => (
            <div key={loss.id}>
              <div className="flex items-center justify-between mb-1.5">
                <div>
                  <span className="text-sm font-medium text-ink-800">{loss.productName}</span>
                  <span className="text-xs text-ink-400 ml-2">{loss.quantity} un. • {formatDate(loss.date)}</span>
                </div>
                <span className="text-sm font-semibold text-error-600">{formatCurrency(loss.value)}</span>
              </div>
              <ProgressBar value={loss.value} max={maxLoss} tone="error" />
            </div>
          ))}
        </div>
      </div>

      {/* Loss table */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-ink-200">
          <h2 className="text-base font-semibold text-ink-900">Detalhamento de perdas</h2>
        </div>
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-ink-50 text-ink-500 text-xs uppercase tracking-wide">
                <th className="px-5 py-3 text-left font-medium">Produto</th>
                <th className="px-5 py-3 text-right font-medium">Quantidade</th>
                <th className="px-5 py-3 text-right font-medium">Valor</th>
                <th className="px-5 py-3 text-left font-medium">Motivo</th>
                <th className="px-5 py-3 text-left font-medium">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {losses.map((loss) => (
                <tr key={loss.id} className="hover:bg-ink-50/50 transition-colors">
                  <td className="px-5 py-3 font-medium text-ink-800">{loss.productName}</td>
                  <td className="px-5 py-3 text-right text-ink-600">{loss.quantity}</td>
                  <td className="px-5 py-3 text-right font-medium text-error-600">{formatCurrency(loss.value)}</td>
                  <td className="px-5 py-3 text-ink-600">{loss.reason}</td>
                  <td className="px-5 py-3 text-ink-600">{formatDate(loss.date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="lg:hidden divide-y divide-ink-100">
          {losses.map((loss) => (
            <div key={loss.id} className="p-4">
              <p className="font-medium text-ink-800 text-sm">{loss.productName}</p>
              <div className="flex items-center justify-between mt-1 text-xs">
                <span className="text-ink-500">{loss.quantity} un. • {loss.reason} • {formatDate(loss.date)}</span>
                <span className="font-semibold text-error-600">{formatCurrency(loss.value)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
