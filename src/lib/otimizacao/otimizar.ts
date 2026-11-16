// Otimização da montagem de cada estrutura na grade do dia, como operador:
// preserva o desenho e as regras do POP e escolhe a montagem de maior valor esperado por risco,
// medido com a vol realizada (a vantagem real; sob a vol implícita tudo vale ~zero).
// Funções puras: quem chama lê os arquivos.
import { diasUteis } from '../motor/calendario.ts';
import { precoBS, volImplicita, normalAcumulada, SELIC_PADRAO, DIAS_UTEIS_ANO } from '../motor/bs.ts';
import { valorPerna, type Perna, type Posicao } from '../motor/posicao.ts';
import { deltaEstrutural, creditoEntrada } from '../catalogo/protocolo.ts';
import type { EstruturaJson, PernaJson } from '../catalogo/converter.ts';

export interface SerieGrade {
  ticker: string; tipo: 'call' | 'put'; strike: number; venc: string; du: number;
  ultimo: number | null; data_ultimo: string | null; negocios: number | null;
}
export interface Grade { ativo?: string; data: string; spot: number; series: SerieGrade[] }
export interface Serie {
  ticker: string; tipo: 'call' | 'put'; strike: number; venc: string;
  preco: number; vol: number; negocios: number | null; origem: 'ultimo' | 'teorico';
}

/** Mínimo de negócios no dia para o último ser preço de montagem, e desvio máximo da vol (p.p./100) para a mediana do vencimento. */
export const MIN_NEGOCIOS = 2, DESVIO_MAX_VOL = 0.15;
/** Cada strike fica a até 5% da moneyness da referência: ATM continua ATM, OTM continua OTM. */
export const BANDA_MONEYNESS = 0.05;
const r2 = (x: number) => Math.round(x * 100) / 100;
const motorT = (data: string, venc: string) => Math.max(diasUteis(data, venc), 0.5) / DIAS_UTEIS_ANO;

/** Vol realizada anualizada dos últimos n log-retornos, sem os `descartar` maiores em módulo (gaps). */
export function volRealizada(closes: number[], n: number, descartar = 0): number {
  const r = closes.slice(1).map((c, i) => Math.log(c / closes[i])).slice(-n);
  const s = [...r].sort((a, b) => Math.abs(a) - Math.abs(b)).slice(0, r.length - descartar);
  const m = s.reduce((a, b) => a + b, 0) / s.length;
  return Math.sqrt((s.reduce((a, x) => a + (x - m) ** 2, 0) / (s.length - 1)) * DIAS_UTEIS_ANO);
}

/**
 * Séries vivas da grade com preço e vol do motor. Negociada no dia (e acima do intrínseco): último negócio.
 * Sem negócio: preço teórico pela vol interpolada no sorriso das negociadas do mesmo vencimento e tipo.
 */
