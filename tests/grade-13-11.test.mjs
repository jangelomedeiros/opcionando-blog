import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { lerMercadoCsv, cenarioInicial, posicaoHoje, remontagemCoerente } from '../src/lib/catalogo/converter.ts';
import { resultado } from '../src/lib/motor/posicao.ts';
import { metricasVencimento } from '../src/lib/motor/metricas.ts';
import { diasUteis } from '../src/lib/motor/calendario.ts';

const ler = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const FONTES = JSON.parse(ler('src/data/laboratorio/fontes.json'));
const grade = JSON.parse(ler(FONTES.grade));
const ESTRUTURAS = JSON.parse(ler('src/data/laboratorio/estruturas.json'));
const m = lerMercadoCsv(ler('src/data/laboratorio/mercado.csv'));
const opcoes = m.linhas.filter((l) => l.tipo !== 'acao');

test('grade importada completa', () => {
  assert.equal(grade.series.length, 939);
  assert.equal(Object.keys(grade.vencimentos).length, 17);
  assert.equal(grade.data, '2026-11-13');
  assert.ok(Math.abs(grade.spot - 15.1) < 0.01, String(grade.spot));
});

test('mercado.csv é de 13/11 e cobre as 62 estruturas', () => {
  assert.equal(m.data, '2026-11-13');
  const sem = ESTRUTURAS.filter((e) => !m.linhas.some((l) => l.estrutura === e.id && l.grupo === 'principal'));
  assert.deepEqual(sem.map((e) => e.id), []);
});

test('toda perna existe na grade e vence depois da data da grade', () => {
  const chave = (venc, tipo, k) => `${venc}|${tipo}|${k.toFixed(2)}`;
  const existe = new Set(grade.series.map((s) => chave(s.venc, s.tipo, s.strike)));
  const fora = opcoes.filter((l) => !existe.has(chave(l.venc, l.tipo, l.strike)) || !(l.venc > grade.data));
  assert.deepEqual(fora.map((l) => `${l.estrutura} ${l.ticker}`), []);
});

test('janelas do POP respeitadas', () => {
  const src = ler('scripts/atualizar_mercado.py');
  const janela = Object.fromEntries([...src.matchAll(/'([\w-]+)': \((\d+), (\d+), (\d+)\)/g)].map((x) => [x[1], [+x[2], +x[3]]]));
  const dus = Object.values(grade.vencimentos);
  const fora = [];
  for (const e of ESTRUTURAS.filter((x) => janela[x.pop])) {
    const [lo, hi] = janela[e.pop];
    if (!dus.some((d) => d >= lo && d <= hi)) continue;
    const vencs = opcoes.filter((l) => l.estrutura === e.id && l.grupo === 'principal').map((l) => l.venc).sort();
    const du = diasUteis(m.data, vencs[0]);
    if (du < lo || du > hi) fora.push(`${e.id}: ${du} du fora de [${lo}, ${hi}]`);
  }
  assert.deepEqual(fora, []);
});

test('quantidades e hedges preservados', () => {
  for (const e of ESTRUTURAS) {
    const qs = m.linhas.filter((l) => l.estrutura === e.id && l.grupo === 'principal').map((l) => l.q);
    assert.deepEqual(qs, e.pernas.map((p) => p.q), e.id);
    if (e.comparacao) assert.ok(m.linhas.some((l) => l.estrutura === e.id && l.grupo === 'comparacao'), `${e.id} sem comparacao`);
  }
});

test('cenário inicial de todas fecha em zero na entrada', () => {
  for (const e of ESTRUTURAS) {
    const { posicao, cenario, fonte } = cenarioInicial(e, m);
    assert.equal(fonte, remontagemCoerente(e, posicaoHoje(e, m).posicao) ? 'mercado' : 'referencia', e.id);
    const r = resultado(posicao, cenario);
    assert.ok(Math.abs(r) < 0.05, `${e.id}: ${r}`);
    const mt = metricasVencimento(posicao);
    for (const v of [mt.ganhoMax, mt.perdaMax, ...mt.equilibrios]) assert.ok(v === null || Number.isFinite(v), e.id);
  }
});
