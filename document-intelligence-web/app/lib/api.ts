export async function readResponseBody(res: Response): Promise<unknown | null> {
  const raw = await res.text();
  if (!raw) return null;
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return raw;
  }
}

export function formatError(status: number, body: unknown): string {
  if (typeof body === "string" && body.trim().length > 0) return body;
  if (body && typeof body === "object") return JSON.stringify(body);
  return `Request failed with status ${status}.`;
}

export const AUTH_KEY = "di_auth";
export type StoredPrefill = { apiBase?: string; tenantSlug?: string };
export type AuthResponse = { tenantId: string; email: string; role: string };
