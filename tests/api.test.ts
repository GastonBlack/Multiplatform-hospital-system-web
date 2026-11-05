import { test, afterEach } from "node:test";
import assert from "node:assert/strict";
import { api } from "../src/lib/api/client.server";
import { ApiError, parseApiError } from "../src/lib/api/errors";
import { login } from "../src/features/auth/api.server";
import { loginValues, validateForm } from "../src/app/(auth)/validation";

const originalFetch = globalThis.fetch;
const originalBase = process.env.API_BASE_URL;
afterEach(() => {
  globalThis.fetch = originalFetch;
  if (originalBase === undefined) delete process.env.API_BASE_URL;
  else process.env.API_BASE_URL = originalBase;
});

test("ValidationProblemDetails fields are normalized and preserved", () => {
  const result = parseApiError(400, {
    title: "Validation failed",
    errors: { Email: ["Invalid email"], FirstName: ["Required"], Bad: 3 },
  });
  assert.deepEqual(result.fields, {
    email: ["Invalid email"],
    firstName: ["Required"],
  });
  assert.equal(result.status, 400);
});
test("custom ErrorResponse uses HTTP status and safe English feedback", () => {
  const result = parseApiError(409, {
    error: "Conflict",
    message: "Development details",
    statusCode: 500,
    traceId: "id",
    timestamp: "date",
  });
  assert.equal(result.status, 409);
  assert.match(result.message, /already exists/);
  assert.doesNotMatch(result.message, /Development/);
});
test("empty and non-JSON 401/403/500 errors are handled", async () => {
  process.env.API_BASE_URL = "https://localhost:7109";
  for (const status of [401, 403, 500]) {
    for (const body of [null, "<html>failure</html>"]) {
      globalThis.fetch = async () => new Response(body, { status });
      await assert.rejects(
        api("/api/auth/session"),
        (error: unknown) =>
          error instanceof ApiError && error.status === status,
      );
    }
  }
});
test("204 logout response is accepted without JSON parsing", async () => {
  process.env.API_BASE_URL = "https://localhost:7109";
  globalThis.fetch = async (_url, init) => {
    assert.equal(init?.method, "POST");
    return new Response(null, { status: 204 });
  };
  assert.equal(
    await api<void>("/api/auth/logout", { method: "POST" }),
    undefined,
  );
});
test("non-JSON success is reported as an invalid response", async () => {
  process.env.API_BASE_URL = "https://localhost:7109";
  globalThis.fetch = async () => new Response("invalid");
  await assert.rejects(
    api("/api/users/me"),
    (error: unknown) => error instanceof ApiError && error.status === 502,
  );
});

test("login sends the new ID contract and preserves 400 versus 401", async () => {
  process.env.API_BASE_URL = "https://localhost:7109";
  const data = new FormData();
  data.set("nationalIdentificationNumber", "01010101");
  data.set("password", " pass ");
  data.set("email", "unused@example.com");
  const { values, errors } = validateForm(data, false);
  assert.deepEqual(errors, {});
  for (const status of [400, 401]) {
    globalThis.fetch = async (url, init) => {
      assert.equal(String(url), "https://localhost:7109/api/auth/login");
      assert.equal(init?.method, "POST");
      assert.deepEqual(JSON.parse(init?.body as string), {
        nationalIdentificationNumber: "01010101",
        password: " pass ",
      });
      return new Response(
        status === 400
          ? JSON.stringify({
              errors: { NationalIdentificationNumber: ["Invalid format"] },
            })
          : null,
        { status },
      );
    };
    await assert.rejects(login(loginValues(values)), (error: unknown) => {
      assert.ok(error instanceof ApiError);
      assert.equal(error.status, status);
      if (status === 400) assert.ok(error.fields.nationalIdentificationNumber);
      else assert.match(error.message, /credentials/);
      return true;
    });
  }
});
