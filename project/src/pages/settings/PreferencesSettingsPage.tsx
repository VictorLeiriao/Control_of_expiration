import { useState } from 'react';
import { Check } from 'lucide-react';

export function PreferencesSettingsPage() {
  const [theme, setTheme] = useState('light');
  const [compactMode, setCompactMode] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-ink-900">Preferências</h2>
        <p className="text-sm text-ink-500 mt-1">Personalize sua experiência no sistema</p>
      </div>

      <div className="card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-ink-800">Modo compacto</p>
            <p className="text-xs text-ink-500 mt-0.5">Exibe mais informações em menos espaço</p>
          </div>
          <button
            onClick={() => setCompactMode(!compactMode)}
            className={`relative w-12 h-6 rounded-full transition-colors ${compactMode ? 'bg-brand-600' : 'bg-ink-300'}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${compactMode ? 'translate-x-6' : ''}`} />
          </button>
        </div>

        <div className="pt-4 border-t border-ink-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-ink-800">Atualização automática</p>
            <p className="text-xs text-ink-500 mt-0.5">Atualiza o dashboard automaticamente a cada 5 minutos</p>
          </div>
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`relative w-12 h-6 rounded-full transition-colors ${autoRefresh ? 'bg-brand-600' : 'bg-ink-300'}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${autoRefresh ? 'translate-x-6' : ''}`} />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button onClick={handleSave} className="btn-primary">
          Salvar alterações
        </button>
        {saved && (
          <span className="inline-flex items-center gap-1 text-sm text-success-600 font-medium">
            <Check className="w-4 h-4" />
            Preferências salvas!
          </span>
        )}
      </div>
    </div>
  );
}
