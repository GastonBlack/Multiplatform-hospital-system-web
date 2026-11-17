import { test, before, beforeEach, afterEach, mock } from "node:test";
import assert from "node:assert/strict";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

let jar = new Map<string, string>();
let changes: string[] = [];
let calls: { path: string; init?: RequestInit }[] = [];
let sessionStatus = 200;
let loginStatus = 200;
let logoutStatus = 204;
let offline = false;
const originalFetch = globalThis.fetch;
const originalBase = process.env.API_BASE_URL;
const session = {
  userId: "current-user",
  sessionId: "current-session",
  profileType: 1,
  accountStatus: 2,
  role: "Patient",
};

mock.module("next/navigation", {
  exports: {
    redirect: (path: string) => {
      throw new Error(`REDIRECT:${path}`);
    },
  },
});
mock.module("next/headers", {
  exports: {
    headers: async () => new Headers({ "x-mhs-return-path": "/" }),
    cookies: async () => ({
      get: (name: string) =>
        jar.has(name) ? { value: jar.get(name) } : undefined,
      set: (name: string, value: string) => {
        jar.set(name, value);
        changes.push(`set:${name}`);
      },
      delete: (name: string) => {
        jar.delete(name);
        changes.push(`delete:${name}`);
      },
    }),
  },
});
mock.module(
  pathToFileURL(resolve("src/app/(auth)/components/login-page.tsx")).href,
  { exports: { LoginPageView: () => null } },
);

let actions: typeof import("../src/app/(auth)/actions");
let LoginPage: typeof import("../src/app/(auth)/login/page").default;
before(async () => {
  actions = await import("../src/app/(auth)/actions");
  ({ default: LoginPage } = await import("../src/app/(auth)/login/page"));
});
beforeEach(() => {
  jar = new Map();
  changes = [];
  calls = [];
  sessionStatus = 200;
  loginStatus = 200;
  logoutStatus = 204;
  offline = false;
  process.env.API_BASE_URL = "https://localhost:7109";
  globalThis.fetch = async (url, init) => {
    const path = new URL(String(url)).pathname;
    calls.push({ path, init });
    assert.equal(init?.cache, "no-store");
    if (offline) throw new TypeError("Private connection diagnostic");
    if (path === "/api/auth/session")
      return new Response(
        sessionStatus === 200 ? JSON.stringify(session) : null,
        { status: sessionStatus },
      );
    if (path === "/api/auth/login")
      return new Response(
        loginStatus === 200 ? JSON.stringify(tokens()) : null,
        { status: loginStatus },
      );
    if (path === "/api/auth/logout")
      return new Response(null, { status: logoutStatus });
    if (path === "/api/auth/refresh")
      return new Response(JSON.stringify(tokens()));
    throw new Error(`Unexpected request: ${path}`);
  };
});
afterEach(() => {
  globalThis.fetch = originalFetch;
  if (originalBase === undefined) delete process.env.API_BASE_URL;
  else process.env.API_BASE_URL = originalBase;
});
function tokens() {
  return {
    accessToken: "new-access",
    refreshToken: "B".repeat(64),
    accessTokenExpiresAt: new Date(Date.now() + 900000).toISOString(),
    sessionExpiresAt: new Date(Date.now() + 86400000).toISOString(),
  };
}
function signedIn() {
  jar.set("mhs_access", "current-access");
  jar.set("mhs_refresh", "A".repeat(64));
}
function credentials() {
  const data = new FormData();
  data.set("nationalIdentificationNumber", "01234567");
  data.set("password", " pass ");
  return data;
}
const page = () => LoginPage({ searchParams: Promise.resolve({}) });

test("anonymous visitors can open login without authentication requests or cookie changes", async () => {
  const result = await page();
  assert.equal(result.props.unavailable, false);
  assert.deepEqual(calls, []);
  assert.deepEqual(changes, []);
});

test("a valid session redirects login to the current profile without replacing or clearing tokens", async () => {
  signedIn();
  await assert.rejects(page(), /REDIRECT:\/profile$/);
  assert.deepEqual(
    calls.map((call) => call.path),
    ["/api/auth/session"],
  );
  assert.equal(jar.get("mhs_access"), "current-access");
  assert.deepEqual(changes, []);
});

