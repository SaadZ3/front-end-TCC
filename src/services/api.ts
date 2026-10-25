export class ApiError extends Error {
  status: number;
  code: string;
  analysisId?: string;
  constructor(message: string, status: number, code: string, analysisId?: string) {
    super(message); this.status = status; this.code = code; this.analysisId = analysisId;
  }
}
const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api';

async function request<T>(path: string, options: RequestInit, timeoutMs: number, read: (response: Response) => Promise<T>): Promise<T> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    const headers = new Headers(options.headers);
    if (options.body && !(options.body instanceof FormData) && !headers.has('Content-Type'))
      headers.set('Content-Type', 'application/json');
    const response = await fetch(baseUrl + path, {
      ...options, credentials: 'include', signal: options.signal ?
        AbortSignal.any([options.signal, controller.signal]) : controller.signal, headers,
    });
    if (!response.ok) {
      const body = await response.json().catch(() => null);
      if (response.status === 401 && !['/auth/login', '/users/me'].includes(path))
        window.dispatchEvent(new Event('session-expired'));
      throw new ApiError(body?.error?.message || 'Não foi possível concluir. Tente novamente.',
        response.status, body?.error?.code || 'UNKNOWN', body?.analysis_id);
    }
    return await read(response);
  } catch (error) {
    if (options.signal?.aborted) throw error;
    if (error instanceof ApiError) throw error;
    if (controller.signal.aborted) {
      const message = path === '/auth/register'
        ? 'O tempo de espera terminou. Tente entrar com o e-mail e a senha informados antes de cadastrar novamente.'
        : path === '/auth/login' ? 'O servidor demorou para responder. Tente entrar novamente.'
        : 'O tempo de espera terminou. Consulte o histórico antes de enviar novamente.';
      throw new ApiError(message, 0, 'CLIENT_TIMEOUT');
    }
    throw new ApiError('Não foi possível conectar ao servidor. Confira a conexão e tente novamente.', 0, 'NETWORK_ERROR');
  } finally { window.clearTimeout(timeout); }
}
export function api<T>(path: string, options: RequestInit = {}, timeoutMs = 15000): Promise<T> {
  return request(path, options, timeoutMs, async response => response.status === 204 ? undefined as T : await response.json() as T);
}
export function apiFile(path: string): Promise<Blob> {
  return request(path, {}, 30000, response => response.blob());
}
