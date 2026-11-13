import { test, before, afterEach, mock } from "node:test";
import assert from "node:assert/strict";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { validateDoctorRegistration } from "../src/app/(admin)/admin/doctors/validation";
import { getValidatedSession } from "../src/features/auth/api.server";

let accessToken: string | undefined = "admin-token";
let refreshToken: string | undefined;
let session: unknown;
let registrationStatus = 201;
let registrationBody: unknown;
let posted: Record<string, unknown>[] = [];
const originalFetch = globalThis.fetch;
const originalBase = process.env.API_BASE_URL;

mock.module("next/navigation", {
  exports: {
    redirect: (path: string) => {
      throw new Error(`REDIRECT:${path}`);
    },
    notFound: () => {
      throw new Error("NOT_FOUND");
    },
  },
});
mock.module("next/headers", {
  exports: {
    headers: async () => new Headers({ "x-mhs-return-path": "/admin/doctors" }),
  },
});
mock.module(pathToFileURL(resolve("src/lib/auth/session.server.ts")).href, {
  exports: {
    readToken: async () => accessToken,
    readRefreshToken: async () => refreshToken,
  },
});
mock.module(
  pathToFileURL(resolve("src/app/(admin)/components/employee-management.tsx"))
    .href,
  {
    exports: { EmployeeManagement: () => null },
  },
);

let registerDoctorAction: typeof import("../src/app/(admin)/admin/doctors/actions").registerDoctorAction;
let DoctorsPage: typeof import("../src/app/(admin)/admin/doctors/page").default;
let StaffPage: typeof import("../src/app/(admin)/admin/staff/page").default;
before(async () => {
  ({ registerDoctorAction } =
    await import("../src/app/(admin)/admin/doctors/actions"));
  ({ default: DoctorsPage } =
    await import("../src/app/(admin)/admin/doctors/page"));
  ({ default: StaffPage } =
    await import("../src/app/(admin)/admin/staff/page"));
});

afterEach(() => {
  globalThis.fetch = originalFetch;
  if (originalBase === undefined) delete process.env.API_BASE_URL;
  else process.env.API_BASE_URL = originalBase;
});

const administrator = {
  userId: "admin",
  sessionId: "session",
  profileType: 3,
  accountStatus: 2,
  role: "Administrator",
};
const response = {
  userId: "doctor-user",
  doctorId: "doctor",
  employeeNumber: "EMP-000001",
  medicalLicenseNumber: "MED-12345",
  accountStatus: "Active",
};
function form(overrides: Record<string, string> = {}) {
  const data = new FormData();
  Object.entries({
    firstName: "Ana",
    lastName: "Perez",
    email: " Ana@Example.com ",
    nationalIdentificationNumber: "01234567",
    password: " pass ",
    medicalLicenseNumber: "MED-12345",
    ...overrides,
  }).forEach(([name, value]) => data.set(name, value));
  return data;
}

function backend(
  value: unknown = administrator,
  status = 201,
  body: unknown = response,
) {
  session = value;
  registrationStatus = status;
  registrationBody = body;
  accessToken = "admin-token";
  refreshToken = undefined;
  posted = [];
  process.env.API_BASE_URL = "https://localhost:7109";
  globalThis.fetch = async (url, init) => {
    assert.equal(init?.cache, "no-store");
    assert.equal(
      (init?.headers as Record<string, string>).Authorization,
      "Bearer admin-token",
    );
    if (new URL(String(url)).pathname === "/api/auth/session")
      return new Response(session ? JSON.stringify(session) : null, {
        status: session ? 200 : 401,
      });
    if (
      init?.method === "GET" &&
      ["/api/doctors", "/api/staff"].includes(new URL(String(url)).pathname)
    ) {
      return new Response(
        JSON.stringify({
          items: [],
          page: 1,
          pageSize: 25,
          totalCount: 0,
          totalPages: 0,
        }),
      );
    }
    assert.equal(String(url), "https://localhost:7109/api/doctors/register");
    assert.equal(init?.method, "POST");
    assert.equal(
      (init?.headers as Record<string, string>)["Content-Type"],
      "application/json",
    );
    posted.push(JSON.parse(init?.body as string));
    return new Response(
      registrationBody === undefined ? null : JSON.stringify(registrationBody),
      { status: registrationStatus },
    );
  };
}

test("doctor registration validates required fields and ignores generated and privileged fields", () => {
  const { values, errors } = validateDoctorRegistration(
    form({
      employeeNumber: "EMP-FAKE",
      accountStatus: "Active",
      role: "Administrator",
      profileType: "Staff",
    }),
  );
  assert.deepEqual(errors, {});
  assert.equal(values.nationalIdentificationNumber, "01234567");
  assert.equal(values.password, " pass ");
  assert.equal(values.email, "ana@example.com");
  assert.deepEqual(
    Object.keys(values).sort(),
    [
      "email",
      "firstName",
      "lastName",
      "medicalLicenseNumber",
      "nationalIdentificationNumber",
      "password",
    ].sort(),
  );
  for (const name of Object.keys(values))
    assert.ok(validateDoctorRegistration(form({ [name]: "" })).errors[name]);
});

