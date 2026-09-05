import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Check } from 'lucide-react';

export function NotificationSettingsPage() {
  const { channels, toggleChannel, addChannel } = useApp();
  const emailChannel = channels.find((c) => c.type === 'EMAIL');
  const [email, setEmail] = useState(emailChannel?.destination || '');
  const [threshold7, setThreshold7] = useState(true);
  const [threshold15, setThreshold15] = useState(false);
  const [threshold30, setThreshold30] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    if (emailChannel) {
      toggleChannel(emailChannel.id);
    } else {
      addChannel({ tenantId: 't1', type: 'EMAIL', destination: email, enabled: true });
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-ink-900">Notificações por email</h2>
        <p className="text-sm text-ink-500 mt-1">Configure como você deseja receber alertas de validade</p>
      </div>

      <div className="card p-6 space-y-4">
        {/* Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-ink-800">Alertas de validade</p>
            <p className="text-xs text-ink-500 mt-0.5">Receba alertas quando produtos estiverem próximos do vencimento</p>
          </div>
          <button
            onClick={() => emailChannel && toggleChannel(emailChannel.id)}
            className={`relative w-12 h-6 rounded-full transition-colors ${emailChannel?.enabled ? 'bg-brand-600' : 'bg-ink-300'}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${emailChannel?.enabled ? 'translate-x-6' : ''}`} />
          </button>
        </div>

        <div className="pt-4 border-t border-ink-100">
          <label className="block text-sm font-medium text-ink-700 mb-1.5">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" className="input-field" />
        </div>

        <div className="pt-4 border-t border-ink-100">
          <p className="text-sm font-medium text-ink-700 mb-3">Notificar quando faltar:</p>
          <div className="space-y-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={threshold7} onChange={(e) => setThreshold7(e.target.checked)} className="w-4 h-4 rounded border-ink-300 text-brand-600 focus:ring-brand-500" />
              <span className="text-sm text-ink-700">7 dias</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={threshold15} onChange={(e) => setThreshold15(e.target.checked)} className="w-4 h-4 rounded border-ink-300 text-brand-600 focus:ring-brand-500" />
              <span className="text-sm text-ink-700">15 dias</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={threshold30} onChange={(e) => setThreshold30(e.target.checked)} className="w-4 h-4 rounded border-ink-300 text-brand-600 focus:ring-brand-500" />
              <span className="text-sm text-ink-700">30 dias</span>
            </label>
          </div>
        </div>
      </div>

      {/* Preview notification */}
      <div className="card p-5 bg-ink-50">
        <p className="text-xs font-medium text-ink-500 mb-2">Prévia da notificação</p>
        <div className="rounded-lg bg-white border border-ink-200 p-4 text-sm text-ink-700">
          <p className="font-semibold text-error-600 mb-2">ALERTA DE VALIDADE</p>
          <p className="font-medium">Ração Golden 15kg</p>
          <p className="text-ink-600">Lote ABC123</p>
          <p className="mt-2">12 unidades vencem em 5 dias.</p>
          <p className="mt-2 text-ink-600">Valor em estoque: R$ 1.080,00</p>
          <p className="mt-2 text-ink-500">Sugestão: priorize a venda ou crie uma promoção.</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button onClick={handleSave} disabled={saving} className="btn-primary">
          {saving ? 'Salvando...' : 'Salvar alterações'}
        </button>
        {saved && (
          <span className="inline-flex items-center gap-1 text-sm text-success-600 font-medium">
            <Check className="w-4 h-4" />
            Configurações salvas!
          </span>
        )}
      </div>
    </div>
  );
}
