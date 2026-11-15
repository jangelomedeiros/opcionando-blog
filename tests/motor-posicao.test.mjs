import { test } from 'node:test';
import assert from 'node:assert/strict';
import { precoBS } from '../src/lib/motor/bs.ts';
import { diasUteis } from '../src/lib/motor/calendario.ts';
import { valorPerna, resultado, gregasPosicao, primeiroVencimento, curva, curvaVencimento } from '../src/lib/motor/posicao.ts';

const perto = (a, b, tol = 1e-9, msg = '') => assert.ok(Math.abs(a - b) <= tol, `${msg} ${a} vs ${b}`);
const C = { data: '2026-11-13', spot: 15.1 };
const T = (venc) => diasUteis(C.data, venc) / 252;

test('venda coberta no vencimento', () => {
  const pos = { realizado: 0, pernas: [
    { id: 'a', tipo: 'acao', q: 1, entrada: 15 },
    { id: 'c', tipo: 'call', q: -1, strike: 16, venc: '2026-12-18', entrada: 0.5, vol: 0.4 },
  ] };
  const ys = curvaVencimento(pos, [12, 15, 16, 20]);
  [-2.5, 0.5, 1.5, 1.5].forEach((y, i) => perto(ys[i], y));
});

function trava(realizado = 0) {
  const e15 = precoBS('call', C.spot, 15, T('2026-12-18'), 0.45);
  const e16 = precoBS('call', C.spot, 16, T('2026-12-18'), 0.45);
  return { realizado, pernas: [
    { id: 'c15', tipo: 'call', q: 1, strike: 15, venc: '2026-12-18', entrada: e15, vol: 0.45 },
    { id: 'c16', tipo: 'call', q: -1, strike: 16, venc: '2026-12-18', entrada: e16, vol: 0.45 },
  ] };
}

test('resultado no cenário de entrada é zero quando a entrada é o preço teórico', () => {
  perto(resultado(trava(), C), 0);
});

test('realizado soma ao resultado', () => {
  perto(resultado(trava(0.37), C), 0.37);
});

test('gregas da posição: ação tem delta 1 e o resto 0; call vendida inverte sinal', () => {
  const g = gregasPosicao({ realizado: 0, pernas: [{ id: 'a', tipo: 'acao', q: 1, entrada: 15 }] }, C);
  assert.deepEqual(g, { delta: 1, gama: 0, theta: 0, vega: 0 });
  const comprada = gregasPosicao({ realizado: 0, pernas: [{ id: 'c', tipo: 'call', q: 1, strike: 15, venc: '2026-12-18', entrada: 1, vol: 0.45 }] }, C);
  const vendida = gregasPosicao({ realizado: 0, pernas: [{ id: 'c', tipo: 'call', q: -1, strike: 15, venc: '2026-12-18', entrada: 1, vol: 0.45 }] }, C);
  for (const k of ['delta', 'gama', 'theta', 'vega']) perto(vendida[k], -comprada[k], 1e-12, k);
  assert.ok(comprada.delta > 0 && comprada.theta < 0 && comprada.vega > 0);
});

test('calendário depois do 1º vencimento: perna vencida vale intrínseco e a longa segue por BS', () => {
  const pos = { realizado: 0, pernas: [
    { id: 'curta', tipo: 'call', q: -1, strike: 15, venc: '2026-12-18', entrada: 0.6, vol: 0.45 },
    { id: 'longa', tipo: 'call', q: 1, strike: 15, venc: '2027-01-15', entrada: 0.9, vol: 0.45 },
  ] };
  assert.equal(primeiroVencimento(pos), '2026-12-18');
  const c = { data: '2026-12-21', spot: 15.4 };
  perto(valorPerna(pos.pernas[0], c), 0.4, 1e-12, 'curta');
  assert.ok(valorPerna(pos.pernas[1], c) > 0.4, 'longa acima do intrínseco');
  for (const y of curvaVencimento(pos, [0, 5, 15, 30])) assert.ok(Number.isFinite(y));
});

test('choqueVol aumenta o valor de uma call comprada', () => {
  const p = { id: 'c', tipo: 'call', q: 1, strike: 15, venc: '2026-12-18', entrada: 1, vol: 0.45 };
  assert.ok(valorPerna(p, { ...C, choqueVol: 10 }) > valorPerna(p, C));
  assert.ok(valorPerna(p, { ...C, choqueVol: -100 }) >= 0.1 - 1e-12); // vol com piso 0 → intrínseco
});

test('xs com zero não gera NaN', () => {
  for (const y of curva(trava(), { data: C.data }, [0, 0.01, 15])) assert.ok(Number.isFinite(y), String(y));
});

test('perna sem vol vale intrínseco', () => {
  perto(valorPerna({ id: 'p', tipo: 'put', q: 1, strike: 16, venc: '2026-12-18', entrada: 1 }, C), 0.9, 1e-12);
  perto(valorPerna({ id: 'p', tipo: 'put', q: 1, strike: 16, venc: '2026-12-18', entrada: 1, vol: 0 }, C), 0.9, 1e-12);
});
