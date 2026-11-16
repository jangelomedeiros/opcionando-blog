import { test } from 'node:test';
import assert from 'node:assert/strict';
import { iniciar, aplicar, desfazer, recomecar } from '../src/lib/catalogo/simulacao.ts';

const grade = { strikes: Array.from({ length: 11 }, (_, i) => 13 + i * 0.5), vencimentos: ['2026-12-18', '2026-12-23', '2027-01-15', '2027-02-19'] };
const inicial = { realizado: 0, pernas: [
  { id: 'p1', tipo: 'call', q: 1, strike: 15, venc: '2026-12-18', entrada: 0.62, vol: 0.45 },
  { id: 'p2', tipo: 'call', q: -1, strike: 16, venc: '2026-12-18', entrada: 0.27, vol: 0.45 },
] };
const C = { data: '2026-11-27', spot: 16.2 };

test('3 ajustes e desfazer 2 volta ao estado depois do 1º', () => {
  const e1 = aplicar(iniciar(inicial), 'rolar', [{ op: 'rolarStrike', perna: 'p2', passos: 2 }], C, grade);
  const e2 = aplicar(e1, 'proteger', [{ op: 'adicionar', tipo: 'put', q: 1, strikePassos: -1 }], { ...C, data: '2026-12-04' }, grade);
  const e3 = aplicar(e2, 'reduzir', [{ op: 'quantidade', perna: 'p1', q: 0.5 }], { ...C, data: '2026-12-10', spot: 15.8 }, grade);
  assert.equal(e3.ajustes.length, 3);
  const volta = desfazer(desfazer(e3, grade), grade);
  assert.deepEqual(volta.posicao, e1.posicao);
  assert.deepEqual(volta.fluxos, e1.fluxos);
  assert.equal(volta.ajustes.length, 1);
});

test('ajuste fora da grade devolve erro e mantém a posição', () => {
  const e0 = iniciar(inicial);
  const e = aplicar(e0, 'longe', [{ op: 'rolarStrike', perna: 'p2', passos: 50 }], C, grade);
  assert.match(e.erro, /fora da grade/);
  assert.deepEqual(e.posicao, e0.posicao);
  assert.equal(e.ajustes.length, 0);
  assert.equal(aplicar(e, 'ok', [{ op: 'encerrar', perna: 'p1' }], C, grade).erro, null);
});

test('recomecar volta ao inicial', () => {
  const e = aplicar(iniciar(inicial), 'x', [{ op: 'encerrar', perna: 'p2' }], C, grade);
  const r = recomecar(e);
  assert.deepEqual(r.posicao, inicial);
  assert.deepEqual(r.ajustes, []);
});
