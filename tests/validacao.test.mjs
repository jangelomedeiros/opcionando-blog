import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fraseDinamica, fraseContexto, VEREDITO } from '../src/lib/otimizacao/validacao.ts';
import { lerMercadoCsv } from '../src/lib/catalogo/converter.ts';

const ler = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const V = JSON.parse(ler('src/data/laboratorio/validacao.json'));
const ESTRUTURAS = JSON.parse(ler('src/data/laboratorio/estruturas.json'));
const m = lerMercadoCsv(ler('src/data/laboratorio/mercado.csv'));

test('fraseDinamica: vendedor de prêmio ganha com tempo e queda de vol', () => {
  const f = fraseDinamica({ delta: 0.3, gama: -0.1, theta: 0.02, vega: -0.5 });
  assert.match(f, /tempo a favor/);
  assert.match(f, /queda da vol/);
  assert.match(f, /altista/);
});

test('fraseDinamica: comprador de prêmio paga o tempo e precisa de movimento', () => {
  const f = fraseDinamica({ delta: -0.02, gama: 0.2, theta: -0.01, vega: 0.8 });
  assert.match(f, /tempo contra/);
  assert.match(f, /alta da vol/);
  assert.match(f, /neutra/);
});

test('fraseContexto nomeia tendência, viés e implícita × realizada', () => {
  const f = fraseContexto({ tendencia: 'baixa', vies: 'altista', aFavorDaTendencia: false, ivAtm: 0.364, volRealizada: 0.332, vendeVol: true, aFavorDaVol: true });
  assert.match(f, /tendência de baixa/i);
  assert.match(f, /contra a tendência/);
  assert.match(f, /36%.*acima.*33%/);
  assert.match(f, /vende vol/);
  const g = fraseContexto({ tendencia: 'baixa', vies: 'neutra', aFavorDaTendencia: null, ivAtm: 0.364, volRealizada: 0.332, vendeVol: false, aFavorDaVol: false });
  assert.match(g, /não depende da direção/);
  assert.match(g, /compra vol.*contra/);
});

test('VEREDITO tem rótulo para os três casos', () => {
  assert.deepEqual(Object.keys(VEREDITO).sort(), ['montar', 'montar-com-ressalva', 'nao-montar']);
});

test('validacao.json cobre as 62, é da data do mercado.csv e bate com as pernas gravadas', () => {
  assert.equal(V.mercado.data, m.data);
  assert.equal(V.estruturas.length, ESTRUTURAS.length);
  for (const v of V.estruturas) {
    const linhas = m.linhas.filter((l) => l.estrutura === v.id && l.grupo === 'principal');
    assert.equal(linhas.length, v.montagem.pernas.length, v.id);
    linhas.forEach((l, i) => {
      const p = v.montagem.pernas[i];
      assert.equal(l.tipo, p.tipo, `${v.id} p${i + 1} tipo`);
      assert.equal(l.q, p.q, `${v.id} p${i + 1} q`);
      if (l.tipo !== 'acao') { assert.equal(l.strike, p.strike, `${v.id} p${i + 1} strike`); assert.equal(l.venc, p.venc, `${v.id} p${i + 1} venc`); }
    });
    assert.ok(VEREDITO[v.veredito], `${v.id} veredito ${v.veredito}`);
    assert.ok(Number.isFinite(v.lucro.ev) && v.lucro.prob >= 0 && v.lucro.prob <= 1, v.id);
  }
});

test('página mostra a validação do operador na aba Visão', () => {
  const h = (id) => ler(`dist/estrategias/${id}/index.html`);
  const semTags = (x) => x.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
  const cc = semTags(h('covered-call'));
  assert.match(cc, /Validação do operador/);
  assert.match(cc, /Valor esperado/);
  assert.match(cc, /conferir no book/i);
  const naoMontar = V.estruturas.find((v) => v.veredito === 'nao-montar');
  if (naoMontar) assert.match(semTags(h(naoMontar.id)), /Não montar agora/);
  // A validação fica dentro do painel da Visão, antes do painel do POP.
  const html = h('covered-call');
  assert.ok(html.indexOf('Validação do operador') < html.indexOf('id="covered-call-pop"'), 'fora da aba Visão');
});
