// Confere os redirecionamentos gerados por `npm run build` e os links internos.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = fileURLToPath(new URL('..', import.meta.url));
const ler = (p) => readFileSync(join(RAIZ, p), 'utf8');
const IDS = JSON.parse(ler('src/data/laboratorio/estruturas.json')).map((e) => e.id);
const redireciona = (de, para) => {
  const f = join(RAIZ, 'dist', de, 'index.html');
  assert.ok(existsSync(f), `${de} não existe`);
  const h = readFileSync(f, 'utf8');
  assert.match(h, /http-equiv="refresh"/i, de);
  assert.ok(h.includes(para), `${de} não aponta para ${para}`);
};

test('laboratório antigo redireciona', () => {
  redireciona('ferramentas/laboratorio', '/estrategias/');
  for (const id of IDS) redireciona(`ferramentas/laboratorio/${id}`, `/estrategias/${id}/`);
});

test('fichas antigas redirecionam', () => {
  redireciona('estrategias/venda-coberta', '/estrategias/covered-call/');
  redireciona('estrategias/venda-de-put-coberta', '/estrategias/cash-put/');
});

test('nenhum link interno aponta para /ferramentas/laboratorio', () => {
  const listar = (d) => readdirSync(d).flatMap((n) => { const p = join(d, n); return statSync(p).isDirectory() ? listar(p) : [p]; });
  const achados = listar(join(RAIZ, 'src'))
    .filter((f) => /\.(astro|ts|tsx|md|mdx)$/.test(f))
    .filter((f) => readFileSync(f, 'utf8').includes('/ferramentas/laboratorio'));
  assert.deepEqual(achados.map((f) => f.replace(RAIZ, '')), []);
});
