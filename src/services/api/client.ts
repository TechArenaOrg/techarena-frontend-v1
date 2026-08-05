// Real HTTP client for the TechArena backend (https://techarena-api-jnwh.onrender.com).
// Unwraps the backend's { success, data, requestId, timestamp } envelope so callers
// just get `data` back, and throws ApiError on failure.

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

interface ValidationIssue {
  path?: string[];
  message: string;
}

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  message?: string;
  requestId?: string;
  timestamp?: string;
  // NestJS validation failures skip the {success,data} envelope entirely and
  // return {statusCode, message, errors} instead - see ApiError below.
  errors?: ValidationIssue[];
}

export class ApiError extends Error {
  status: number;
  requestId?: string;
  errors?: ValidationIssue[];

  constructor(message: string, status: number, requestId?: string, errors?: ValidationIssue[]) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.requestId = requestId;
    this.errors = errors;
  }
}

const TOKEN_STORAGE_KEY = 'techarena_access_token';

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
  if (typeof window !== 'undefined') {
    if (token) {
      window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  }
}

export function getAuthToken(): string | null {
  if (authToken) return authToken;
  if (typeof window !== 'undefined') {
    authToken = window.localStorage.getItem(TOKEN_STORAGE_KEY);
  }
  return authToken;
}

interface RequestOptions {
  params?: Record<string, string | number | boolean | undefined>;
  token?: string;
  signal?: AbortSignal;
}

function buildUrl(path: string, params?: RequestOptions['params']): string {
  const url = new URL(`${API_BASE_URL}${path}`);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

// The backend is a Render free-tier deploy that cold-starts after idling. The first
// request while it's spinning back up can fail to even connect within fetch's default
// ~10s connect timeout, so retry once after a short delay before giving up.
async function fetchWithColdStartRetry(url: string, init: RequestInit): Promise<Response> {
  try {
    return await fetch(url, init);
  } catch {
    await new Promise((resolve) => setTimeout(resolve, 3000));
    return fetch(url, init);
  }
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  options: RequestOptions = {}
): Promise<T> {
  const token = options.token ?? getAuthToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetchWithColdStartRetry(buildUrl(path, options.params), {
    method,
    headers,
    // The backend also sets an httpOnly `jwt` cookie on login; sending credentials
    // lets that cookie work as a fallback auth path alongside the bearer token.
    credentials: 'include',
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal: options.signal,
  });

  const text = await response.text();
  const json: ApiEnvelope<T> | undefined = text ? JSON.parse(text) : undefined;

  if (!response.ok) {
    const message = json?.errors?.length
      ? json.errors.map((e) => e.message).join(' ')
      : json?.message || response.statusText || 'Request failed';
    throw new ApiError(message, response.status, json?.requestId, json?.errors);
  }
  if (!json) {
    return undefined as T;
  }
  if (!json.success) {
    throw new ApiError(json.message || 'Request failed', response.status, json.requestId);
  }

  return json.data;
}

export const apiClient = {
  get: <T>(path: string, options?: RequestOptions) => request<T>('GET', path, undefined, options),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) => request<T>('POST', path, body, options),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) => request<T>('PUT', path, body, options),
  delete: <T>(path: string, options?: RequestOptions) => request<T>('DELETE', path, undefined, options),
};
