import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { trajetoria, fraseTrajetoria } from '../src/lib/catalogo/trajetoria.ts';
import { precoBS } from '../src/lib/motor/bs.ts';
import { diasUteis, ehDiaUtil } from '../src/lib/motor/calendario.ts';

const D = '2026-11-13', S = 15.1, V = '2026-12-18';
const T = diasUteis(D, V) / 252;
const perna = (id, tipo, q, k, vol = 0.36) => ({ id, tipo, q, strike: k, venc: V, entrada: precoBS(tipo, S, k, T, vol), vol });
const pos = (...pernas) => ({ realizado: 0, pernas });
const C = { data: D, spot: S };

test('trajetoria: um ponto por dia útil, da entrada ao 1º vencimento', () => {
  const t = trajetoria(pos(perna('c', 'call', -1, 15.7)), C, 0.33);
  assert.equal(t.datas[0], D);
  assert.equal(t.datas[t.datas.length - 1], V);
  assert.ok(t.datas.every(ehDiaUtil));
  assert.equal(t.datas.length, diasUteis(D, V) + 2); // as duas pontas entram
  for (const k of ['parado', 'alta', 'baixa', 'precoAlta', 'precoBaixa']) assert.equal(t[k].length, t.datas.length, k);
  for (const k of ['parado', 'alta', 'baixa']) assert.ok(Math.abs(t[k][0]) < 1e-9, `${k} começa em zero`);
});

test('trajetoria: caminhos de preço abrem com a raiz do tempo', () => {
  const t = trajetoria(pos(perna('c', 'call', -1, 15.7)), C, 0.33);
  const n = t.datas.length - 1;
  assert.equal(t.precoAlta[0], S);
  assert.ok(Math.abs(t.precoAlta[n] - S * Math.exp(0.33 * Math.sqrt(n / 252))) < 1e-9);
  assert.ok(Math.abs(t.precoBaixa[n] - S * Math.exp(-0.33 * Math.sqrt(n / 252))) < 1e-9);
});

test('vendedor de prêmio: parado ganha com o tempo até o prêmio; a alta de 1σ machuca a call vendida', () => {
  const p = pos(perna('c', 'call', -1, 15.7));
  const t = trajetoria(p, C, 0.33), n = t.datas.length - 1;
  assert.ok(Math.abs(t.parado[n] - p.pernas[0].entrada) < 1e-9, 'OTM parada: fica com o prêmio todo');
  for (let i = 1; i <= n; i++) assert.ok(t.parado[i] >= t.parado[i - 1] - 1e-9, `parado não cai no dia ${i}`);
  assert.ok(t.alta[n] < 0 && t.baixa[n] > 0);
  const f = fraseTrajetoria(t);
  assert.match(f, /parado/i);
  assert.ok(f.includes(`em ${diasUteis(D, V)} du`), f); // mesma contagem do resto do site (sem as pontas)
  assert.match(f, /ganha/);
});

test('comprador de prêmio: parado perde com o tempo; movimento de 1σ para qualquer lado ajuda', () => {
  const t = trajetoria(pos(perna('c', 'call', 1, 15.2), perna('p', 'put', 1, 15.2)), C, 0.5), n = t.datas.length - 1;
  assert.ok(t.parado[n] < 0);
  assert.ok(t.alta[n] > t.parado[n] && t.baixa[n] > t.parado[n]);
  assert.match(fraseTrajetoria(t), /perde/);
});

test('página mostra a dinâmica no tempo na aba Visão, com gráfico e frase', () => {
  const h = readFileSync(new URL('../dist/estrategias/covered-call/index.html', import.meta.url), 'utf8');
  assert.match(h, /Dinâmica do lucro no tempo/);
  assert.match(h, /class="traj-svg"/);
  for (const c of ['traj-parado', 'traj-alta', 'traj-baixa']) assert.match(h, new RegExp(c), c);
  assert.ok(h.indexOf('Dinâmica do lucro no tempo') < h.indexOf('id="covered-call-pop"'), 'fora da aba Visão');
});
