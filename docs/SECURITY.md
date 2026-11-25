# Security

This document maps every control to the OWASP Top 10 (2021) and the OWASP API Security Top 10, and to the test that proves it. All tests are HTTP-level: they go through the real middleware pipeline, in `server/tests/Kanban.Tests/SecurityTests.cs`.

## Threat model in one paragraph

A logged-in user must never read or change another user's data. An attacker on another site must not be able to make a victim's browser act on their board. Credentials must resist guessing and stuffing. Any input, however malformed, must yield a 4xx and never a 5xx or a stack trace. The app has no file uploads, no outbound requests and no server-rendered HTML, which removes whole classes of risk.

## Controls

| OWASP | Control | Implementation | Test |
|---|---|---|---|
| **A01** Access control | Deny by default: a fallback policy requires an authenticated user on every endpoint. Only auth, health and static files opt out. | `Program.cs` `SetFallbackPolicy` | `A01_Anonymous_requests_are_rejected` |
| **A01** IDOR | Owner id is read **only** from the cookie principal, and every lookup goes through the owner's board. Foreign ids return 404. | `BoardEndpoints.Owner`, `IBoardRepository.GetForOwnerAsync` | `A01_User_cannot_read_modify_or_delete_another_users_task` |
| **A01** CSRF | (1) `SameSite=Strict` cookie. (2) A required custom header `X-Kanban-Client`, which a cross-site form can't send and a cross-site fetch can't send without a CORS preflight, and no CORS policy exists. (3) `Origin` must match the host. | `CsrfGuardMiddleware.cs` | `CSRF_State_change_without_client_header_is_blocked`, `CSRF_Cross_origin_request_is_blocked` |
| **A02** Crypto | Identity PBKDF2-HMAC-SHA512 password hashing. Auth cookie encrypted by Data Protection, with the key ring DPAPI-protected at rest on Windows. HSTS for 1 year with preload; HTTPS redirect. `__Host-` cookie prefix in production. | `Infrastructure/DependencyInjection.cs`, `Program.cs` | `A07_Session_cookie_is_httponly_and_samesite_strict` |
| **A03** Injection | EF Core parameterises every query. Enums, dates and numbers are parsed against explicit allow-lists (`WireFormat`), never `Enum.Parse` on raw input. | `WireFormat.cs`, `Rules.cs` | `A03_Invalid_input_returns_validation_problem` (5 cases), `A03_Oversized_title_is_rejected` |
| **A03** XSS | React escapes all output, and there is no `dangerouslySetInnerHTML`. The CSP allows `script-src 'self'` with no inline scripts and no third-party origins. Fonts are system fonts, so there is no CDN. | `SecurityHeadersMiddleware.cs`, `vite.config.js` (no inlined assets) | `A05_Security_headers_are_present_and_server_is_not_advertised` |
| **API6** Mass assignment | JSON binding uses `UnmappedMemberHandling.Disallow`, so an extra field such as `ownerId` is a 400. The client builds request bodies from an explicit field list. | `Program.cs`, `web/src/api/client.js toRequest` | `API6_Unknown_json_properties_are_rejected` |
| **A04** Insecure design / DoS | Hard caps on every collection and string (see `Rules.cs`). Kestrel body limit of 256 KB and header limit of 32 KB. JSON `MaxDepth` of 16. Password max of 128 characters bounds hashing cost. Rate limiting: 10/min per IP on auth, token bucket per user elsewhere. | `Rules.cs`, `Program.cs` | domain tests |
| **A05** Misconfiguration | CSP, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY` plus `frame-ancestors 'none'`, `Referrer-Policy: no-referrer`, Permissions-Policy, COOP/CORP. `Server` header removed. ProblemDetails with no stack traces in any environment. Malformed bodies return 400, never 500. API responses are `no-store`. | `SecurityHeadersMiddleware.cs`, `Program.cs` | `A05_*`, `Unknown_api_routes_return_404_not_the_spa` |
| **A06** Components | `NuGetAudit` (mode `all`, level `low`) turns any known-vulnerable package, direct or transitive, into a **build error**. Versions are pinned centrally. `npm audit` is clean. React and Vite are the only runtime and build dependencies. | `Directory.Build.props`, `Directory.Packages.props`, `web/package.json` | CI build |
| **A07** Authentication | Minimum 12-character passphrases, length over composition (NIST SP 800-63B). Lockout after 5 failures for 15 minutes. Identical 401 message **and equalised timing** for unknown emails (a dummy hash is verified). Duplicate-email registration gives a generic message. Security stamp revalidated every 5 minutes, so password changes kill sessions. | `AuthEndpoints.cs`, `Infrastructure/DependencyInjection.cs` | `A07_*` (4 tests) |
| **A08** Integrity | Lockfiles committed. No third-party scripts at runtime. Hashed, immutable assets. | `package-lock.json` | none |
| **A09** Logging | Structured logs for sign-up, sign-in and failed sign-in, with user id and remote IP, **never** emails or passwords. Structured logging prevents log injection. | `AuthEndpoints.cs` | none |
| **A10** SSRF | The server makes no outbound HTTP calls. | none | none |

## Secrets and data at rest

- No secrets in the repo. The SQLite database and Data Protection keys live in `App_Data/`, which is git-ignored.
- Treat `App_Data/keys` as a secret. Back it up with the database, and never commit or share it.
- On Linux or containers, protect keys with a certificate (`ProtectKeysWithCertificate`) or a cloud KMS instead of DPAPI.

## Production checklist

- [ ] Terminate TLS in front of the app, or configure Kestrel certificates.
- [ ] Set `ASPNETCORE_ENVIRONMENT=Production`. This enables HSTS, HTTPS redirect and the `__Host-` cookie.
- [ ] Set `AllowedHosts` to your domain.
- [ ] Put `App_Data/` (database and keys) on a persistent, backed-up volume.
- [ ] If behind a proxy, configure `ForwardedHeaders` so rate limiting and logs see the real client IP.
- [ ] Run `dotnet list server package --vulnerable` and `npm audit` in CI.

## Reporting

Please report suspected vulnerabilities privately to the maintainer rather than opening a public issue.
