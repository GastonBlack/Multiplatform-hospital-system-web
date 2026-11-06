# Multiplatform Hospital System - Web

Minimal hospital account frontend built with Next.js App Router, React, strict TypeScript and Tailwind CSS. The interface is in English, using white, black and blue accents. The home page currently contains only the header. Sign-in and patient registration use compact panels; registration uses two columns on standard mobile and desktop widths. Very narrow screens, browser zoom, the on-screen keyboard and validation messages may require scrolling rather than hiding fields.

## Requirements and setup

- Node.js 24 LTS (24.6+ for the system certificate store), npm and the separately running ASP.NET Core API at `https://localhost:7109`.
- Verified toolchain: Node 24.22.2, Next.js 16.4.5, React 19.3.1, Tailwind 4.3.4 and TypeScript 6.0.3. Exact versions are recorded in `package-lock.json`.
- TypeScript 6 and ESLint 9 are retained for compatibility with the Next.js ESLint plugins. ESLint 9 reports end-of-support; update the toolchain together when the plugins support newer majors.

From the project root:

```powershell
npm ci
Copy-Item .env.example .env.local
npm run dev
```

Preserve an existing `.env.local`. Open `http://localhost:3000`. For production, run `npm run build` then `npm start` behind HTTPS. If PowerShell blocks `npm.ps1`, use `npm.cmd` instead of `npm`.

## Environment and local HTTPS

Set `API_BASE_URL=https://localhost:7109` in `.env.local` (ignored by Git). This is server-only configuration: no `NEXT_PUBLIC_` prefix, JWT signing key or database credentials are needed.

Trust the development certificate in Windows and enable the system certificate store before starting Node:

```powershell
dotnet dev-certs https --trust
$env:NODE_USE_SYSTEM_CA = '1'
npm run dev
```

Restart Node after changing trust settings. `NODE_USE_SYSTEM_CA` must be set before the process starts, rather than only in `.env.local`. Alternatively, set `NODE_EXTRA_CA_CERTS` to an absolute path to a trusted public PEM certificate before starting Node. Do not copy private keys into this project or disable TLS validation.

