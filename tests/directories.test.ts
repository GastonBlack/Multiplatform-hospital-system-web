import { test, before, afterEach, mock } from "node:test";
import assert from "node:assert/strict";
import {
  directoryQuery,
  directoryHref,
  directoryPages,
} from "../src/app/(admin)/admin/directory-query";
import type { DirectorySection } from "../src/features/admin/types";

mock.module("next/navigation", {
  exports: {
    redirect: (path: string) => {
      throw new Error(`REDIRECT:${path}`);
    },
  },
});
let loadDirectory: typeof import("../src/app/(admin)/admin/directory.server").loadDirectory;
before(async () => {
  ({ loadDirectory } =
    await import("../src/app/(admin)/admin/directory.server"));
});
const originalFetch = globalThis.fetch;
const originalBase = process.env.API_BASE_URL;
afterEach(() => {
  globalThis.fetch = originalFetch;
  if (originalBase === undefined) delete process.env.API_BASE_URL;
  else process.env.API_BASE_URL = originalBase;
});

test("directories use fixed page sizes, resource-specific filters and unchanged identification strings", () => {
  for (const section of ["doctors", "staff"] as const) {
    const query = directoryQuery(section, {
      page: "2",
      pageSize: "10000",
      name: " Ana ",
      email: "@example",
      nationalIdentificationNumber: "01234567",
      employeeNumber: "EMP-",
      accountStatus: "Active",
      staffRole: "Receptionist",
      medicalLicenseNumber: "MED-",
      token: "forged",
    });
    assert.equal(query.get("pageSize"), "25");
    assert.equal(query.get("page"), "2");
    assert.equal(query.get("name"), "Ana");
    assert.equal(query.get("email"), "@example");
    assert.equal(query.get("nationalIdentificationNumber"), "01234567");
    assert.equal(query.has("token"), false);
    assert.equal(query.has("staffRole"), section === "staff");
    assert.equal(query.has("medicalLicenseNumber"), section === "doctors");
  }
  assert.equal(
    directoryQuery("doctors", {
      nationalIdentificationNumber: " 01234567",
    }).get("nationalIdentificationNumber"),
    " 01234567",
  );
  assert.equal(
    directoryQuery("staff", { name: "  ", email: "" }).has("name"),
    false,
  );
});

test("search resets the page and pagination preserves applied filters with bounded page links", () => {
  const params = {
    name: "Ana & Perez",
    nationalIdentificationNumber: "01234567",
    page: "5",
  };
  const search = new URL(directoryHref("doctors", params), "https://mhs.local");
  assert.equal(search.searchParams.get("page"), "1");
  const next = new URL(
    directoryHref("doctors", params, 6),
    "https://mhs.local",
  );
  assert.equal(next.searchParams.get("page"), "6");
  assert.equal(next.searchParams.get("name"), "Ana & Perez");
  assert.equal(
    next.searchParams.get("nationalIdentificationNumber"),
    "01234567",
  );
  assert.deepEqual(directoryPages(1, 0), []);
  assert.deepEqual(directoryPages(1, 1), [1]);
  assert.deepEqual(directoryPages(4, 1000), [1, 2, 3, 4, 5, 6, 1000]);
});

function backend(section: DirectorySection, status: number, body: unknown) {
  process.env.API_BASE_URL = "https://localhost:7109";
  globalThis.fetch = async (url, init) => {
    const request = new URL(String(url));
    assert.equal(request.pathname, `/api/${section}`);
    assert.equal(request.searchParams.get("page"), "2");
    assert.equal(request.searchParams.get("pageSize"), "25");
    assert.equal(request.searchParams.get("email"), "@example");
    assert.equal(init?.method, "GET");
    assert.equal(init?.cache, "no-store");
    assert.equal(
      (init?.headers as Record<string, string>).Authorization,
      "Bearer admin-token",
    );
    return new Response(body === undefined ? null : JSON.stringify(body), {
      status,
    });
  };
}

test("both directories return real items and pagination metadata including legacy null IDs", async () => {
  for (const section of ["doctors", "staff"] as const) {
    const item = {
      userId: "user",
      firstName: "Ana",
      lastName: "Perez",
      email: "ana@example.com",
      nationalIdentificationNumber: null,
      employeeNumber: "EMP-000001",
      accountStatus: "Active",
      ...(section === "doctors"
        ? { doctorId: "doctor", medicalLicenseNumber: "MED-12345" }
        : { staffId: "staff", staffRole: "Receptionist" }),
    };
    const body = {
      items: [item],
      page: 2,
      pageSize: 25,
      totalCount: 26,
      totalPages: 2,
    };
    backend(section, 200, body);
    const result = await loadDirectory(section, "admin-token", {
      page: "2",
      email: "@example",
    });
    assert.deepEqual(result.data, body);
    assert.equal(result.message, undefined);
    assert.doesNotMatch(JSON.stringify(result), /admin-token/);
  }
});

test("empty results and out-of-range pages retain backend metadata", async () => {
  const body = {
    items: [],
    page: 2,
    pageSize: 25,
    totalCount: 0,
    totalPages: 0,
  };
  backend("doctors", 200, body);
  assert.deepEqual(
    (
      await loadDirectory("doctors", "admin-token", {
        page: "2",
        email: "@example",
      })
    ).data,
    body,
  );
});

test("directory validation errors retain applied filters and suppress raw diagnostics", async () => {
  backend("doctors", 400, {
    errors: {
      NationalIdentificationNumber: ["Private diagnostic"],
      Page: ["Private diagnostic"],
    },
  });
  const result = await loadDirectory("doctors", "admin-token", {
    page: "2",
    email: "@example",
    nationalIdentificationNumber: "bad-id",
  });
  assert.equal(result.data, null);
  assert.equal(result.query.nationalIdentificationNumber, "bad-id");
  assert.ok(result.errors?.nationalIdentificationNumber);
  assert.ok(result.errors?.page);
  assert.doesNotMatch(JSON.stringify(result), /Private diagnostic/);
});

test("directory 401 enters renewal with the current page and filters", async () => {
  backend("staff", 401, undefined);
  await assert.rejects(
    loadDirectory("staff", "admin-token", { page: "2", email: "@example" }),
    (error: unknown) => {
      assert.ok(error instanceof Error);
      const url = new URL(
        error.message.replace("REDIRECT:", ""),
        "https://mhs.local",
      );
      assert.equal(url.pathname, "/session/refresh");
      const returnTo = new URL(
        url.searchParams.get("returnTo")!,
        "https://mhs.local",
      );
      assert.equal(returnTo.pathname, "/admin/staff");
      assert.equal(returnTo.searchParams.get("page"), "2");
      assert.equal(returnTo.searchParams.get("email"), "@example");
      return true;
    },
  );
});

test("directory access denial and service failures remain errors instead of empty directories", async () => {
  for (const status of [403, 500]) {
    backend("staff", status, { message: "Private diagnostic" });
    const result = await loadDirectory("staff", "admin-token", {
      page: "2",
      email: "@example",
    });
    assert.equal(result.data, null);
    assert.ok(result.message);
    assert.doesNotMatch(result.message!, /Private diagnostic/);
  }
  globalThis.fetch = async () => {
    throw new TypeError("Private diagnostic");
  };
  const result = await loadDirectory("staff", "admin-token", {});
  assert.equal(result.data, null);
  assert.match(result.message!, /Unable to connect/);
});
