// Lê dist/ (rode npm run build antes).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const ler = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');

test('página do protocolo de manejo', () => {
  const h = ler('dist/estrategias/protocolo-de-manejo/index.html');
  assert.match(h, /Prof\. Su/);
  for (const s of ['Melhorar o delta', 'Melhorar o theta', 'Reduzir a exposição', 'Mais de 22 du', 'De 22 a 12 du', 'De 12 a 6 du', 'Menos de 6 du', 'R$ 0,20', '10%']) assert.ok(h.includes(s), s);
});

test('aba Manejo leva ao protocolo', () => {
  assert.match(ler('dist/estrategias/covered-call/index.html'), /href="\/estrategias\/protocolo-de-manejo\/"/);
});
