# МС Навигатор — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deploy a static Bulgarian MS information website to GitHub Pages at ms-navigator.bg with automated CI/CD.

**Architecture:** Astro static site with Tailwind CSS. Eleven topic sections served as individual static pages, content loaded via Astro Content Collections from Markdown files. GitHub Actions builds on push to `main` and deploys to GitHub Pages. Visual reference: `documents/ms-navigator-homepage.html`.

**Tech Stack:** Astro 4.x, @astrojs/tailwind, @tailwindcss/typography, Tailwind CSS 3.x, GitHub Actions, GitHub Pages.

---

## File Map

| File | Responsibility |
|------|---------------|
| `src/layouts/BaseLayout.astro` | HTML shell: charset, viewport, meta/OG tags, Google Fonts, skip-to-content, analytics slot |
| `src/components/Disclaimer.astro` | Medical disclaimer banner (warm amber box) |
| `src/components/BackButton.astro` | "← Обратно към начало" link |
| `src/components/SectionCard.astro` | Clickable card with icon/title/description/arrow, hover + focus states |
| `src/components/SectionLayout.astro` | Inner page chrome: BackButton + h1 + summary + Disclaimer + content slot |
| `src/pages/index.astro` | Home page: header, hero, Disclaimer, 11 SectionCards, footer |
| `src/pages/[section].astro` × 11 | One page per section, reads from Content Collection |
| `src/content/config.ts` | Content Collection schema (title: string, summary: string) |
| `src/content/sections/*.md` × 11 | Placeholder Markdown with frontmatter |
| `public/CNAME` | Single line: `ms-navigator.bg` — GitHub Pages custom domain |
| `public/favicon.svg` | Minimal SVG favicon in accent green |
| `astro.config.mjs` | Astro config: site URL, Tailwind integration |
| `tailwind.config.mjs` | Design tokens: colors, fonts, animation, breakpoints |
| `.github/workflows/deploy.yml` | CI: build on PRs, build + deploy on push to main |

---

### Task 1: Repo foundation — git, .gitignore, npm, beads

**Files:**
- Create: `.gitignore`
- Create: `package.json`
- Initialize: beads database

- [ ] **Step 1: Initialize git**
```bash
cd /Users/radi.radichev/Projects/ms-navigator
git init
git branch -M main
```

- [ ] **Step 2: Create .gitignore**

Save to `.gitignore`:
```
node_modules/
dist/
.astro/
.DS_Store
*.log
npm-debug.log*
```

- [ ] **Step 3: Initialize npm**
```bash
npm init -y
```
Then open `package.json` and set `"name": "ms-navigator"`.

- [ ] **Step 4: Initialize beads**
```bash
bd init
```
Expected output: confirmation that the beads database was created (a `.beads/` directory appears).

- [ ] **Step 5: Initial commit**
```bash
git add .gitignore package.json .beads/
git commit -m "chore: initialize repo with git and beads"
```

---

### Task 2: Install Astro and Tailwind

**Files:**
- Modify: `package.json` (scripts + devDependencies)
- Create: `astro.config.mjs`
- Create: `src/env.d.ts`

- [ ] **Step 1: Install dependencies**
```bash
npm install astro @astrojs/tailwind tailwindcss @tailwindcss/typography
```

- [ ] **Step 2: Add scripts to package.json**

In `package.json`, replace the `"scripts"` block with:
```json
"scripts": {
  "dev": "astro dev",
  "build": "astro build",
  "preview": "astro preview",
  "check": "astro check"
}
```

- [ ] **Step 3: Create astro.config.mjs**
```js
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://ms-navigator.bg',
  integrations: [tailwind()],
});
```

- [ ] **Step 4: Create src/env.d.ts**
```ts
/// <reference types="astro/client" />
```

- [ ] **Step 5: Verify Astro is configured correctly**
```bash
npm run check
```
Expected: exits 0 or warns about no pages — that's fine at this stage. If it errors on the config file itself, fix before continuing.

- [ ] **Step 6: Commit**
```bash
git add astro.config.mjs src/env.d.ts package.json package-lock.json
git commit -m "chore: install astro and tailwind"
```

---

### Task 3: Tailwind design tokens

**Files:**
- Modify: `tailwind.config.mjs`

