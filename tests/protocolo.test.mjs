import { test } from 'node:test';
import assert from 'node:assert/strict';
import { avaliarPilares, exposicaoVendida, pernasRegra020, janelaHole } from '../src/lib/catalogo/protocolo.ts';
import { aplicarAjuste } from '../src/lib/motor/manejo.ts';

const C = { data: '2026-11-27', spot: 16.2 };
const grade = { strikes: Array.from({ length: 21 }, (_, i) => 12 + i * 0.5), vencimentos: ['2026-12-18', '2027-01-15', '2027-06-18', '2027-12-17'] };
const venda = () => ({ realizado: 0, pernas: [
  { id: 'p1', tipo: 'call', q: -10, strike: 15, venc: '2026-12-18', entrada: 0.8, vol: 0.4 },
  { id: 'p2', tipo: 'put', q: -10, strike: 13, venc: '2026-12-18', entrada: 0.1, vol: 0.4 },
] });

test('redução de 10% melhora a exposição', () => {
  const antes = venda();
  const { posicao } = aplicarAjuste(antes, [{ op: 'quantidade', perna: 'p1', q: -9 }], C, grade);
  const r = avaliarPilares(antes, posicao, C);
  assert.equal(exposicaoVendida(antes), 20);
  assert.equal(r.exposicao.depois, 19);
  assert.ok(r.exposicao.melhorou && r.atende);
});

test('encerrar a CALL vendida no dinheiro melhora o delta', () => {
  const antes = venda();
  const { posicao } = aplicarAjuste(antes, [{ op: 'encerrar', perna: 'p1' }], C, grade);
  assert.ok(avaliarPilares(antes, posicao, C).delta.melhorou);
});

test('ajuste que não melhora nenhum pilar', () => {
  const antes = { realizado: 0, pernas: [{ id: 'p1', tipo: 'call', q: 1, strike: 15, venc: '2026-12-18', entrada: 1, vol: 0.4 }] };
  const { posicao } = aplicarAjuste(antes, [{ op: 'quantidade', perna: 'p1', q: 2 }], C, grade);
  const r = avaliarPilares(antes, posicao, C);
  assert.equal(r.atende, false);
});

test('regra dos R$ 0,20 só aponta vendidas baratas', () => {
  const p = venda();
  p.pernas.push({ id: 'p3', tipo: 'put', q: 5, strike: 12, venc: '2026-12-18', entrada: 0.05, vol: 0.4 });
  assert.deepEqual(pernasRegra020(p, C), ['p2']);
});

test('janelas do calendário', () => {
  const ids = [30, 22, 15, 12, 8, 6, 3].map((d) => janelaHole(d).id);
  assert.deepEqual(ids, ['montagem', 'manutencao', 'manutencao', 'travas', 'travas', 'final', 'final']);
});

test('adicionar com vencIndice −1 usa o vencimento mais longo', () => {
  const { posicao } = aplicarAjuste(venda(), [{ op: 'adicionar', tipo: 'put', q: 1, strikePassos: -2, vencIndice: -1 }], C, grade);
  assert.equal(posicao.pernas.at(-1).venc, '2027-12-17');
});

import { deltaEstrutural, creditoEntrada } from '../src/lib/catalogo/protocolo.ts';
const perna = (id, tipo, q, strike, entrada = 0) => ({ id, tipo, q, strike, venc: '2026-12-18', entrada, vol: 0.4 });

test('delta estrutural: exemplos dos POPs do Prof. Su', () => {
  assert.equal(deltaEstrutural({ realizado: 0, pernas: [perna('a', 'call', 3, 28), perna('b', 'call', -4, 29), perna('c', 'call', 1, 34)] }), -2);
  assert.equal(deltaEstrutural({ realizado: 0, pernas: [perna('a', 'call', 1, 110), perna('b', 'call', -2, 114), perna('c', 'call', 1, 120)] }), -2);
});

test('delta estrutural só existe com soma das quantidades zero, um tipo e um vencimento', () => {
  assert.equal(deltaEstrutural({ realizado: 0, pernas: [perna('a', 'call', 1, 28), perna('b', 'call', -1, 30), perna('c', 'put', -1, 26)] }), null);
  assert.equal(deltaEstrutural({ realizado: 0, pernas: [perna('a', 'call', 1, 28), perna('b', 'call', -2, 30)] }), null);
});

test('crédito de entrada: positivo quando recebe', () => {
  const p = { realizado: 0, pernas: [perna('a', 'call', 1, 110, 6), perna('b', 'call', -2, 114, 4), perna('c', 'call', 1, 120, 0.5)] };
  assert.ok(Math.abs(creditoEntrada(p) - 1.5) < 1e-12);
});
