import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const MANEJO = JSON.parse(readFileSync(new URL('../src/data/laboratorio/manejo.json', import.meta.url), 'utf8'));
const SU = ['mannerheim', 'quatermine-v1', 'quatermine-v2', 'hexabox', 'monada-basica-call', 'monada-basica-put', 'anakha',
  'b1', 'b2', 'b3-2x3', 'b3-3x4', 'thl-call', 'thl-put', 'thl-perene', 'clade', 'straddle-long-put', 'straddle-perene'];
const caminhos = (id) => MANEJO[id].cenarios.flatMap((c) => c.caminhos);
const ops = (id) => caminhos(id).flatMap((p) => p.ops ?? []);

test('estruturas da metodologia têm cenários com fonte Prof. Su', () => {
  for (const id of SU) {
    assert.ok(MANEJO[id], id);
    assert.match(MANEJO[id].fonte, /Prof\. Su/, id);
    assert.equal(MANEJO[id].revisado, false, id);
  }
});

test('B1 não rola', () => {
  assert.deepEqual(ops('b1').filter((o) => o.op.startsWith('rolar')), []);
});

test('nenhum hedge colateral: PUT comprada no mesmo vencimento de outra perna', () => {
  for (const id of Object.keys(MANEJO)) {
    const ruins = ops(id).filter((o) => o.op === 'adicionar' && o.tipo === 'put' && o.q > 0 && o.vencDe);
    assert.deepEqual(ruins, [], id);
  }
});

test('B2 e Straddle com PUT longa têm rolagem com redução de 10%', () => {
  for (const id of ['b2', 'straddle-long-put']) {
    const p = caminhos(id).find((x) => /10%/.test(x.nome));
    assert.ok(p, id);
    const i = p.ops.findIndex((o) => o.op === 'quantidade');
    assert.ok(i >= 0 && p.ops.slice(i + 1).some((o) => o.op === 'rolarVencimento' && o.perna === p.ops[i].perna), id);
  }
});

const AVANCADOS = ['linha-mannerheim', 'gl-shortput-booster', 'asym-wings-diagonal', 'booster-fly', 'malha-bw', 'hyperfly', 'fly-modular', 'modulo-q', 'bwb', 'calendar-butterfly'];

test('estruturas avançadas têm cenários com fonte Prof. Su', () => {
  for (const id of AVANCADOS) { assert.ok(MANEJO[id], id); assert.match(MANEJO[id].fonte, /Prof\. Su/, id); }
});

test('gradiente: regra de ouro, nunca aumentar o lote', () => {
  for (const id of ['linha-mannerheim', 'gl-shortput-booster', 'asym-wings-diagonal']) {
    const aumentos = caminhos(id).flatMap((p) => p.ops ?? []).filter((o) => o.op === 'quantidade' && Math.abs(o.q) > 1);
    assert.deepEqual(aumentos, [], id);
  }
});

test('Módulo Q rola com redução de 10%', () => {
  assert.ok(caminhos('modulo-q').some((p) => /10%/.test(p.nome) && p.ops.some((o) => o.op === 'quantidade')));
});

test('as 62 estruturas têm manejo', () => {
  const E = JSON.parse(readFileSync(new URL('../src/data/laboratorio/estruturas.json', import.meta.url), 'utf8'));
  assert.deepEqual(E.filter((e) => !MANEJO[e.id]).map((e) => e.id), []);
});