- [ ] **Step 1: Write the full theme**

Replace `tailwind.config.mjs` with:
```js
import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,ts,md}'],
  theme: {
    extend: {
      colors: {
        'ms-bg':               '#F7F6F1',
        'ms-card':             '#FFFFFF',
        'ms-text':             '#2C2C2C',
        'ms-muted':            '#6B6860',
        'ms-accent':           '#3B7A6A',
        'ms-accent-light':     '#E8F0ED',
        'ms-accent-hover':     '#2E6254',
        'ms-border':           '#E8E6DF',
        'ms-disclaimer-bg':    '#FDF6EC',
        'ms-disclaimer-border':'#E8D9C0',
        'ms-disclaimer-text':  '#7A6840',
      },
      fontFamily: {
        heading: ['Literata', 'Georgia', 'serif'],
        body:    ['"Source Sans 3"', '"Segoe UI"', 'sans-serif'],
      },
      maxWidth: {
        content: '860px',
      },
      borderRadius: {
        card: '12px',
      },
      screens: {
        'sm-ms': '560px',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.4s ease both',
      },
      keyframes: {
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [typography()],
};
```

- [ ] **Step 2: Commit**
```bash
git add tailwind.config.mjs
git commit -m "chore: add design tokens to tailwind theme"
```

---

### Task 4: BaseLayout.astro

**Files:**
- Create: `src/layouts/BaseLayout.astro`

- [ ] **Step 1: Create the layout**
```astro
---
// src/layouts/BaseLayout.astro
interface Props {
  title: string;
  description: string;
}
const { title, description } = Astro.props;
const fullTitle = title === 'МС Навигатор' ? title : `${title} — МС Навигатор`;
---
<!DOCTYPE html>
<html lang="bg">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{fullTitle}</title>
  <meta name="description" content={description} />
  <meta property="og:title" content={fullTitle} />
  <meta property="og:description" content={description} />
  <meta property="og:type" content="website" />
  <meta property="og:locale" content="bg_BG" />
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link
    rel="stylesheet"
    href="https://fonts.googleapis.com/css2?family=Literata:opsz,wght@7..72,400;7..72,600;7..72,700&family=Source+Sans+3:wght@400;500;600&display=swap"
  />
  <!-- Analytics: add script tag here when ready -->
</head>
<body class="bg-ms-bg font-body text-[18px] leading-[1.7] text-ms-text antialiased">
  <a
    href="#main-content"
    class="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-ms-accent focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:outline-none"
  >
    Прескочи към съдържанието
  </a>
  <main id="main-content">
    <slot />
  </main>
</body>
</html>
```

- [ ] **Step 2: Create a minimal index.astro to verify the layout**

Create `src/pages/index.astro`:
```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---
<BaseLayout title="МС Навигатор" description="Тест.">
  <p class="p-8 text-ms-text">Layout works.</p>
</BaseLayout>
```

- [ ] **Step 3: Run dev server and verify**
```bash
npm run dev
```
Open http://localhost:4321. Expected: page renders with warm `#F7F6F1` background, Literata and Source Sans 3 loaded from Google Fonts (check Network tab).

- [ ] **Step 4: Verify build**
```bash
npm run build
```
Expected: exits 0, `dist/index.html` exists.

- [ ] **Step 5: Commit**
```bash
git add src/layouts/BaseLayout.astro src/pages/index.astro
git commit -m "feat: add BaseLayout with meta tags, fonts, and skip link"
```

---

### Task 5: Disclaimer and BackButton components

**Files:**
- Create: `src/components/Disclaimer.astro`
- Create: `src/components/BackButton.astro`

- [ ] **Step 1: Create Disclaimer.astro**
```astro
---
// src/components/Disclaimer.astro
---
<div class="max-w-content mx-auto px-6">
  <div class="bg-ms-disclaimer-bg border border-ms-disclaimer-border rounded-lg px-[1.1rem] py-[0.85rem] text-[0.88rem] text-ms-disclaimer-text leading-[1.5]">
    <strong class="font-semibold">Важно:</strong> Този сайт предоставя информация, не медицински съвет.
    Винаги се консултирай с лекаря си за решения относно лечението.
  </div>
</div>
```

