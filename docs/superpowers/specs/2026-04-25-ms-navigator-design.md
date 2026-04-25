# МС Навигатор — Design Spec

**Date:** 2026-04-25
**Status:** Approved

---

## Overview

Static Bulgarian-language website providing Multiple Sclerosis information for newly diagnosed people and their families. Designed for cognitive accessibility — users may experience brain fog, fatigue, and visual problems.

**Domain:** ms-navigator.bg
**Repo:** github.com/coldsoul/ms-navigator

---

## Site Architecture

### Framework & Stack

- **Astro** — static site generator, zero JS required for core functionality
- **Tailwind CSS** — with custom theme matching the design spec
- **Markdown** — content for all 11 sections, rendered at build time
- **Google Fonts** — Literata (headings) + Source Sans 3 (body), loaded via `<link>` in BaseLayout

### Pages

| Route | File | Description |
|-------|------|-------------|
| `/` | `src/pages/index.astro` | Home page with 11 section cards |
| `/kakvo-e-ms` | `src/pages/kakvo-e-ms.astro` | Section 1: What is MS? |
| `/vidove-ms` | `src/pages/vidove-ms.astro` | Section 2: Types of MS |
| `/pristap` | `src/pages/pristap.astro` | Section 3: What is a relapse? |
| `/simptomi` | `src/pages/simptomi.astro` | Section 4: Symptoms |
| `/izsledvania` | `src/pages/izsledvania.astro` | Section 5: Tests |
| `/lechenie` | `src/pages/lechenie.astro` | Section 6: Treatment |
| `/meditsinski-ekip` | `src/pages/meditsinski-ekip.astro` | Section 7: Medical team |
| `/hranene-i-dieti` | `src/pages/hranene-i-dieti.astro` | Section 8: Diet |
| `/sharlatani` | `src/pages/sharlatani.astro` | Section 9: Charlatans |
| `/emotsii` | `src/pages/emotsii.astro` | Section 10: Emotions |
| `/chesti-vaprosi` | `src/pages/chesti-vaprosi.astro` | Section 11: FAQ |

### File Structure

```
ms-navigator/
├── .github/
│   └── workflows/
│       └── deploy.yml
├── src/
│   ├── layouts/
│   │   └── BaseLayout.astro
│   ├── pages/
│   │   ├── index.astro
│   │   ├── kakvo-e-ms.astro
│   │   ├── vidove-ms.astro
│   │   ├── pristap.astro
│   │   ├── simptomi.astro
│   │   ├── izsledvania.astro
│   │   ├── lechenie.astro
│   │   ├── meditsinski-ekip.astro
│   │   ├── hranene-i-dieti.astro
│   │   ├── sharlatani.astro
│   │   ├── emotsii.astro
│   │   └── chesti-vaprosi.astro
│   ├── components/
│   │   ├── SectionCard.astro
│   │   ├── SectionLayout.astro
│   │   ├── Disclaimer.astro
│   │   └── BackButton.astro
│   └── content/
│       ├── kakvo-e-ms.md
│       ├── vidove-ms.md
│       ├── pristap.md
│       ├── simptomi.md
│       ├── izsledvania.md
│       ├── lechenie.md
│       ├── meditsinski-ekip.md
│       ├── hranene-i-dieti.md
│       ├── sharlatani.md
│       ├── emotsii.md
│       └── chesti-vaprosi.md
├── public/
│   ├── CNAME                   # contains: ms-navigator.bg
│   └── favicon.svg
├── astro.config.mjs
├── tailwind.config.mjs
└── package.json
```

### Components

**BaseLayout.astro**
- `<html lang="bg">`, charset, viewport
- Google Fonts preconnect + stylesheet link
- Per-page `title` and `description` props for SEO meta tags
- OG tags: `og:title`, `og:description`, `og:type`, `og:locale` (bg_BG)
- Skip-to-content link (accessibility)
- Slot for page content
- Analytics script slot (empty for now, to be wired up later without structural changes)

**SectionCard.astro**
Props: `title`, `description`, `icon` (emoji), `href`
- Full card is an `<a>` tag
- Hover: `translateY(-2px)`, box-shadow, accent border, arrow appears
- `focus-visible`: 3px solid accent outline
- Min tap target: 48×48px

**SectionLayout.astro**
Props: `title`, `summary`
- BackButton top-left
- h1 title
- Summary paragraph with border-bottom separator
- Slot for Markdown content

**Disclaimer.astro**
Static text: "Важно: Този сайт предоставя информация, не медицински съвет. Винаги се консултирай с лекаря си за решения относно лечението."
Appears on every page via BaseLayout.

**BackButton.astro**
`← Обратно към начало` link to `/`. Min height 48px.

### Design Tokens (Tailwind custom theme)

```
bg: #F7F6F1
bg-card: #FFFFFF
text: #2C2C2C
text-muted: #6B6860
accent: #3B7A6A
accent-light: #E8F0ED
accent-hover: #2E6254
border: #E8E6DF
disclaimer-bg: #FDF6EC
disclaimer-border: #E8D9C0
disclaimer-text: #7A6840

font-heading: Literata, Georgia, serif
font-body: Source Sans 3, Segoe UI, sans-serif
font-size-base: 18px
line-height-body: 1.7
max-width: 860px
radius: 12px
radius-sm: 8px
```

### Content Strategy

All 11 Markdown files ship with placeholder body (`## Подзаглавие\nСъдържание идва скоро.`) in Phase 1. Real content is a separate phase. Each file uses frontmatter:

```markdown
---
title: "Какво е множествена склероза?"
summary: "Множествената склероза е хронично заболяване..."
---
```

### Accessibility

WCAG 2.1 AA target:
- Skip-to-content link
- Correct heading hierarchy (h1 → h2 → h3)
- All interactive elements keyboard accessible
- `focus-visible` on all interactive elements (3px solid accent)
- Min contrast 4.5:1
- Min tap target 48×48px
- `aria-label` on icon-only elements
- `alt` on all images

---

## CI/CD Pipeline

### GitHub Actions — `.github/workflows/deploy.yml`

**Triggers:**
- Push to `main` → full build + deploy
- Pull request → build only (no deploy), acts as a gate

**Steps:**
1. `actions/checkout`
2. `actions/setup-node` (Node 20 LTS)
3. `npm ci`
4. `astro build` (via `withastro/action` or direct script)
5. `actions/upload-pages-artifact` (uploads `dist/`)
6. `actions/deploy-pages` (deploy job, `environment: github-pages`)

A failed build blocks deployment. The live site is never updated with a broken build.

### Astro Config

```js
// astro.config.mjs
export default defineConfig({
  site: 'https://ms-navigator.bg',
  output: 'static',
  integrations: [tailwind()],
})
```

---

## Repo Setup

- Git initialized locally at `/Users/radi.radichev/Projects/ms-navigator`
- `.gitignore`: `node_modules/`, `dist/`, `.astro/`, `.DS_Store`
- `bd init` — beads issue tracker initialized and committed
- GitHub repo created manually at `github.com/coldsoul/ms-navigator`
- `main` is the single production branch

**One manual GitHub step after repo creation:**
Settings → Pages → Source → **GitHub Actions** (not legacy branch deploy)

**Custom domain DNS (when ready):**
Point `ms-navigator.bg` A records to GitHub Pages IPs, or add a CNAME for `www`. The `public/CNAME` file handles the GitHub Pages side automatically.

---

## Out of Scope (Future Phases)

- Analytics (will be added via BaseLayout script slot, provider TBD)
- Dark mode
- Search
- Print version
- Phase 2+: Daily tips, disability documents, patient rights, health system sections
