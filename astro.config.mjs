// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import preact from '@astrojs/preact';

// URL final do blog
export default defineConfig({
  site: 'https://opcionando.com.br',
  integrations: [mdx(), sitemap(), preact()],
});
