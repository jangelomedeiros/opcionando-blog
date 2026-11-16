// Lê dist/ (rode npm run build antes).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { opcaoDaGrade } from '../src/lib/conceitos/jornada.ts';

const ler = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const FONTES = JSON.parse(ler('src/data/laboratorio/fontes.json'));
const GRADE = JSON.parse(ler(FONTES.grade));

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

test('sem JavaScript, o equilíbrio do comprador é strike + prêmio', () => {
  const op = opcaoDaGrade(GRADE, 'call');
  const be = (op.strike + op.premio).toFixed(2).replace('.', ',');
  const ns = ler('dist/conceitos/jornada-do-premio/index.html').match(/<noscript>([\s\S]*?)<\/noscript>/)[1];
  assert.ok(ns.includes(be), be);
  assert.doesNotMatch(ns, /alta superar o prêmio/);
});