- [ ] **Step 2: Create BackButton.astro**
```astro
---
// src/components/BackButton.astro
---
<a
  href="/"
  class="inline-flex items-center gap-[0.4rem] text-[0.95rem] font-medium text-ms-accent hover:text-ms-accent-hover transition-colors duration-150 min-h-[48px] py-2 mb-6 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ms-accent rounded"
>
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path d="M13 16l-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
  Обратно към начало
</a>
```

- [ ] **Step 3: Verify build still passes**
```bash
npm run build
```
Expected: exits 0.

- [ ] **Step 4: Commit**
```bash
git add src/components/Disclaimer.astro src/components/BackButton.astro
git commit -m "feat: add Disclaimer and BackButton components"
```

---

### Task 6: SectionCard component

**Files:**
- Create: `src/components/SectionCard.astro`

- [ ] **Step 1: Create SectionCard.astro**
```astro
---
// src/components/SectionCard.astro
interface Props {
  title: string;
  description: string;
  icon: string;
  href: string;
  animationDelay?: string;
}
const { title, description, icon, href, animationDelay = '0s' } = Astro.props;
---
<a
  href={href}
  class="group flex items-start gap-4 bg-ms-card border border-ms-border rounded-card p-[1.35rem_1.4rem] no-underline text-ms-text transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(60,60,50,0.06),0_1px_4px_rgba(60,60,50,0.06)] hover:border-ms-accent focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ms-accent focus-visible:ring-offset-2 min-h-[48px] animate-fade-in-up"
  style={`animation-delay: ${animationDelay}`}
>
  <div
    class="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-ms-accent-light rounded-lg text-2xl leading-none"
    aria-hidden="true"
  >
    {icon}
  </div>
  <div class="flex-1 min-w-0">
    <div class="font-heading font-semibold text-[1.05rem] leading-[1.35] text-ms-text mb-1">
      {title}
    </div>
    <div class="text-[0.92rem] text-ms-muted leading-[1.5]">
      {description}
    </div>
  </div>
  <svg
    class="flex-shrink-0 text-ms-accent opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200 self-center"
    width="20" height="20" viewBox="0 0 20 20" fill="none"
    aria-hidden="true"
  >
    <path d="M7 4l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
</a>
```

- [ ] **Step 2: Update index.astro to render one card for verification**

Replace `src/pages/index.astro` with:
```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import SectionCard from '../components/SectionCard.astro';
---
<BaseLayout title="МС Навигатор" description="Тест.">
  <div class="p-8">
    <SectionCard
      title="Какво е множествена склероза?"
      description="Какво се случва в тялото ти, обяснено с прости думи."
      icon="🧠"
      href="/kakvo-e-ms"
      animationDelay="0.03s"
    />
  </div>
</BaseLayout>
```

- [ ] **Step 3: Run dev server and verify card**
```bash
npm run dev
```
Open http://localhost:4321. Expected: card with icon, title, description. Hover: card lifts, border turns green, arrow appears from right. Tab focus: 3px green ring.

- [ ] **Step 4: Verify build**
```bash
npm run build
```
Expected: exits 0.

- [ ] **Step 5: Commit**
```bash
git add src/components/SectionCard.astro src/pages/index.astro
git commit -m "feat: add SectionCard component with hover and focus states"
```

---

### Task 7: SectionLayout component

**Files:**
- Create: `src/components/SectionLayout.astro`

- [ ] **Step 1: Create SectionLayout.astro**
```astro
---
// src/components/SectionLayout.astro
import BackButton from './BackButton.astro';
import Disclaimer from './Disclaimer.astro';

interface Props {
  title: string;
  summary: string;
}
const { title, summary } = Astro.props;
---
<div class="max-w-content mx-auto px-6 pt-8 pb-12">
  <BackButton />
  <h1 class="font-heading font-bold text-[clamp(1.4rem,3.5vw,1.8rem)] leading-[1.3] text-ms-text mb-2">
    {title}
  </h1>
  <p class="text-[1.05rem] text-ms-muted leading-[1.65] mb-8 pb-6 border-b border-ms-border">
    {summary}
  </p>
  <div class="prose prose-lg max-w-none text-ms-text leading-[1.7] prose-headings:font-heading prose-headings:text-ms-text prose-a:text-ms-accent">
    <slot />
  </div>
  <div class="mt-12">
    <Disclaimer />
  </div>
</div>
```

