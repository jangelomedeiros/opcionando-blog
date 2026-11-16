import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { razaoContraste, lerTokens } from '../scripts/lib/contraste.mjs';

const css = readFileSync(new URL('../src/styles/tokens.css', import.meta.url), 'utf8');
const temas = lerTokens(css);

const TEXTO = [ // mínimo 4,5
  ['--texto', '--fundo'], ['--texto', '--superficie'], ['--texto-suave', '--fundo'],
  ['--texto-suave', '--superficie'], ['--titulo', '--fundo'], ['--destaque', '--fundo'],
  ['--marca-texto', '--fundo'], ['--texto-sobre-marca', '--marca'],
  ['--lucro-texto', '--superficie'], ['--prejuizo-texto', '--superficie'],
  ['--atencao-texto', '--superficie'],
];
const GRAFICO = [ // mínimo 3
  ['--lucro', '--superficie'], ['--prejuizo', '--superficie'], ['--hoje', '--superficie'],
  ['--borda-forte', '--superficie'], ['--marca', '--fundo'],
  ['--serie-a', '--superficie'], ['--serie-b', '--superficie'],
];

function checar(pares, minimo) {
  const falhas = [];
  for (const [nome, t] of Object.entries(temas)) {
    for (const [a, b] of pares) {
      const r = razaoContraste(t[a], t[b]);
      if (!(r >= minimo)) falhas.push(`${nome}: ${a} (${t[a]}) sobre ${b} (${t[b]}) = ${r.toFixed(2)}`);
    }
  }
  assert.deepEqual(falhas, []);
}

test('razaoContraste("#000000","#ffffff") === 21', () => {
  assert.equal(Math.round(razaoContraste('#000000', '#ffffff') * 100) / 100, 21);
  assert.equal(razaoContraste('#fff', '#ffffff'), 1);
});

test('todos os tokens existem nos dois temas', () => {
  assert.ok(Object.keys(temas.dark).length > 0, 'tema escuro vazio');
  assert.deepEqual(Object.keys(temas.light).sort(), Object.keys(temas.dark).sort());
  for (const [a, b] of [...TEXTO, ...GRAFICO]) {
    assert.ok(temas.dark[a] && temas.dark[b], `faltando ${a} ou ${b}`);
  }
});

test('contraste de texto ≥ 4,5 (dark e light)', () => checar(TEXTO, 4.5));
test('contraste gráfico ≥ 3 (dark e light)', () => checar(GRAFICO, 3));
