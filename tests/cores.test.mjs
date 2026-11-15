import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { encontrarCoresFixas } from '../scripts/checar-cores.mjs';

const RAIZ = fileURLToPath(new URL('..', import.meta.url));

function listar(dir) {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? listar(p) : [p];
  });
}

test('detecta hex, rgb e rgba em fixture', () => {
  const dir = mkdtempSync(join(tmpdir(), 'cores-'));
  const f = join(dir, 'x.astro');
  writeFileSync(f, '<style>\n.a{color:#d64545;}\n.b{background:rgba(1,2,3,.5)}\n</style>\n');
  const r = encontrarCoresFixas([f]);
  assert.equal(r.length, 2);
  assert.deepEqual(r.map((o) => o.linha), [2, 3]);
});

test('ignora âncora href="#metodo" e tokens.css', () => {
  const dir = mkdtempSync(join(tmpdir(), 'cores-'));
  const f = join(dir, 'y.astro');
  writeFileSync(f, '<a href="#metodo">ir</a>\n<a href="#cab">x</a>\n<a href="#add">x</a>\n');
  assert.deepEqual(encontrarCoresFixas([f]), []);
  assert.deepEqual(encontrarCoresFixas([join(RAIZ, 'src/styles/tokens.css')]), []);
});

test('laboratório sem cores fixas', () => {
  const arquivos = [
    join(RAIZ, 'src/lib/laboratorio.ts'),
    join(RAIZ, 'src/styles/laboratorio.css'),
    ...listar(join(RAIZ, 'src/pages/ferramentas/laboratorio')),
  ];
  assert.deepEqual(encontrarCoresFixas(arquivos), []);
});

import { listarArquivos } from '../scripts/checar-cores.mjs';
import { readFileSync } from 'node:fs';

test('src inteiro sem cores fixas', () => {
  const r = encontrarCoresFixas(listarArquivos(join(RAIZ, 'src')));
  assert.deepEqual(r.map((o) => `${o.arquivo.replace(RAIZ, '')}:${o.linha}`), []);
});

test('nenhum prefers-color-scheme em src', () => {
  const achados = listarArquivos(join(RAIZ, 'src')).filter((f) => readFileSync(f, 'utf8').includes('prefers-color-scheme'));
  assert.deepEqual(achados.map((f) => f.replace(RAIZ, '')), []);
});

test('payoffs usam as áreas de lucro/prejuízo do tema e a linha "hoje" em âmbar', () => {
  const calc = readFileSync(join(RAIZ, 'src/pages/ferramentas/calculadora-de-payoff.astro'), 'utf8');
  const est = readFileSync(join(RAIZ, 'src/components/analise/PayoffEstrutura.astro'), 'utf8');
  assert.match(calc, /\.area-pos\) \{ fill: var\(--lucro-area\)/);
  assert.match(calc, /\.area-neg\) \{ fill: var\(--prejuizo-area\)/);
  assert.match(calc, /\.spot\) \{ stroke: var\(--hoje\)/);
  assert.match(calc, /\.rot-spot\) \{ fill: var\(--hoje\)/);
  assert.match(est, /\.pos \{ fill: var\(--lucro-area\); \} \.neg \{ fill: var\(--prejuizo-area\); \}/);
});

test('laboratório: coluna única no celular não estoura a largura (minmax(0,1fr))', () => {
  const css = readFileSync(join(RAIZ, 'src/styles/laboratorio.css'), 'utf8');
  assert.match(css, /@media\(max-width:820px\)\{\.lab \.duo\{grid-template-columns:minmax\(0,1fr\)\}\}/);
});
