const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export type ApiResult<T> =
  | { data: T; error: null }
  | { data: null; error: string };

async function request<T>(
  method: string,
  key: string,
  body?: unknown
): Promise<ApiResult<T>> {
  try {
    const res = await fetch(`${BASE_URL}/${encodeURIComponent(key)}`, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (res.status === 404) return { data: null as T, error: null };
    if (!res.ok) return { data: null, error: `Server error: ${res.status}` };
    if (res.status === 201 || res.status === 204) return { data: null as T, error: null };

    const text = await res.text();
    const data = text ? (JSON.parse(text) as T) : (null as T);
    return { data, error: null };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Network error";
    return { data: null, error: message };
  }
}

export const api = {
  get: <T>(key: string) => request<T>("GET", key),
  set: (key: string, value: unknown) => request("POST", key, value),
  del: (key: string) => request("DELETE", key),
};
