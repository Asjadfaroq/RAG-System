/** API base URL from env. Set NEXT_PUBLIC_API_BASE_URL in .env.local (e.g. http://localhost:5224). */
export function getApiBase(): string {
  const url = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5224";
  return url.trim();
}

export async function readResponseBody(res: Response): Promise<unknown | null> {
  const raw = await res.text();
  if (!raw) return null;
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return raw;
  }
}

const MAX_ERROR_LENGTH = 120;

function sanitizeUserMessage(msg: string): string {
  if (msg.length <= MAX_ERROR_LENGTH) return msg;
  return msg.slice(0, MAX_ERROR_LENGTH).trim() + "…";
}

export function formatError(status: number, body: unknown): string {
  let msg = "Something went wrong. Please try again.";
  if (typeof body === "string" && body.trim().length > 0) {
    msg = body.trim();
  } else if (body && typeof body === "object") {
    const obj = body as Record<string, unknown>;
    if (typeof obj.detail === "string" && obj.detail.trim().length > 0)
      msg = obj.detail.trim();
    else if (typeof obj.title === "string" && obj.title.trim().length > 0)
      msg = obj.title.trim();
    else if (typeof obj.error === "string" && obj.error.trim().length > 0)
      msg = obj.error.trim();
  }
  return sanitizeUserMessage(msg);
}

/** Safe error message for user display. Truncates long messages. */
export function getUserFriendlyError(err: unknown, fallback: string): string {
  const msg = err instanceof Error ? err.message : fallback;
  return sanitizeUserMessage(msg || fallback);
}

export const AUTH_KEY = "di_auth";
export type StoredPrefill = { tenantSlug?: string };
export type AuthResponse = { tenantId: string; email: string; role: string };
