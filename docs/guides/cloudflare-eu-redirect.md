# Cloudflare Redirect: ms-navigator.eu → ms-navigator.bg

**Goal:** ms-navigator.bg is the canonical domain. ms-navigator.eu permanently redirects to it (301). No duplicate content, one deployment.

**Beads:** ms-navigator-eie (switch primary), ms-navigator-u8i (Cloudflare setup)

---

## Part 1 — Switch primary domain to .bg (ms-navigator-eie)

### 1. Update the codebase

In `astro.config.mjs`:
```js
site: 'https://ms-navigator.bg',
```

In `public/CNAME`:
```
ms-navigator.bg
```

Commit and push:
```bash
git add astro.config.mjs public/CNAME
git commit -m "chore: switch primary domain to ms-navigator.bg"
git push
```

### 2. Update GitHub Pages custom domain

In the GitHub repo: **Settings → Pages → Custom domain** → type `ms-navigator.bg` → Save.

GitHub will verify the CNAME file and issue a Let's Encrypt certificate. This takes a few minutes. Tick **Enforce HTTPS** once it appears.

### 3. Add DNS records for ms-navigator.bg

At your `.bg` domain registrar, add these A records:

| Type | Name | Value |
|------|------|-------|
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| CNAME | www | coldsoul.github.io |

DNS propagation takes up to 24 hours. Verify with:
```bash
dig ms-navigator.bg +short
```
Expected: one or more of the four GitHub Pages IPs above.

---

## Part 2 — Set up Cloudflare redirect for .eu (ms-navigator-u8i)

### 1. Create a free Cloudflare account

Sign up at cloudflare.com if you don't have one. The free plan is sufficient — this only uses a redirect rule and DNS hosting.

### 2. Add ms-navigator.eu to Cloudflare

1. In Cloudflare dashboard: **Add a site** → enter `ms-navigator.eu` → choose **Free plan**
2. Cloudflare will scan existing DNS records. You can ignore them.
3. Cloudflare gives you two nameserver addresses, e.g.:
   ```
   aria.ns.cloudflare.com
   bob.ns.cloudflare.com
   ```
4. At your `.eu` domain registrar, replace the current nameservers with the two Cloudflare ones.
5. Wait for propagation (minutes to a few hours). Cloudflare emails you when active.

### 3. Add a placeholder DNS record

Cloudflare requires at least one DNS record to proxy traffic. Add an A record that points nowhere real — Cloudflare intercepts it before it reaches any server:

| Type | Name | Value | Proxy |
|------|------|-------|-------|
| A | @ | 192.0.2.1 | Proxied (orange cloud ✓) |

`192.0.2.1` is a reserved "documentation" IP (RFC 5737) — it never routes anywhere. The orange cloud (proxied) means Cloudflare handles the request before it leaves their network.

### 4. Create the redirect rule

**Cloudflare dashboard → ms-navigator.eu → Rules → Redirect Rules → Create rule**

| Field | Value |
|-------|-------|
| Rule name | Redirect EU to BG |
| When incoming requests match | Custom filter expression |
| Field | Hostname |
| Operator | equals |
| Value | `ms-navigator.eu` |
| Then | Dynamic redirect |
| Expression | `concat("https://ms-navigator.bg", http.request.uri.path)` |
| Status code | 301 |

Click **Deploy**.

This redirects:
- `ms-navigator.eu` → `https://ms-navigator.bg`
- `ms-navigator.eu/simptomi` → `https://ms-navigator.bg/simptomi`
- `ms-navigator.eu/kakvo-e-ms` → `https://ms-navigator.bg/kakvo-e-ms`

### 5. Verify

```bash
curl -I https://ms-navigator.eu/simptomi
```

Expected response:
```
HTTP/2 301
location: https://ms-navigator.bg/simptomi
```

---

## Troubleshooting

**GitHub Pages shows "Domain not verified"**
The CNAME file must contain exactly `ms-navigator.bg` with no trailing whitespace. Check with `cat -A public/CNAME`.

**Certificate not issued after 24h**
Go to GitHub Pages settings and click "Remove" then re-add the custom domain. This re-triggers the Let's Encrypt flow.

**Cloudflare redirect loops**
Make sure the A record for `ms-navigator.eu` has the orange cloud (proxied). If it's grey (DNS only), Cloudflare Rules won't fire.

**www.ms-navigator.eu not redirecting**
Add a second A record for `www` with the same `192.0.2.1` value and the orange cloud. The redirect rule applies to all hostnames on the zone by default, but the record must exist for Cloudflare to proxy it.