- [ ] **Step 2: Verify build passes**
```bash
npm run build
```
Expected: exits 0.

- [ ] **Step 3: Commit**
```bash
git add src/components/SectionLayout.astro
git commit -m "feat: add SectionLayout component"
```

---

### Task 8: Home page — index.astro (final)

**Files:**
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Replace index.astro with the full home page**
```astro
---
// src/pages/index.astro
import BaseLayout from '../layouts/BaseLayout.astro';
import SectionCard from '../components/SectionCard.astro';
import Disclaimer from '../components/Disclaimer.astro';

const sections = [
  { icon: "🧠", title: "Какво е множествена склероза?",  description: "Какво се случва в тялото ти, обяснено с прости думи.",                href: "/kakvo-e-ms" },
  { icon: "📋", title: "Видове МС",                      description: "Пристъпно-ремитентна, прогресираща — какво означават за теб.",           href: "/vidove-ms" },
  { icon: "⚡", title: "Какво е пристъп?",               description: "Как да разпознаеш пристъп и какво да правиш.",                          href: "/pristap" },
  { icon: "🔍", title: "Симптоми",                       description: "Какво може да изпитваш и защо е различно при всеки.",                    href: "/simptomi" },
  { icon: "🏥", title: "Изследвания",                    description: "ЯМР, лумбална пункция — какво означават резултатите.",                   href: "/izsledvania" },
  { icon: "💊", title: "Лечение",                        description: "Какви терапии съществуват днес, включително HSCT.",                      href: "/lechenie" },
  { icon: "👨‍⚕️", title: "Твоят медицински екип",       description: "Как да работиш ефективно с лекарите си.",                               href: "/meditsinski-ekip" },
  { icon: "🥗", title: "Хранене и диети",                description: "Какво знае науката и какво е просто мода.",                             href: "/hranene-i-dieti" },
  { icon: "🚩", title: "Внимание: шарлатани",            description: "Как да разпознаеш фалшиви „лекове" и измами.",                          href: "/sharlatani" },
  { icon: "💛", title: "Емоционалната страна",           description: "За скръбта, страха и как да се справиш.",                               href: "/emotsii" },
  { icon: "❓", title: "Често задавани въпроси",         description: "Работа, деца, спорт — бързи отговори.",                                 href: "/chesti-vaprosi" },
];
---
<BaseLayout
  title="МС Навигатор"
  description="Информация за множествена склероза на разбираем български език. Създадено от човек с МС, за хора с МС."
>
  <header class="max-w-content mx-auto px-6 pt-10">
    <div class="flex items-center gap-2 font-heading font-bold text-[1.75rem] tracking-[-0.02em] text-ms-accent">
      <span class="w-[10px] h-[10px] rounded-full bg-ms-accent opacity-50 inline-block" aria-hidden="true"></span>
      МС Навигатор
    </div>
  </header>

  <section class="max-w-content mx-auto px-6 pt-8 pb-4" aria-labelledby="hero-heading">
    <h1 id="hero-heading" class="font-heading font-bold text-[clamp(1.6rem,4vw,2.2rem)] leading-[1.3] tracking-[-0.01em] text-ms-text mb-3">
      Информация за множествена склероза на разбираем български език
    </h1>
    <p class="text-[1.1rem] text-ms-muted max-w-[600px] leading-[1.65]">
      Създадено от човек с МС, за хора с МС. Тук ще намериш ясни и честни отговори — без медицински жаргон и без излишна паника.
    </p>
  </section>

  <div class="mt-2 mb-0">
    <Disclaimer />
  </div>

  <section class="max-w-content mx-auto px-6 pt-7 pb-12" aria-label="Раздели">
    <div class="grid grid-cols-1 gap-[0.85rem] sm-ms:grid-cols-2">
      {sections.map((s, i) => (
        <SectionCard
          title={s.title}
          description={s.description}
          icon={s.icon}
          href={s.href}
          animationDelay={`${(i + 1) * 0.03}s`}
        />
      ))}
    </div>
  </section>

  <footer class="max-w-content mx-auto px-6 py-6 border-t border-ms-border text-[0.85rem] text-ms-muted text-center leading-[1.6]">
    МС Навигатор &middot; Създадено с грижа от човек с МС &middot; Не заменя медицински съвет
  </footer>
</BaseLayout>
```

