// Posição (conjunto de pernas) avaliada em um cenário: valor, resultado, gregas e curvas.
// Valores por unidade; q > 0 comprado, q < 0 vendido.
import { diasUteis } from './calendario.ts';
import { gregasBS, SELIC_PADRAO, DIAS_UTEIS_ANO } from './bs.ts';

export interface Perna {
  id: string;
  tipo: 'acao' | 'call' | 'put';
  q: number;
  strike?: number;
  venc?: string;
  entrada: number;
  vol?: number;
}
export interface Cenario {
  data: string;
  spot: number;
  /** Pontos percentuais somados à vol de cada opção (ex.: 10 = +10 p.p.). */
  choqueVol?: number;
  r?: number;
}
export interface Posicao { pernas: Perna[]; realizado: number }
export interface GregasPosicao { delta: number; gama: number; theta: number; vega: number }

const ZERO: GregasPosicao = { delta: 0, gama: 0, theta: 0, vega: 0 };

function gregasPerna(p: Perna, c: Cenario) {
  if (p.tipo === 'acao') return { preco: c.spot, delta: 1, gama: 0, theta: 0, vega: 0 };
  const K = p.strike ?? 0;
  const T = p.venc && c.data < p.venc ? diasUteis(c.data, p.venc) / DIAS_UTEIS_ANO : 0;
  const vol = Math.max((p.vol ?? 0) + (c.choqueVol ?? 0) / 100, 0);
  return gregasBS(p.tipo, c.spot, K, T, vol, c.r ?? SELIC_PADRAO);
}

/** Preço unitário da perna no cenário (intrínseco se vencida ou sem vol). */
export function valorPerna(p: Perna, c: Cenario): number {
  return gregasPerna(p, c).preco;
}

/** Resultado da posição no cenário: realizado + Σ q·(valor − entrada). */
export function resultado(pos: Posicao, c: Cenario): number {
  let total = pos.realizado;
  for (const p of pos.pernas) total += p.q * (valorPerna(p, c) - p.entrada);
  return total;
}

export function gregasPosicao(pos: Posicao, c: Cenario): GregasPosicao {
  const g = { ...ZERO };
  for (const p of pos.pernas) {
    const x = gregasPerna(p, c);
    g.delta += p.q * x.delta;
    g.gama += p.q * x.gama;
    g.theta += p.q * x.theta;
    g.vega += p.q * x.vega;
  }
  return g;
}

export function primeiroVencimento(pos: Posicao): string | null {
  const vencs = pos.pernas.filter((p) => p.tipo !== 'acao' && p.venc).map((p) => p.venc as string);
  return vencs.length ? vencs.sort()[0] : null;
}

/** Resultado para cada spot de `xs`, na data e condições de `c`. */
export function curva(pos: Posicao, c: Omit<Cenario, 'spot'>, xs: number[]): number[] {
  return xs.map((spot) => resultado(pos, { ...c, spot }));
}

/** Curva na data do primeiro vencimento; pernas mais longas seguem por Black-Scholes. */
export function curvaVencimento(pos: Posicao, xs: number[], r?: number): number[] {
  const data = primeiroVencimento(pos) ?? '9999-12-31';
  return curva(pos, { data, r }, xs);
}
