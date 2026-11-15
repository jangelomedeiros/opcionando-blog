import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { diasUteis, somarDiasUteis, ehDiaUtil } from '../src/lib/motor/calendario.ts';

const grade = JSON.parse(readFileSync(new URL('./fixtures/grade-bbas3-2026-11-13.json', import.meta.url), 'utf8'));

test('dias úteis batem com a grade de 13/11/2026 nos 17 vencimentos', () => {
  const vencs = Object.entries(grade.vencimentos);
  assert.equal(vencs.length, 17);
  const diferencas = vencs
    .map(([venc, du]) => [venc, du, diasUteis(grade.data, venc)])
    .filter(([, du, nosso]) => du !== nosso);
  assert.deepEqual(diferencas, []);
});

test('Consciência Negra (20/11) e fim de semana não contam', () => {
  assert.equal(diasUteis('2026-11-18', '2026-11-23'), 1);
});

test('ate <= de devolve 0', () => {
  assert.equal(diasUteis('2026-11-13', '2026-11-13'), 0);
  assert.equal(diasUteis('2026-11-20', '2026-11-13'), 0);
});

test('somarDiasUteis inverte diasUteis', () => {
  assert.equal(somarDiasUteis('2026-11-13', 3), '2026-11-18');
  assert.equal(diasUteis('2026-11-13', somarDiasUteis('2026-11-13', 10)), 9);
});

test('ehDiaUtil', () => {
  assert.equal(ehDiaUtil('2027-02-08'), false); // Carnaval
  assert.equal(ehDiaUtil('2027-03-26'), false); // Sexta-feira Santa
  assert.equal(ehDiaUtil('2027-05-27'), false); // Corpus Christi
  assert.equal(ehDiaUtil('2026-11-21'), false); // sábado
  assert.equal(ehDiaUtil('2026-11-19'), true);
});
