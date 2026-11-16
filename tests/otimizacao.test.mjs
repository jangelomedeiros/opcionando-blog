import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { volRealizada, seriesDaGrade, janela, criarAvaliador, otimizar, desenhoPreservado } from '../src/lib/otimizacao/otimizar.ts';
import { precoBS } from '../src/lib/motor/bs.ts';
import { diasUteis } from '../src/lib/motor/calendario.ts';
import { deltaEstrutural, creditoEntrada } from '../src/lib/catalogo/protocolo.ts';

const ler = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const FONTES = JSON.parse(ler('src/data/laboratorio/fontes.json'));
const GRADE = JSON.parse(ler(FONTES.grade));
const ESTRUTURAS = JSON.parse(ler('src/data/laboratorio/estruturas.json'));
const est = (id) => ESTRUTURAS.find((e) => e.id === id);
const SERIES = seriesDaGrade(GRADE);
const D = '2026-11-13', S = 15.1;

test('volRealizada: anualiza o desvio dos log-retornos e descarta os maiores absolutos', () => {
  const closes = [100, 101, 100, 101, 100, 101, 100, 70, 70.7];
  const sem = volRealizada(closes, 8, 1);
  assert.ok(sem > 0 && sem < 0.3, String(sem));
  assert.ok(volRealizada(closes, 8, 0) > 1, 'o gap de −30% domina sem descarte');
  const r1 = Math.log(1.01);
  assert.ok(Math.abs(volRealizada([100, 101, 100], 2) - r1 * Math.SQRT2 * Math.sqrt(252)) < 1e-12);
});

test('seriesDaGrade: negociadas no dia ficam com o último, as demais com preço teórico', () => {
  const neg = SERIES.filter((s) => s.origem === 'ultimo');
  assert.ok(neg.length > 200 && neg.length < 476, String(neg.length)); // 476 negociadas; as isoladas e fora do sorriso viram teóricas
  assert.ok(SERIES.every((s) => s.venc > D && s.preco >= 0.01 && s.vol > 0));
  const bbasl153 = SERIES.find((s) => s.ticker === 'BBASL153');
  assert.equal(bbasl153.origem, 'ultimo');
  assert.equal(bbasl153.preco, 0.71);
});

test('janela do 1º vencimento: POP manda; sem POP, pela referência', () => {
  assert.deepEqual(janela(est('bull-spread')), [6, 12]);
  assert.deepEqual(janela(est('b1')), [12, 24]);
  assert.deepEqual(janela(est('borboleta')), [23, 45]);
  assert.deepEqual(janela(est('anakha')), [3, 8]);
  assert.deepEqual(janela(est('covered-call')), [20, 45]);
});

test('avaliador: sob a própria vol implícita, o valor esperado da montagem é ~zero', () => {
  const venc = '2026-12-18', T = diasUteis(D, venc) / 252;
  const px = precoBS('call', S, 15.2, T, 0.36);
  const pos = { realizado: 0, pernas: [{ id: 'p1', tipo: 'call', q: -1, strike: 15.2, venc, entrada: px, vol: 0.36 }] };
  const av = criarAvaliador(D, S, 0.36)(pos);
  assert.ok(Math.abs(av.ev) < 0.005, String(av.ev));
  assert.ok(av.prob > 0.6 && av.prob < 0.75, String(av.prob)); // perde só acima de ~15,90
  assert.ok(av.risco < -2, 'call a seco: pior perda grande na faixa');
  const vende = criarAvaliador(D, S, 0.25)(pos), compra = criarAvaliador(D, S, 0.5)(pos);
  assert.ok(vende.ev > 0.05 && compra.ev < -0.05, `${vende.ev} ${compra.ev}`);
});

test('desenhoPreservado: ordem, igualdade e simetria das asas', () => {
  const ref = est('borboleta');
  const mk = (ks) => ({ realizado: 0, pernas: ks.map((k, i) => ({ id: `p${i}`, tipo: 'call', q: ref.pernas[i].q, strike: k, venc: '2026-12-18', entrada: 0.1 })) });
  assert.equal(desenhoPreservado(ref, mk([14.2, 15.2, 16.2])), true);
  assert.equal(desenhoPreservado(ref, mk([14.2, 15.2, 17.2])), false, 'asas desiguais viram BWB');
  assert.equal(desenhoPreservado(ref, mk([15.2, 15.2, 16.2])), false, 'strikes iguais desmancham a borboleta');
});

