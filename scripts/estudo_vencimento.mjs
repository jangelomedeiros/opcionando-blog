#!/usr/bin/env node
// Estudo dos vencimentos: com a grade do dia do vencimento (ou da véspera), avalia cada montagem-base do diário
// que vence: situação, exercício, e as alternativas (encerrar, seguir, cada manejo) nos preços de tela do dia.
// Grava src/data/estudo/AAAA-MM-DD.json, que a página /estrategias/estudo/ publica.
//
// Uso: node scripts/estudo_vencimento.mjs [GRADE.json] [CANDLES.json]   (padrão: src/data/laboratorio/fontes.json)
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { seriesDaGrade, volRealizada } from '../src/lib/otimizacao/otimizar.ts';
import { avaliarVencimento } from '../src/lib/estudo/vencimento.ts';
import { diasUteis } from '../src/lib/motor/calendario.ts';
import { resolverArg } from './lib/caminhos.mjs';

const RAIZ = new URL('../', import.meta.url);
const daRaiz = (p) => fileURLToPath(new URL(p, RAIZ));
const ler = (p) => JSON.parse(readFileSync(p, 'utf8'));
const FONTES = ler(daRaiz('src/data/laboratorio/fontes.json'));
const [gArg, cArg] = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const G = ler(gArg ? resolverArg(gArg) : daRaiz(FONTES.grade));
const C = ler(cArg ? resolverArg(cArg) : daRaiz(FONTES.candles));
const E = Object.fromEntries(ler(daRaiz('src/data/laboratorio/estruturas.json')).map((e) => [e.id, e]));
const MANEJO = ler(daRaiz('src/data/laboratorio/manejo.json'));
const spot = Math.round(G.spot * 100) / 100, data = G.data;

const closes = C.map((x) => x.c);
if (C[C.length - 1].d < data) closes.push(spot);
const sigma = volRealizada(closes, 120, 2);
const tela = new Map(G.series.filter((s) => s.ultimo !== null && s.data_ultimo === data && s.venc >= data)
  .map((s) => [`${s.tipo}|${Math.round(s.strike * 100) / 100}|${s.venc}`, s.ultimo]));
const dia = { data, spot, series: seriesDaGrade(G, spot), tela, grade: G };

// Montagens-base do diário que vencem hoje ou no próximo pregão (grade da véspera).
const pasta = daRaiz('src/data/diario/');
const todos = readdirSync(pasta).filter((f) => f.endsWith('.json')).map((f) => ler(pasta + f));
const registros = todos.filter((r) => r.data < data);
const devidas = registros.flatMap((r) => r.estruturas.filter((e) => e.venc1 >= data && diasUteis(data, e.venc1) <= 1).map((e) => ({ r, e })));
if (!devidas.length) {
  const proximos = [...new Set(todos.flatMap((r) => r.estruturas.map((e) => e.venc1)).filter((v) => v >= data))].sort().slice(0, 3);
  console.log(`Grade de ${data}: nenhuma estrutura do diário vence hoje ou no próximo pregão. Próximos vencimentos: ${proximos.join(', ') || 'nenhum'}.`);
  process.exit(0);
}
const estudos = devidas.map(({ r, e }) => avaliarVencimento(E[e.id], e, { data: r.data, spot: r.spot }, dia, (MANEJO[e.id]?.cenarios ?? []).flatMap((c) => c.caminhos), { sigma }));
mkdirSync(daRaiz('src/data/estudo/'), { recursive: true });
writeFileSync(daRaiz(`src/data/estudo/${data}.json`), JSON.stringify({ data, spot, sigma, estudos }, null, 1) + '\n');
for (const s of estudos) console.log(`${s.id.padEnd(22)} ${s.situacao.resultado >= 0 ? 'lucro' : 'prejuízo'} ${s.situacao.resultado.toFixed(2)} · sugestão: ${s.sugestao}`);
console.log(`${estudos.length} estruturas estudadas no vencimento de ${data} → src/data/estudo/${data}.json`);
