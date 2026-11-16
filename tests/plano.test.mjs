import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { cenariosDoVencimento, diaProjetado, planoDaEstrutura } from '../src/lib/estudo/plano.ts';
import { seriesDaGrade } from '../src/lib/otimizacao/otimizar.ts';
import { precoBS } from '../src/lib/motor/bs.ts';
import { diasUteis } from '../src/lib/motor/calendario.ts';

const ler = (p) => JSON.parse(readFileSync(new URL(`../${p}`, import.meta.url), 'utf8'));
const FONTES = ler('src/data/laboratorio/fontes.json');
const G = ler(FONTES.grade), SERIES = seriesDaGrade(G);
const REG = ler('src/data/diario/2026-11-13.json');
const ESTS = Object.fromEntries(ler('src/data/laboratorio/estruturas.json').map((e) => [e.id, e]));
const MANEJO = ler('src/data/laboratorio/manejo.json');
const BASE = { data: REG.data, spot: REG.spot };
const caminhos = (id) => MANEJO[id].cenarios.flatMap((c) => c.caminhos);

test('cenários do vencimento: parado, ±1σ e ±2σ, abrindo com a raiz do tempo até o vencimento', () => {
  const cs = cenariosDoVencimento(15.1, '2026-11-13', '2026-12-18', 0.33);
  assert.deepEqual(cs.map((c) => c.k), [-2, -1, 0, 1, 2]);
  assert.equal(cs[2].spot, 15.1);
  const t = diasUteis('2026-11-13', '2026-12-18') / 252;
  assert.ok(Math.abs(cs[3].spot - 15.1 * Math.exp(0.33 * Math.sqrt(t))) < 1e-9);
  assert.ok(cs.every((c, i) => i === 0 || c.spot > cs[i - 1].spot));
});

test('diaProjetado: só séries depois do vencimento, reprecificadas com a vol implícita de cada uma (sticky strike)', () => {
  const d = diaProjetado(G, SERIES, '2026-12-18', 16);
  assert.equal(d.data, '2026-12-18');
  assert.ok(d.series.length > 100 && d.series.every((s) => s.venc > '2026-12-18'));
  const s = d.series.find((x) => x.tipo === 'call' && x.venc === '2027-01-15');
  const orig = SERIES.find((x) => x.ticker === s.ticker);
  assert.equal(s.vol, orig.vol);
  const esperado = Math.max(Math.round(precoBS('call', 16, s.strike, diasUteis('2026-12-18', '2027-01-15') / 252, orig.vol) * 100) / 100, 0.01);
  assert.equal(s.preco, esperado);
});

test('plano da venda coberta: CALL vendida vira pó na queda e é exercida na alta; cada cenário tem uma sugestão', () => {
  const reg = REG.estruturas.find((e) => e.id === 'covered-call');
  const p = planoDaEstrutura(ESTS['covered-call'], reg, BASE, G, SERIES, caminhos('covered-call'), 0.33);
  assert.equal(p.venc, reg.venc1);
  assert.equal(p.cenarios.length, 5);
  const exerc = (c) => c.exercicio.find((x) => x.tipo === 'call').decisao;
  assert.equal(exerc(p.cenarios[0]), 'vira pó');
  assert.equal(exerc(p.cenarios[4]), 'ser exercido');
  for (const c of p.cenarios) {
    assert.ok(c.alternativas.some((a) => a.nome === c.sugestao), c.nome);
    assert.ok(c.alternativas.filter((a) => a.tipo === 'manejo' && a.aplicavel).length > 0, `${c.nome}: nenhum manejo aplicável`);
  }
  assert.ok(p.cenarios[4].resultado > p.cenarios[0].resultado, 'na alta a venda coberta ganha mais que na queda');
});

test('plano das 62 roda sem erro e cobre todas as estruturas do diário', () => {
  const planos = REG.estruturas.map((reg) => planoDaEstrutura(ESTS[reg.id], reg, BASE, G, SERIES, caminhos(reg.id), 0.33));
  assert.equal(planos.length, 62);
  for (const p of planos) for (const c of p.cenarios) assert.ok(Number.isFinite(c.resultado), `${p.id} ${c.nome}`);
});

test('plano gravado para as 62 e publicado na página do estudo, por vencimento', () => {
  const plano = ler('src/data/plano/2026-11-13.json');
  assert.equal(plano.base, '2026-11-13');
  assert.equal(plano.planos.length, 62);
  assert.match(plano.hipotese, /sticky strike|vol implícita/);
  const html = readFileSync(new URL('../dist/estrategias/estudo/index.html', import.meta.url), 'utf8');
  const t = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
  assert.match(t, /Plano para os próximos vencimentos/);
  assert.match(t, /Vencimento de 19\/11\/2026/);
  assert.match(t, /alta de 2σ/);
  assert.equal((html.match(/<details class="plano-estrutura"/g) ?? []).length, 62);
});
