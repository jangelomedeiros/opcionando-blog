// Lê dist/ (rode npm run build antes).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { opcaoDaGrade } from '../src/lib/conceitos/jornada.ts';

const ler = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const GRADE = JSON.parse(ler('src/data/grades/bbas3-2026-11-13.json'));

test('/conceitos/ lista a Jornada', () => {
  assert.match(ler('dist/conceitos/index.html'), /href="\/conceitos\/jornada-do-premio\/"/);
});

test('página da Jornada tem a ilha e o resumo sem JavaScript', () => {
  const h = ler('dist/conceitos/jornada-do-premio/index.html');
  assert.match(h, /astro-island/);
  const ns = h.match(/<noscript>([\s\S]*?)<\/noscript>/)?.[1] ?? '';
  assert.ok(ns.includes(opcaoDaGrade(GRADE, 'call').ticker), 'ticker da CALL');
  assert.match(ns, /Comprador/);
  assert.match(ns, /Vendedor/);
});

test('menu ganha Conceitos e mantém os itens', () => {
  const h = ler('dist/index.html');
  const nav = h.slice(h.indexOf('class="container-larga menu"'), h.indexOf('</nav>'));
  assert.match(nav, /href="\/conceitos"/);
  for (const x of ['/comece-aqui', '/acoes', '/analises', '/macro', '/estrategias', '/supercoberta', '/ferramentas', '/estudos', '/glossario', '/artigos']) assert.ok(nav.includes(`href="${x}"`), x);
});
