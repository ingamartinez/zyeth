// @ts-check
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';

// Zyeth submissions backend — Astro in SSR mode (Node adapter).
// Runs as a standalone Node process behind Caddy at admin.zyeth.work.
// The public marketing site (repo root) stays a separate static build.
export default defineConfig({
  output: 'server',
  adapter: node({ mode: 'standalone' }),
});