test("doctor registration rejects invalid identifiers, lengths, emails and non-text values", () => {
  for (const id of [
    "1234567",
    "123456789",
    " 01234567",
    "01234567\n",
    "01.234.567",
    "01-234567",
    "０１２３４５６７",
  ])
    assert.ok(
      validateDoctorRegistration(form({ nationalIdentificationNumber: id }))
        .errors.nationalIdentificationNumber,
    );
  for (const [name, value] of [
    ["firstName", "A"],
    ["lastName", "x".repeat(121)],
    ["password", "12345"],
    ["password", "1234567890123"],
    ["email", "a b@example.com"],
    ["email", "a".repeat(140) + "@example.com"],
    ["medicalLicenseNumber", "   "],
  ])
    assert.ok(validateDoctorRegistration(form({ [name]: value })).errors[name]);
  const data = form();
  data.set("nationalIdentificationNumber", new Blob(["01234567"]), "id.txt");
  assert.ok(
    validateDoctorRegistration(data).errors.nationalIdentificationNumber,
  );
});

test("active backend-validated Administrator registers a doctor and receives only safe confirmation", async () => {
  backend();
  assert.ok(await DoctorsPage());
  assert.ok(await StaffPage());
  const result = await registerDoctorAction({}, form());
  assert.deepEqual(result, {
    success: true,
    message: "Doctor registered successfully.",
    employeeNumber: "EMP-000001",
  });
  assert.deepEqual(posted, [validateDoctorRegistration(form()).values]);
  assert.equal("password" in result, false);
  assert.equal("token" in result, false);
  assert.equal(response.accountStatus, "Active");
});

test("registration action rejects missing sessions, every non-admin role and inactive administrators", async () => {
  for (const value of [
    null,
    { ...administrator, role: undefined },
    { ...administrator, role: null },
    ...["Patient", "Doctor", "Receptionist", "Staff", "administrator"].map(
      (role) => ({ ...administrator, role }),
    ),
    ...[1, 3, 4].map((accountStatus) => ({ ...administrator, accountStatus })),
  ]) {
    backend(value);
    await assert.rejects(DoctorsPage(), /NOT_FOUND/);
    await assert.rejects(StaffPage(), /NOT_FOUND/);
    await assert.rejects(registerDoctorAction({}, form()), /NOT_FOUND/);
    assert.equal(posted.length, 0);
  }
  backend();
  accessToken = undefined;
  await assert.rejects(DoctorsPage(), /NOT_FOUND/);
  await assert.rejects(StaffPage(), /NOT_FOUND/);
  await assert.rejects(registerDoctorAction({}, form()), /NOT_FOUND/);
  assert.equal(posted.length, 0);
});

test("registration rechecks permissions on every action and validates before posting", async () => {
  backend();
  await registerDoctorAction({}, form());
  session = { ...administrator, role: "Receptionist" };
  await assert.rejects(registerDoctorAction({}, form()), /NOT_FOUND/);
  assert.equal(posted.length, 1);
  backend();
  const result = await registerDoctorAction({}, form({ firstName: "A" }));
  assert.ok(result.errors?.firstName);
  assert.equal(posted.length, 0);
});

test("registration handles both 400 formats and returns safe field feedback without submitted values", async () => {
  for (const body of [
    { errors: { MedicalLicenseNumber: ["Private diagnostic"] } },
    { message: "Private diagnostic", statusCode: 400 },
  ]) {
    backend(administrator, 400, body);
    const result = await registerDoctorAction({}, form());
    assert.equal(result.success, undefined);
    assert.ok(result.message);
    assert.doesNotMatch(
      JSON.stringify(result),
      /Private diagnostic|pass|admin-token/,
    );
    if ("errors" in body) assert.ok(result.errors?.medicalLicenseNumber);
  }
});

test("registration handles each known conflict and 403 without exposing unknown diagnostics", async () => {
  for (const message of [
    "Email is already registered.",
    "Identification number is already registered.",
    "Medical license number is already registered.",
  ]) {
    backend(administrator, 409, { message });
    assert.equal((await registerDoctorAction({}, form())).message, message);
  }
  backend(administrator, 409, { message: "Private diagnostic" });
  assert.equal(
    (await registerDoctorAction({}, form())).message,
    "An account already exists with these details.",
  );
  backend(administrator, 403, {});
  assert.match((await registerDoctorAction({}, form())).message!, /permission/);
});

test("expired sessions and API 401 enter session recovery without retrying registration", async () => {
  backend(null);
  refreshToken = "refresh-cookie";
  await assert.rejects(
    registerDoctorAction({}, form()),
    /REDIRECT:\/session\/refresh/,
  );
  assert.equal(posted.length, 0);
  backend(administrator, 401, undefined);
  await assert.rejects(
    registerDoctorAction({}, form()),
    /REDIRECT:\/session\/refresh\?returnTo=%2Fadmin%2Fdoctors/,
  );
  assert.equal(posted.length, 1);
});

test("service failures remain safe failures and never authorize registration", async () => {
  backend(administrator, 500, { message: "Private diagnostic" });
  assert.match(
    (await registerDoctorAction({}, form())).message!,
    /unavailable/,
  );
  backend();
  const fetchSession = globalThis.fetch;
  globalThis.fetch = async (url, init) => {
    if (new URL(String(url)).pathname === "/api/doctors/register")
      throw new TypeError("Private diagnostic");
    return fetchSession(url, init);
  };
  assert.match(
    (await registerDoctorAction({}, form())).message!,
    /Unable to connect/,
  );
  backend();
  globalThis.fetch = async () => {
    throw new TypeError("Private diagnostic");
  };
  await assert.rejects(registerDoctorAction({}, form()), /Unable to connect/);
  assert.equal(posted.length, 0);
  await assert.rejects(getValidatedSession("admin-token"), /Unable to connect/);
});