export function seriesDaGrade(g: Grade, spot = r2(g.spot)): Serie[] {
  const vivas = g.series.filter((s) => s.venc > g.data);
  const out: Serie[] = [];
  const pendentes: SerieGrade[] = [];
  for (const s of vivas) {
    const fresca = s.ultimo !== null && s.ultimo > 0 && s.data_ultimo === g.data;
    const vol = fresca ? volImplicita(s.tipo, spot, s.strike, motorT(g.data, s.venc), s.ultimo as number) : null;
    if (vol) out.push({ ticker: s.ticker, tipo: s.tipo, strike: r2(s.strike), venc: s.venc, preco: s.ultimo as number, vol, negocios: s.negocios, origem: 'ultimo' });
    else pendentes.push(s);
  }
  // Negócio isolado ou feito com outro spot (vol fora do sorriso do vencimento) não serve de preço: vira teórico.
  const mediana = (xs: number[]) => { const o = [...xs].sort((a, b) => a - b); return o[Math.floor(o.length / 2)]; };
  const medVenc = new Map<string, number>();
  for (const v of new Set(out.map((x) => x.venc))) {
    const doVenc = out.filter((x) => x.venc === v);
    const perto = doVenc.filter((x) => Math.abs(x.strike / spot - 1) <= 0.1);
    medVenc.set(v, mediana((perto.length ? perto : doVenc).map((x) => x.vol)));
  }
  for (let i = out.length - 1; i >= 0; i--) {
    const x = out[i];
    if ((x.negocios ?? 0) < MIN_NEGOCIOS || Math.abs(x.vol - (medVenc.get(x.venc) as number)) > DESVIO_MAX_VOL) {
      pendentes.push(vivas.find((s) => s.ticker === x.ticker && s.venc === x.venc) as SerieGrade);
      out.splice(i, 1);
    }
  }
  const du = (v: string) => diasUteis(g.data, v);
  const sorriso = (venc: string, tipo: string, k: number): number => {
    let pts = out.filter((x) => x.venc === venc && x.tipo === tipo);
    if (!pts.length) pts = out.filter((x) => x.venc === venc);
    if (!pts.length) {
      const outro = [...new Set(out.map((x) => x.venc))].sort((a, b) => Math.abs(du(a) - du(venc)) - Math.abs(du(b) - du(venc)))[0];
      return sorriso(outro, tipo, k);
    }
    const p = pts.map((x) => [x.strike, x.vol]).sort((a, b) => a[0] - b[0]);
    if (k <= p[0][0]) return p[0][1];
    if (k >= p[p.length - 1][0]) return p[p.length - 1][1];
    for (let i = 1; i < p.length; i++) {
      if (k <= p[i][0]) return p[i - 1][1] + ((p[i][1] - p[i - 1][1]) * (k - p[i - 1][0])) / (p[i][0] - p[i - 1][0] || 1);
    }
    return p[p.length - 1][1];
  };
  for (const s of pendentes) {
    const v = sorriso(s.venc, s.tipo, s.strike), T = motorT(g.data, s.venc);
    const preco = Math.max(r2(precoBS(s.tipo, spot, s.strike, T, v)), 0.01);
    const vol = volImplicita(s.tipo, spot, s.strike, T, preco) ?? v;
    out.push({ ticker: s.ticker, tipo: s.tipo, strike: r2(s.strike), venc: s.venc, preco, vol, negocios: null, origem: 'teorico' });
  }
  return out;
}

/** Janela de dias úteis do 1º vencimento: a do POP (calendário do Prof. Su) ou, sem regra, pela referência. */
export const JANELAS: Record<string, [number, number]> = {
  b1: [12, 24], b2: [30, 45], b3: [25, 60], 'trava-alta': [6, 12], 'trava-baixa': [6, 12],
  'trava-alta-put': [6, 12], 'trava-baixa-call': [6, 12], thl: [23, 60], 'thl-put': [23, 60], tlad: [23, 60],
  bwb: [23, 45], borboleta: [23, 45], hyperfly: [23, 45], 'malha-bw': [23, 45], 'fly-modular': [23, 45], condor: [23, 45],
};
export function janela(e: EstruturaJson & { pop?: string }): [number, number] {
  if (e.pop && JANELAS[e.pop]) return JANELAS[e.pop];
  const d = Math.min(...e.pernas.filter((l) => l.t !== 'S').map((l) => l.d));
  return d <= 5 ? [3, 8] : d <= 10 ? [6, 13] : d <= 20 ? [12, 26] : [20, 45];
}

/** Janela usada quando a do POP não tem os strikes do desenho (ex.: semanais só com strikes redondos). */
export const JANELA_AMPLA: [number, number] = [3, 60];

/** POPs que pedem custo zero (ou débito/aporte pequeno) na entrada: débito máximo por unidade. */
export const DEBITO_MAXIMO: Record<string, number> = {
  b1: 0.05, b2: 0.05, b3: 0.05, 'booster-fly': 0.05, 'booster-horizontal': 0.05, collar: 0.05, 'fly-modular': 0.05,
  'quatermine-v2': 0.05, seagull: 0.05, 'straddle-perene': 0.05, mannerheim: 0.15, 'quatermine-v1': 0.15,
};

