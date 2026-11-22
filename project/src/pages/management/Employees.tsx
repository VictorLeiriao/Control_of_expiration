import { useEffect, useState, type FormEvent } from 'react';
import { Modal } from '@/components/ui/Modal';
import { managementService, type EmployeeRole, type Invitation, type Member } from '@/services/management';
import { formatDateTime } from '@/utils/format';

const roles = {
  MEMBER: 'Consulta',
  OPERATOR: 'Operador',
  MANAGER: 'Gerente',
} satisfies Record<EmployeeRole, string>;

type EmployeeAction = { type: 'invite' | 'create' } | { type: 'edit'; member: Member };
type AccessCode = Invitation & { type: 'invite' | 'activation' };

function RoleField({ initial }: { initial: EmployeeRole }) {
  return (
    <label className="block text-sm font-medium">
      Perfil de acesso
      <select name="role" className="input-field mt-1" defaultValue={initial}>
        {Object.entries(roles).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
      </select>
      <span className="mt-1 block text-xs text-ink-500">
        Consulta visualiza o estoque. Operador também movimenta. Gerente também edita o catálogo, gerencia promoções e acessa relatórios.
      </span>
    </label>
  );
}

export function Employees({ token, canInvite, canManage }: { token: string; canInvite: boolean; canManage: boolean }) {
  const [members, setMembers] = useState<Member[] | null>(null);
  const [action, setAction] = useState<EmployeeAction | null>(null);
  const [code, setCode] = useState<AccessCode | null>(null);
  const [notice, setNotice] = useState('');
  const [loadError, setLoadError] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    managementService.members(token, controller.signal).then((data) => {
      if (!controller.signal.aborted) setMembers(data);
    }).catch((failure: unknown) => {
      if (!controller.signal.aborted) setLoadError(failure instanceof Error ? failure.message : 'Não foi possível carregar os funcionários.');
    });
    return () => controller.abort();
  }, [token, attempt]);

  function open(next: EmployeeAction) {
    setError('');
    setNotice('');
    setAction(next);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!action) return;
    const fields = new FormData(event.currentTarget);
    const roleCode = String(fields.get('role')) as EmployeeRole;
    const email = String(fields.get('email') ?? '').trim();
    const profile = {
      name: String(fields.get('name') ?? '').trim(),
      jobTitle: String(fields.get('jobTitle') ?? '').trim() || null,
      roleCode,
    };
    setBusy(true);
    setError('');
    setCode(null);
    setLoadError('');
    try {
      if (action.type === 'invite') {
        setCode({ ...await managementService.invite(token, email, roleCode), type: 'invite' });
      } else if (action.type === 'create') {
        const employee = await managementService.createEmployee(token, { ...profile, email });
        setCode({ ...employee.activation, type: 'activation' });
        setNotice('Funcionário cadastrado. O acesso está pendente de ativação.');
        setAttempt((value) => value + 1);
      } else if (action.type === 'edit') {
        await managementService.updateEmployee(token, action.member.userId, { ...profile, isActive: fields.get('active') === 'on' });
        setNotice('Funcionário atualizado.');
        setAttempt((value) => value + 1);
      }
      setAction(null);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Não foi possível salvar.');
    } finally {
      setBusy(false);
    }
  }

  async function renew(member: Member) {
    setBusy(true);
    setError('');
    setNotice('');
    setCode(null);
    try {
      setCode({ ...await managementService.renewActivation(token, member.userId), type: 'activation' });
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Não foi possível gerar um novo código.');
    } finally {
      setBusy(false);
    }
  }

  const editing = action?.type === 'edit' ? action.member : null;
  return (
    <section className="card p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-semibold">Funcionários</h2>
        <div className="flex flex-wrap gap-2">
          {canInvite && <button className="btn-secondary" disabled={busy} onClick={() => open({ type: 'invite' })}>Convidar funcionário</button>}
          {canManage && <button className="btn-primary" disabled={busy} onClick={() => open({ type: 'create' })}>Cadastrar funcionário</button>}
        </div>
      </div>
      {notice && <p role="status" className="mt-3 text-sm text-success-700">{notice}</p>}
      {error && !action && <p role="alert" className="mt-3 text-sm text-error-700">{error}</p>}
      {loadError && (
        <div className="mt-3">
          <p role="alert" className="text-sm text-error-700">{loadError}</p>
          <button className="btn-secondary mt-2" onClick={() => { setLoadError(''); setAttempt((value) => value + 1); }}>Tentar novamente</button>
        </div>
      )}
      {!members && !loadError && <p className="mt-2 text-sm text-ink-500">Carregando funcionários…</p>}
      {code && (
        <div className="mt-3 rounded-lg bg-brand-50 p-3 text-sm">
          <p>
            {code.type === 'activation'
              ? 'Entregue este código em particular ao funcionário. Na tela de login, ele deve escolher Ativar acesso de funcionário e definir a própria senha.'
              : 'Compartilhe este código em particular com a pessoa convidada. Ela pode usar Aceitar convite na tela de login.'}
          </p>
          <p className="mt-1">Válido até {formatDateTime(code.expiresAt)}.</p>
          <code className="break-all">{code.token}</code>
          <button className="btn-ghost mt-1" onClick={() => setCode(null)}>Ocultar código</button>
        </div>
      )}
      {members && (
        <ul className="mt-3 divide-y divide-ink-100">
          {members.map((member) => (
            <li key={member.userId} className="flex flex-wrap items-center justify-between gap-2 py-3">
              <div className="min-w-0">
                <p className="font-medium break-words">{member.name}</p>
                <p className="break-all text-sm text-ink-500">{member.email}</p>
                {member.jobTitle && <p className="break-words text-sm text-ink-500">{member.jobTitle}</p>}
                <p className="text-xs text-ink-500">
                  {member.roleCode === 'OWNER' ? 'Proprietário' : roles[member.roleCode]}
                  {' · '}{!member.isActive ? 'Inativo' : member.activationPending ? 'Pendente de ativação' : 'Ativo'}
                </p>
              </div>
              {canManage && member.roleCode !== 'OWNER' && (
                <div className="flex flex-wrap gap-2">
                  <button className="btn-secondary" disabled={busy} onClick={() => open({ type: 'edit', member })}>Editar funcionário</button>
                  {member.isActive && member.activationPending && (
                    <button className="btn-ghost" disabled={busy} onClick={() => renew(member)}>Gerar novo código</button>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
      {action && (
        <Modal open onClose={() => !busy && setAction(null)} title={editing ? 'Editar funcionário' : action.type === 'create' ? 'Cadastrar funcionário' : 'Convidar funcionário'}>
          <form className="space-y-4" onSubmit={submit}>
            {action.type !== 'invite' && (
              <>
                <label className="block text-sm font-medium">Nome de exibição
                  <input name="name" className="input-field mt-1" defaultValue={editing?.name} maxLength={200} required />
                </label>
                <label className="block text-sm font-medium">Cargo
                  <input name="jobTitle" className="input-field mt-1" defaultValue={editing?.jobTitle ?? ''} maxLength={120} />
                </label>
              </>
            )}
            <label className="block text-sm font-medium">E-mail
              <input name="email" className="input-field mt-1" type="email" defaultValue={editing?.email} readOnly={Boolean(editing)} maxLength={320} required />
            </label>
            <RoleField initial={editing && editing.roleCode !== 'OWNER' ? editing.roleCode : 'MEMBER'} />
            {editing && (
              <label className="flex items-center gap-2 text-sm font-medium">
                <input type="checkbox" name="active" defaultChecked={editing.isActive} /> Acesso ativo nesta empresa
              </label>
            )}
            {error && <p role="alert" className="text-sm text-error-700">{error}</p>}
            <div className="flex flex-wrap justify-end gap-2">
              <button type="button" className="btn-secondary" disabled={busy} onClick={() => setAction(null)}>Cancelar</button>
              <button type="submit" className="btn-primary" disabled={busy}>{action.type === 'invite' ? 'Gerar convite' : 'Salvar funcionário'}</button>
            </div>
          </form>
        </Modal>
      )}
    </section>
  );
}