test('otimizar: as 62 saem coerentes, nas janelas e com as quantidades do POP', () => {
  const ctx = { data: D, spot: S, sigma: 0.332, sigmaEstresse: 0.389 };
  const falhas = [];
  for (const e of ESTRUTURAS) {
    const r = otimizar(e, SERIES, ctx);
    const pos = r.montagem.posicao;
    if (!desenhoPreservado(e, pos)) falhas.push(`${e.id}: desenho`);
    const [lo, hi] = janela(e);
    const du = Math.min(...pos.pernas.filter((p) => p.tipo !== 'acao').map((p) => diasUteis(D, p.venc)));
    if ((du < lo || du > hi) && !r.avisos.some((a) => a.includes('janela'))) falhas.push(`${e.id}: ${du} du fora de [${lo}, ${hi}]`);
    if (pos.pernas.map((p) => p.q).join() !== e.pernas.map((p) => p.q).join()) falhas.push(`${e.id}: quantidades`);
    if (!['montar', 'montar-com-ressalva', 'nao-montar'].includes(r.veredito)) falhas.push(`${e.id}: veredito`);
    if (r.veredito === 'montar' && !(r.montagem.av.ev > 0 && r.montagem.av.prob >= 0.5)) falhas.push(`${e.id}: montar sem vantagem`);
  }
  assert.deepEqual(falhas, []);
});

test('otimizar: BWB respeita crédito ≥ |delta estrutural|', () => {
  const r = otimizar(est('bwb'), SERIES, { data: D, spot: S, sigma: 0.332, sigmaEstresse: 0.389 });
  const pos = r.montagem.posicao, de = deltaEstrutural(pos);
  if (de !== null && de < 0 && !r.avisos.some((a) => a.includes('delta estrutural'))) {
    assert.ok(creditoEntrada(pos) >= Math.abs(de) - 1e-9, `${creditoEntrada(pos)} < ${Math.abs(de)}`);
  }
});

test('otimizar: cada strike fica a até 5% da moneyness da referência (ATM continua ATM)', () => {
  const ctx = { data: D, spot: S, sigma: 0.332, sigmaEstresse: 0.389 };
  const fora = [];
  for (const e of ESTRUTURAS) {
    const r = otimizar(e, SERIES, ctx);
    e.pernas.forEach((l, i) => {
      if (l.t === 'S') return;
      const d = r.montagem.posicao.pernas[i].strike / S - l.k / e.ref.spot;
      if (Math.abs(d) > (r.avisos.some((a) => a.includes('adaptado')) ? 0.1 : 0.05) + 1e-9) fora.push(`${e.id} p${i + 1}: ${d.toFixed(3)}`);
    });
  }
  assert.deepEqual(fora, []);
});

test('seriesDaGrade: negócio isolado ou com vol fora do sorriso vira preço teórico', () => {
  const g = { data: D, spot: S, series: [
    ...[14.7, 15.2, 15.7].map((k, i) => ({ ticker: `C${i}`, tipo: 'call', strike: k, venc: '2026-12-18', du: 23, ultimo: precoBS('call', S, k, diasUteis(D, '2026-12-18') / 252, 0.36), data_ultimo: D, negocios: 10 })),
    { ticker: 'VELHA', tipo: 'call', strike: 13.2, venc: '2026-12-18', du: 23, ultimo: 3.5, data_ultimo: D, negocios: 5 },
    { ticker: 'UNICA', tipo: 'call', strike: 16.2, venc: '2026-12-18', du: 23, ultimo: 0.3, data_ultimo: D, negocios: 1 },
  ] };
  const ss = seriesDaGrade(g);
  assert.equal(ss.find((s) => s.ticker === 'VELHA').origem, 'teorico');
  assert.equal(ss.find((s) => s.ticker === 'UNICA').origem, 'teorico');
  assert.equal(ss.find((s) => s.ticker === 'C1').origem, 'ultimo');
});

test('regra da BWB vale para 3+ strikes, não para trava', () => {
  const r = otimizar(est('trava-alta-put'), SERIES, { data: D, spot: S, sigma: 0.332, sigmaEstresse: 0.389 });
  assert.ok(!r.avisos.some((a) => a.includes('delta estrutural')), r.avisos.join());
});