const sinal = (x: number) => (Math.abs(x) < 1e-9 ? 0 : Math.sign(x));
const strikesRef = (e: EstruturaJson) => [...new Set(e.pernas.filter((l) => l.t !== 'S').map((l) => l.k as number))].sort((a, b) => a - b);
const gaps = (ks: number[]) => ks.slice(1).map((k, i) => k - ks[i]);

/** Forma das asas: gaps iguais continuam iguais; gaps desiguais mantêm o sentido e a proporção (entre metade e o dobro). */
function formaOk(g: number[], h: number[]): boolean {
  for (let i = 0; i < h.length; i++) {
    for (let j = i + 1; j < h.length; j++) {
      const gm = Math.max(g[i], g[j]);
      if (Math.abs(g[i] - g[j]) <= 0.02 * gm) {
        if (Math.abs(h[i] - h[j]) > Math.max(0.13, 0.15 * Math.max(h[i], h[j]))) return false;
      } else {
        if (sinal(h[i] - h[j]) !== sinal(g[i] - g[j]) || Math.abs(h[i] - h[j]) < 0.01) return false;
        const q = h[i] / h[j] / (g[i] / g[j]);
        if (q < 0.5 || q > 2) return false;
      }
    }
  }
  return true;
}

/** A montagem preserva o desenho da referência: ordem e igualdade de strikes e vencimentos, e a forma das asas. */
export function desenhoPreservado(e: EstruturaJson, pos: Posicao): boolean {
  const ref = e.pernas, at = pos.pernas;
  if (ref.length !== at.length) return false;
  for (let i = 0; i < ref.length; i++) {
    if ((ref[i].t === 'S') !== (at[i].tipo === 'acao') || ref[i].q !== at[i].q) return false;
    for (let j = i + 1; j < ref.length; j++) {
      if (ref[i].t === 'S' || ref[j].t === 'S') continue;
      if (sinal((ref[i].k ?? 0) - (ref[j].k ?? 0)) !== sinal((at[i].strike ?? 0) - (at[j].strike ?? 0))) return false;
      if (Math.sign((ref[i].exp ?? '').localeCompare(ref[j].exp ?? '')) !== Math.sign((at[i].venc ?? '').localeCompare(at[j].venc ?? ''))) return false;
    }
  }
  const novos = [...new Set(at.filter((p) => p.tipo !== 'acao').map((p) => p.strike as number))].sort((a, b) => a - b);
  return formaOk(gaps(strikesRef(e)), gaps(novos));
}

export interface Avaliacao {
  /** Valor esperado a valor presente (R$ por unidade), sob a vol realizada. */
  ev: number;
  /** Probabilidade de terminar o 1º vencimento no lucro. */
  prob: number;
  /** Pior resultado no 1º vencimento na faixa de 0,3× a 2,5× o spot (negativo = perda). */
  risco: number;
}

const N_GRADE = 241;
/**
 * Avaliador no 1º vencimento: distribuição lognormal centrada no termo (drift = Selic, sem visão de direção),
 * com a vol dada. Pernas mais longas seguem por Black-Scholes com a própria vol (como no gráfico).
 */
