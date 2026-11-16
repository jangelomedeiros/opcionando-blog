import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { lerMercadoCsv, posicaoReferencia, cenarioInicial, posicaoHoje, remontagemCoerente } from '../src/lib/catalogo/converter.ts';
import { resultado, primeiroVencimento } from '../src/lib/motor/posicao.ts';
import { metricasVencimento } from '../src/lib/motor/metricas.ts';

const ler = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const ESTRUTURAS = JSON.parse(ler('src/data/laboratorio/estruturas.json'));
const m = lerMercadoCsv(ler('tests/fixtures/mercado-2026-10-27.csv'));
const est = (id) => ESTRUTURAS.find((e) => e.id === id);

test('lerMercadoCsv lê metadados e linhas', () => {
  assert.equal(m.data, '2026-10-27');
  assert.equal(m.spot, 17.38);
  assert.equal(m.ativo, 'BBAS3');
  const l = m.linhas[0];
  assert.deepEqual([l.estrutura, l.grupo, l.tipo, l.q, l.preco], ['covered-call', 'principal', 'acao', 1, 17.38]);
  const c = m.linhas[1];
  assert.deepEqual([c.tipo, c.q, c.strike, c.venc, c.preco, c.vol], ['call', -1, 18.45, '2026-12-18', 0.74, 0.4511]);
});

test('as 62 estruturas usam o mercado se a remontagem for coerente, senão a referência', () => {
  assert.equal(ESTRUTURAS.length, 62);
  for (const e of ESTRUTURAS) {
    const { posicao, cenario, fonte } = cenarioInicial(e, m);
    assert.equal(fonte, remontagemCoerente(e, posicaoHoje(e, m).posicao) ? 'mercado' : 'referencia', e.id);
    const r = resultado(posicao, cenario);
    assert.ok(Number.isFinite(r) && Math.abs(r) < 0.05, `${e.id}: ${r}`);
  }
});

test('quantidades fracionárias e ação', () => {
  for (const id of ['quatermine-v2', 'dividendo-sint', 'monada-basica-call', 'booster-horizontal']) {
    const { posicao } = cenarioInicial(est(id), m);
    const mt = metricasVencimento(posicao);
    for (const v of [mt.ganhoMax, mt.perdaMax, ...mt.equilibrios]) assert.ok(v === null || Number.isFinite(v), `${id}: ${JSON.stringify(mt)}`);
  }
});

test('estrutura de dois vencimentos: primeiroVencimento é o mais curto', () => {
  const { posicao } = cenarioInicial(est('thl-call'), m);
  const vencs = posicao.pernas.map((p) => p.venc).filter(Boolean).sort();
  assert.equal(primeiroVencimento(posicao), vencs[0]);
  assert.ok(new Set(vencs).size === 2);
});

test('sem linhas no mercado cai para a referência', () => {
  const r = cenarioInicial(est('covered-call'), { ...m, linhas: [] });
  assert.equal(r.fonte, 'referencia');
  assert.deepEqual(r.cenario, { data: '2026-10-02', spot: 23.72 });
});

test('referência da venda coberta', () => {
  const { posicao } = posicaoReferencia(est('covered-call'));
  assert.equal(posicao.pernas.length, 2);
  const acao = posicao.pernas.find((p) => p.tipo === 'acao');
  assert.equal(acao.entrada, 23.72);
  assert.equal(posicao.realizado, 0);
});
