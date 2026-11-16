// Regressões da revisão dos PRs #7 a #10.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { executar } from '../scripts/lib/executar.mjs';
import { resolverArg } from '../scripts/lib/caminhos.mjs';
import { candlesDeOhlcv } from '../scripts/lib/candles.mjs';
import { primeiroMensal } from '../src/lib/catalogo/protocolo.ts';
import { trajetoria, fraseTrajetoria, paradoEm } from '../src/lib/catalogo/trajetoria.ts';
import { precoBS } from '../src/lib/motor/bs.ts';
import { diasUteis } from '../src/lib/motor/calendario.ts';

const ler = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const D = '2026-11-13', S = 15.1, V = '2026-12-18', T = diasUteis(D, V) / 252;
const call = (q, k) => ({ id: 'c', tipo: 'call', q, strike: k, venc: V, entrada: precoBS('call', S, k, T, 0.36), vol: 0.36 });

test('executar: roda o node (caminho com espaço) e passa argumento com espaço intacto', () => {
  const r = executar(process.execPath, ['-e', 'process.stdout.write(process.argv[1])', 'Grade BBAS3.xlsx'], { capturar: true });
  assert.equal(r.status, 0, r.stderr);
  assert.equal(r.stdout, 'Grade BBAS3.xlsx');
});

test('executar: programa inexistente devolve a causa, não só "falhou"', () => {
  const r = executar('programa-que-nao-existe-xyz', ['--versao'], { capturar: true });
  assert.notEqual(r.status, 0);
  assert.match(r.causa, /programa-que-nao-existe-xyz/);
});

test('resolverArg: caminho absoluto do Windows fica como está; relativo vale a partir da pasta atual', () => {
  assert.equal(resolverArg(String.raw`C:\tmp\grade.json`, String.raw`D:\repo`), String.raw`C:\tmp\grade.json`);
  assert.equal(resolverArg(String.raw`dados\g.json`, String.raw`D:\repo`).toLowerCase(), String.raw`d:\repo\dados\g.json`);
});

test('candles: OHLCV curto demais para a média de 200 dá erro claro', () => {
  const rows = Array.from({ length: 250 }, (_, i) => ({ t: 1767268800 + i * 86400, o: 1, h: 1, l: 1, c: 1, v: 1 }));
  assert.throws(() => candlesDeOhlcv(rows, 123), /322 pregões/);
});

test('primeiroMensal: vencimento mensal antecipado pelo feriado (19/11, quinta) é reconhecido', () => {
  const vencs = ['2026-11-19', '2026-11-27', '2026-12-04', '2026-12-18', '2026-12-23', '2027-01-15'];
  assert.equal(primeiroMensal(vencs), '2026-11-19');
  assert.equal(primeiroMensal(vencs.slice(1)), '2026-12-18');
  assert.equal(primeiroMensal(['2026-11-27']), null);
});

test('trajetoria ignora o choque de vol do simulador: a vol fica congelada na de entrada', () => {
  const pos = { realizado: 0, pernas: [call(-1, 15.7)] };
  const com = trajetoria(pos, { data: D, spot: S, choqueVol: 20 }, 0.33), sem = trajetoria(pos, { data: D, spot: S }, 0.33);
  assert.deepEqual(com.parado, sem.parado);
  assert.deepEqual(paradoEm(pos, { data: D, spot: S, choqueVol: 20 }, sem.datas), sem.parado);
});

test('fraseTrajetoria separa o já realizado do que o tempo entrega', () => {
  const c = call(-1, 15.7);
  const t = trajetoria({ realizado: 0.8, pernas: [c] }, { data: D, spot: S }, 0.33);
  const f = fraseTrajetoria(t);
  assert.ok(f.includes(`ganha R$ ${c.entrada.toFixed(2).replace('.', ',')}`), f);
  assert.match(f, /R\$ 0,80 já acumulado/);
  assert.doesNotMatch(f, /primeiros 0 du/);
});

test('atalho "Ver a dinâmica no tempo" segue o estado do simulador (evento), não a existência do gráfico', () => {
  const h = ler('dist/estrategias/covered-call/index.html');
  assert.match(h, /addEventListener\('opcionando:simulacao'/);
  assert.doesNotMatch(h, /document\.querySelector\('\.traj'\)\) v\.hidden = false/);
});

test('painel Hoje: efeito hole do vencimento mensal real (19/11, menos de 6 du)', () => {
  const t = ler('dist/estrategias/hoje/index.html').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
  assert.match(t, /Vencimento mensal em 19\/11\/2026, a 3 du/);
  assert.match(t, /Menos de 6 du/);
});
