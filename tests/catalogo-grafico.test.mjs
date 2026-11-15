import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { segmentosPorSinal, faixaPrecos, escalas, caminho, area } from '../src/lib/catalogo/grafico.ts';
import { posicaoReferencia } from '../src/lib/catalogo/converter.ts';
import { curvaVencimento } from '../src/lib/motor/posicao.ts';

const ESTRUTURAS = JSON.parse(readFileSync(new URL('../src/data/laboratorio/estruturas.json', import.meta.url), 'utf8'));
const CAIXA = { L: 40, R: 10, T: 10, B: 30, W: 600, H: 300 };

test('segmentosPorSinal corta no zero', () => {
  const s = segmentosPorSinal([0, 1, 2, 3], [-1, -1, 1, 1]);
  assert.equal(s.length, 2);
  assert.equal(s[0].sinal, -1);
  assert.deepEqual(s[0].pontos.at(-1), [1.5, 0]);
  assert.equal(s[1].sinal, 1);
  assert.deepEqual(s[1].pontos[0], [1.5, 0]);
});

test('segmentos de uma venda coberta', () => {
  const { posicao, cenario } = posicaoReferencia(ESTRUTURAS.find((e) => e.id === 'covered-call'));
  const xs = faixaPrecos(posicao, cenario.spot);
  const s = segmentosPorSinal(xs, curvaVencimento(posicao, xs));
  assert.deepEqual(s.map((x) => x.sinal), [-1, 1]);
  assert.equal(Math.round(s[1].pontos[0][0] * 100) / 100, 22.23);
});

test('faixaPrecos inclui strikes e o spot e começa em >= 0', () => {
  const { posicao, cenario } = posicaoReferencia(ESTRUTURAS.find((e) => e.id === 'covered-call'));
  const xs = faixaPrecos(posicao, cenario.spot);
  assert.ok(xs[0] >= 0);
  assert.ok(xs.includes(25.04) && xs.includes(23.72));
  assert.ok(xs.every((x, i) => i === 0 || x > xs[i - 1]));
});

test('escalas: yMin <= 0 <= yMax e X/Y mapeiam as bordas da caixa', () => {
  const e = escalas([10, 20], [[1, 2], [3, 4]], CAIXA);
  assert.ok(e.yMin <= 0 && e.yMax >= 4);
  assert.equal(e.X(10), CAIXA.L);
  assert.equal(e.X(20), CAIXA.W - CAIXA.R);
  assert.equal(e.Y(e.yMax), CAIXA.T);
  assert.equal(e.Y(e.yMin), CAIXA.H - CAIXA.B);
});

test('caminho e area produzem strings sem NaN', () => {
  const e = escalas([0, 1, 2], [[-1, 0, 1]], CAIXA);
  const pts = [[0, -1], [1, 0], [2, 1]];
  const c = caminho(pts, e.X, e.Y), a = area(pts, e.X, e.Y);
  assert.match(c, /^M[\d.]+,[\d.]+( L[\d.]+,[\d.]+)+$/);
  assert.match(a, /Z$/);
  assert.ok(!/NaN/.test(c + a));
});
