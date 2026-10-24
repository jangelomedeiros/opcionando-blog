// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// TROQUE pela URL final do blog (domínio próprio ou o endereço .pages.dev)
export default defineConfig({
  site: 'https://opcionando.com.br',
  integrations: [sitemap()],
});
