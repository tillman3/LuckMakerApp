# LuckMaker3000 Security Audit — Findings Report

**Date:** 2026-03-26  
**Auditor:** Jarvis (automated security audit)  
**Target:** https://luckmaker3000.com (187.77.198.243)  
**Stack:** Next.js 14, SQLite, Stripe, nginx, Ubuntu 24.04

---

## Executive Summary

LuckMaker3000 has a **solid security foundation** — the Stripe webhook properly validates signatures, SQL injection is prevented via prepared statements, sensitive files aren't web-accessible, and systemd hardening is in place. The main gaps were **missing HTTP security headers** (HSTS, CSP), **information leakage** via error messages and server headers, **weak authentication on user-facing endpoints**, and **no rate limiting**.

**Issues found:** 0 Critical, 4 High (all fixed), 5 Medium, 3 Low, 6 Informational (positive)

### Actions Taken
- ✅ Added HSTS, CSP, Permissions-Policy headers to nginx
- ✅ Removed X-Powered-By header (nginx + Next.js config)
- ✅ Added dotfile/sensitive file blocking in nginx
- ✅ Tightened database file permissions (644 → 640)
- ✅ Sanitized Stripe error messages in checkout/portal endpoints
- ✅ Rebuilt and redeployed application

---

## Findings

### HIGH Severity (Fixed)

#### H-1: Missing HSTS Header ✅ FIXED
**Severity:** HIGH  
**Description:** The luckmaker3000.com nginx config was missing `Strict-Transport-Security`, meaning browsers could be tricked into loading the site over HTTP.  
**Evidence:** `curl -sI https://luckmaker3000.com/ | grep -i strict-transport` returned nothing before fix.  
**Remediation:** Added `add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;` to nginx config.  
**Status:** ✅ Fixed and verified.

#### H-2: Missing Content-Security-Policy ✅ FIXED
**Severity:** HIGH  
**Description:** No CSP header was set, leaving the site vulnerable to XSS via injected scripts.  
**Evidence:** `curl -sI https://luckmaker3000.com/ | grep -i content-security-policy` returned nothing.  
**Remediation:** Added comprehensive CSP allowing only self, Google Analytics, Stripe, and Google Fonts origins.  
**Status:** ✅ Fixed and verified.

#### H-3: Information Leakage via X-Powered-By Header ✅ FIXED
**Severity:** HIGH  
**Description:** Response included `X-Powered-By: Next.js` revealing the framework. Combined with version-specific vulnerabilities in npm audit, this aids attackers.  
**Evidence:** `curl -sI https://luckmaker3000.com/ | grep x-powered-by` → `X-Powered-By: Next.js`  
**Remediation:** Added `proxy_hide_header X-Powered-By;` to nginx + set `poweredByHeader: false` in next.config.mjs.  
**Status:** ✅ Fixed and verified.

#### H-4: Stripe Error Messages Leaked to Clients ✅ FIXED
**Severity:** HIGH  
**Description:** The `/api/checkout` and `/api/portal` endpoints returned raw Stripe SDK error messages (e.g., `No such price: 'price_fake_free'`, `No such customer: 'cus_fake123'`), revealing internal implementation details and valid/invalid resource patterns.  
**Evidence:**
```
curl -X POST /api/checkout -d '{"priceId":"price_fake"}' → {"error":"No such price: 'price_fake'"}
curl -X POST /api/portal -d '{"customerId":"cus_fake"}' → {"error":"No such customer: 'cus_fake123'"}
```
**Remediation:** Replaced `error.message` with generic error messages. Detailed errors still logged server-side via `console.error`.  
**Status:** ✅ Fixed, rebuilt, and deployed.

---

### MEDIUM Severity (Document — Ask Before Implementing)

#### M-1: No Rate Limiting on API Endpoints
**Severity:** MEDIUM  
**Description:** All API endpoints accept unlimited requests. An attacker could brute-force vault tokens, spam pool creation, trigger excessive Stripe API calls via checkout/portal, or scrape all draw data.  
**Evidence:** 20 rapid requests to `/api/health` all returned 200 with no throttling.  
**Remediation:** Options:
1. **nginx rate limiting** (simplest): Add `limit_req_zone` in nginx for `/api/` routes (e.g., 10 req/sec with burst 20)
2. **Application-level**: Use a middleware like `express-rate-limit` equivalent for Next.js
3. **Cloudflare** (if added later): Built-in rate limiting rules

