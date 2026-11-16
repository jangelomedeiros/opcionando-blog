import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';

const dir = new URL('../src/lib/motor/', import.meta.url);

test('motor não usa APIs de Node nem imports do Vite', () => {
  const ruins = readdirSync(dir).filter((f) => {
    const s = readFileSync(new URL(f, dir), 'utf8');
    return s.includes("from 'node:") || s.includes('?raw') || s.includes(".json'");
  });
  assert.deepEqual(ruins, []);
});

test('laboratório usa o calendário do motor', () => {
  const s = readFileSync(new URL('../src/lib/laboratorio.ts', import.meta.url), 'utf8');
  assert.ok(!s.includes('const FERIADOS'), 'laboratorio.ts ainda define FERIADOS');
  assert.ok(s.includes("from './motor/calendario.ts'"), 'laboratorio.ts não importa o calendário do motor');
});
