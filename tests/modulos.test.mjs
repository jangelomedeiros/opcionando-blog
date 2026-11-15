import { test } from 'node:test';
import assert from 'node:assert/strict';
import { faixa, anatomia, curvasPorPrazo, gregasAoLongo, deltaNoTempo, premioPorVol, quedaDeVol, densidade, probLucro } from '../src/lib/conceitos/modulos.ts';
import { normalAcumulada, SELIC_PADRAO } from '../src/lib/motor/bs.ts';

const S = 15.1, K = 15.2, T = 24 / 252, V = 0.36;
const xs = faixa(S);
const passo = xs[1] - xs[0];
const finitos = (o) => Object.values(o).every(Number.isFinite);
const argmax = (a) => a.indexOf(Math.max(...a));
const trap = (x, y) => y.slice(1).reduce((s, v, i) => s + ((v + y[i]) / 2) * (x[i + 1] - x[i]), 0);

test('anatomia: valor = intrínseco + extrínseco; extrínseco máximo perto do strike; PUT', () => {
  const a = anatomia('call', K, xs, T, V);
  a.forEach((p) => assert.ok(Math.abs(p.valor - p.intrinseco - p.extrinseco) < 1e-12));
  assert.ok(Math.abs(xs[argmax(a.map((p) => p.extrinseco))] - K) <= passo + 1e-9);
  anatomia('put', K, xs, T, V).forEach((p, i) => assert.equal(p.intrinseco > 0, xs[i] < K));
});

test('curvasPorPrazo: 0 du = intrínseco e ordenadas', () => {
  const [c60, c30, c10, c0] = curvasPorPrazo('call', K, xs, [60, 30, 10, 0], V);
  c0.forEach((v, i) => assert.ok(Math.abs(v - Math.max(xs[i] - K, 0)) < 1e-12));
  xs.forEach((_, i) => assert.ok(c60[i] >= c30[i] - 1e-12 && c30[i] >= c10[i] - 1e-12 && c10[i] >= c0[i] - 1e-12, `i=${i}`));
});

test('gregasAoLongo: limites, pico do gama e T = 0', () => {
  const gc = gregasAoLongo('call', K, xs, T, V), gp = gregasAoLongo('put', K, xs, T, V);
  gc.forEach((g) => assert.ok(g.delta >= 0 && g.delta <= 1 && g.gama >= 0 && g.vega >= 0));
  gp.forEach((g) => assert.ok(g.delta >= -1 && g.delta <= 0));
  // o pico do gama fica um pouco abaixo do strike: S* = K·e^(−(r + 1,5σ²)T)
  const pico0 = K * Math.exp(-(SELIC_PADRAO + 1.5 * V * V) * T);
  assert.ok(Math.abs(xs[argmax(gc.map((g) => g.gama))] - pico0) <= passo + 1e-9);
  const pico = (du) => Math.max(...gregasAoLongo('call', K, xs, du / 252, V).map((g) => g.gama));
  assert.ok(pico(3) > pico(30));
  gregasAoLongo('call', K, xs, 0, V).forEach((g) => assert.ok(finitos(g)));
});

test('deltaNoTempo: ITM → 1, OTM → 0, ATM ~ 0,5', () => {
  const [itm, atm, otm] = deltaNoTempo('call', K, [K * 1.1, K, K * 0.9], 60, V);
  assert.ok(itm.at(-1) > 0.99 && otm.at(-1) < 0.01);
  assert.ok(atm[0] >= 0.45 && atm[0] <= 0.65, String(atm[0]));
  assert.equal(itm.length, 61);
});

test('premioPorVol e quedaDeVol', () => {
  const p = premioPorVol('call', S, K, T, [0.05, 0.2, 0.4, 0.8, 1.2]);
  p.slice(1).forEach((v, i) => assert.ok(v > p[i]));
  assert.ok(p.every(Number.isFinite));
  const q = quedaDeVol('call', S, K, T, 0.6, 0.35);
  assert.ok(q.antes > q.depois && q.perda > 0);
});

test('densidade integra ~1 e probLucro bate com N(d2)', () => {
  const amplo = Array.from({ length: 2001 }, (_, i) => S * (0.3 + (1.7 * i) / 2000));
  const area = trap(amplo, densidade(S, amplo, T, V));
  assert.ok(area >= 0.98 && area <= 1.0001, String(area));
  const premio = 0.71, be = K + premio;
  const ys = amplo.map((x) => Math.max(x - K, 0) - premio);
  const p = probLucro(amplo, ys, densidade(S, amplo, T, V));
  const d2 = (Math.log(S / be) + (SELIC_PADRAO - (V * V) / 2) * T) / (V * Math.sqrt(T));
  assert.ok(Math.abs(p - normalAcumulada(d2)) < 0.01, `${p} vs ${normalAcumulada(d2)}`);
  const pv = probLucro(amplo, ys.map((y) => -y), densidade(S, amplo, T, V));
  assert.ok(Math.abs(p + pv - 1) < 0.01);
});
