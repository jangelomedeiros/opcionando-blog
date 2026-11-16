#!/usr/bin/env node
// Plano por cenário: para cada montagem-base do diário, as decisões no 1º vencimento (encerrar, exercer, manejar,
// hedge) com o ativo parado, a ±1σ e a ±2σ, usando as séries seguintes da grade-base (vol implícita de cada série).
// Grava src/data/plano/AAAA-MM-DD.json (data do registro do diário), publicado em /estrategias/estudo/.
//
// Uso: node scripts/plano_vencimentos.mjs [DIARIO.json]   (padrão: o registro do diário da grade de fontes.json)
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { seriesDaGrade } from '../src/lib/otimizacao/otimizar.ts';
import { planoDaEstrutura } from '../src/lib/estudo/plano.ts';
import { resolverArg } from './lib/caminhos.mjs';

const RAIZ = new URL('../', import.meta.url);
const daRaiz = (p) => fileURLToPath(new URL(p, RAIZ));
const ler = (p) => JSON.parse(readFileSync(p, 'utf8'));
const FONTES = ler(daRaiz('src/data/laboratorio/fontes.json'));
const G = ler(daRaiz(FONTES.grade));
const arg = process.argv.slice(2).find((a) => !a.startsWith('--'));
const REG = ler(arg ? resolverArg(arg) : daRaiz(`src/data/diario/${G.data}.json`));
if (REG.data !== G.data) { console.error(`O registro do diário (${REG.data}) não é da grade em uso (${G.data}): o plano precisa das séries da mesma data.`); process.exit(1); }
const E = Object.fromEntries(ler(daRaiz('src/data/laboratorio/estruturas.json')).map((e) => [e.id, e]));
const MANEJO = ler(daRaiz('src/data/laboratorio/manejo.json'));
const series = seriesDaGrade(G, Math.round(G.spot * 100) / 100);

// Só o que a página usa, para o arquivo não crescer à toa.
const enxuto = (a) => ({ nome: a.nome, tipo: a.tipo, aplicavel: a.aplicavel, erro: a.erro, ev: a.ev, prob: a.prob, piorCaso: a.piorCaso, risco: a.risco, compensa: a.compensa, objetivo: a.objetivo });
const planos = REG.estruturas.map((reg) => {
  const p = planoDaEstrutura(E[reg.id], reg, { data: REG.data, spot: REG.spot }, G, series, (MANEJO[reg.id]?.cenarios ?? []).flatMap((c) => c.caminhos), REG.sigma);
  return { ...p, cenarios: p.cenarios.map((c) => ({ ...c, exercicio: c.exercicio.map((x) => ({ tipo: x.tipo, lado: x.lado, strike: x.strike, decisao: x.decisao })), alternativas: c.alternativas.map(enxuto) })) };
});
const hipotese = 'séries seguintes reprecificadas no cenário com a vol implícita de cada uma na grade-base (sticky strike); valor esperado e probabilidade com a vol realizada de referência';
mkdirSync(daRaiz('src/data/plano/'), { recursive: true });
writeFileSync(daRaiz(`src/data/plano/${REG.data}.json`), JSON.stringify({ base: REG.data, spot: REG.spot, sigma: REG.sigma, hipotese, planos }) + '\n');
console.log(`${planos.length} planos · 5 cenários cada · base ${REG.data} → src/data/plano/${REG.data}.json`);
