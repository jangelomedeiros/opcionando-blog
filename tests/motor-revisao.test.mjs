// Regressões da revisão final da etapa 2.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { precoBS } from '../src/lib/motor/bs.ts';
import { diasUteis } from '../src/lib/motor/calendario.ts';
import { valorPerna, gregasPosicao } from '../src/lib/motor/posicao.ts';
import { metricasVencimento, equilibrios } from '../src/lib/motor/metricas.ts';
import { aplicarAjuste } from '../src/lib/motor/manejo.ts';

const D0 = '2026-11-13', S0 = 15.1;
const T = (venc) => diasUteis(D0, venc) / 252;

function calendario(tipo, curta, longa, vol) {
  const ec = precoBS(tipo, S0, 15, T(curta), vol), el = precoBS(tipo, S0, 15, T(longa), vol);
  return { debito: el - ec, pos: { realizado: 0, pernas: [
    { id: 'curta', tipo, q: -1, strike: 15, venc: curta, entrada: ec, vol },
    { id: 'longa', tipo, q: 1, strike: 15, venc: longa, entrada: el, vol },
  ] } };
}

test('calendário com perna longa viva tem perda limitada ao débito (não "ilimitado")', () => {
  for (const [tipo, longa, vol] of [['call', '2027-09-17', 0.35], ['call', '2027-06-18', 0.5], ['put', '2027-12-17', 0.35]]) {
    const { pos, debito } = calendario(tipo, '2026-12-18', longa, vol);
    const m = metricasVencimento(pos);
    assert.notEqual(m.perdaMax, null, `${tipo} ${longa}`);
    assert.notEqual(m.ganhoMax, null, `${tipo} ${longa}`);
    if (tipo === 'call') assert.ok(Math.abs(m.perdaMax + debito) < 0.02, `${tipo} ${longa}: perda ${m.perdaMax} vs débito ${debito}`);
    // put: com o ativo perto de zero a put longa europeia vale K·e^(−rT) < intrínseco da curta, então a perda passa do débito
    else assert.ok(m.perdaMax < -debito && m.perdaMax > -15 * (1 - Math.exp(-0.15 * T(longa))) - debito - 0.02, `${tipo}: ${m.perdaMax}`);
  }
});

test('calendário reverso tem ganho limitado', () => {
  const { pos } = calendario('call', '2026-12-18', '2027-09-17', 0.35);
  pos.pernas.forEach((p) => { p.q = -p.q; });
  assert.notEqual(metricasVencimento(pos).ganhoMax, null);
});

test('ponto de equilíbrio atravessando trecho zerado (risk reversal de custo zero)', () => {
  const pos = { realizado: 0, pernas: [
    { id: 'p', tipo: 'put', q: -1, strike: 18, venc: '2026-12-18', entrada: 0.5, vol: 0.4 },
    { id: 'c', tipo: 'call', q: 1, strike: 22, venc: '2026-12-18', entrada: 0.5, vol: 0.4 },
  ] };
  assert.deepEqual(metricasVencimento(pos).equilibrios, [18, 22]);
  assert.deepEqual(equilibrios([1, 2, 3, 4, 5], [-1, 0, 0, 0, 1]), [2, 4]);
  assert.deepEqual(equilibrios([1, 2, 3, 4, 5], [1, 0, 0, 0, 1]), []);
});

test('véspera do vencimento ainda tem valor de tempo e theta', () => {
  const p = { id: 'c', tipo: 'call', q: 1, strike: 15, venc: '2026-11-19', entrada: 0.3, vol: 0.45 };
  const vespera = { data: '2026-11-18', spot: 15 };
  assert.ok(valorPerna(p, vespera) > 0, 'ATM na véspera vale mais que zero');
  assert.ok(gregasPosicao({ realizado: 0, pernas: [p] }, vespera).theta < 0);
  assert.equal(valorPerna(p, { data: '2026-11-19', spot: 15 }), 0); // no dia do vencimento: intrínseco
});

test('choque de vol até zero não faz o preço saltar', () => {
  for (const [tipo, K] of [['call', 12], ['put', 18]]) {
    const p = { id: 'x', tipo, q: 1, strike: K, venc: '2027-12-17', entrada: 1, vol: 0.3 };
    const a = valorPerna(p, { data: D0, spot: S0, choqueVol: -29.9 });
    const b = valorPerna(p, { data: D0, spot: S0, choqueVol: -30 });
    assert.ok(Math.abs(a - b) < 0.05, `${tipo} ${K}: ${a} vs ${b}`);
  }
});

test('ajustes aplicados um a um sem número não repetem ids', () => {
  const grade = { strikes: [14, 14.5, 15, 15.5, 16], vencimentos: ['2026-12-18', '2027-01-15'] };
  const c = { data: D0, spot: S0 };
  let pos = { realizado: 0, pernas: [{ id: 'c', tipo: 'call', q: 1, strike: 15, venc: '2026-12-18', entrada: 0.6, vol: 0.45 }] };
  pos = aplicarAjuste(pos, [{ op: 'adicionar', tipo: 'put', q: 1 }], c, grade).posicao;
  pos = aplicarAjuste(pos, [{ op: 'adicionar', tipo: 'put', q: -1 }], c, grade).posicao;
  pos = aplicarAjuste(pos, [{ op: 'rolarStrike', perna: 'c', passos: 1 }], c, grade).posicao;
  pos = aplicarAjuste(pos, [{ op: 'rolarStrike', perna: pos.pernas.find((p) => p.tipo === 'call').id, passos: 1 }], c, grade).posicao;
  const ids = pos.pernas.map((p) => p.id);
  assert.equal(new Set(ids).size, ids.length, ids.join(','));
});
