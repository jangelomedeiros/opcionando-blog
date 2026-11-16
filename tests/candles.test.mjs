import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { candlesDeOhlcv } from '../scripts/lib/candles.mjs';

const ler = (p) => JSON.parse(readFileSync(new URL(`../${p}`, import.meta.url), 'utf8'));

test('candlesDeOhlcv: colunas do TradingView viram candles com médias simples do fechamento', () => {
  const n = 230;
  const t = Array.from({ length: n }, (_, i) => Date.UTC(2026, 0, 1, 13) / 1000 + i * 86400);
  const c = Array.from({ length: n }, (_, i) => 10 + (i % 7));
  const ohlcv = { t, o: c, h: c.map((x) => x + 1), l: c.map((x) => x - 1), c, v: c.map(() => 2_500_000) };
  const out = candlesDeOhlcv(ohlcv, 123);
  assert.equal(out.length, 123);
  assert.equal(out[0].d, '2026-04-18');
  assert.equal(out[out.length - 1].d, '2026-08-18');
  assert.deepEqual(Object.keys(out[0]), ['d', 'o', 'h', 'l', 'c', 'v', 'm20', 'm50', 'm200']);
  assert.equal(out[0].v, 2.5);
  const ult = out[out.length - 1];
  const sma = (k) => +(c.slice(n - k).reduce((a, b) => a + b, 0) / k).toFixed(2);
  assert.equal(ult.m20, sma(20));
  assert.equal(ult.m50, sma(50));
  assert.equal(ult.m200, sma(200));
});

test('candlesDeOhlcv aceita linhas [{t,o,h,l,c,v}] e deixa média nula quando não há pregões suficientes', () => {
  const rows = Array.from({ length: 30 }, (_, i) => ({ t: Date.UTC(2026, 0, 1, 13) / 1000 + i * 86400, o: 1, h: 2, l: 0.5, c: 1 + i / 100, v: 1e6 }));
  const out = candlesDeOhlcv(rows, 10);
  assert.equal(out.length, 10);
  assert.equal(out[9].m50, null);
  assert.ok(out[9].m20 > 1);
});

test('candles de 13/11 gerados do OHLCV batem com os de 12/11 nas datas em comum', () => {
  const novo = ler('src/data/candles/bbas3-2026-11-13.json'), velho = ler('src/data/candles/bbas3-2026-11-12.json');
  assert.equal(novo[novo.length - 1].d, '2026-11-13');
  assert.equal(novo.length, 123);
  const porData = new Map(velho.map((x) => [x.d, x]));
  const dif = [];
  for (const x of novo) {
    const y = porData.get(x.d);
    if (!y) continue;
    for (const k of ['o', 'h', 'l', 'c', 'm20', 'm50', 'm200']) if (Math.abs(x[k] - y[k]) > 0.011) dif.push(`${x.d} ${k}: ${x[k]} vs ${y[k]}`);
  }
  assert.deepEqual(dif, []);
});

test('fontes.json aponta para grade e candles existentes, da mesma data', () => {
  const f = ler('src/data/laboratorio/fontes.json');
  for (const p of [f.grade, f.candles]) assert.ok(existsSync(new URL(`../${p}`, import.meta.url)), p);
  const g = ler(f.grade), c = ler(f.candles);
  assert.equal(c[c.length - 1].d, g.data);
});
