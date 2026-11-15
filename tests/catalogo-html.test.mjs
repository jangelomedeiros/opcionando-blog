// Confere o HTML gerado por `npm run build` (rode o build antes de `npm test`).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { DISCLAIMER } from '../src/consts.ts';

const ler = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const IDS = JSON.parse(ler('src/data/laboratorio/estruturas.json')).map((e) => e.id);
const pagina = (id) => ler(`dist/estrategias/${id}/index.html`);

test('62 páginas de estrutura em /estrategias/<id>/', () => {
  const faltando = IDS.filter((id) => !existsSync(new URL(`../dist/estrategias/${id}/index.html`, import.meta.url)));
  assert.deepEqual(faltando, []);
});

test('página de estrutura tem ilha, abas e aviso legal', () => {
  const h = pagina('covered-call');
  assert.match(h, /astro-island/);
  assert.match(h, /role="tablist"/);
  for (const aba of ['Visão', 'POP', 'Manejo', 'Hoje']) assert.match(h, new RegExp(`role="tab"[^>]*>${aba}<`), aba);
  assert.ok(h.includes(DISCLAIMER.slice(0, 60)), 'aviso legal');
});

test('aba Vídeo só aparece com vídeo', () => {
  assert.doesNotMatch(pagina('thl-call'), /role="tab"[^>]*>Vídeo</);
});

test('sem JS o gráfico estático existe em noscript', () => {
  assert.match(pagina('covered-call'), /<noscript>[\s\S]*class="pf[\s"][\s\S]*<\/noscript>/);
});

test('conteúdo das fichas migrou', () => {
  const md = ler('src/content/estrategias/venda-coberta.md').split(/^---$/m)[2];
  const frase = md.split('\n').map((l) => l.trim()).find((l) => l && !l.startsWith('#') && !l.startsWith('-') && !l.startsWith('|') && l.length > 40);
  const trecho = frase.replace(/[*_`]/g, '').split('"')[0].trim().slice(0, 40);
  assert.ok(pagina('covered-call').includes(trecho), trecho);
});

test('catálogo lista as 62', () => {
  const h = ler('dist/estrategias/index.html');
  const faltando = IDS.filter((id) => !h.includes(`href="/estrategias/${id}/"`));
  assert.deepEqual(faltando, []);
});
