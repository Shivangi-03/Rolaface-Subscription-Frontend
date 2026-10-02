import { isAxiosError } from "axios";

export interface ApiError {
  title?: string;
  message: string;
  status?: number;
}

const stripHtml = (html: string): string =>
  new DOMParser().parseFromString(html, "text/html").body.textContent?.trim() ?? "";

const parseServerMessages = (raw: unknown): string[] => {
  if (typeof raw !== "string") return [];
  try {
    const outer: unknown = JSON.parse(raw);
    if (!Array.isArray(outer)) return [];
    return outer
      .map((item) => {
        try {
          const inner = typeof item === "string" ? JSON.parse(item) : item;
          return stripHtml(String((inner as { message?: unknown })?.message ?? ""));
        } catch {
          return stripHtml(String(item));
        }
      })
      .filter(Boolean);
  } catch {
    return [];
  }
};

const asText = (v: unknown): string => (typeof v === "string" ? stripHtml(v) : "");

export const isCanceled = (err: unknown): boolean =>
  isAxiosError(err) ? err.code === "ERR_CANCELED" : err instanceof DOMException && err.name === "AbortError";

export const toApiError = (err: unknown): ApiError => {
  if (isAxiosError(err)) {
    const res = err.response;
    const body = res?.data && typeof res.data === "object" ? (res.data as Record<string, unknown>) : undefined;

    const message =
      parseServerMessages(body?._server_messages).join("\n") ||
      asText(body?.message) ||
      asText(body?.exception) ||
      err.message;

    const title =
      asText(body?.exc_type) ||
      (res ? `${res.status} ${res.statusText}`.trim() : err.code) ||
      undefined;

    return { title, message, status: res?.status };
  }

  if (err instanceof Error) return { message: err.message };
  return { message: String(err) };
};