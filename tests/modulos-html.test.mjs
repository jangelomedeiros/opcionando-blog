// Lê dist/ (rode npm run build antes).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const ler = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const SLUGS = ['anatomia-do-premio', 'premio-e-prazo', 'gregas-ao-longo-do-preco', 'gregas-no-tempo', 'volatilidade', 'probabilidade'];

test('as 6 páginas de módulo existem com ilha e explicação sem JS', () => {
  for (const s of SLUGS) {
    const f = new URL(`../dist/conceitos/${s}/index.html`, import.meta.url);
    assert.ok(existsSync(f), s);
    const h = readFileSync(f, 'utf8');
    assert.match(h, /astro-island/, s);
    assert.match(h, /<noscript>[\s\S]{40,}<\/noscript>/, s);
  }
});

test('índice lista os 7 módulos e não tem mais "Em breve"', () => {
  const h = ler('dist/conceitos/index.html');
  for (const s of ['jornada-do-premio', ...SLUGS]) assert.ok(h.includes(`href="/conceitos/${s}/"`), s);
  assert.doesNotMatch(h, /Em breve/);
});
