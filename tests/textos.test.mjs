import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolverTexto, valoresDaReferencia } from '../src/lib/catalogo/textos.ts';
import { lerMercadoCsv } from '../src/lib/catalogo/converter.ts';

const ler = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const ESTRUTURAS = JSON.parse(ler('src/data/laboratorio/estruturas.json'));
const ANTES = JSON.parse(ler('tests/fixtures/estruturas-antes-dos-marcadores.json'));
const RELATORIO = 'docs/revisao/2026-11-15-textos-e-rotulos.md';
const textos = (e) => [e.racional, e.esperado, ...e.notas];

test('resolverTexto troca marcadores', () => {
  const v = { spot: 15.1, pernas: [{ k: 15, px: 0.8 }, { k: 16.5, px: 0.3 }], comparacao: [], be: [15.5] };
  assert.equal(resolverTexto('Acima de R$ {p2.k}, ganho {p2.k-p1.k}', v), 'Acima de R$ 16,50, ganho 1,50');
  assert.equal(resolverTexto('BE {be1}; teto {p1.k+p1.px}; spot {spot}', v), 'BE 15,50; teto 15,80; spot 15,10');
  assert.equal(resolverTexto('mil {p1.k}', { ...v, pernas: [{ k: 1234.5, px: 0 }] }), 'mil 1.234,50');
});

test('marcador inválido lança erro', () => {
  const v = { spot: 15, pernas: [{ k: 15, px: 1 }, { k: 16, px: 0.5 }], comparacao: [], be: [] };
  assert.throws(() => resolverTexto('x {p5.k}', v, 'teste'), /Marcador inválido \{p5\.k\} em teste/);
  assert.throws(() => resolverTexto('x {be1}', v, 'teste'), /Marcador inválido \{be1\} em teste/);
});

test('resolver com a referência reproduz o texto original', () => {
  for (const e of ESTRUTURAS) {
    const antes = ANTES.find((x) => x.id === e.id);
    const v = valoresDaReferencia(e);
    assert.deepEqual(textos(e).map((t) => resolverTexto(t, v, e.id)), textos(antes), e.id);
  }
});

test('números que sobraram estão no relatório de revisão', () => {
  assert.ok(existsSync(new URL(`../${RELATORIO}`, import.meta.url)), 'relatório ausente');
  const rel = ler(RELATORIO);
  const faltando = [];
  for (const e of ESTRUTURAS) {
    for (const n of textos(e).join(' ').match(/\d+,\d{2}/g) ?? []) {
      if (!rel.includes(`| ${e.id} | ${n} |`)) faltando.push(`${e.id} ${n}`);
    }
  }
  assert.deepEqual(faltando, []);
  assert.ok(ESTRUTURAS.some((e) => /\{p\d+\.k\}/.test(e.esperado)), 'migração não aplicada');
});

test('página mostra o texto com a montagem atual', () => {
  const m = lerMercadoCsv(ler('src/data/laboratorio/mercado.csv'));
  const call = m.linhas.find((l) => l.estrutura === 'covered-call' && l.tipo === 'call');
  const k = call.strike.toFixed(2).replace('.', ',');
  const h = ler('dist/estrategias/covered-call/index.html');
  const esperar = h.slice(h.indexOf('O que esperar'), h.indexOf('O que esperar') + 600);
  assert.ok(esperar.includes(k), `strike atual ${k} ausente`);
  assert.doesNotMatch(h.replace(/<script[\s\S]*?<\/script>/g, ''), /\{p\d|\{be\d|\{spot\}/);
});
