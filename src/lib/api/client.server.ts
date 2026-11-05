import "server-only";
import { ApiError, parseApiError } from "./errors";

export async function api<T>(
  path: string,
  options: { method?: "GET" | "POST"; body?: unknown; token?: string } = {},
): Promise<T> {
  const base = process.env.API_BASE_URL;
  if (!base)
    throw new ApiError(503, "The service connection has not been configured.");
  let response: Response;
  try {
    const url = new URL(base);
    if (url.protocol !== "https:") throw new Error("HTTPS required");
    response = await fetch(new URL(path, url), {
      method: options.method ?? "GET",
      headers: {
        Accept: "application/json",
        ...(options.body !== undefined
          ? { "Content-Type": "application/json" }
          : {}),
        ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      },
      body:
        options.body !== undefined ? JSON.stringify(options.body) : undefined,
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(10000),
    });
  } catch {
    throw new ApiError(
      503,
      "Unable to connect to the service. Please try again later.",
    );
  }
  const text = await response.text();
  let body: unknown;
  try {
    body = text ? JSON.parse(text) : undefined;
  } catch {
    body = undefined;
  }
  if (!response.ok) throw parseApiError(response.status, body);
  if (response.status !== 204 && body === undefined)
    throw new ApiError(502, "The service returned an invalid response.");
  return body as T;
}
