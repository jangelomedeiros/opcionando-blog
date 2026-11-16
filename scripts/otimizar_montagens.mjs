#!/usr/bin/env node
// Monta as 62 estruturas na grade do dia da forma otimizada (src/lib/otimizacao/otimizar.ts)
// e grava src/data/laboratorio/mercado.csv, src/data/laboratorio/validacao.json e o relatório de validação.
//
// Uso: node scripts/otimizar_montagens.mjs src/data/grades/bbas3-AAAA-MM-DD.json src/data/candles/bbas3-AAAA-MM-DD.json [relatorio.md]
import { readFileSync, writeFileSync } from 'node:fs';
import { volRealizada, seriesDaGrade, otimizar, janela } from '../src/lib/otimizacao/otimizar.ts';
import { metricasVencimento } from '../src/lib/motor/metricas.ts';
import { gregasPosicao } from '../src/lib/motor/posicao.ts';
import { diasUteis } from '../src/lib/motor/calendario.ts';
import { deltaEstrutural } from '../src/lib/catalogo/protocolo.ts';
import { gradeParaManejo } from '../src/lib/catalogo/gradeManejo.ts';
import { iniciar, aplicar } from '../src/lib/catalogo/simulacao.ts';

const [gradeArq, candlesArq, relArq = 'docs/revisao/2026-11-16-validacao-estruturas.md'] = process.argv.slice(2);
if (!gradeArq || !candlesArq) {
  console.error('Uso: node scripts/otimizar_montagens.mjs GRADE.json CANDLES.json [RELATORIO.md]');
  process.exit(1);
}
const RAIZ = new URL('../', import.meta.url);
const ler = (p) => JSON.parse(readFileSync(p, 'utf8'));
const G = ler(gradeArq), C = ler(candlesArq);
const E = ler(new URL('src/data/laboratorio/estruturas.json', RAIZ));
const MANEJO = ler(new URL('src/data/laboratorio/manejo.json', RAIZ));
const spot = Math.round(G.spot * 100) / 100, data = G.data;

// Vol realizada: 120 pregões sem os 2 maiores gaps (base) e 60 pregões sem os 2 maiores (estresse).
const closes = C.map((x) => x.c);
if (C[C.length - 1].d < data) closes.push(spot);
const sigma = volRealizada(closes, 120, 2), sigmaEstresse = volRealizada(closes, 60, 2);
const hv = { hv20: volRealizada(closes, 20), hv60: volRealizada(closes, 60), hv120: volRealizada(closes, 120) };
const ult = C[C.length - 1];
const tendencia = spot < ult.m20 && ult.m20 < ult.m50 && ult.m50 < ult.m200 ? 'baixa'
  : spot > ult.m20 && ult.m20 > ult.m50 && ult.m50 > ult.m200 ? 'alta' : 'lateral';

const series = seriesDaGrade(G, spot);
const ctx = { data, spot, sigma, sigmaEstresse };
// Operador só monta onde consegue manejar: todos os caminhos com operações têm de aplicar na grade real.
const manejoAplica = (id) => (pos) => {
  const cenario = { data, spot }, g = gradeParaManejo(pos, cenario, G);
  for (const c of MANEJO[id]?.cenarios ?? []) for (const p of c.caminhos.filter((x) => x.ops?.length)) {
    if (aplicar(iniciar(pos), p.nome, p.ops, cenario, g).erro) return false;
  }
  return true;
};
const ivAtm = (venc) => {
  const xs = series.filter((s) => s.venc === venc);
  const k = xs.reduce((a, b) => (Math.abs(b.strike - spot) < Math.abs(a.strike - spot) ? b : a)).strike;
  const v = xs.filter((s) => s.strike === k).map((s) => s.vol);
  return v.reduce((a, b) => a + b, 0) / v.length;
};

const f = (x, d = 2) => (x === null || x === undefined ? '' : x.toFixed(d).replace('.', ','));
const pct = (x) => `${(x * 100).toFixed(0)}%`;
const linhas = [], validacao = [];
const TIPO = { call: 'CALL', put: 'PUT' };

