// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import preact from '@astrojs/preact';
import { readFileSync } from 'node:fs';

// Endereços antigos do Laboratório e das fichas → catálogo único em /estrategias/
const ids = JSON.parse(readFileSync(new URL('./src/data/laboratorio/estruturas.json', import.meta.url), 'utf8')).map((e) => e.id);
const redirects = {
  '/ferramentas/laboratorio': '/estrategias/',
  '/estrategias/venda-coberta': '/estrategias/covered-call/',
  '/estrategias/venda-de-put-coberta': '/estrategias/cash-put/',
  ...Object.fromEntries(ids.map((id) => [`/ferramentas/laboratorio/${id}`, `/estrategias/${id}/`])),
};

// URL final do blog
export default defineConfig({
  site: 'https://opcionando.com.br',
  integrations: [mdx(), sitemap(), preact()],
  redirects,
});