- [ ] **Step 2: Run dev server and compare visually with the prototype**
```bash
npm run dev
```
Open http://localhost:4321 alongside `documents/ms-navigator-homepage.html` in another tab. Check: warm background, site name with dot, h1, disclaimer box, 2-column card grid (on wide screen), single column on narrow, footer. Hover cards: lift + green border + arrow.

- [ ] **Step 3: Verify build**
```bash
npm run build
```
Expected: exits 0.

- [ ] **Step 4: Commit**
```bash
git add src/pages/index.astro
git commit -m "feat: build home page with 11 section cards"
```

---

### Task 9: Content Collection — schema + 11 Markdown placeholders

**Files:**
- Create: `src/content/config.ts`
- Create: `src/content/sections/` (11 `.md` files)

- [ ] **Step 1: Create content collection schema**
```ts
// src/content/config.ts
import { defineCollection, z } from 'astro:content';

const sections = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    summary: z.string(),
  }),
});

export const collections = { sections };
```

- [ ] **Step 2: Create the sections directory**
```bash
mkdir -p src/content/sections
```

- [ ] **Step 3: Create all 11 Markdown files**

`src/content/sections/kakvo-e-ms.md`:
```markdown
---
title: "Какво е множествена склероза?"
summary: "Множествената склероза е хронично заболяване, при което имунната система атакува защитната обвивка на нервите. Това може да причини различни симптоми, но не е смъртна присъда — милиони хора по света живеят пълноценен живот с МС."
---

## Какво се случва в тялото

Съдържание идва скоро.

## Какво МС не е

Съдържание идва скоро.

## Защо се появява

Съдържание идва скоро.
```

`src/content/sections/vidove-ms.md`:
```markdown
---
title: "Видове МС"
summary: "Има няколко вида МС, като най-честият е пристъпно-ремитентният (RRMS), при който симптомите идват и си отиват. Видът, който имаш, помага на лекаря ти да избере най-доброто лечение."
---

## Пристъпно-ремитентна МС (RRMS)

Съдържание идва скоро.

## Прогресираща МС

Съдържание идва скоро.
```

`src/content/sections/pristap.md`:
```markdown
---
title: "Какво е пристъп (рецидив)?"
summary: "Пристъпът е период, в който се появяват нови симптоми или старите се влошават. Важно е да знаеш разликата между пристъп и временно влошаване от умора или жега."
---

## Как изглежда един пристъп

Съдържание идва скоро.

## Какво да правиш

Съдържание идва скоро.
```

`src/content/sections/simptomi.md`:
```markdown
---
title: "Симптоми"
summary: "МС може да причини различни симптоми — от умора и изтръпване до проблеми със зрението и равновесието. Не всеки изпитва всичко, и МС е различна при всеки човек."
---

## Умора

Съдържание идва скоро.

## Изтръпване и мравучкане

Съдържание идва скоро.

## Зрителни проблеми

Съдържание идва скоро.
```

`src/content/sections/izsledvania.md`:
```markdown
---
title: "Изследвания"
summary: "ЯМР и лумбалната пункция са основните изследвания при МС. Тук обясняваме какво означават резултатите с прости думи."
---

## Какво е ЯМР

Съдържание идва скоро.

## Лумбална пункция

Съдържание идва скоро.
```

`src/content/sections/lechenie.md`:
```markdown
---
title: "Лечение"
summary: "Днес съществуват множество терапии, които могат да забавят прогресията на МС, включително HSCT (трансплантация на стволови клетки). Имаш право да участваш в избора на своето лечение."
---

## Модифициращи терапии (DMTs)

Съдържание идва скоро.

## HSCT — трансплантация на стволови клетки

Съдържание идва скоро.
```

`src/content/sections/meditsinski-ekip.md`:
```markdown
---
title: "Твоят медицински екип"
summary: "Добрата комуникация с лекаря ти е ключова за управлението на МС. Тук ще намериш съвети как да се подготвиш за преглед и кога да потърсиш второ мнение."
---

## Невролог срещу МС-специалист

Съдържание идва скоро.

## Как да се подготвиш за преглед

Съдържание идва скоро.
```