#### M-2: Vault/Alerts Endpoints Use Weak Token Authentication (IDOR Risk)
**Severity:** MEDIUM  
**Description:** The `/api/vault` endpoint authenticates users by a `user_token` query parameter, and `/api/alerts` uses `email`. These are guessable — if an attacker knows/guesses a token or email, they can view all of that user's tickets and alert settings. There's no session, cookie, or JWT authentication.  
**Evidence:**
```
curl /api/vault?token=admin → {"tickets":[],"stats":{...}}  (accepted, just no data)
curl /api/alerts?email=test@test.com → {"alerts":[]}  (accepted)
```
**Remediation:** Since there's no auth system currently, this is by design (Stripe customer ID tracking). For future hardening:
1. Use cryptographically random tokens (UUID v4) generated server-side
2. Consider adding Stripe customer ID validation before vault access
3. Long-term: implement proper auth (NextAuth.js or similar)

#### M-3: npm Audit — High Severity Vulnerabilities in Next.js
**Severity:** MEDIUM  
**Description:** `npm audit` reports 1 high severity vulnerability in `next@14.x` with 4 advisories including DoS via Image Optimizer, HTTP request smuggling, and unbounded disk cache growth.  
**Evidence:**
```
1 high severity vulnerability
- GHSA-9g9p-9gw9-jx7f (Image Optimizer DoS)
- GHSA-h25m-26qc-wcjf (RSC deserialization DoS)  
- GHSA-ggv3-7p47-pfv8 (HTTP request smuggling in rewrites)
- GHSA-3x4c-7xq6-9pq8 (Unbounded image disk cache)
```
**Remediation:** `npm audit fix --force` would upgrade to Next.js 16.x (breaking change). Recommend testing upgrade in staging first. The request smuggling one (GHSA-ggv3-7p47-pfv8) only affects rewrites, which this app doesn't use heavily.

#### M-4: Port 3002 Bound on 0.0.0.0 (Defense in Depth)
**Severity:** MEDIUM  
**Description:** The Next.js server binds to `0.0.0.0:3002` (set via systemd `HOSTNAME=0.0.0.0`). While UFW blocks external access to port 3002 (only 22/80/443 allowed), if UFW is ever disabled or misconfigured, the app would be directly accessible, bypassing all nginx security headers.  
**Evidence:** `ss -tlnp` shows `0.0.0.0:3002`. UFW default-deny blocks it currently.  
**Remediation:** Change systemd `Environment=HOSTNAME=127.0.0.1` so the app only listens on localhost. Requires service restart.

#### M-5: Portal Endpoint Accepts Any Customer ID (No Ownership Validation)
**Severity:** MEDIUM  
**Description:** The `/api/portal` endpoint creates a Stripe billing portal session for any `customerId` passed in. While Stripe validates the customer exists, an attacker who obtains a valid Stripe customer ID could access that customer's billing portal to view/modify their subscription.  
**Evidence:** Passing any string creates a portal attempt — Stripe rejects invalid IDs but would accept valid ones from anyone.  
**Remediation:** Tie portal access to an authenticated session. Without auth, at minimum store and validate that the requesting browser matches the customer (e.g., via an HTTP-only session cookie set during Stripe checkout completion).

---

### LOW Severity

#### L-1: Uploaded Ticket Photos Publicly Accessible
**Severity:** LOW  
**Description:** The `/api/upload-ticket` endpoint saves photos to `public/uploads/tickets/` with UUID filenames. While UUIDs make enumeration impractical, anyone with the URL can view uploaded ticket photos.  
**Evidence:** Files saved to `public/uploads/tickets/{uuid}.jpeg` — served statically by Next.js.  
**Remediation:** Move uploads outside `public/` and serve them through an authenticated route, or use signed URLs with expiration.

