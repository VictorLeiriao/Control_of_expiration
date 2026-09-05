import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { cn } from '@/utils/cn';
import { Building2, Bell, Send, Users, Sliders } from 'lucide-react';

const settingsNav = [
  { to: '/settings/company', label: 'Empresa', icon: Building2 },
  { to: '/settings/notifications', label: 'Notificações', icon: Bell },
  { to: '/settings/telegram', label: 'Telegram', icon: Send },
  { to: '/settings/users', label: 'Usuários', icon: Users },
  { to: '/settings/preferences', label: 'Preferências', icon: Sliders },
];

export function SettingsLayout() {
  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <h1 className="text-xl font-bold text-ink-900 mb-6">Configurações</h1>
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Settings nav */}
        <div className="lg:w-56 flex-shrink-0">
          <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
            {settingsNav.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap',
                      isActive
                        ? 'bg-brand-50 text-brand-700'
                        : 'text-ink-600 hover:bg-ink-50 hover:text-ink-900'
                    )
                  }
                >
                  <Icon className="w-[18px] h-[18px] flex-shrink-0" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Settings content */}
        <div className="flex-1 min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export function CompanySettingsPage() {
  const { company, updateCompany } = useApp();
  const [name, setName] = useState(company.name);
  const [document, setDocument] = useState(company.document);
  const [segment, setSegment] = useState(company.segment);
  const [logo, setLogo] = useState<string | null>(company.logoBase64);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    await updateCompany({ name, document, segment, logoBase64: logo });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-ink-900">Dados da empresa</h2>
        <p className="text-sm text-ink-500 mt-1">Configure as informações da sua empresa</p>
      </div>

      <div className="card p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-ink-700 mb-1.5">Nome da empresa</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink-700 mb-1.5">CNPJ / CPF</label>
          <input type="text" value={document} onChange={(e) => setDocument(e.target.value)} className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink-700 mb-1.5">Segmento</label>
          <input type="text" value={segment} onChange={(e) => setSegment(e.target.value)} className="input-field" />
        </div>
      </div>

      <div className="card p-6">
        <h3 className="text-sm font-semibold text-ink-800 mb-1">Logo da empresa</h3>
        <p className="text-xs text-ink-500 mb-4">Sua logo aparecerá no menu lateral e nas notificações</p>
        <ImageUploader value={logo} onChange={setLogo} />
      </div>

      <div className="flex items-center gap-3">
        <button onClick={handleSave} disabled={saving} className="btn-primary">
          {saving ? 'Salvando...' : 'Salvar alterações'}
        </button>
        {saved && (
          <span className="text-sm text-success-600 font-medium">Alterações salvas com sucesso!</span>
        )}
      </div>
    </div>
  );
}

import { useApp } from '@/contexts/AppContext';
import { ImageUploader } from '@/components/ui/ImageUploader';