for (const e of E) {
  const r = otimizar(e, series, { ...ctx, aceitar: manejoAplica(e.id) });
  const m = r.montagem, pos = m.posicao;
  const grupo = (nome, legs, ss) => legs.forEach((l, i) => {
    const s = ss[i];
    linhas.push(s
      ? `${e.id};${nome};${TIPO[s.tipo]};${l.q};${s.ticker};${f(s.strike)};${s.venc};${f(s.preco)};${f(s.vol, 4)};${s.negocios ?? ''};${s.origem}`
      : `${e.id};${nome};AÇÃO;${l.q};${G.ativo};;;${f(spot)};;;ultimo`);
  });
  grupo('principal', e.pernas, m.series);
  if (e.comparacao) grupo('comparacao', e.comparacao, m.comparacao);

  const venc1 = pos.pernas.filter((p) => p.tipo !== 'acao').map((p) => p.venc).sort()[0];
  const du1 = diasUteis(data, venc1);
  const mt = metricasVencimento(pos);
  const g = gregasPosicao(pos, { data, spot });
  const iv = ivAtm(venc1);
  const exp = Math.max(Math.abs(g.delta), 1e-9);
  const vies = g.delta > 0.1 ? 'altista' : g.delta < -0.1 ? 'baixista' : 'neutra';
  const favorTend = tendencia === 'lateral' ? (vies === 'neutra') : (vies === 'neutra' ? null : (vies === 'altista') === (tendencia === 'alta'));
  const vendeVol = g.vega < 0;
  const favorVol = (iv > sigma) === vendeVol;
  void exp;
  validacao.push({
    id: e.id, veredito: r.veredito, avisos: r.avisos,
    montagem: {
      pernas: pos.pernas.map((p, i) => ({ tipo: p.tipo, q: p.q, ticker: m.series[i]?.ticker ?? G.ativo, strike: p.strike ?? null, venc: p.venc ?? null, preco: p.entrada, origem: m.series[i]?.origem ?? 'ultimo', negocios: m.series[i]?.negocios ?? null })),
      credito: m.credito, du1, janela: janela(e), deltaEstrutural: deltaEstrutural(pos), candidatas: r.candidatas,
    },
    lucro: {
      ev: m.av.ev, prob: m.av.prob, risco: m.av.risco, evEstresse: m.avEstresse.ev, probEstresse: m.avEstresse.prob,
      ganhoMax: mt.ganhoMax, perdaMax: mt.perdaMax, equilibrios: mt.equilibrios,
    },
    contexto: { tendencia, vies, aFavorDaTendencia: favorTend, ivAtm: iv, volRealizada: sigma, vendeVol, aFavorDaVol: favorVol },
    dinamica: { delta: g.delta, gama: g.gama, theta: g.theta, vega: g.vega },
  });
}

const cab = [
  '# Preços reais para o bloco "Como essa estrutura seria montada hoje?"',
  `# data=${data}`, `# ativo=${G.ativo}`, `# spot=${f(spot)}`,
  '# fonte=B3 via opcoes.net.br · último negócio do dia de cada série (teórico por Black-Scholes quando não houve negócio)',
  '# Gerado por scripts/otimizar_montagens.mjs (montagem otimizada: desenho e regras do POP, maior valor esperado por risco com a vol realizada).',
  '# tipo: AÇÃO, CALL ou PUT. qtd: positivo compra, negativo venda. vencimento: AAAA-MM-DD. origem: ultimo ou teorico. grupo: principal ou comparacao.',
  'estrutura;grupo;tipo;qtd;ticker;strike;vencimento;preco;vi;negocios;origem'];
writeFileSync(new URL('src/data/laboratorio/mercado.csv', RAIZ), '﻿' + [...cab, ...linhas].join('\r\n') + '\r\n'); // CRLF, como o arquivo original
const mercadoInfo = { data, ativo: G.ativo, spot, sigma, sigmaEstresse, ...hv, tendencia, m20: ult.m20, m50: ult.m50, m200: ult.m200 };
writeFileSync(new URL('src/data/laboratorio/validacao.json', RAIZ), JSON.stringify({ mercado: mercadoInfo, estruturas: validacao }, null, 1) + '\n');