export function criarAvaliador(data: string, spot: number, sigma: number, r = SELIC_PADRAO) {
  const lo = Math.log(0.3 * spot), hi = Math.log(2.5 * spot);
  const xs = Array.from({ length: N_GRADE }, (_, i) => Math.exp(lo + ((hi - lo) * i) / (N_GRADE - 1)));
  const porData = new Map<string, { w: number[]; desc: number }>();
  const vetores = new Map<string, number[]>();
  const pesos = (D: string) => {
    let x = porData.get(D);
    if (!x) {
      const T = diasUteis(data, D) / DIAS_UTEIS_ANO, sd = sigma * Math.sqrt(T), mu = (r - sigma * sigma / 2) * T;
      const z = (lnS: number) => normalAcumulada((lnS - Math.log(spot) - mu) / sd);
      const bordas = xs.slice(1).map((v, i) => Math.log(Math.sqrt(v * xs[i])));
      const w = xs.map((_, i) => (i === xs.length - 1 ? 1 : z(bordas[i])) - (i === 0 ? 0 : z(bordas[i - 1])));
      x = { w, desc: Math.exp(-r * T) };
      porData.set(D, x);
    }
    return x;
  };
  const vetor = (p: Perna, D: string) => {
    if (p.tipo === 'acao') return xs;
    const k = `${p.tipo}|${p.strike}|${p.venc}|${p.vol}|${D}`;
    let v = vetores.get(k);
    if (!v) { v = xs.map((s) => valorPerna(p, { data: D, spot: s, r })); vetores.set(k, v); }
    return v;
  };
  return (pos: Posicao): Avaliacao => {
    const D = pos.pernas.filter((p) => p.tipo !== 'acao').map((p) => p.venc as string).sort()[0];
    const { w, desc } = pesos(D);
    const pnl = new Float64Array(xs.length);
    let ev = pos.realizado;
    for (const p of pos.pernas) {
      const v = vetor(p, D);
      let e = 0;
      for (let i = 0; i < xs.length; i++) { pnl[i] += p.q * (v[i] - p.entrada); e += w[i] * v[i]; }
      ev += p.q * (desc * e - p.entrada);
    }
    let prob = 0, risco = Infinity;
    for (let i = 0; i < xs.length; i++) { if (pnl[i] > 1e-9) prob += w[i]; if (pnl[i] < risco) risco = pnl[i]; }
    return { ev, prob, risco: Math.min(risco, 0) };
  };
}

export interface Montagem { posicao: Posicao; series: (Serie | null)[]; comparacao: (Serie | null)[]; av: Avaliacao; avEstresse: Avaliacao; credito: number }
export interface Contexto {
  data: string; spot: number; sigma: number; sigmaEstresse: number;
  /** Filtro do operador (ex.: todos os caminhos de manejo aplicam na grade). Se nenhuma montagem passar, é relaxado com aviso. */
  aceitar?: (pos: Posicao) => boolean;
}
export interface Resultado {
  id: string; montagem: Montagem; veredito: 'montar' | 'montar-com-ressalva' | 'nao-montar';
  avisos: string[]; candidatas: number; teorico: boolean;
}

const tipoDe = (t: PernaJson['t']) => (t === 'C' ? 'call' : 'put');

/** Mapas de vencimento: o 1º na janela; os seguintes em ordem, com o intervalo entre metade e 2,5× o da referência. */
function mapasVencimento(e: EstruturaJson, vencs: [string, number][], jan: [number, number], livre = false): Map<string, string>[] {
  const refs = [...new Map(e.pernas.filter((l) => l.t !== 'S').map((l) => [l.exp as string, l.d])).entries()].sort((a, b) => a[1] - b[1]);
  const out: Map<string, string>[] = [];
  const passo = (i: number, prevDu: number, acc: string[]) => {
    if (i === refs.length) { out.push(new Map(refs.map(([ex], j) => [ex, acc[j]]))); return; }
    let ops: [string, number][];
    if (i === 0) {
      ops = vencs.filter(([, d]) => d >= jan[0] && d <= jan[1]);
      if (!ops.length) ops = [[...vencs].sort((a, b) => Math.abs(a[1] - (jan[0] + jan[1]) / 2) - Math.abs(b[1] - (jan[0] + jan[1]) / 2))[0]];
    } else {
      const g = refs[i][1] - refs[i - 1][1];
      const maiores = vencs.filter(([, d]) => d > prevDu);
      ops = livre ? maiores : maiores.filter(([, d]) => d - prevDu >= 0.5 * g && d - prevDu <= 2.5 * g);
      if (!ops.length) ops = maiores.slice(0, 1);
    }
    for (const [v, d] of ops) passo(i + 1, d, [...acc, v]);
  };
  passo(0, -1, []);
  return out;
}

