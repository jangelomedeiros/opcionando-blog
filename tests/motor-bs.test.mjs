import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { precoBS, gregasBS, volImplicita, SELIC_PADRAO } from '../src/lib/motor/bs.ts';

const grade = JSON.parse(readFileSync(new URL('./fixtures/grade-bbas3-2026-11-13.json', import.meta.url), 'utf8'));
const perto = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg ?? ''} ${a} vs ${b} (tol ${tol})`);
const mediana = (xs) => { const s = [...xs].sort((a, b) => a - b); return s[Math.floor(s.length / 2)]; };

test('valor de referência (Hull): S=42 K=40 r=10% σ=20% T=0,5', () => {
  perto(precoBS('call', 42, 40, 0.5, 0.2, 0.1), 4.7594, 1e-3, 'call');
  perto(precoBS('put', 42, 40, 0.5, 0.2, 0.1), 0.8086, 1e-3, 'put');
});

test('paridade put-call', () => {
  for (const S of [10, 15.1, 20]) {
    const c = precoBS('call', S, 15, 0.3, 0.4), p = precoBS('put', S, 15, 0.3, 0.4);
    perto(c - p, S - 15 * Math.exp(-SELIC_PADRAO * 0.3), 1e-9, `S=${S}`);
  }
});

test('gregas por diferença finita', () => {
  const S = 15.1, K = 15, T = 23 / 252, v = 0.45, h = 0.01;
  for (const tipo of ['call', 'put']) {
    const g = gregasBS(tipo, S, K, T, v);
    const P = (s = S, t = T, vol = v) => precoBS(tipo, s, K, t, vol);
    perto(g.preco, P(), 1e-12, `${tipo} preco`);
    perto(g.delta, (P(S + h) - P(S - h)) / (2 * h), 2e-3, `${tipo} delta`);
    perto(g.gama, (P(S + h) - 2 * P() + P(S - h)) / (h * h), 2e-3, `${tipo} gama`);
    perto(g.vega, (P(S, T, v + 1e-4) - P(S, T, v - 1e-4)) / 2e-4 / 100, 2e-3, `${tipo} vega`);
    perto(g.theta, P(S, T - 1 / 252) - P(), 2e-3, `${tipo} theta`);
  }
});

test('grade 13/11: delta do motor dentro de 0,03 do opcoes.net.br', () => {
  const fora = grade.series.filter((s) => Math.abs(gregasBS(s.tipo, grade.spot, s.strike, s.du / 252, s.vol).delta - s.delta) > 0.03);
  assert.deepEqual(fora.map((s) => s.ticker), []);
});

test('grade 13/11: gama, vega e theta na mesma escala do opcoes.net.br', () => {
  const fora = [];
  const razoesTheta = [];
  for (const s of grade.series) {
    const g = gregasBS(s.tipo, grade.spot, s.strike, s.du / 252, s.vol);
    const rg = s.gama / g.gama, rv = s.vega / (g.vega * 100);
    if (rg < 0.9 || rg > 1.15) fora.push(`${s.ticker} gama ${rg.toFixed(3)}`);
    if (rv < 0.95 || rv > 1.3) fora.push(`${s.ticker} vega ${rv.toFixed(3)}`);
    razoesTheta.push(s.theta / g.theta);
  }
  assert.deepEqual(fora, []);
  const mt = mediana(razoesTheta);
  assert.ok(mt >= 0.9 && mt <= 1.1, `mediana theta ${mt}`);
});

test('grade 13/11: preço teórico perto do último negócio', () => {
  const m = mediana(grade.series.map((s) => Math.abs(precoBS(s.tipo, grade.spot, s.strike, s.du / 252, s.vol) - s.ultimo) / s.ultimo));
  assert.ok(m <= 0.05, `mediana ${m}`);
});

test('volImplicita recupera a vol', () => {
  for (const v of [0.15, 0.45, 1.2]) {
    for (const tipo of ['call', 'put']) {
      perto(volImplicita(tipo, 15.1, 15, 0.25, precoBS(tipo, 15.1, 15, 0.25, v)), v, 1e-4, `${tipo} σ=${v}`);
    }
  }
});

test('volImplicita sem solução devolve null', () => {
  const casos = [
    ['call', 15.1, 14, 0.25, 0.5],   // abaixo do intrínseco (1,1)
    ['call', 15.1, 15, 0.25, 15.1],  // >= S
    ['put', 15.1, 15, 0, 0.3],       // T = 0
  ];
  for (const c of casos) {
    const t0 = performance.now();
    assert.equal(volImplicita(...c), null, JSON.stringify(c));
    assert.ok(performance.now() - t0 < 50);
  }
});

test('casos degenerados sem NaN', () => {
  for (const [S, T, v] of [[0, 0.3, 0.4], [15, 0, 0.4], [15, 0.3, 0], [15, -0.1, 0.4]]) {
    for (const tipo of ['call', 'put']) {
      const g = gregasBS(tipo, S, 15, T, v);
      for (const [k, x] of Object.entries(g)) assert.ok(Number.isFinite(x), `${tipo} S=${S} T=${T} v=${v} ${k}=${x}`);
    }
  }
  assert.equal(precoBS('put', 0, 15, 0.3, 0.4), 15);
});