`src/content/sections/hranene-i-dieti.md`:
```markdown
---
title: "Хранене и диети"
summary: "Много диети обещават чудеса за МС, но науката е по-предпазлива. Тук разглеждаме какво наистина знаем и как да не попаднеш на маркетингови трикове."
---

## Популярни диети при МС

Съдържание идва скоро.

## Какво казва науката

Съдържание идва скоро.
```

`src/content/sections/sharlatani.md`:
```markdown
---
title: "Внимание: шарлатани"
summary: "Хората с МС често са мишена за измамници, които обещават „пълно излекуване". Тук ще научиш как да разпознаваш фалшиви лекове и да защитиш себе си."
---

## Типични обещания, които трябва да те насторожат

Съдържание идва скоро.

## Как да проверяваш информация

Съдържание идва скоро.
```

`src/content/sections/emotsii.md`:
```markdown
---
title: "Емоционалната страна"
summary: "Диагнозата МС идва с много емоции — шок, страх, скръб. Всичко това е нормално и тук говорим открито за него."
---

## Шокът и отричането

Съдържание идва скоро.

## Как да потърсиш помощ

Съдържание идва скоро.
```

`src/content/sections/chesti-vaprosi.md`:
```markdown
---
title: "Често задавани въпроси"
summary: "„Мога ли да работя?", „Мога ли да имам деца?", „Ще бъда ли в инвалидна количка?" — бързи и честни отговори на най-честите въпроси."
---

## Мога ли да работя?

Съдържание идва скоро.

## Мога ли да имам деца?

Съдържание идва скоро.

## Мога ли да спортувам?

Съдържание идва скоро.
```

- [ ] **Step 4: Verify type checking passes**
```bash
npm run check
```
Expected: exits 0 with no errors about the content collection.

- [ ] **Step 5: Commit**
```bash
git add src/content/
git commit -m "feat: add content collection schema and 11 placeholder sections"
```

---

### Task 10: Eleven section pages

**Files:**
- Create: `src/pages/kakvo-e-ms.astro` (and 10 more with the same pattern)

All 11 pages are identical in structure — only the slug changes.

- [ ] **Step 1: Create kakvo-e-ms.astro**
```astro
---
// src/pages/kakvo-e-ms.astro
import { getEntry } from 'astro:content';
import BaseLayout from '../layouts/BaseLayout.astro';
import SectionLayout from '../components/SectionLayout.astro';

const entry = await getEntry('sections', 'kakvo-e-ms');
const { Content } = await entry.render();
---
<BaseLayout title={entry.data.title} description={entry.data.summary}>
  <SectionLayout title={entry.data.title} summary={entry.data.summary}>
    <Content />
  </SectionLayout>
</BaseLayout>
```

- [ ] **Step 2: Create the remaining 10 pages using the same pattern**

For each file below, copy the template from Step 1 and replace the slug (`'kakvo-e-ms'`) and filename accordingly:

| File | Slug |
|------|------|
| `src/pages/vidove-ms.astro` | `'vidove-ms'` |
| `src/pages/pristap.astro` | `'pristap'` |
| `src/pages/simptomi.astro` | `'simptomi'` |
| `src/pages/izsledvania.astro` | `'izsledvania'` |
| `src/pages/lechenie.astro` | `'lechenie'` |
| `src/pages/meditsinski-ekip.astro` | `'meditsinski-ekip'` |
| `src/pages/hranene-i-dieti.astro` | `'hranene-i-dieti'` |
| `src/pages/sharlatani.astro` | `'sharlatani'` |
| `src/pages/emotsii.astro` | `'emotsii'` |
| `src/pages/chesti-vaprosi.astro` | `'chesti-vaprosi'` |

