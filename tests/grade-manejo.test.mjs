import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { gradeParaManejo } from '../src/lib/catalogo/gradeManejo.ts';
import { lerMercadoCsv, posicaoHoje, posicaoReferencia } from '../src/lib/catalogo/converter.ts';
import { aplicarAjuste } from '../src/lib/motor/manejo.ts';
import { resultado, primeiroVencimento } from '../src/lib/motor/posicao.ts';
import { ehDiaUtil } from '../src/lib/motor/calendario.ts';

const ler = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const FONTES = JSON.parse(ler('src/data/laboratorio/fontes.json'));
const ESTRUTURAS = JSON.parse(ler('src/data/laboratorio/estruturas.json'));
const GRADE = JSON.parse(ler(FONTES.grade));
const m = lerMercadoCsv(ler('src/data/laboratorio/mercado.csv'));
const cc = ESTRUTURAS.find((e) => e.id === 'covered-call');

test('grade real contém o strike da call e os 17 vencimentos', () => {
  const { posicao, cenario } = posicaoHoje(cc, m);
  const g = gradeParaManejo(posicao, cenario, GRADE);
  const k = posicao.pernas.find((p) => p.tipo === 'call').strike;
  assert.ok(g.strikes.includes(k));
  assert.equal(g.vencimentos.length, 17);
  assert.ok(g.strikes.every((x, i) => i === 0 || x > g.strikes[i - 1]));
});

test('grade sintética da referência', () => {
  const { posicao, cenario } = posicaoReferencia(cc);
  const g = gradeParaManejo(posicao, cenario, null);
  assert.ok(g.strikes.includes(25.04));
  assert.ok(g.strikes[0] <= 14.3 && g.strikes[0] >= 14.1, String(g.strikes[0]));
  assert.ok(g.strikes.at(-1) >= 33 && g.strikes.at(-1) <= 33.3, String(g.strikes.at(-1)));
  const futuros = g.vencimentos.filter((v) => v > cenario.data);
  assert.ok(futuros.length >= 6);
  assert.ok(futuros.every(ehDiaUtil));
});

test('ajuste no dia do vencimento rola para um vencimento posterior sem criar valor', () => {
  const { posicao, cenario } = posicaoHoje(cc, m);
  const g = gradeParaManejo(posicao, cenario, GRADE);
  const v1 = primeiroVencimento(posicao);
  const c = { ...cenario, data: v1 };
  const { posicao: nova } = aplicarAjuste(posicao, [{ op: 'rolarVencimento', perna: 'p2', passos: 1 }], c, g);
  assert.ok(nova.pernas.find((p) => p.tipo === 'call').venc > v1);
  assert.ok(Math.abs(resultado(nova, c) - resultado(posicao, c)) < 1e-9);
});
