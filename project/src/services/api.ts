export class ApiError extends Error {
  constructor(public status: number, public body: unknown) {
    const details = body as { message?: string; title?: string } | null;
    super(details?.message ?? details?.title ?? `A API respondeu com o código ${status}.`);
  }
}

interface RequestOptions {
  token?: string;
  body?: object;
  signal?: AbortSignal;
}

export async function apiRequest<T>(path: string, { token, body, signal }: RequestOptions = {}): Promise<T> {
  const base = import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, '') || '/api/v1';
  const headers = new Headers({ Accept: 'application/json' });
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (body) headers.set('Content-Type', 'application/json');

  let response: Response;
  try {
    response = await fetch(base + path, {
      headers, method: body ? 'POST' : 'GET', body: body ? JSON.stringify(body) : undefined, signal,
    });
  } catch (error) {
    if (signal?.aborted) throw error;
    throw new Error('Não foi possível conectar à API. Tente novamente.');
  }
  const isJson = response.headers.get('content-type')?.includes('json');
  const data = isJson ? await response.json() : null;
  if (!response.ok) {
    if (token && response.status === 401) window.dispatchEvent(new CustomEvent('inventory:unauthorized', { detail: token }));
    throw new ApiError(response.status, data);
  }
  if (!isJson) throw new Error('A API retornou uma resposta inesperada.');
  return data as T;
}
