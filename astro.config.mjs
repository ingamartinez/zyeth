// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://zyeth.work',
  i18n: {
    locales: ['en', 'es'],
    defaultLocale: 'en',
    routing: {
      // EN served at "/", ES at "/es". See PLAN.md §6.
      prefixDefaultLocale: false,
    },
  },
  vite: {
    plugins: [tailwindcss()]
  }
});
