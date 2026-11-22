export class ApiError extends Error {
  constructor(public status: number, public body: unknown) {
    const details = body as { message?: string; title?: string } | null;
    const code = (body as { code?: string } | null)?.code;
    const codeMessages: Record<string, string> = {
      insufficient_stock: 'Saldo elegível insuficiente para a saída FEFO.',
      operation_conflict: 'Identificador usado em outra movimentação.',
      stock_lock_unavailable: 'O estoque está ocupado. Tente novamente.',
    };
    const statusMessages: Record<number, string> = {
      403: 'Você não tem permissão para esta operação.',
      404: 'Registro não encontrado.',
    };
    super(details?.message ?? (code && codeMessages[code]) ?? statusMessages[status] ?? details?.title ?? `A API respondeu com o código ${status}.`);
  }
}

interface RequestOptions {
  token?: string;
  body?: object;
  signal?: AbortSignal;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
}

export async function apiRequest<T>(path: string, { token, body, signal, method = body ? 'POST' : 'GET' }: RequestOptions = {}): Promise<T> {
  const base = import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, '') || '/api/v1';
  const headers = new Headers({ Accept: 'application/json' });
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (body) headers.set('Content-Type', 'application/json');

  let response: Response;
  try {
    response = await fetch(base + path, {
      headers, method, body: body ? JSON.stringify(body) : undefined, signal,
    });
  } catch (error) {
    if (signal?.aborted) throw error;
    throw new Error('Não foi possível conectar à API. Tente novamente.');
  }
  if (response.status === 204) return undefined as T;
  const isJson = response.headers.get('content-type')?.includes('json');
  const data = isJson ? await response.json() : null;
  if (!response.ok) {
    if (token && response.status === 401) window.dispatchEvent(new CustomEvent('inventory:unauthorized', { detail: token }));
    throw new ApiError(response.status, data);
  }
  if (!isJson) throw new Error('A API retornou uma resposta inesperada.');
  return data as T;
}

export async function listAll<T>(path: string, options: Pick<RequestOptions, 'token' | 'signal'>): Promise<T[]> {
  const limit = 100;
  const separator = path.includes('?') ? '&' : '?';
  const items: T[] = [];
  for (let offset = 0; ; offset += limit) {
    const page = await apiRequest<T[]>(`${path}${separator}limit=${limit}&offset=${offset}`, options);
    if (!Array.isArray(page)) throw new Error('A API retornou uma lista inválida.');
    items.push(...page);
    if (page.length < limit) return items;
  }
}
