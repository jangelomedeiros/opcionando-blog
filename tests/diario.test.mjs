import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { registroDe, apurar, resumoDiario } from '../src/lib/otimizacao/diario.ts';
import { precoBS } from '../src/lib/motor/bs.ts';
import { diasUteis } from '../src/lib/motor/calendario.ts';

const ler = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const D = '2026-11-13', S = 15.1, V = '2026-12-18', V2 = '2027-01-15';
const px = (tipo, k, venc) => +precoBS(tipo, S, k, Math.max(diasUteis(D, venc), 0.5) / 252, 0.36).toFixed(2);

// Validação mínima no formato de validacao.json.
const validacao = {
  mercado: { data: D, spot: S, sigma: 0.33 },
  estruturas: [
    { id: 'venda-call', veredito: 'montar', montagem: { credito: px('call', 15.7, V), pernas: [{ tipo: 'call', q: -1, strike: 15.7, venc: V, preco: px('call', 15.7, V) }] }, lucro: { ev: 0.07, prob: 0.74 } },
    { id: 'compra-put', veredito: 'nao-montar', montagem: { credito: -px('put', 15.2, V), pernas: [{ tipo: 'put', q: 1, strike: 15.2, venc: V, preco: px('put', 15.2, V) }] }, lucro: { ev: -0.07, prob: 0.36 } },
    { id: 'calendario', veredito: 'montar-com-ressalva', montagem: { credito: 0, pernas: [
      { tipo: 'call', q: -1, strike: 15.2, venc: V, preco: px('call', 15.2, V) }, { tipo: 'call', q: 1, strike: 15.2, venc: V2, preco: px('call', 15.2, V2) }] }, lucro: { ev: 0.1, prob: 0.45 } },
    { id: 'coberta', veredito: 'montar', montagem: { credito: 0.5, pernas: [{ tipo: 'acao', q: 1, strike: null, venc: null, preco: S }, { tipo: 'call', q: -1, strike: 15.7, venc: V, preco: px('call', 15.7, V) }] }, lucro: { ev: 0.07, prob: 0.66 } },
  ],
};

test('registroDe guarda o veredito, a montagem e o 1º vencimento de cada estrutura', () => {
  const r = registroDe(validacao);
  assert.equal(r.data, D);
  assert.equal(r.estruturas.length, 4);
  assert.deepEqual(r.estruturas.map((e) => e.venc1), [V, V, V, V]);
  assert.equal(r.estruturas[0].ev, 0.07);
});

test('apurar: sem o fechamento do 1º vencimento, fica pendente', () => {
  const a = apurar(registroDe(validacao), [{ d: '2026-12-17', c: 15 }]);
  assert.ok(a.every((x) => x.status === 'pendente'));
});

test('apurar: no vencimento, resultado pelo fechamento; acerto conforme o veredito', () => {
  const candles = [{ d: '2026-12-17', c: 15.4 }, { d: V, c: 14.9 }];
  const a = Object.fromEntries(apurar(registroDe(validacao), candles).map((x) => [x.id, x]));
  const vc = a['venda-call'];
  assert.equal(vc.status, 'apurado');
  assert.equal(vc.fechamento, 14.9);
  assert.ok(Math.abs(vc.resultado - px('call', 15.7, V)) < 1e-9, 'call vendida OTM vence pó: fica com o prêmio');
  assert.equal(vc.acerto, true);
  const cp = a['compra-put'];
  assert.ok(Math.abs(cp.resultado - (0.3 - px('put', 15.2, V))) < 1e-9);
  assert.equal(cp.acerto, cp.resultado <= 0, '"não montar" acerta quando a montagem teria perdido');
  assert.equal(a.calendario.status, 'apurado');
  assert.ok(Number.isFinite(a.calendario.resultado), 'perna longa marcada por Black-Scholes com a vol de entrada');
  assert.ok(Math.abs(a.coberta.resultado - (14.9 - S + px('call', 15.7, V))) < 1e-9, 'ação entra pelo fechamento');
});

test('resumoDiario: acertos e resultado das recomendadas contra o valor esperado', () => {
  const candles = [{ d: V, c: 14.9 }];
  const r = resumoDiario([apurar(registroDe(validacao), candles), apurar(registroDe(validacao), [])]);
  assert.equal(r.apuradas, 4);
  assert.equal(r.pendentes, 4);
  assert.equal(r.montar.n, 3);
  assert.ok(r.montar.acertos >= 2);
  assert.ok(Math.abs(r.montar.ev - (0.07 + 0.1 + 0.07)) < 1e-9);
  assert.ok(Number.isFinite(r.montar.resultado));
});

test('diário de 13/11 gravado e página publicada com as pendentes', () => {
  assert.ok(existsSync(new URL('../src/data/diario/2026-11-13.json', import.meta.url)));
  const reg = JSON.parse(ler('src/data/diario/2026-11-13.json'));
  assert.equal(reg.estruturas.length, 62);
  const t = ler('dist/estrategias/diario/index.html').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
  assert.match(t, /Diário do operador/);
  assert.match(t, /Grade de 13\/11\/2026/);
  assert.match(t, /19\/11/);
  assert.match(ler('dist/estrategias/hoje/index.html'), /href="\/estrategias\/diario\/"/);
});