- [ ] **Step 3: Build and verify all 12 pages exist in dist/**
```bash
npm run build && ls dist/
```
Expected output includes: `index.html`, `kakvo-e-ms/`, `vidove-ms/`, `pristap/`, `simptomi/`, `izsledvania/`, `lechenie/`, `meditsinski-ekip/`, `hranene-i-dieti/`, `sharlatani/`, `emotsii/`, `chesti-vaprosi/`

```bash
ls dist/kakvo-e-ms/
```
Expected: `index.html`

- [ ] **Step 4: Run dev server and click through all 11 cards**
```bash
npm run dev
```
Open http://localhost:4321. Click every card on the home page. Each section page should show: BackButton top-left, h1 title, summary paragraph with separator, placeholder content. BackButton navigates back to home.

- [ ] **Step 5: Commit**
```bash
git add src/pages/
git commit -m "feat: add 11 section pages"
```

---

### Task 11: Public assets — CNAME and favicon

**Files:**
- Create: `public/CNAME`
- Create: `public/favicon.svg`

- [ ] **Step 1: Create public/CNAME**

Create the file `public/CNAME` with exactly this content (one line, no extra whitespace):
```
ms-navigator.bg
```
GitHub Pages reads this to serve the site at the custom domain.

- [ ] **Step 2: Create public/favicon.svg**
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <circle cx="16" cy="16" r="14" fill="#3B7A6A"/>
  <circle cx="16" cy="16" r="6" fill="white" opacity="0.7"/>
</svg>
```

- [ ] **Step 3: Verify favicon appears in browser**
```bash
npm run dev
```
Open http://localhost:4321. Check the browser tab — it should show a small teal/green circle icon.

- [ ] **Step 4: Verify CNAME is copied to dist/ on build**
```bash
npm run build && cat dist/CNAME
```
Expected: `ms-navigator.bg`

- [ ] **Step 5: Commit**
```bash
git add public/
git commit -m "feat: add CNAME and favicon"
```

---

### Task 12: GitHub Actions deployment workflow

**Files:**
- Create: `.github/workflows/deploy.yml`

- [ ] **Step 1: Create the workflow directory**
```bash
mkdir -p .github/workflows
```

- [ ] **Step 2: Create deploy.yml**
```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Type check
        run: npm run check

      - name: Build
        run: npm run build

      - name: Upload Pages artifact
        if: github.ref == 'refs/heads/main'
        uses: actions/upload-pages-artifact@v3
        with:
          path: dist/

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 3: Verify local build is still clean**
```bash
npm run check && npm run build
```
Expected: both exit 0.

- [ ] **Step 4: Commit**
```bash
git add .github/
git commit -m "ci: add GitHub Actions deploy workflow"
```

---

### Task 13: Connect to GitHub and push

**Prerequisite (manual):** Before running these steps, create the GitHub repo:
1. Go to https://github.com/new
2. Repository name: `ms-navigator`
3. Visibility: **Public** (required for free GitHub Pages)
4. Do **not** initialize with README, .gitignore, or license
5. Click "Create repository"

Then enable Pages:
- Settings → Pages → Source → **GitHub Actions**

- [ ] **Step 1: Add the remote**
```bash
git remote add origin https://github.com/coldsoul/ms-navigator.git
```

- [ ] **Step 2: Verify commit history looks correct**
```bash
git log --oneline
```
Expected: 11–13 commits from Tasks 1–12, most recent at top.

- [ ] **Step 3: Push**
```bash
git push -u origin main
```

- [ ] **Step 4: Watch the Actions run**

Go to https://github.com/coldsoul/ms-navigator/actions — the "Deploy to GitHub Pages" workflow should appear and run. Wait for both the `build` and `deploy` jobs to turn green (typically 2–4 minutes).

- [ ] **Step 5: Verify the deployed site**

After the workflow passes, open the URL shown in the `deploy` job (something like `https://coldsoul.github.io/ms-navigator/`). The home page should render with all 11 cards.

- [ ] **Step 6: Configure custom domain in GitHub Pages settings**

In the GitHub repo: Settings → Pages → Custom domain → type `ms-navigator.bg` → Save.

At your domain registrar, add these DNS records:
```
A    @    185.199.108.153
A    @    185.199.109.153
A    @    185.199.110.153
A    @    185.199.111.153
CNAME    www    coldsoul.github.io
```
(GitHub Pages' current IPs — verify against https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site if in doubt)

DNS propagation takes up to 24 hours. Once live, https://ms-navigator.bg serves the site with automatic HTTPS via GitHub's Let's Encrypt integration.
