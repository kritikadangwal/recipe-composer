const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

async function request<T>(
  method: string,
  key: string,
  body?: unknown
): Promise<T | null> {
  const res = await fetch(`${BASE_URL}/${encodeURIComponent(key)}`, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Server error: ${res.status}`);
  if (res.status === 201 || res.status === 204) return null;

  const text = await res.text();
  return text ? (JSON.parse(text) as T) : null;
}

export const api = {
  get: <T>(key: string) => request<T>("GET", key),
  set: (key: string, value: unknown) => request("POST", key, value),
  del: (key: string) => request("DELETE", key),
};