test("submitting another login from an old tab preserves the current account", async () => {
  signedIn();
  await assert.rejects(
    actions.loginAction({}, credentials()),
    /REDIRECT:\/profile$/,
  );
  assert.deepEqual(
    calls.map((call) => call.path),
    ["/api/auth/session"],
  );
  assert.equal(jar.get("mhs_access"), "current-access");
  assert.deepEqual(changes, []);
});

test("an expired access token enters existing renewal with profile as the destination", async () => {
  signedIn();
  sessionStatus = 401;
  await assert.rejects(
    page(),
    /REDIRECT:\/session\/refresh\?returnTo=%2Fprofile$/,
  );
  await assert.rejects(
    actions.loginAction({}, credentials()),
    /REDIRECT:\/session\/refresh\?returnTo=%2Fprofile$/,
  );
  assert.equal(
    calls.some((call) => call.path === "/api/auth/login"),
    false,
  );
  assert.deepEqual(changes, []);
});

test("unavailable account checks keep an explicit logout path and block account replacement", async () => {
  signedIn();
  offline = true;
  const result = await page();
  assert.equal(result.props.unavailable, true);
  const feedback = await actions.loginAction({}, credentials());
  assert.match(feedback.message!, /Unable to connect/);
  assert.equal(
    calls.some((call) => call.path === "/api/auth/login"),
    false,
  );
  assert.deepEqual(changes, []);
});

test("after signing out, an anonymous login saves only the new session and preserves credential strings", async () => {
  await assert.rejects(
    actions.loginAction({}, credentials()),
    /REDIRECT:\/profile$/,
  );
  assert.deepEqual(JSON.parse(calls[0].init?.body as string), {
    nationalIdentificationNumber: "01234567",
    password: " pass ",
  });
  assert.equal(jar.get("mhs_access"), "new-access");
  assert.equal(jar.get("mhs_refresh"), "B".repeat(64));
  assert.deepEqual(changes, ["set:mhs_access", "set:mhs_refresh"]);
});

test("incorrect credentials never write session cookies", async () => {
  loginStatus = 401;
  assert.match(
    (await actions.loginAction({}, credentials())).message!,
    /Incorrect ID or password/,
  );
  assert.deepEqual(changes, []);
});

test("unavailable-account logout revokes remotely when the API is reachable and clears both cookies", async () => {
  signedIn();
  await assert.rejects(actions.logoutOnThisDeviceAction(), /REDIRECT:\/login$/);
  assert.deepEqual(
    calls.map((call) => call.path),
    ["/api/auth/session", "/api/auth/logout"],
  );
  assert.equal(calls[1].init?.method, "POST");
  assert.equal(jar.size, 0);
  assert.deepEqual(changes, ["delete:mhs_access", "delete:mhs_refresh"]);
});

test("explicit device logout recovers from an outage while ordinary logout retains its retry behavior", async () => {
  signedIn();
  offline = true;
  assert.match((await actions.logoutAction()).message!, /Unable to connect/);
  assert.equal(jar.size, 2);
  await assert.rejects(actions.logoutOnThisDeviceAction(), /REDIRECT:\/login$/);
  assert.equal(jar.size, 0);
  assert.deepEqual(changes, ["delete:mhs_access", "delete:mhs_refresh"]);
  assert.equal((await page()).props.unavailable, false);
});

test("explicit device logout also clears cookies if remote revocation fails", async () => {
  signedIn();
  logoutStatus = 503;
  await assert.rejects(actions.logoutOnThisDeviceAction(), /REDIRECT:\/login$/);
  assert.equal(jar.size, 0);
  assert.equal(
    calls.filter((call) => call.path === "/api/auth/logout").length,
    1,
  );
});

test("sign-out with expired access uses the existing refresh flow before revoking and clearing", async () => {
  signedIn();
  sessionStatus = 401;
  await assert.rejects(actions.logoutOnThisDeviceAction(), /REDIRECT:\/login$/);
  assert.deepEqual(
    calls.map((call) => call.path),
    ["/api/auth/session", "/api/auth/refresh", "/api/auth/logout"],
  );
  assert.equal(
    (calls[2].init?.headers as Record<string, string>).Authorization,
    "Bearer new-access",
  );
  assert.equal(jar.size, 0);
});

test("device logout with no cookies returns to login without contacting the backend", async () => {
  await assert.rejects(actions.logoutOnThisDeviceAction(), /REDIRECT:\/login$/);
  assert.deepEqual(calls, []);
  assert.equal(jar.size, 0);
});