/** Gera as montagens que preservam o desenho, com as séries do pool. */
interface Busca { jan: [number, number]; livre: boolean; banda: number }
function* gerar(e: EstruturaJson, pool: Serie[], c: Contexto, b: Busca): Generator<{ series: (Serie | null)[]; comparacao: (Serie | null)[] }> {
  const idx = new Map<string, Map<number, Serie>>();
  for (const s of pool) {
    const k = `${s.venc}|${s.tipo}`;
    if (!idx.has(k)) idx.set(k, new Map());
    idx.get(k)!.set(s.strike, s);
  }
  const vencs = [...new Set(pool.map((s) => s.venc))].map((v) => [v, diasUteis(c.data, v)] as [string, number]).sort((a, b) => a[1] - b[1]);
  const ks = strikesRef(e), g = gaps(ks);
  const opcoes = e.pernas.filter((l) => l.t !== 'S');
  const todas = [...e.pernas, ...(e.comparacao ?? [])];
  for (const mv of mapasVencimento(e, vencs, b.jan, b.livre)) {
    const precisa = ks.map((k) => [...new Set(opcoes.filter((l) => l.k === k).map((l) => `${mv.get(l.exp as string)}|${tipoDe(l.t)}`))]);
    const cand = precisa.map((ps) => {
      const conj = ps.map((p) => idx.get(p) ?? new Map<number, Serie>());
      return [...conj[0].keys()].filter((k) => conj.every((m) => m.has(k))).sort((a, b) => a - b);
    }).map((lista, j) => lista.filter((k) => Math.abs(k / c.spot - ks[j] / e.ref.spot) <= b.banda + 1e-9));
    const escolha: number[] = [];
    function* dfs(i: number): Generator<number[]> {
      if (i === ks.length) { yield [...escolha]; return; }
      for (const k of cand[i]) {
        if (i > 0 && k <= escolha[i - 1]) continue;
        escolha.push(k);
        if (i < 2 || formaOk(g.slice(0, i), gaps(escolha))) yield* dfs(i + 1);
        escolha.pop();
      }
    }
    for (const novos of dfs(0)) {
      const mk = (l: PernaJson) => (l.t === 'S' ? null : idx.get(`${mv.get(l.exp as string)}|${tipoDe(l.t)}`)!.get(novos[ks.indexOf(l.k as number)])!);
      const ss = todas.map(mk);
      if (ss.some((s, i) => todas[i].t !== 'S' && !s)) continue;
      yield { series: ss.slice(0, e.pernas.length), comparacao: ss.slice(e.pernas.length) };
    }
  }
}

export function posicaoDe(e: EstruturaJson, series: (Serie | null)[], spot: number): Posicao {
  return {
    realizado: 0,
    pernas: e.pernas.map((l, i) => {
      const s = series[i];
      return s
        ? { id: `p${i + 1}`, tipo: s.tipo, q: l.q, strike: s.strike, venc: s.venc, entrada: s.preco, vol: s.vol }
        : { id: `p${i + 1}`, tipo: 'acao' as const, q: l.q, entrada: spot };
    }),
  };
}

const creditoOpcoes = (p: Posicao) => creditoEntrada({ ...p, pernas: p.pernas.filter((x) => x.tipo !== 'acao') });

