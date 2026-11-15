import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const ler = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const ESTRUTURAS = JSON.parse(ler('src/data/laboratorio/estruturas.json'));
const NIVEIS = ['Iniciante', 'Intermediário', 'Avançado'];
const OBJETIVOS = ['Renda', 'Direcional', 'Proteção', 'Volatilidade', 'Ajuste'];

test('62 estruturas com nivel e objetivo válidos', () => {
  const ruins = ESTRUTURAS.filter((e) => !NIVEIS.includes(e.nivel) || !OBJETIVOS.includes(e.objetivo));
  assert.deepEqual(ruins.map((e) => `${e.id}: ${e.nivel}/${e.objetivo}`), []);
});

test('relatório lista os 62 rótulos como rascunho', () => {
  const rel = ler('docs/revisao/2026-11-15-textos-e-rotulos.md');
  const sec = rel.slice(rel.indexOf('## 2.'));
  assert.ok(sec.length > 5 && /rascunho/i.test(sec));
  const faltando = ESTRUTURAS.filter((e) => !sec.includes(`| ${e.id} | ${e.nivel} | ${e.objetivo} |`));
  assert.deepEqual(faltando.map((e) => e.id), []);
});

test('catálogo tem filtros de nível e objetivo', () => {
  const h = ler('dist/estrategias/index.html');
  for (const n of NIVEIS) assert.match(h, new RegExp(`data-nivel="${n}"[^>]*>${n}<`), n);
  for (const o of OBJETIVOS) assert.match(h, new RegExp(`data-objetivo="${o}"[^>]*>${o}<`), o);
  const cards = h.match(/<a class="lab-card"[^>]*>/g) ?? [];
  assert.equal(cards.length, 62);
  assert.ok(cards.every((c) => /data-nivel="[^"]+"/.test(c) && /data-objetivo="[^"]+"/.test(c)));
});

test('página da estrutura mostra nível e objetivo', () => {
  const h = ler('dist/estrategias/covered-call/index.html');
  assert.match(h, /class="chip-rotulo"[^>]*>Iniciante</);
  assert.match(h, /class="chip-rotulo"[^>]*>Renda</);
});
