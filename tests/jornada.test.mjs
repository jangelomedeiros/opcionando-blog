import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { opcaoDaGrade, diasDaOpcao, trajetoriaCenario, trechosHistoricos, jornada, comentario, equacaoValor } from '../src/lib/conceitos/jornada.ts';

const ler = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const GRADE = JSON.parse(ler('src/data/grades/bbas3-2026-11-13.json'));
const CANDLES = JSON.parse(ler('src/data/candles/bbas3-2026-11-12.json'));
const CENARIOS = ['alta-lenta', 'queda-brusca', 'lateral', 'gap-balanco'];
const perto = (a, b, tol, msg = '') => assert.ok(Math.abs(a - b) <= tol, `${msg} ${a} vs ${b}`);
const call = opcaoDaGrade(GRADE, 'call'), put = opcaoDaGrade(GRADE, 'put');
const DIAS = diasDaOpcao(call);

test('opção da grade: ATM de 18/12 com prêmio real e jornada começa no prêmio', () => {
  assert.equal(call.venc, '2026-12-18');
  const ks = GRADE.series.filter((s) => s.tipo === 'call' && s.venc === '2026-12-18').map((s) => s.strike);
  const atm = ks.reduce((m, k) => (Math.abs(k - 15.1) < Math.abs(m - 15.1) ? k : m));
  assert.equal(call.strike, atm);
  assert.ok(call.premio > 0 && put.premio > 0);
  perto(jornada(call, [call.spot])[0].valor, call.premio, 1e-6, 'valor inicial');
});

test('trajetórias de cenário', () => {
  for (const t of CENARIOS) {
    const p = trajetoriaCenario(t, 15.1, DIAS);
    assert.equal(p.length, DIAS + 1, t);
    assert.equal(p[0], 15.1, t);
  }
  perto(trajetoriaCenario('alta-lenta', 15.1, DIAS).at(-1) / 15.1 - 1, 0.08, 0.001, 'alta lenta');
  assert.ok(Math.min(...trajetoriaCenario('queda-brusca', 15.1, DIAS)) / 15.1 - 1 <= -0.09);
  assert.ok(trajetoriaCenario('lateral', 15.1, DIAS).every((x) => Math.abs(x / 15.1 - 1) <= 0.025));
  const g = trajetoriaCenario('gap-balanco', 15.1, DIAS);
  assert.ok(g.some((x, i) => i > 0 && x / g[i - 1] - 1 <= -0.08));
});

test('trechos históricos', () => {
  const t = trechosHistoricos(CANDLES, DIAS, 15.1);
  assert.equal(t.length, 4);
  assert.equal(new Set(t.map((x) => x.id)).size, 4);
  for (const x of t) { assert.equal(x.precos.length, DIAS + 1); perto(x.precos[0], 15.1, 1e-9); }
  const [alta, queda] = ['maior-alta', 'maior-queda'].map((id) => t.find((x) => x.id === id));
  assert.ok(alta.precos.at(-1) > queda.precos.at(-1));
  assert.deepEqual(trechosHistoricos(CANDLES, 500, 15.1), []);
});

test('decomposição exata e espelho comprador × vendedor', () => {
  for (const op of [call, put]) for (const t of CENARIOS) for (const choque of [0, 5]) {
    for (const d of jornada(op, trajetoriaCenario(t, op.spot, DIAS), choque)) {
      perto(d.contrib.preco + d.contrib.tempo + d.contrib.vol, d.valor - op.premio, 1e-9, `${op.tipo} ${t} dia ${d.n}`);
      perto(d.comprador, d.valor - op.premio, 1e-12);
      assert.equal(d.vendedor, -d.comprador);
    }
  }
});

test('no vencimento: valor = intrínseco', () => {
  for (const op of [call, put]) {
    const ult = jornada(op, trajetoriaCenario('queda-brusca', op.spot, DIAS)).at(-1);
    assert.equal(ult.data, op.venc);
    perto(ult.extrinseco, 0, 1e-9); perto(ult.valor, ult.intrinseco, 1e-9);
  }
});

test('sinais: preço e tempo', () => {
  const ac = jornada(call, trajetoriaCenario('alta-lenta', call.spot, DIAS)).at(-2);
  const ap = jornada(put, trajetoriaCenario('alta-lenta', put.spot, DIAS)).at(-2);
  assert.ok(ac.contrib.preco > 0 && ap.contrib.preco < 0);
  for (const op of [call, put]) assert.ok(jornada(op, trajetoriaCenario('lateral', op.spot, DIAS)).at(-2).contrib.tempo < 0, op.tipo);
});

test('choque de vol no dia 0', () => {
  const d0 = jornada(call, trajetoriaCenario('lateral', call.spot, DIAS), 5)[0];
  assert.ok(d0.contrib.vol > 0);
  perto(d0.comprador, d0.contrib.vol, 1e-9);
});

test('comentário', () => {
  for (const d of jornada(call, trajetoriaCenario('lateral', call.spot, DIAS))) {
    const c = comentario(call, d);
    assert.ok(c.length > 10 && !/NaN|undefined/.test(c), c);
    const { preco, tempo, vol } = d.contrib;
    if (d.n > 0 && Math.abs(tempo) > Math.abs(preco) && Math.abs(tempo) > Math.abs(vol)) assert.match(c, /tempo/, c);
  }
});

test('a jornada passa por todos os pregões até o vencimento', () => {
  const datas = jornada(call, trajetoriaCenario('lateral', call.spot, DIAS)).map((d) => d.data);
  assert.equal(new Set(datas).size, datas.length);
  assert.ok(datas.includes('2026-12-17'));
  assert.equal(datas.at(-1), '2026-12-18');
});

test('trechos históricos não se repetem', () => {
  const t = trechosHistoricos(CANDLES, DIAS, 15.1);
  const assinaturas = t.map((x) => x.precos.map((p) => p.toFixed(4)).join());
  assert.equal(new Set(assinaturas).size, t.length);
});

test('equação do valor fecha mesmo com extrínseco negativo', () => {
  const d = { valor: 4.538, intrinseco: 4.556, extrinseco: 4.538 - 4.556 };
  assert.equal(equacaoValor(d), 'R$ 4,54 = 4,56 − 0,02');
  assert.equal(equacaoValor({ valor: 0.71, intrinseco: 0, extrinseco: 0.71 }), 'R$ 0,71 = 0,00 + 0,71');
});
