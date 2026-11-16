// Decisões do autor (16/11/2026): TLAD 3:4, Strangle/P do catálogo, regras de entrada das anotações de aula nos POPs.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { lerMercadoCsv } from '../src/lib/catalogo/converter.ts';

const ler = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const E = JSON.parse(ler('src/data/laboratorio/estruturas.json'));
const P = JSON.parse(ler('src/data/laboratorio/pops.json'));
const est = (id) => E.find((e) => e.id === id);

test('TLAD na proporção 3:4 (3 longas, 4 curtas em cada lado)', () => {
  assert.deepEqual(est('clade').pernas.map((l) => l.q), [3, -4, 3, -4]);
  const m = lerMercadoCsv(ler('src/data/laboratorio/mercado.csv'));
  assert.deepEqual(m.linhas.filter((l) => l.estrutura === 'clade' && l.grupo === 'principal').map((l) => l.q), [3, -4, 3, -4]);
  assert.match(est('clade').racional, /3×4/);
  assert.doesNotMatch(est('clade').racional, /1×2/);
  assert.match(P.tlad.montagem.join(' '), /3 CALLs longas/);
});

test('Strangle/P mantém a montagem do catálogo', () => {
  assert.deepEqual(est('strangle-p').pernas.map((l) => `${l.t}${l.q}`), ['C-1', 'C1', 'P-1']);
});

test('regras de entrada das anotações de aula nos POPs', () => {
  const chaves = ['trava-alta', 'trava-baixa', 'seagull', 'fence', 'straddle-perene', 'strangle-p', 'box-perene', 'modulo-q', 'financiamento',
    'dividendo-sint', 'thl-perene', 'borboleta', 'calendar-butterfly', 'gl-shortput-booster', 'b3', 'booster-call', 'booster-put', 'straddle-long-put', 'covered-call'];
  const faltando = chaves.filter((k) => !/Anotações de aula:/.test(P[k]?.contexto ?? ''));
  assert.deepEqual(faltando, []);
});