Official references: [Next.js installation](https://nextjs.org/docs/app/getting-started/installation), [Node certificate configuration](https://nodejs.org/learn/http/enterprise-network-configuration), [dotnet dev-certs](https://learn.microsoft.com/en-us/dotnet/core/tools/dotnet-dev-certs).

All API calls run server-to-server. Browser CORS is not needed for this scope. The default Server Action origin checks remain enabled without expanding `allowedOrigins`.

## Structure

```text
src/app/
  layout.tsx                  Shared root and English document language
  (auth)/                     Compact sign-in and registration layout
    components/               Login/register views, forms and sign-out button
    actions.ts                Server Actions that call API features
    validation.ts             Shared client/server form validation
    types.ts                  Form feedback types
    login/page.tsx
    register/page.tsx
    session/refresh/          Server Action and session-renewal page
  (site)/                     Header, empty home and protected profile
    components/               Header and profile presentation
    page.tsx
    profile/page.tsx
  (admin)/
    components/               Administrative presentation
    admin/                    Layout and protected Server Component pages
      page.tsx
      doctors/page.tsx
      staff/page.tsx
src/features/
  auth/                       Authentication API calls and request/response types
  users/                      Account profile API calls and response types
  admin/                      Employee registration API contracts
src/lib/
  api/                        Server-only HTTP client and safe API errors
  auth/                       Cookie, backend session checks and guards
src/proxy.ts                  Forwards a safe return path; never grants access
tests/                        Local tests; fetch mocks exist only in tests
```

Route groups do not appear in URLs. Public and administrative routes use English paths, including `/profile`, `/admin/doctors` and `/admin/staff`. Each route's `page.tsx` is a Server Component that reads request data, loads API data or checks permissions, then passes safe props to its presentation component. Login/register views and forms live in `(auth)/components`, the profile and header in `(site)/components`, and administrative presentation in `(admin)/components`.

`features/` is exclusively the typed API integration layer, without UI components, form validation or Next.js actions. Its public `index.ts` files export types explicitly; server-only API functions are imported directly from `api.server.ts` so they cannot accidentally enter client bundles. Form actions and validation belong to the route area that uses them. The backend project remains unchanged.

## Authentication and permissions

- Sign-in for patients, doctors, receptionists and administrators sends only `{ nationalIdentificationNumber, password }` to `POST /api/auth/login`. The ID is a string of exactly eight ASCII digits, preserving leading zeros and rejecting spaces, dots and hyphens. Email is required for registration, but cannot be used to sign in. Invalid format returns 400; incorrect credentials return 401.
- Patient registration preserves its existing body. Doctor/staff registration types also require `nationalIdentificationNumber`; their forms are not implemented yet.
- Server Actions validate all form values. Passwords are never trimmed. Dates use America/Montevideo for future-date validation.
- Tokens are stored only in `mhs_access` and `mhs_refresh` cookies: HttpOnly, SameSite=Lax, Path=/ and Secure in production. Their expiration dates come from `accessTokenExpiresAt` and `sessionExpiresAt`, respectively. Tokens are never passed through component props, action responses, logs, localStorage or sessionStorage.
- When a page request needs a session and access has expired, the server redirects to `/session/refresh`. A same-origin Server Action calls `POST /api/auth/refresh` and writes both replacement cookies before returning to the requested page. Server Components do not mutate cookies. Renewal happens on demand, rather than keeping an inactive tab alive with polling.
- The backend rotates refresh tokens and revokes sessions when a consumed token is reused. The renewal page uses the browser's Web Locks API to serialize renewal across tabs; the action rechecks the latest cookies before rotating. This requires a modern browser in a secure context (HTTPS or localhost). Unsupported browsers request a new sign-in rather than rotating unsafely. No session tokens or authorization decisions are cached between users.
- Refresh does not extend the backend's absolute session lifetime: currently seven days from login, with access tokens lasting up to 15 minutes. Invalid/revoked refresh tokens clear both cookies and request a new sign-in (Admin still resolves to page not found without authorization). Connection errors retain the cookies and show a retry action.
- `requireSession()` validates the current session with the backend using `cache: no-store`. A cookie alone does not establish a valid session. Every account status can view its own profile.
- `requireAdmin()` requires a valid backend session, `role === "Administrator"` and active account status (`2`). Each administrative page calls the guard. Every future protected administrative action must do the same; the API remains the final authority.
- Administrative sections use App Router client-side navigation with `prefetch={false}`. The sidebar stays mounted while the right-hand page changes and shows its own loading state. Each dynamic page still calls `requireAdmin()` on the server; shared-layout checks are not the only authorization boundary. Permissions are not persistently cached or inferred from Staff profile type or decoded JWT claims. The router uses its default zero stale time for dynamic pages; browser back/forward may restore client-side UI, so API operations must always validate current permissions.
- Protected profile routes redirect missing/invalid sessions to sign-in. Admin routes show page not found for missing/invalid sessions or insufficient permissions. Connection failures never grant access. With streaming, Next.js may return HTTP 200 while rendering a not-found screen or meta redirect.
- Sign-out obtains usable access (refreshing if needed), revokes the backend session and then deletes both cookies. Connection errors retain the cookies for retry; already-invalid sessions are cleared.
- ValidationProblemDetails, custom ErrorResponse and empty/non-JSON error responses are handled. User-facing errors are in English and do not expose backend development diagnostics.

## Backend role contract

`GET /api/auth/session` now exposes `role` as nullable text. The controller reads `ClaimTypes.Role` from the principal validated by `JwtSessionEvents`, which refreshes role and account status from PostgreSQL on each authenticated request. The JWT and login response remain unchanged.

The frontend shows Administration in Options only when a backend-validated session has `role === "Administrator"` and active account status (`2`). Every administrative page and its layout check authorization before rendering. Missing/invalid sessions and insufficient permissions use Next.js `notFound()` to show the same page-not-found screen as a nonexistent route; profile authentication still redirects to sign-in. Backend connection failures remain service errors. Missing, null, unrecognized or malformed roles never grant access. No browser-side JWT decoding or privileged default is used.

The session endpoint returns 401 without a token. Automated role tests use mocked API responses; authenticated integration checks require real test accounts.

## Verification

```powershell
npm test
npm run lint
npm run typecheck
npm run build
```

ESLint runs separately from the Next.js 16 build. Typecheck generates route types first. Tests use Node's test runner with tsx and the `react-server` condition for server-only modules. Test mocks are not available as an application authentication mode.

Tests cover absent/revoked sessions, missing roles, receptionists, inactive administrators, confirmed active administrators, repeated permission checks and connection failures. They also cover API error formats, empty responses, login request fields, 400/401 handling, registration validation and unchanged passwords/leading zeros.

Renewal tests cover cookie security and expiry, rotated-token replacement, expired/missing access, invalid refresh tokens, connection errors, malformed responses, duplicate renewal avoidance and safe return paths. HTTP checks against Next.js verified renewal redirects, cookie cleanup, no tokens in action results and rejection of cross-origin Server Action requests. Positive refresh against the real backend with an expired test-account access token remains an integration check; mocked tests do not enable a fake application authentication mode.

Integration checklist with a running API and test accounts: TLS, patient registration, duplicate handling, sign-in and cookie attributes, real profile data, expiry, sign-out revocation, active-administrator access, and rejection after a role or account-status change. These checks are separate from the mocked API tests.

Use `npm audit` to review dependency advisories and `npm audit --omit=dev` for production dependencies. Review version compatibility before applying major upgrades.

## Current scope

Header-only home, compact sign-in and patient registration, automatic on-demand session renewal, protected account profile, sign-out and initial protected Admin sections. No appointments, availability, specialties or complete administrative registration forms are implemented.

The appointment and medical-history navigation buttons are disabled placeholders. The sign-in form's Remember me control does not change session persistence: cookies currently expire at the backend-provided dates for all sign-ins. The Forgot Password link targets a recovery route that is not implemented. Password recovery and distinct Remember me behavior remain pending.
