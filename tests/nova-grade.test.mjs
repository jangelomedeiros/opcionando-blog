import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';

test('nova_grade --plano lista os passos na ordem, sem executar nada', () => {
  const r = spawnSync(process.execPath, ['scripts/nova_grade.mjs', 'planilha.xlsx', 'ohlcv.json', '--plano'], { cwd: new URL('../', import.meta.url), encoding: 'utf8' });
  assert.equal(r.status, 0, r.stderr);
  const passos = r.stdout.trim().split('\n');
  assert.equal(passos.length, 6);
  assert.match(passos[0], /importar_grade\.py planilha\.xlsx/);
  assert.match(passos[1], /atualizar_candles\.mjs ohlcv\.json/);
  assert.match(passos[2], /fontes\.json/);
  assert.match(passos[3], /otimizar_montagens\.mjs/);
  assert.match(passos[4], /astro build|npm run build/);
  assert.match(passos[5], /node --test|npm test/);
});

test('nova_grade sem argumentos explica o uso e sai com erro', () => {
  const r = spawnSync(process.execPath, ['scripts/nova_grade.mjs'], { cwd: new URL('../', import.meta.url), encoding: 'utf8' });
  assert.equal(r.status, 1);
  assert.match(r.stderr, /Uso:/);
});
