// Lê dist/ (rode npm run build antes).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const ler = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const MANEJO = JSON.parse(ler('src/data/laboratorio/manejo.json'));
const pagina = (id) => ler(`dist/estrategias/${id}/index.html`);
const desescapar = (s) => s.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');

test('aba Manejo de covered-call: sem faixa de rascunho, com cenários e botões de simular', () => {
  const h = pagina('covered-call');
  assert.doesNotMatch(h, /Rascunho em revisão pelo autor/);
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

test('aba Manejo mantém o POP e só caminhos com operações têm botão', () => {
  // Desde que as 62 estruturas ganharam manejo, não há mais estrutura "sem manejo" para testar.
  const h = pagina('hedge-inverse');
  assert.match(h, /Saída e stop|Risco principal/);
  const comOps = MANEJO['hedge-inverse'].cenarios.flatMap((c) => c.caminhos).filter((p) => p.ops?.length).length;
  assert.equal((h.match(/class="simular"/g) ?? []).length, comOps);
});

test('nenhuma página mostra a faixa de rascunho e nenhuma fonte diz "rascunho"', () => {
  for (const id of Object.keys(MANEJO)) {
    assert.equal(MANEJO[id].revisado, true, id);
    assert.doesNotMatch(MANEJO[id].fonte, /rascunho/i, id);
    assert.doesNotMatch(pagina(id), /Rascunho em revisão pelo autor/, id);
  }
});