// Relatório
const nome = Object.fromEntries(E.map((e) => [e.id, e.nome]));
const VER = { montar: 'Montar', 'montar-com-ressalva': 'Montar com ressalva', 'nao-montar': 'Não montar agora' };
const cont = (v) => validacao.filter((x) => x.veredito === v).length;
const md = [
  `# Validação das 62 estruturas — grade de ${data.split('-').reverse().join('/')}`, '',
  `Gerado por \`scripts/otimizar_montagens.mjs\`. Critério em \`docs/superpowers/specs/2026-11-16-otimizacao-montagens-design.md\`.`, '',
  '## Mercado', '',
  `- ${G.ativo} a R$ ${f(spot)}; médias de 20, 50 e 200: R$ ${f(ult.m20)}, R$ ${f(ult.m50)}, R$ ${f(ult.m200)} — tendência **${tendencia}**.`,
  `- Vol realizada: HV20 ${pct(hv.hv20)}, HV60 ${pct(hv.hv60)}, HV120 ${pct(hv.hv120)} (contaminadas pelo gap de −34,7% em 26/10).`,
  `- Sem os 2 maiores gaps: **${pct(sigma)}** em 120 pregões (base do valor esperado) e ${pct(sigmaEstresse)} em 60 (estresse).`,
  `- Vol implícita ATM entre ${pct(Math.min(...validacao.map((v) => v.contexto.ivAtm)))} e ${pct(Math.max(...validacao.map((v) => v.contexto.ivAtm)))} nos vencimentos usados: a implícita está acima da realizada sem gaps, então **a vantagem estatística hoje é de quem vende vol**.`, '',
  `Veredito: ${cont('montar')} para montar, ${cont('montar-com-ressalva')} com ressalva e ${cont('nao-montar')} para não montar agora. Preços de último negócio: conferir no book antes de executar.`, '',
  '## As 62', '',
  '| Estrutura | Veredito | Montagem | Crédito | VE | VE estresse | Prob. lucro | Pior caso | Viés × tendência | Vol | Θ/du | Avisos |',
  '|---|---|---|---|---|---|---|---|---|---|---|---|',
  ...validacao.map((v) => {
    const mo = v.montagem.pernas.map((p) => (p.tipo === 'acao' ? `${p.q > 0 ? '+' : ''}${p.q} ação` : `${p.q > 0 ? '+' : ''}${p.q} ${p.ticker} ${f(p.strike)}${p.origem === 'teorico' ? '*' : ''}`)).join(' / ');
    const tend = v.contexto.aFavorDaTendencia === null ? `${v.contexto.vies}` : `${v.contexto.vies} (${v.contexto.aFavorDaTendencia ? 'a favor' : 'contra'})`;
    return `| ${nome[v.id]} | ${VER[v.veredito]} | ${mo} (${v.montagem.du1} du) | ${f(v.montagem.credito)} | ${f(v.lucro.ev, 3)} | ${f(v.lucro.evEstresse, 3)} | ${pct(v.lucro.prob)} | ${f(v.lucro.risco)} | ${tend} | ${v.contexto.vendeVol ? 'vende' : 'compra'} (${v.contexto.aFavorDaVol ? 'a favor' : 'contra'}) | ${f(v.dinamica.theta, 3)} | ${v.avisos.join('; ')} |`;
  }),
  '', '\\* preço teórico (série sem negócio no dia).', '',
];
// A seção "Leitura do operador" é escrita à mão e sobrevive à regeração.
const MARCA = '## Leitura do operador';
let leitura = '';
try { const atual = readFileSync(new URL(relArq, RAIZ), 'utf8'); const i = atual.indexOf(MARCA); if (i >= 0) leitura = atual.slice(i); } catch {}
writeFileSync(new URL(relArq, RAIZ), md.join('\n') + leitura);
console.log(`${E.length} estruturas · σ base ${pct(sigma)} · estresse ${pct(sigmaEstresse)} · montar ${cont('montar')} · ressalva ${cont('montar-com-ressalva')} · não montar ${cont('nao-montar')}`);
