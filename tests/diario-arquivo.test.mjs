import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { gravarRegistro } from '../scripts/lib/diario-arquivo.mjs';

const pasta = () => mkdtempSync(join(tmpdir(), 'diario-'));
const reg = (ev) => ({ data: '2026-11-13', spot: 15.1, sigma: 0.33, estruturas: [{ id: 'x', veredito: 'montar', ev }] });

test('grava o registro novo', () => {
  const p = join(pasta(), '2026-11-13.json');
  assert.equal(gravarRegistro(p, reg(0.1)), 'novo');
  assert.equal(JSON.parse(readFileSync(p, 'utf8')).estruturas[0].ev, 0.1);
});

test('registro igual: nada muda', () => {
  const p = join(pasta(), 'r.json');
  gravarRegistro(p, reg(0.1));
  assert.equal(gravarRegistro(p, reg(0.1)), 'igual');
});

test('registro diferente de um dia já gravado: preserva o original (o diário vale pelo que foi recomendado no dia)', () => {
  const p = join(pasta(), 'r.json');
  gravarRegistro(p, reg(0.1));
  assert.equal(gravarRegistro(p, reg(0.2)), 'preservado');
  assert.equal(JSON.parse(readFileSync(p, 'utf8')).estruturas[0].ev, 0.1);
});

test('com regravar: true, sobrescreve', () => {
  const p = join(pasta(), 'r.json');
  gravarRegistro(p, reg(0.1));
  assert.equal(gravarRegistro(p, reg(0.2), { regravar: true }), 'regravado');
  assert.equal(JSON.parse(readFileSync(p, 'utf8')).estruturas[0].ev, 0.2);
});

test('cria a pasta se não existir', () => {
  const p = join(pasta(), 'sub', 'r.json');
  assert.equal(gravarRegistro(p, reg(0.1)), 'novo');
  assert.ok(existsSync(p));
});
