import { test } from 'node:test';
import assert from 'node:assert/strict';
import { metricasVencimento, equilibrios } from '../src/lib/motor/metricas.ts';

const perto = (a, b, tol = 1e-6, msg = '') => assert.ok(a !== null && Math.abs(a - b) <= tol, `${msg} ${a} vs ${b}`);
const V = '2026-12-18';
const opc = (id, tipo, q, strike, entrada) => ({ id, tipo, q, strike, venc: V, entrada, vol: 0.4 });
const pos = (...pernas) => ({ realizado: 0, pernas });

test('venda coberta', () => {
  const m = metricasVencimento(pos({ id: 'a', tipo: 'acao', q: 1, entrada: 15 }, opc('c', 'call', -1, 16, 0.5)));
  perto(m.ganhoMax, 1.5, 1e-6, 'ganho');
  perto(m.perdaMax, -14.5, 1e-6, 'perda');
  assert.deepEqual(m.equilibrios, [14.5]);
});

test('call comprada: ganho ilimitado', () => {
  const m = metricasVencimento(pos(opc('c', 'call', 1, 15, 0.8)));
  assert.equal(m.ganhoMax, null);
  perto(m.perdaMax, -0.8);
  assert.deepEqual(m.equilibrios, [15.8]);
});

test('call vendida a seco: perda ilimitada', () => {
  const m = metricasVencimento(pos(opc('c', 'call', -1, 15, 0.8)));
  assert.equal(m.perdaMax, null);
  perto(m.ganhoMax, 0.8);
});

test('borboleta 14/15/16 com débito de 0,20', () => {
  const m = metricasVencimento(pos(opc('a', 'call', 1, 14, 1.4), opc('b', 'call', -2, 15, 0.8), opc('c', 'call', 1, 16, 0.4)));
  perto(m.ganhoMax, 0.8);
  perto(m.perdaMax, -0.2);
  assert.deepEqual(m.equilibrios, [14.2, 15.8]);
});

test('straddle vendido em 15 com crédito de 1,0', () => {
  const m = metricasVencimento(pos(opc('c', 'call', -1, 15, 0.5), opc('p', 'put', -1, 15, 0.5)));
  assert.deepEqual(m.equilibrios, [14, 16]);
  assert.equal(m.perdaMax, null);
  perto(m.ganhoMax, 1);
});

test('equilibrios: zero exato no ponto da grade conta uma vez', () => {
  assert.deepEqual(equilibrios([1, 2, 3], [-1, 0, 1]), [2]);
  assert.deepEqual(equilibrios([1, 2, 3], [1, 0, 1]), []); // toca o zero sem trocar de sinal
});
