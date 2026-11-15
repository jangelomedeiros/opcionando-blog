// Lê dist/ (rode npm run build antes).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const ler = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const MANEJO = JSON.parse(ler('src/data/laboratorio/manejo.json'));
const pagina = (id) => ler(`dist/estrategias/${id}/index.html`);
const desescapar = (s) => s.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');

test('aba Manejo de covered-call: faixa de rascunho, cenários e botões de simular', () => {
  const h = pagina('covered-call');
  assert.match(h, /Rascunho em revisão pelo autor/);
  for (const c of MANEJO['covered-call'].cenarios) assert.ok(h.includes(c.nome), c.nome);
  const botoes = [...h.matchAll(/<button[^>]*class="simular"[^>]*>/g)].map((x) => x[0]);
  const comOps = MANEJO['covered-call'].cenarios.flatMap((c) => c.caminhos).filter((p) => p.ops?.length).length;
  assert.equal(botoes.length, comOps);
  for (const b of botoes) {
    assert.match(b, /\shidden/);
    const ops = JSON.parse(desescapar(b.match(/data-ops="([^"]*)"/)[1]));
    assert.ok(Array.isArray(ops) && ops.length > 0);
  }
});

test('estrutura sem dados de manejo não tem botão de simular e mantém o POP', () => {
  const h = pagina('thl-call');
  assert.doesNotMatch(h, /class="simular"/);
  assert.match(h, /Saída e stop|Risco principal/);
});