test('otimizar: predicado aceitar descarta montagens e avisa quando nenhuma passa', () => {
  const ctx = { data: D, spot: S, sigma: 0.332, sigmaEstresse: 0.389 };
  const livre = otimizar(est('cash-put'), SERIES, ctx);
  const k0 = livre.montagem.posicao.pernas[0].strike;
  const semK0 = otimizar(est('cash-put'), SERIES, { ...ctx, aceitar: (p) => p.pernas[0].strike !== k0 });
  assert.notEqual(semK0.montagem.posicao.pernas[0].strike, k0);
  assert.ok(!semK0.avisos.some((a) => a.includes('manejo')), semK0.avisos.join());
  const nenhuma = otimizar(est('cash-put'), SERIES, { ...ctx, aceitar: () => false });
  assert.ok(nenhuma.avisos.some((a) => a.includes('manejo')), nenhuma.avisos.join());
});

test('avaliador devolve o piso (pior resultado sem truncar) e o otimizador descarta arbitragem aparente', () => {
  const venc = '2026-12-18';
  // Borboleta "de graça": último negócio inconsistente deixa a estrutura com lucro em todo cenário.
  const pos = { realizado: 0, pernas: [
    { id: 'a', tipo: 'call', q: 1, strike: 14.2, venc, entrada: 1.0, vol: 0.36 },
    { id: 'b', tipo: 'call', q: -2, strike: 14.7, venc, entrada: 0.8, vol: 0.36 },
    { id: 'c', tipo: 'call', q: 1, strike: 15.2, venc, entrada: 0.3, vol: 0.36 },
  ] };
  const av = criarAvaliador(D, S, 0.33)(pos);
  assert.ok(av.piso > 0.02 && av.risco === 0, `${av.piso} ${av.risco}`);
  const ctx = { data: D, spot: S, sigma: 0.332, sigmaEstresse: 0.389 };
  for (const e of ESTRUTURAS) {
    const r = otimizar(e, SERIES, ctx);
    // Exceção só para a BWB que cumpre a regra do POP (crédito ≥ |delta estrutural|): aí o lucro em todo cenário é o desenho.
    const de = deltaEstrutural(r.montagem.posicao);
    const bwb = de !== null && de < 0 && new Set(e.pernas.map((l) => l.k)).size >= 3 && creditoEntrada(r.montagem.posicao) >= Math.abs(de) - 1e-9;
    if (r.montagem.av.piso > 0.02 && !bwb) assert.ok(r.avisos.some((a) => a.includes('inconsistentes')), `${e.id}: piso ${r.montagem.av.piso}`);
  }
});

test('nao-montar: a montagem mostrada é a de maior valor esperado, não a de maior risco', () => {
  const ctx = { data: D, spot: S, sigma: 0.332, sigmaEstresse: 0.389 };
  for (const id of ['collar', 'strangle-compra', 'put-compra']) {
    const r1 = otimizar(est(id), SERIES, ctx);
    if (r1.veredito !== 'nao-montar') continue;
    const chave = (p) => p.pernas.map((x) => `${x.strike}|${x.venc}`).join();
    const k1 = chave(r1.montagem.posicao);
    const r2 = otimizar(est(id), SERIES, { ...ctx, aceitar: (p) => chave(p) !== k1 });
    assert.ok(r1.montagem.av.ev >= r2.montagem.av.ev - 1e-12, `${id}: ${r1.montagem.av.ev} < ${r2.montagem.av.ev}`);
    assert.ok(r1.montagem.av.risco >= -2, `${id}: risco ${r1.montagem.av.risco} para uma montagem que não se monta`);
  }
});

test('seriesDaGrade: grade sem negócio na data dá erro claro, não estouro de pilha', () => {
  assert.throws(() => seriesDaGrade({ ...GRADE, data: '2026-11-16' }), /nenhuma série negociada em 2026-11-16/);
});

test('aviso "fora da janela" só quando o 1º vencimento está mesmo fora da janela', () => {
  const ctx = { data: D, spot: S, sigma: 0.332, sigmaEstresse: 0.389 };
  const falsos = [];
  for (const e of ESTRUTURAS) {
    const r = otimizar(e, SERIES, ctx);
    const [lo, hi] = janela(e);
    const du = Math.min(...r.montagem.posicao.pernas.filter((p) => p.tipo !== 'acao').map((p) => diasUteis(D, p.venc)));
    if (du >= lo && du <= hi && r.avisos.some((a) => a.includes('fora da janela'))) falsos.push(`${e.id}: ${du} du em [${lo}, ${hi}]`);
  }
  assert.deepEqual(falsos, []);
});
