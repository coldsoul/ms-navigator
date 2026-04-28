import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://ms-navigator.bg',
  i18n: {
    defaultLocale: 'bg',
    locales: ['bg', 'en'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  integrations: [tailwind(), sitemap()],
});