#### L-2: Server Header Reveals nginx
**Severity:** LOW  
**Description:** The `Server: nginx` header is present (version number hidden by `server_tokens off`). This reveals the web server software.  
**Evidence:** `curl -sI https://luckmaker3000.com/ | grep Server` → `Server: nginx`  
**Remediation:** To fully hide: `more_clear_headers Server;` (requires nginx `headers-more` module). Low priority since version is already hidden.

#### L-3: No CSRF Protection on POST Endpoints  
**Severity:** LOW  
**Description:** POST endpoints like `/api/pools`, `/api/pools/members`, `/api/vault`, `/api/alerts` accept JSON POST without CSRF tokens. However, since these are JSON API endpoints (not form submissions), the risk is mitigated by browser same-origin policy for JSON content types.  
**Remediation:** The CSP `form-action` directive now restricts form targets. For additional hardening, add `SameSite=Strict` cookies if/when auth is implemented.

---

### INFO (Positive Findings) ✅

#### I-1: Stripe Webhook Signature Verification — SECURE ✅
The webhook endpoint at `/api/webhook` correctly uses `stripe.webhooks.constructEvent()` with the webhook secret to verify signatures. Fake webhooks without valid signatures are rejected with 400.
```
curl -X POST /api/webhook -d '{"fake":"data"}' → {"error":"Missing signature or webhook secret"}
```

#### I-2: SQL Injection Protection — SECURE ✅
All database queries use `better-sqlite3` prepared statements with parameterized queries. SQLi attempts return empty results, not errors.
```
/api/draws?gameId=powerball' OR 1=1-- → {"draws":[],"total":0}
```

#### I-3: Sensitive Files Not Web-Accessible — SECURE ✅
- `.env.local` → 404 (600 permissions + never committed to git)
- `.git/HEAD` → 404
- `.git/config` → 404
- `data/luckmaker.db` → 404
- Directory traversal attempts → 404/400

#### I-4: Secrets Not in Git History — SECURE ✅
Git history search for `sk_live`, `whsec_`, and `STRIPE_SECRET` in committed files found nothing. `.env.local` was never committed (only `.env.example` with placeholder values).

#### I-5: Systemd Service Hardening — GOOD ✅
The service unit includes: `NoNewPrivileges=true`, `ProtectSystem=strict`, `ProtectHome=read-only`, `ReadWritePaths` limited to data directory, `PrivateTmp=true`.

#### I-6: SSH Configuration — SECURE ✅
- Root login disabled (`PermitRootLogin no`)
- Password auth disabled (`PasswordAuthentication no` via cloud config)
- X11 forwarding disabled
- fail2ban active on sshd jail
- UFW allows only 22/80/443

---

## Infrastructure Summary

| Component | Status | Notes |
|-----------|--------|-------|
| UFW Firewall | ✅ Good | Default deny, only 22/80/443 open |
| fail2ban | ✅ Active | sshd jail running |
| SSH | ✅ Hardened | No root, no password, no X11 |
| SSL/TLS | ✅ Good | TLS 1.2+1.3, Let's Encrypt, strong ciphers |
| HSTS | ✅ Fixed | 1-year max-age + includeSubDomains + preload |
| CSP | ✅ Fixed | Comprehensive policy added |
| nginx | ✅ Hardened | server_tokens off, X-Powered-By hidden, dotfiles blocked |
| Systemd | ✅ Hardened | NoNewPrivileges, ProtectSystem, PrivateTmp |
| .env.local | ✅ Secure | 600 permissions, not in git |
| Database | ✅ Fixed | Permissions tightened to 640 |
| Webhook auth | ✅ Secure | Proper Stripe signature validation |
| SQLi protection | ✅ Secure | Prepared statements throughout |

---

## Recommended Next Steps (Priority Order)

1. **Implement rate limiting** (M-1) — nginx `limit_req_zone` is quickest win
2. **Bind port 3002 to 127.0.0.1** (M-4) — one-line systemd change
3. **Upgrade Next.js** (M-3) — test Next.js 15/16 for vulnerability fixes
4. **Add authentication** (M-2, M-5) — NextAuth.js for proper user sessions
5. **Move uploads out of public/** (L-1) — serve via authenticated route

---

*Report generated 2026-03-26T19:17 UTC*
