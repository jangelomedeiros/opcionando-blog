// Regressões da revisão final da etapa 3b: texto e tabela sempre da mesma data; remontagem coerente.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { lerMercadoCsv, cenarioInicial } from '../src/lib/catalogo/converter.ts';
import { textoUsaMontagemAtual, NUMERO_FIXO } from '../src/lib/catalogo/textos.ts';

const ler = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const ESTRUTURAS = JSON.parse(ler('src/data/laboratorio/estruturas.json'));
const m = lerMercadoCsv(ler('src/data/laboratorio/mercado.csv'));
const est = (id) => ESTRUTURAS.find((e) => e.id === id);
const semTags = (h) => h.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

test('remontagem que desmancha o desenho volta para a referência', () => {
  // Montagem otimizada: as 62 vêm do mercado (desenho preservado por construção).
  for (const e of ESTRUTURAS) assert.equal(cenarioInicial(e, m).fonte, 'mercado', e.id);
  // Desmanchando o desenho (borboleta com as duas asas no mesmo strike), a página volta para a referência.
  const bwb = m.linhas.filter((l) => l.estrutura === 'bwb');
  const quebrado = { ...m, linhas: m.linhas.map((l) => (l === bwb[0] ? { ...l, strike: bwb[1].strike, ticker: bwb[1].ticker } : l)) };
  assert.equal(cenarioInicial(est('bwb'), quebrado).fonte, 'referencia');
});

test('NUMERO_FIXO pega números, percentuais, datas, du e meses', () => {
  for (const s of ['custa 0,15', '7,4% em', 'até 19/11', '31 du', 'em dezembro', '≈ 1,5']) assert.match(s, NUMERO_FIXO, s);
  assert.doesNotMatch('Acima de R$ {p2.k}, o ganho fica travado', NUMERO_FIXO);
});

test('texto só usa a montagem atual quando não tem número fixo nem marcador ambíguo', () => {
  for (const e of ESTRUTURAS) {
    if (!textoUsaMontagemAtual(e, cenarioInicial(e, m).fonte)) continue;
    const t = [e.racional, e.esperado, ...e.notas].join(' ');
    assert.doesNotMatch(t, NUMERO_FIXO, e.id);
    assert.equal(e.marcadores_ambiguos ?? 0, 0, e.id);
  }
});

test('páginas: nota coerente com a data do texto', () => {
  const malha = semTags(ler('dist/estrategias/malha-bw/index.html'));
  assert.ok(malha.includes('Exemplo calibrado'), 'malha-bw deve mostrar o exemplo de 02/10');
  assert.ok(!malha.includes('acompanham esta montagem'));
  assert.ok(malha.includes('−0,25') || malha.includes('-0,25'), 'conta original preservada');
  const cc = semTags(ler('dist/estrategias/covered-call/index.html'));
  assert.ok(cc.includes('acompanham esta montagem'));
});
