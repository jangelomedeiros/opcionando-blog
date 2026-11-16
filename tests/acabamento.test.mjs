// Acabamento: pontos menores deixados pelas revisões das etapas anteriores.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { aplicarAjuste } from '../src/lib/motor/manejo.ts';

const RAIZ = fileURLToPath(new URL('..', import.meta.url));
const ler = (p) => readFileSync(join(RAIZ, p), 'utf8');
const listar = (d) => readdirSync(d).flatMap((n) => { const p = join(d, n); return statSync(p).isDirectory() ? listar(p) : [p]; });

test('nenhum link interno passa pelas fichas antigas', () => {
  const achados = listar(join(RAIZ, 'src')).filter((f) => /\.(astro|ts|tsx|md|mdx)$/.test(f))
    .filter((f) => /\/estrategias\/(venda-coberta|venda-de-put-coberta)\b/.test(readFileSync(f, 'utf8')));
  assert.deepEqual(achados.map((f) => f.replace(RAIZ, '')), []);
});

test('catálogo: mensagem para filtro sem resultado e estado inicial dos botões', () => {
  const h = ler('dist/estrategias/index.html');
  assert.match(h, /class="filtro-vazio"[^>]*hidden/);
  assert.match(h, /Limpar filtros/);
  for (const b of h.match(/<button[^>]*class="(fbtn|rbtn)[^"]*"[^>]*>/g)) assert.match(b, /aria-pressed="(true|false)"/, b);
});

test('rolar só o strike de uma perna vencida é recusado com mensagem clara', () => {
  const pos = { realizado: 0, pernas: [{ id: 'p1', tipo: 'call', q: -1, strike: 15, venc: '2026-12-18', entrada: 0.5, vol: 0.4 }] };
  const grade = { strikes: [14, 14.5, 15, 15.5, 16], vencimentos: ['2026-12-18', '2027-01-15'] };
  assert.throws(() => aplicarAjuste(pos, [{ op: 'rolarStrike', perna: 'p1', passos: 1 }], { data: '2026-12-18', spot: 15.4 }, grade), /já venceu/);
  assert.doesNotThrow(() => aplicarAjuste(pos, [{ op: 'rolarVencimento', perna: 'p1', passos: 1 }], { data: '2026-12-18', spot: 15.4 }, grade));
});

test('modo livre e jornada: nomes acessíveis e leitura calma', () => {
  const ilha = ler('src/components/catalogo/GraficoEstrutura.tsx');
  assert.match(ilha, /aria-label=\{`Encerrar \$\{rotuloPerna\(p\)\}`\}/);
  assert.match(ilha, /selected=\{n === novo\.venc\}/);
  assert.match(ler('src/components/conceitos/Jornada.tsx'), /aria-live=\{tocando \? 'off' : 'polite'\}/);
});

test('importar_grade.py sem argumentos mostra o uso', () => {
  const r = spawnSync('python', ['-I', join(RAIZ, 'scripts/importar_grade.py')], { encoding: 'utf8' });
  assert.equal(r.status, 2);
  assert.match(r.stdout + r.stderr, /Uso:/);
});
