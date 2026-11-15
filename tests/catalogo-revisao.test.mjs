// Regressões da revisão final da etapa 3a. Os testes de HTML leem dist/ (rode npm run build antes).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { lerMercadoCsv, cenarioInicial } from '../src/lib/catalogo/converter.ts';
import { metricasVencimento } from '../src/lib/motor/metricas.ts';

const ler = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const ESTRUTURAS = JSON.parse(ler('src/data/laboratorio/estruturas.json'));
const m = lerMercadoCsv(ler('src/data/laboratorio/mercado.csv'));
const pagina = (id) => ler(`dist/estrategias/${id}/index.html`);
const semTags = (h) => h.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

test('quantidades fracionárias com ponto decimal são lidas certo', () => {
  const q = (id) => m.linhas.filter((l) => l.estrutura === id).map((l) => l.q);
  assert.deepEqual(q('dividendo-sint'), [1, -0.3]);
  assert.deepEqual(q('quatermine-v2'), [1, -1.6, 1, -1.4, 1]);
  const div = cenarioInicial(ESTRUTURAS.find((e) => e.id === 'dividendo-sint'), m);
  assert.notEqual(metricasVencimento(div.posicao).perdaMax, null, 'venda coberta parcial não tem perda ilimitada');
  assert.equal(m.spot, 17.38);
});

test('sem JavaScript aparece um gráfico só, e nada manda mover controles', () => {
  const h = pagina('covered-call');
  assert.match(h, /<astro-island[^>]*client="only"/, 'ilha client:only');
  assert.doesNotMatch(semTags(h.replace(/<noscript>[\s\S]*?<\/noscript>/g, '')), /Mova os controles/);
});

test('ficha antiga: campos, montagem e link da calculadora voltaram', () => {
  const t = semTags(pagina('covered-call'));
  for (const s of ['Lateral para alta', 'Renda', 'Iniciante', '(Strike − preço de compra da ação) + prêmio', 'Ter (ou comprar) as ações, em lotes de 100']) {
    assert.ok(t.includes(s), s);
  }
  assert.match(pagina('covered-call'), /href="\/ferramentas\/calculadora-de-payoff\?preset=venda-coberta"/);
});

test('toda estrutura tem o link da calculadora e o aviso de bid/ask e probabilidade', () => {
  for (const e of ESTRUTURAS) {
    const h = pagina(e.id);
    assert.match(h, /href="\/ferramentas\/calculadora-de-payoff"/, e.id);
    assert.ok(semTags(h).includes('não são bid/ask'), e.id);
    assert.ok(semTags(h).includes('Probabilidade de lucro estimada pelo modelo'), e.id);
  }
});

test('estruturas de dois vencimentos explicam a curva no primeiro vencimento', () => {
  for (const e of ESTRUTURAS.filter((x) => x.modo === 'mtm')) {
    assert.ok(semTags(pagina(e.id)).includes('Curva no primeiro vencimento'), e.id);
  }
});

test('coluna fixa do gráfico cabe na altura da janela', () => {
  const css = ler('src/styles/catalogo.css');
  assert.match(css, /\.est-esq \{[^}]*max-height: calc\(100vh - 2rem\);[^}]*overflow-y: auto;/);
});
