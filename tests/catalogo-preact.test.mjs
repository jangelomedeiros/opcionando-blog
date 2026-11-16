import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { metricasVencimento } from '../src/lib/motor/metricas.ts';

const ler = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');

test('integração preact configurada', () => {
  assert.match(ler('astro.config.mjs'), /preact\(/);
  const pkg = JSON.parse(ler('package.json'));
  assert.ok(pkg.dependencies['@astrojs/preact'] && pkg.dependencies.preact);
});

test('métricas de um calendário saem em menos de 100 ms', () => {
  const pos = { realizado: 0, pernas: [
    { id: 'c', tipo: 'call', q: -1, strike: 15, venc: '2026-12-18', entrada: 0.6, vol: 0.35 },
    { id: 'l', tipo: 'call', q: 1, strike: 15, venc: '2027-09-17', entrada: 1.6, vol: 0.35 },
  ] };
  metricasVencimento(pos);
  const t0 = performance.now();
  metricasVencimento(pos);
  const ms = performance.now() - t0;
  assert.ok(ms < 100, `${ms.toFixed(0)} ms`);
});
