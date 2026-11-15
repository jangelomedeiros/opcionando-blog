import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { aplicarAjuste, reconstruir } from '../src/lib/motor/manejo.ts';
import { resultado } from '../src/lib/motor/posicao.ts';
import { metricasVencimento } from '../src/lib/motor/metricas.ts';

const amostra = JSON.parse(readFileSync(new URL('./fixtures/grade-bbas3-2026-11-13.json', import.meta.url), 'utf8'));
const grade = {
  strikes: Array.from({ length: 11 }, (_, i) => 13 + i * 0.5),
  vencimentos: Object.keys(amostra.vencimentos),
};
const perto = (a, b, tol = 1e-9, msg = '') => assert.ok(Math.abs(a - b) <= tol, `${msg} ${a} vs ${b}`);
const C = { data: '2026-11-13', spot: 15.1 };
const C2 = { data: '2026-11-27', spot: 16.2 }; // momento do ajuste: subiu
const trava = () => ({ realizado: 0, pernas: [
  { id: 'c15', tipo: 'call', q: 1, strike: 15, venc: '2026-12-18', entrada: 0.62, vol: 0.45 },
  { id: 'c16', tipo: 'call', q: -1, strike: 16, venc: '2026-12-18', entrada: 0.27, vol: 0.45 },
] });

test('ajuste não cria nem destrói valor no instante do ajuste', () => {
  const casos = [
    [{ op: 'encerrar', perna: 'c16' }],
    [{ op: 'rolarStrike', perna: 'c16', passos: 2 }],
    [{ op: 'rolarVencimento', perna: 'c15', passos: 1 }],
    [{ op: 'quantidade', perna: 'c15', q: 0.5 }],
    [{ op: 'quantidade', perna: 'c16', q: -3 }],
    [{ op: 'adicionar', tipo: 'put', q: -1, strikePassos: -2 }],
    [{ op: 'adicionar', tipo: 'acao', q: 1 }],
  ];
  for (const ops of casos) {
    const antiga = trava();
    const { posicao } = aplicarAjuste(antiga, ops, C2, grade);
    perto(resultado(posicao, C2), resultado(antiga, C2), 1e-9, JSON.stringify(ops));
  }
});

test('encerrar move o resultado para realizado', () => {
  const antiga = trava();
  const { posicao, fluxo } = aplicarAjuste(antiga, [{ op: 'encerrar', perna: 'c15' }, { op: 'encerrar', perna: 'c16' }], C2, grade);
  assert.equal(posicao.pernas.length, 0);
  perto(posicao.realizado, resultado(antiga, C2));
  assert.ok(fluxo > 0, 'encerrar uma trava de alta com ganho é crédito');
});

test('rolar a call vendida para cima: novo strike, débito e ganho máximo maior', () => {
  const antiga = trava();
  const { posicao, fluxo } = aplicarAjuste(antiga, [{ op: 'rolarStrike', perna: 'c16', passos: 2 }], C2, grade);
  const nova = posicao.pernas.find((p) => p.q < 0);
  assert.equal(nova.strike, 17);
  assert.equal(nova.id, 'c16~1');
  assert.ok(fluxo < 0, `fluxo ${fluxo}`);
  assert.ok(metricasVencimento(posicao).ganhoMax > metricasVencimento(antiga).ganhoMax);
});

test('rolarVencimento usa o próximo vencimento da grade', () => {
  const { posicao } = aplicarAjuste(trava(), [{ op: 'rolarVencimento', perna: 'c16', passos: 1 }], C2, grade);
  assert.equal(posicao.pernas.find((p) => p.q < 0).venc, '2026-12-23');
});

test('adicionar usa o strike ATM da grade e o 1º vencimento depois da data', () => {
  const { posicao } = aplicarAjuste(trava(), [{ op: 'adicionar', tipo: 'put', q: -1, strikePassos: -2 }], C2, grade);
  const put = posicao.pernas.find((p) => p.tipo === 'put');
  assert.equal(put.strike, 15); // ATM 16 (mais perto de 16,2) − 2 passos de 0,5
  assert.equal(put.venc, '2026-12-04'); // 1º vencimento depois de 27/11
  assert.equal(put.vol, 0.45);
});

test('fora da grade: RangeError e posição intacta', () => {
  const antiga = trava();
  const copia = structuredClone(antiga);
  assert.throws(() => aplicarAjuste(antiga, [{ op: 'encerrar', perna: 'c15' }, { op: 'rolarStrike', perna: 'c16', passos: 50 }], C2, grade), RangeError);
  assert.throws(() => aplicarAjuste(antiga, [{ op: 'rolarVencimento', perna: 'c16', passos: 40 }], C2, grade), RangeError);
  assert.deepEqual(antiga, copia);
});

test('perna inexistente lança erro', () => {
  assert.throws(() => aplicarAjuste(trava(), [{ op: 'encerrar', perna: 'xyz' }], C2, grade), /Perna inexistente: xyz/);
});

test('reconstruir encadeia ajustes e desfazer = remover o último', () => {
  const a1 = { nome: 'rolar para cima', cenario: C2, ops: [{ op: 'rolarStrike', perna: 'c16', passos: 2 }] };
  const a2 = { nome: 'proteger', cenario: { data: '2026-12-04', spot: 15.6 }, ops: [{ op: 'adicionar', tipo: 'put', q: 1, strikePassos: -1 }] };
  const passo1 = aplicarAjuste(trava(), a1.ops, a1.cenario, grade);
  const passo2 = aplicarAjuste(passo1.posicao, a2.ops, a2.cenario, grade, 2);
  const dois = reconstruir({ inicial: trava(), ajustes: [a1, a2] }, grade);
  assert.deepEqual(dois.posicao, passo2.posicao);
  assert.deepEqual(dois.fluxos, [passo1.fluxo, passo2.fluxo]);
  assert.deepEqual(reconstruir({ inicial: trava(), ajustes: [a1] }, grade).posicao, passo1.posicao);
});

test('no mesmo ajuste, o id original segue a perna depois de rolada', () => {
  const { posicao } = aplicarAjuste(trava(), [{ op: 'rolarStrike', perna: 'c16', passos: 2 }, { op: 'rolarVencimento', perna: 'c16', passos: 1 }], C2, grade);
  const nova = posicao.pernas.find((p) => p.q < 0);
  assert.equal(nova.strike, 17);
  assert.equal(nova.venc, '2026-12-23');
});
