import { test, afterEach } from "node:test";
import assert from "node:assert/strict";
import { getValidatedSession } from "../src/features/auth/api.server";
import { isActiveAdmin } from "../src/lib/auth/policy";
import { ApiError } from "../src/lib/api/errors";

const originalFetch = globalThis.fetch;
const originalBase = process.env.API_BASE_URL;
afterEach(() => {
  globalThis.fetch = originalFetch;
  if (originalBase === undefined) delete process.env.API_BASE_URL;
  else process.env.API_BASE_URL = originalBase;
});
const session = {
  userId: "account",
  sessionId: "session",
  profileType: 3,
  accountStatus: 2,
};

function backend(body: unknown, status = 200) {
  process.env.API_BASE_URL = "https://localhost:7109";
  globalThis.fetch = async (_url, init) => {
    assert.equal(init?.cache, "no-store");
    assert.equal(
      (init?.headers as Record<string, string>).Authorization,
      "Bearer test-token",
    );
    return new Response(body === undefined ? null : JSON.stringify(body), {
      status,
    });
  };
}
test("missing session does not call the backend", async () => {
  globalThis.fetch = async () => {
    throw new Error("must not fetch");
  };
  assert.equal(await getValidatedSession(undefined), null);
  assert.equal(isActiveAdmin(null), false);
});
test("invalid or revoked token returns no session even with an empty 401", async () => {
  backend(undefined, 401);
  assert.equal(await getValidatedSession("test-token"), null);
});
test("missing role denies Admin, even for Staff", async () => {
  backend(session);
  assert.equal(isActiveAdmin(await getValidatedSession("test-token")), false);
});
test("Receptionist denies Admin", async () => {
  backend({ ...session, role: "Receptionist" });
  assert.equal(isActiveAdmin(await getValidatedSession("test-token")), false);
});

test("null roles and non-administrative roles preserve sessions but deny Admin", async () => {
  for (const role of [null, "Patient", "Doctor", "Staff", "administrator", ""]) {
    backend({ ...session, role });
    const result = await getValidatedSession("test-token");
    assert.ok(result);
    assert.equal(isActiveAdmin(result), false);
  }
});

test("malformed role is rejected instead of granting permissions", async () => {
  backend({ ...session, role: ["Administrator"] });
  await assert.rejects(getValidatedSession("test-token"), (error: unknown) => error instanceof ApiError && error.status === 502);
});
test("every non-active Administrator denies Admin", async () => {
  for (const accountStatus of [1, 3, 4]) {
    backend({ ...session, accountStatus, role: "Administrator" });
    const result = await getValidatedSession("test-token");
    assert.ok(result, "non-active accounts retain own-profile access");
    assert.equal(isActiveAdmin(result), false);
  }
});
test("active Administrator confirmed by backend is authorized", async () => {
  backend({ ...session, role: "Administrator" });
  assert.equal(isActiveAdmin(await getValidatedSession("test-token")), true);
});
test("permissions are fetched again; revocation is not cached", async () => {
  backend({ ...session, role: "Administrator" });
  assert.equal(isActiveAdmin(await getValidatedSession("test-token")), true);
  backend({ ...session, role: "Receptionist" });
  assert.equal(isActiveAdmin(await getValidatedSession("test-token")), false);
});
test("connection failure remains a service error, not invalid credentials", async () => {
  process.env.API_BASE_URL = "https://localhost:7109";
  globalThis.fetch = async () => {
    throw new TypeError("offline");
  };
  await assert.rejects(
    getValidatedSession("test-token"),
    (error: unknown) => error instanceof ApiError && error.status === 503,
  );
});
test("malformed successful session never authorizes", async () => {
  backend({ role: "Administrator", accountStatus: 2 });
  await assert.rejects(
    getValidatedSession("test-token"),
    (error: unknown) => error instanceof ApiError && error.status === 502,
  );
});