/** Escolhe a montagem de maior valor esperado por risco, dentro do desenho e das regras do POP. */
export function otimizar(e: EstruturaJson & { pop?: string }, series: Serie[], c: Contexto): Resultado {
  const avaliar = criarAvaliador(c.data, c.spot, c.sigma), estresse = criarAvaliador(c.data, c.spot, c.sigmaEstresse);
  const avisos: string[] = [];
  const debMax = e.pop ? DEBITO_MAXIMO[e.pop] : undefined;
  const nStrikes = strikesRef(e).length; // regra de entrada da BWB: borboletas e afins (3+ strikes)
  const regraPop = (p: Posicao) => {
    const de = deltaEstrutural(p);
    if (nStrikes >= 3 && de !== null && de < 0 && creditoEntrada(p) < Math.abs(de) - 1e-9) return false;
    if (debMax !== undefined && creditoOpcoes(p) < -debMax - 1e-9) return false;
    return true;
  };
  let teorico = false;
  let lista: { m: Omit<Montagem, 'avEstresse'>; pop: boolean }[] = [];
  const neg = series.filter((s) => s.origem === 'ultimo');
  const B = (jan: [number, number], livre = false, banda = BANDA_MONEYNESS): Busca => ({ jan, livre, banda });
  const tentativas: [Serie[], Busca, string][] = [
    [neg, B(janela(e)), ''], [series, B(janela(e)), 'teorico'],
    [neg, B(JANELA_AMPLA), 'janela'], [series, B(JANELA_AMPLA), 'janela teorico'],
    [series, B(JANELA_AMPLA, true, 2 * BANDA_MONEYNESS), 'janela teorico adaptado'],
  ];
  let fora = false, adaptado = false;
  for (const [pool, busca, marca] of tentativas) {
    lista = [];
    teorico = marca.includes('teorico'); fora = marca.includes('janela'); adaptado = marca.includes('adaptado');
    for (const g of gerar(e, pool, c, busca)) {
      const posicao = posicaoDe(e, g.series, c.spot);
      lista.push({ m: { posicao, series: g.series, comparacao: g.comparacao, av: avaliar(posicao), credito: creditoOpcoes(posicao) }, pop: regraPop(posicao) });
    }
    if (lista.length) break;
  }
  if (!lista.length) throw new Error(`${e.id}: nenhuma montagem preserva o desenho`);
  if (adaptado) avisos.push('desenho adaptado à grade: vencimento longo livre e strikes a até 10% da moneyness da referência');
  if (fora) avisos.push('fora da janela do POP: a grade não tem os strikes do desenho nos vencimentos da janela');
  if (teorico) avisos.push('sem montagem só com séries negociadas no dia: usa preço teórico em parte das pernas');
  let base = lista.filter((x) => x.pop);
  if (!base.length) {
    base = lista;
    avisos.push(debMax !== undefined ? 'nenhuma montagem fecha a custo zero hoje: regra do POP relaxada' : 'nenhuma montagem cumpre crédito ≥ |delta estrutural| hoje: regra do POP relaxada');
  }
  if (c.aceitar) {
    const ok = base.filter((x) => c.aceitar!(x.m.posicao));
    if (ok.length) base = ok;
    else avisos.push('nenhuma montagem deixa todos os caminhos de manejo aplicáveis na grade de hoje');
  }
  const nota = (a: Avaliacao) => a.ev / Math.max(-a.risco, 0.05);
  const melhor = (xs: typeof base) => xs.reduce((a, b) => (nota(b.m.av) > nota(a.m.av) ? b : a));
  const boas = base.filter((x) => x.m.av.ev > 0 && x.m.av.prob >= 0.5);
  const positivas = base.filter((x) => x.m.av.ev > 0);
  let escolhida: (typeof base)[number], veredito: Resultado['veredito'];
  if (boas.length) { escolhida = melhor(boas); veredito = 'montar'; }
  else if (positivas.length) { escolhida = melhor(positivas); veredito = 'montar-com-ressalva'; avisos.push('valor esperado positivo, mas probabilidade de lucro abaixo de 50%'); }
  else { escolhida = melhor(base); veredito = 'nao-montar'; avisos.push('nenhuma montagem tem valor esperado positivo com a vol realizada de hoje'); }
  const avEstresse = estresse(escolhida.m.posicao);
  if (veredito !== 'nao-montar' && avEstresse.ev <= 0) avisos.push('vantagem frágil: some com a vol do estresse');
  return { id: e.id, montagem: { ...escolhida.m, avEstresse }, veredito, avisos, candidatas: lista.length, teorico };
}
