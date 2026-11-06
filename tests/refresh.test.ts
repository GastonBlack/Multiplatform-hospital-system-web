import { test, afterEach } from "node:test";
import assert from "node:assert/strict";
import { resolveSessionTokens } from "../src/lib/auth/renewal.server";
import {
  accessCookie,
  refreshCookie,
  tokenCookies,
} from "../src/lib/auth/token-cookies";
import { safeReturnPath, renewalPath } from "../src/lib/auth/return-path";
import { ApiError } from "../src/lib/api/errors";

const originalFetch = globalThis.fetch;
const originalBase = process.env.API_BASE_URL;
afterEach(() => {
  globalThis.fetch = originalFetch;
  if (originalBase === undefined) delete process.env.API_BASE_URL;
  else process.env.API_BASE_URL = originalBase;
});
function tokens() {
  return {
    accessToken: "new-access-token",
    refreshToken: "B".repeat(64),
    accessTokenExpiresAt: new Date(Date.now() + 900000).toISOString(),
    sessionExpiresAt: new Date(Date.now() + 86400000).toISOString(),
  };
}
function backend(handler: (path: string, init?: RequestInit) => Response) {
  process.env.API_BASE_URL = "https://localhost:7109";
  globalThis.fetch = async (url, init) => {
    assert.equal(init?.cache, "no-store");
    return handler(new URL(String(url)).pathname, init);
  };
}

test("both token cookies are HttpOnly and use the backend expiration dates", () => {
  const response = tokens();
  const result = tokenCookies(response, true);
  assert.deepEqual(
    result.map((c) => c.name),
    [accessCookie, refreshCookie],
  );
  for (const cookie of result) {
    assert.equal(cookie.options.httpOnly, true);
    assert.equal(cookie.options.secure, true);
    assert.equal(cookie.options.sameSite, "lax");
    assert.equal(cookie.options.path, "/");
  }
  assert.equal(
    result[0].options.expires.toISOString(),
    response.accessTokenExpiresAt,
  );
  assert.equal(
    result[1].options.expires.toISOString(),
    response.sessionExpiresAt,
  );
  assert.equal(tokenCookies(response, false)[0].options.secure, false);
});

test("invalid token responses are rejected before writing either cookie", () => {
  const response = tokens();
  for (const invalid of [
    { ...response, refreshToken: "short" },
    { ...response, refreshToken: "A".repeat(64) + "\n" },
    { ...response, accessToken: "" },
    { ...response, accessTokenExpiresAt: "invalid" },
    { ...response, accessTokenExpiresAt: new Date(0).toISOString() },
    { ...response, sessionExpiresAt: new Date(Date.now() + 100).toISOString() },
  ])
    assert.throws(() => tokenCookies(invalid, false), ApiError);
});

test("no tokens means no refresh request", async () => {
  globalThis.fetch = async () => {
    throw new Error("must not fetch");
  };
  assert.deepEqual(await resolveSessionTokens(), { kind: "expired" });
});

test("a session already renewed by another tab does not rotate again", async () => {
  let requests = 0;
  backend((path) => {
    requests++;
    assert.equal(path, "/api/auth/session");
    return Response.json({
      userId: "user",
      sessionId: "session",
      profileType: 1,
      accountStatus: 1,
      role: "Patient",
    });
  });
  assert.deepEqual(await resolveSessionTokens("current", "A".repeat(64)), {
    kind: "current",
    accessToken: "current",
  });
  assert.equal(requests, 1);
});

test("expired access rotates using the refresh token only on the server", async () => {
  const response = tokens();
  const paths: string[] = [];
  backend((path, init) => {
    paths.push(path);
    if (path === "/api/auth/session")
      return new Response(null, { status: 401 });
    assert.equal(path, "/api/auth/refresh");
    assert.equal(init?.method, "POST");
    assert.deepEqual(JSON.parse(init?.body as string), {
      refreshToken: "A".repeat(64),
    });
    assert.equal(
      (init?.headers as Record<string, string>).Authorization,
      undefined,
    );
    return Response.json(response);
  });
  assert.deepEqual(await resolveSessionTokens("expired", "A".repeat(64)), {
    kind: "renewed",
    tokens: response,
  });
  assert.deepEqual(paths, ["/api/auth/session", "/api/auth/refresh"]);
});

test("missing access cookie can still renew, and the replacement refresh token is retained", async () => {
  const response = tokens();
  backend((path) => {
    assert.equal(path, "/api/auth/refresh");
    return Response.json(response);
  });
  const result = await resolveSessionTokens(undefined, "A".repeat(64));
  assert.equal(result.kind, "renewed");
  if (result.kind === "renewed") {
    assert.equal(
      tokenCookies(result.tokens, true)[1].value,
      response.refreshToken,
    );
    assert.notEqual(response.refreshToken, "A".repeat(64));
  }
});

test("invalid, revoked or expired refresh tokens request a new login", async () => {
  for (const status of [400, 401]) {
    backend(() => new Response(null, { status }));
    assert.deepEqual(await resolveSessionTokens(undefined, "A".repeat(64)), {
      kind: "expired",
    });
  }
});

test("refresh connection failures stay service errors and are not retried automatically", async () => {
  let requests = 0;
  backend(() => {
    requests++;
    return new Response(null, { status: 503 });
  });
  await assert.rejects(
    resolveSessionTokens(undefined, "A".repeat(64)),
    (error: unknown) => error instanceof ApiError && error.status === 503,
  );
  assert.equal(requests, 1);
});

test("successful refresh with a malformed replacement is not accepted", async () => {
  backend(() => Response.json({ ...tokens(), refreshToken: "invalid" }));
  await assert.rejects(
    resolveSessionTokens(undefined, "A".repeat(64)),
    (error: unknown) => error instanceof ApiError && error.status === 502,
  );
});

test("refresh returns only to supported same-origin pages without loops or open redirects", () => {
  for (const path of [
    "/",
    "/profile",
    "/admin",
    "/admin/doctors",
    "/admin/staff?tab=list",
  ])
    assert.equal(safeReturnPath(path), path);
  for (const path of [
    undefined,
    "https://evil.example",
    "//evil.example",
    "/\\evil.example",
    "/session/refresh",
    "/login",
    "/admin/unknown",
  ])
    assert.equal(safeReturnPath(path), "/");
  assert.equal(
    renewalPath("/admin/doctors"),
    "/session/refresh?returnTo=%2Fadmin%2Fdoctors",
  );
});
