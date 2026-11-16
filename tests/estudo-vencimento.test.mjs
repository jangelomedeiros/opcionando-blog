import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { avaliarVencimento, classificar, decidirExercicio } from '../src/lib/estudo/vencimento.ts';
import { precoBS } from '../src/lib/motor/bs.ts';
import { diasUteis } from '../src/lib/motor/calendario.ts';

const ler = (p) => JSON.parse(readFileSync(new URL(`../${p}`, import.meta.url), 'utf8'));
const EST = ler('src/data/laboratorio/estruturas.json').find((e) => e.id === 'covered-call');
const CAMINHOS = ler('src/data/laboratorio/manejo.json')['covered-call'].cenarios.flatMap((c) => c.caminhos);
const BASE = { data: '2026-11-13', spot: 15.1 };
const VENC = '2026-11-27', V2 = '2026-12-18', V3 = '2027-01-15';
const REG = { id: 'covered-call', veredito: 'montar', venc1: VENC, credito: 0.3, ev: 0.05, prob: 0.7, pernas: [
  { tipo: 'acao', q: 1, strike: null, venc: null, preco: 15.1 },
  { tipo: 'call', q: -1, strike: 15.7, venc: VENC, preco: 0.3 },
] };

// Mercado sintético no dia do vencimento: CALLs de dezembro e janeiro precificadas a 36%.
function dia(spot, tela = { [`call|15.7|${VENC}`]: Math.max(spot - 15.7, 0) + 0.01 }) {
  const ks = [14.7, 15.2, 15.7, 16.2, 16.7, 17.2, 17.7];
  const series = [V2, V3].flatMap((v) => ks.map((k) => ({ ticker: `C${k}${v}`, tipo: 'call', strike: k, venc: v, preco: +precoBS('call', spot, k, diasUteis(VENC, v) / 252, 0.36).toFixed(2), vol: 0.36, negocios: 10, origem: 'ultimo' })));
  return { data: VENC, spot, series, tela: new Map(Object.entries(tela)), grade: { vencimentos: { [V2]: diasUteis(VENC, V2), [V3]: diasUteis(VENC, V3) }, series: [...ks.map((k) => ({ strike: k, venc: VENC })), ...series.map((s) => ({ strike: s.strike, venc: s.venc }))] } };
}
const OPC = { sigma: 0.33, custoPorPerna: 0.01 };

test('situação no vencimento: resultado acumulado, lucro ou prejuízo', () => {
  const r = avaliarVencimento(EST, REG, BASE, dia(16.0), CAMINHOS, OPC);
  assert.ok(Math.abs(r.situacao.resultado - 0.9) < 1e-9, String(r.situacao.resultado)); // ação +0,90; call vendida empata (0,30 − 0,30)
  assert.equal(r.situacao.lucro, true);
  assert.equal(r.venc, VENC);
});

test('exercício: CALL vendida dentro do dinheiro, recomprar custa mais que ser exercido', () => {
  const r = avaliarVencimento(EST, REG, BASE, dia(16.0), CAMINHOS, OPC);
  const x = r.exercicio.find((p) => p.tipo === 'call');
  assert.equal(x.lado, 'vendida');
  assert.equal(x.itm, true);
  assert.ok(Math.abs(x.intrinseco - 0.3) < 1e-9);
  assert.equal(x.decisao, 'ser exercido');
  assert.match(x.texto, /entrega/);
});

test('exercício: fora do dinheiro vira pó; no dinheiro avisa o risco de exercício incerto', () => {
  assert.equal(avaliarVencimento(EST, REG, BASE, dia(15.0, {}), CAMINHOS, OPC).exercicio[0].decisao, 'vira pó');
  const pin = avaliarVencimento(EST, REG, BASE, dia(15.69, {}), CAMINHOS, OPC).exercicio[0];
  assert.match(pin.texto, /no dinheiro/);
});

test('decidirExercicio: comprada vende a mercado só se a tela pagar mais que o intrínseco mais o custo', () => {
  assert.equal(decidirExercicio({ lado: 'comprada', intrinseco: 0.3, tela: 0.35, custo: 0.01 }), 'vender a mercado');
  assert.equal(decidirExercicio({ lado: 'comprada', intrinseco: 0.3, tela: 0.305, custo: 0.01 }), 'exercer');
  assert.equal(decidirExercicio({ lado: 'comprada', intrinseco: 0.3, tela: null, custo: 0.01 }), 'exercer');
  assert.equal(decidirExercicio({ lado: 'vendida', intrinseco: 0.3, tela: 0.31, custo: 0.01 }), 'ser exercido');
  assert.equal(decidirExercicio({ lado: 'vendida', intrinseco: 0, tela: 0, custo: 0.01 }), 'vira pó');
});

