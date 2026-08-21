// Real HTTP client for the TechArena backend (https://techarena-api-jnwh.onrender.com).
// Unwraps the backend's { success, data, requestId, timestamp } envelope so callers
// just get `data` back, and throws ApiError on failure.

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

interface ValidationIssue {
  path?: string[];
  message?: string;
  // Present on some non-validation error shapes instead of `message`, e.g. the
  // out-of-stock 409 from /orders/add: {productId, productName, requestedQuantity, availableStock}.
  [key: string]: unknown;
}

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  message?: string;
  requestId?: string;
  timestamp?: string;
  // Present on validation failures: {success:false, message:"Validation failed", details:[...]}
  details?: ValidationIssue[];
}

export class ApiError extends Error {
  status: number;
  requestId?: string;
  details?: ValidationIssue[];

  constructor(message: string, status: number, requestId?: string, details?: ValidationIssue[]) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.requestId = requestId;
    this.details = details;
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

function looksLikeJson(text: string): boolean {
  const trimmed = text.trimStart();
  return trimmed === '' || trimmed.startsWith('{') || trimmed.startsWith('[');
}

// The backend is a Render free-tier deploy that cold-starts after idling. While it's
// spinning back up, requests can either fail to connect within fetch's default ~10s
// connect timeout, or succeed but come back through Render's proxy as an HTML holding
// page instead of JSON - both are retried once after a short delay before giving up.
async function fetchWithColdStartRetry(url: string, init: RequestInit): Promise<{ response: Response; text: string }> {
  try {
    const response = await fetch(url, init);
    const text = await response.text();
    if (!looksLikeJson(text)) {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      const retryResponse = await fetch(url, init);
      return { response: retryResponse, text: await retryResponse.text() };
    }
    return { response, text };
  } catch {
    await new Promise((resolve) => setTimeout(resolve, 3000));
    const response = await fetch(url, init);
    return { response, text: await response.text() };
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

  const { response, text } = await fetchWithColdStartRetry(buildUrl(path, options.params), {
    method,
    headers,
    // Not 'include': the backend's CORS config returns Access-Control-Allow-Origin: *,
    // which browsers refuse to pair with credentialed requests - sending cookies here
    // would break every client-side (browser) fetch with a CORS error. We don't rely on
    // the httpOnly cookie anyway; auth uses the bearer token above.
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal: options.signal,
  });

  let json: ApiEnvelope<T> | undefined;
  if (text) {
    try {
      json = JSON.parse(text);
    } catch {
      // Even after the cold-start retry, the response still isn't JSON (a Render
      // proxy error page, an nginx timeout page, etc.) - surface a clear message
      // instead of letting the raw SyntaxError bubble up as an unhandled crash.
      throw new ApiError('The server is taking longer than usual to respond. Please try again.', response.status || 503);
    }
  }

  if (!response.ok) {
    // Only build the message from `details` when every entry actually has one
    // (field-validation errors) - other error shapes (e.g. the out-of-stock 409 from
    // /orders/add, which names products via productId/requestedQuantity/availableStock
    // instead) fall back to the top-level `message`, which is already human-readable.
    const detailMessages = json?.details?.every((e) => typeof e.message === 'string')
      ? json!.details!.map((e) => e.message).join(' ')
      : undefined;
    const message = detailMessages || json?.message || response.statusText || 'Request failed';
    throw new ApiError(message, response.status, json?.requestId, json?.details);
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
