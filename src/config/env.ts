const readBaseUrl = (value: string | undefined): string =>
  (value ?? "").trim().replace(/\/+$/, ""); 

export const ENV = {
  apiBaseUrl: readBaseUrl(import.meta.env.VITE_API_BASE_URL),
} as const;