import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { lerMercadoCsv, cenarioInicial } from '../src/lib/catalogo/converter.ts';
import { aplicarAjuste } from '../src/lib/motor/manejo.ts';
import { resultado } from '../src/lib/motor/posicao.ts';

const ler = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const MANEJO = JSON.parse(ler('src/data/laboratorio/manejo.json'));
const ESTRUTURAS = JSON.parse(ler('src/data/laboratorio/estruturas.json'));
const GRADE = JSON.parse(ler('src/data/grades/bbas3-2026-11-13.json'));
const m = lerMercadoCsv(ler('src/data/laboratorio/mercado.csv'));
const OPS = ['encerrar', 'rolarStrike', 'rolarVencimento', 'quantidade', 'adicionar'];
const ids = new Set(ESTRUTURAS.map((e) => e.id));

function gradeSimples(pos) {
  const ks = pos.pernas.filter((p) => p.strike).map((p) => p.strike);
  const strikes = [...new Set([...ks, ...ks.flatMap((k) => Array.from({ length: 11 }, (_, i) => +(k + (i - 5) * 0.25).toFixed(2)))])].sort((a, b) => a - b);
  const vencimentos = [...new Set([...Object.keys(GRADE.vencimentos), ...pos.pernas.filter((p) => p.venc).map((p) => p.venc)])].sort();
  return { strikes, vencimentos };
}

test('manejo.json válido', () => {
  for (const [id, d] of Object.entries(MANEJO)) {
    assert.ok(ids.has(id), id);
    assert.ok(d.cenarios.length > 0, id);
    for (const c of d.cenarios) {
      for (const k of ['nome', 'sinais', 'pesa']) assert.ok(c[k]?.trim(), `${id} cenário sem ${k}`);
      assert.ok(c.caminhos.length >= 2, `${id} ${c.nome}: trilha precisa de mais de um caminho`);
      for (const p of c.caminhos) {
        for (const k of ['nome', 'descricao', 'ganha', 'perde', 'quando']) assert.ok(p[k]?.trim(), `${id} ${p.nome} sem ${k}`);
        for (const o of p.ops ?? []) assert.ok(OPS.includes(o.op), `${id} op ${o.op}`);
        if (p.estrutura) assert.ok(ids.has(p.estrutura), p.estrutura);
      }
    }
  }
});

test('caminhos com ops aplicam no cenário inicial sem erro e sem criar valor', () => {
  for (const [id, d] of Object.entries(MANEJO)) {
    const { posicao, cenario } = cenarioInicial(ESTRUTURAS.find((e) => e.id === id), m);
    const grade = gradeSimples(posicao);
    for (const c of d.cenarios) for (const p of c.caminhos.filter((x) => x.ops?.length)) {
      const { posicao: nova } = aplicarAjuste(posicao, p.ops, cenario, grade);
      assert.ok(Math.abs(resultado(nova, cenario) - resultado(posicao, cenario)) < 1e-9, `${id} ${p.nome}`);
    }
  }
});

test('rascunhos marcados', () => {
  for (const id of ['covered-call', 'cash-put', 'booster-call']) assert.equal(MANEJO[id]?.revisado, false, id);
});
