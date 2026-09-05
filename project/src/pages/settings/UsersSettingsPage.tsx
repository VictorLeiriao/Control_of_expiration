import { User as UserIcon, Plus, Shield, Mail } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export function UsersSettingsPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-ink-900">Usuários</h2>
        <p className="text-sm text-ink-500 mt-1">Gerencie quem tem acesso ao sistema</p>
      </div>

      <div className="card divide-y divide-ink-100">
        <div className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-sm font-semibold text-brand-700">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-ink-800">{user?.name}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <Mail className="w-3 h-3 text-ink-400" />
              <p className="text-xs text-ink-500">{user?.email}</p>
            </div>
          </div>
          <span className="badge bg-brand-50 text-brand-700 border border-brand-200">
            <Shield className="w-3 h-3" />
            Administrador
          </span>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center py-8 text-center rounded-xl border-2 border-dashed border-ink-200">
        <div className="w-12 h-12 rounded-xl bg-ink-100 flex items-center justify-center mb-3">
          <UserIcon className="w-6 h-6 text-ink-400" />
        </div>
        <p className="text-sm font-medium text-ink-600">Nenhum outro usuário</p>
        <p className="text-xs text-ink-400 mt-1 max-w-sm">Convide membros da sua equipe para colaborar no controle de estoque</p>
        <button className="btn-secondary mt-4">
          <Plus className="w-4 h-4" />
          Convidar usuário
        </button>
      </div>
    </div>
  );
}
