// Regressões da revisão final: texto escuro sobre petróleo no tema claro.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const ler = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');

test('barra do prêmio: intrínseco em petróleo fixo com texto creme', () => {
  assert.match(ler('src/styles/global.css'), /\.barra-premio \.int \{ background: var\(--petroleo\); color: var\(--creme\); \}/);
});

test('laboratório: botão "Todas" tem cor própria (--fc), não cai no --destaque', () => {
  const html = ler('dist/estrategias/index.html');
  const botoes = html.match(/<button[^>]*class="fbtn[^"]*"[^>]*>/g) ?? [];
  assert.ok(botoes.length > 1, 'filtros não encontrados (rode npm run build)');
  for (const b of botoes) assert.match(b, /--fc:/, b);
});

test('rodapé: título "Aviso importante" legível sobre o fundo do rodapé nos dois temas', () => {
  assert.match(ler('src/components/Footer.astro'), /\.aviso strong \{ color: var\(--creme\);/);
});