test('alternativas: encerrar realiza o resultado; manejo é avaliado nos preços do dia contra a referência', () => {
  const r = avaliarVencimento(EST, REG, BASE, dia(16.0), CAMINHOS, OPC);
  const enc = r.alternativas.find((a) => a.tipo === 'encerrar');
  assert.ok(Math.abs(enc.ev - 0.9) < 1e-9 && enc.prob === 1 && Math.abs(enc.piorCaso - 0.9) < 1e-9);
  const seguir = r.alternativas.find((a) => a.tipo === 'seguir');
  assert.equal(seguir.aplicavel, false, 'a CALL venceu: só sobra a ação, não há estrutura para seguir');
  const rolar = r.alternativas.find((a) => a.nome === 'Rolar para cima e para frente');
  assert.equal(rolar.aplicavel, true, rolar.erro);
  assert.ok(Math.abs(rolar.resultadoAgora - 0.9) < 0.02, 'manejo não cria valor no instante');
  for (const k of ['ev', 'prob', 'piorCaso', 'delta', 'theta']) assert.ok(Number.isFinite(rolar[k]), k);
  assert.ok(['menor', 'igual', 'maior'].includes(rolar.risco));
  assert.ok(['sim', 'troca', 'não'].includes(rolar.compensa));
  assert.equal(typeof rolar.objetivo.atende, 'boolean');
  assert.match(rolar.objetivo.texto, /tempo|Θ/);
  assert.ok(r.alternativas.some((a) => a.nome === r.sugestao), 'sugestão é uma das alternativas');
});

test('pernas novas do manejo entram pelo preço de tela do dia', () => {
  const d = dia(16.0);
  const r = avaliarVencimento(EST, REG, BASE, d, CAMINHOS, OPC);
  const rolar = r.alternativas.find((a) => a.nome === 'Rolar para cima e para frente');
  for (const p of rolar.novas) {
    const s = d.series.find((x) => x.tipo === p.tipo && Math.abs(x.strike - p.strike) < 1e-9 && x.venc === p.venc);
    assert.ok(s, `${p.tipo} ${p.strike} ${p.venc} fora da grade`);
    assert.equal(p.entrada, s.preco);
  }
});

test('classificar: compensa, troca risco por retorno ou não compensa', () => {
  const ref = { ev: 0.1, piorCaso: -1 };
  assert.deepEqual(classificar(ref, { ev: 0.2, piorCaso: -0.5 }), { risco: 'menor', compensa: 'sim' });
  assert.deepEqual(classificar(ref, { ev: 0.2, piorCaso: -2 }), { risco: 'maior', compensa: 'troca' });
  assert.deepEqual(classificar(ref, { ev: 0.05, piorCaso: -0.5 }), { risco: 'menor', compensa: 'não' });
  assert.deepEqual(classificar(ref, { ev: 0.1, piorCaso: -1 }), { risco: 'igual', compensa: 'não' });
});

test('fora do dinheiro, a venda coberta fica com as ações: relançar é comparado com ficar só com elas', () => {
  const r = avaliarVencimento(EST, REG, BASE, dia(15.0, {}), CAMINHOS, OPC);
  const ficar = r.alternativas.find((a) => a.tipo === 'seguir');
  assert.equal(ficar.aplicavel, true, ficar.erro);
  assert.equal(ficar.nome, 'Ficar com as ações');
  assert.ok(ficar.piorCaso < -5, 'ação sozinha: pior caso grande');
  const relancar = r.alternativas.find((a) => a.nome === 'Relançar no próximo vencimento');
  assert.equal(relancar.risco, 'menor', 'o prêmio amortece a queda');
  assert.equal(relancar.compensa, 'sim');
});

test('dentro do dinheiro e exercida, a CALL entrega as ações: nada sobra para seguir', () => {
  const r = avaliarVencimento(EST, REG, BASE, dia(16.0), CAMINHOS, OPC);
  const seguir = r.alternativas.find((a) => a.tipo === 'seguir');
  assert.equal(seguir.aplicavel, false);
  assert.match(seguir.erro, /exercício|terminou/);
});

test('no vencimento, rolar o strike de uma perna que vence vira vender a próxima série no strike novo', () => {
  const r = avaliarVencimento(EST, REG, BASE, dia(15.0, {}), CAMINHOS, OPC);
  const baixo = r.alternativas.find((a) => a.nome === 'Rolar para baixo');
  assert.equal(baixo.aplicavel, true, baixo.erro);
  assert.equal(baixo.novas.length, 1);
  assert.ok(baixo.novas[0].strike < 15.7 && baixo.novas[0].venc === V2, JSON.stringify(baixo.novas));
});

test('script sem estrutura vencendo na grade: explica e não grava nada', async () => {
  const { spawnSync } = await import('node:child_process');
  const r = spawnSync(process.execPath, ['scripts/estudo_vencimento.mjs'], { cwd: new URL('../', import.meta.url), encoding: 'utf8' });
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /nenhuma estrutura do diário vence/);
  assert.match(r.stdout, /2026-11-19/);
});

test('página do estudo publicada, com os próximos vencimentos e links a partir do diário', () => {
  const ler2 = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
  const t = ler2('dist/estrategias/estudo/index.html').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
  assert.match(t, /Estudo dos vencimentos/);
  assert.match(t, /19\/11\/2026 \(2 estruturas\)/);
  assert.match(ler2('dist/estrategias/diario/index.html'), /href="\/estrategias\/estudo\/"/);
});

test('o motivo da sugestão diz contra o que o risco foi comparado', () => {
  const r = avaliarVencimento(EST, REG, BASE, dia(15.0, {}), CAMINHOS, OPC);
  assert.notEqual(r.sugestao, 'Encerrar tudo agora');
  assert.match(r.motivo, /ficar com as ações/);
});
