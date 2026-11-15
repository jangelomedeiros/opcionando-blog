// Lógica dos módulos de conceitos (spec 5.6), sobre o motor: Black-Scholes, Selic 15% a.a., dias úteis/252.
import { gregasBS, precoBS, SELIC_PADRAO, DIAS_UTEIS_ANO, type TipoOpcao } from '../motor/bs.ts';

const intrinseco = (tipo: TipoOpcao, S: number, K: number) => (tipo === 'call' ? Math.max(S - K, 0) : Math.max(K - S, 0));

/** Preços do eixo X: de 60% a 140% do spot. */
export function faixa(spot: number, n = 121): number[] {
  return Array.from({ length: n }, (_, i) => spot * (0.6 + (0.8 * i) / (n - 1)));
}

export function anatomia(tipo: TipoOpcao, K: number, xs: number[], T: number, vol: number) {
  return xs.map((S) => {
    const valor = precoBS(tipo, S, K, T, vol);
    const intr = intrinseco(tipo, S, K);
    return { valor, intrinseco: intr, extrinseco: valor - intr };
  });
}

export function curvasPorPrazo(tipo: TipoOpcao, K: number, xs: number[], prazosDu: number[], vol: number): number[][] {
  return prazosDu.map((du) => xs.map((S) => precoBS(tipo, S, K, du / DIAS_UTEIS_ANO, vol)));
}

export function gregasAoLongo(tipo: TipoOpcao, K: number, xs: number[], T: number, vol: number) {
  return xs.map((S) => {
    const g = gregasBS(tipo, S, K, T, vol);
    return { delta: g.delta, gama: g.gama, theta: g.theta, vega: g.vega };
  });
}

/** Para cada spot, o delta de `duMax` dias úteis até 0 (vencimento). */
export function deltaNoTempo(tipo: TipoOpcao, K: number, spots: number[], duMax: number, vol: number): number[][] {
  return spots.map((S) => Array.from({ length: duMax + 1 }, (_, i) => gregasBS(tipo, S, K, (duMax - i) / DIAS_UTEIS_ANO, vol).delta));
}

export function premioPorVol(tipo: TipoOpcao, S: number, K: number, T: number, vols: number[]): number[] {
  return vols.map((v) => precoBS(tipo, S, K, T, v));
}

/** Queda da vol depois de um evento (ex.: balanço), com preço e prazo iguais. */
export function quedaDeVol(tipo: TipoOpcao, S: number, K: number, T: number, volAntes: number, volDepois: number) {
  const antes = precoBS(tipo, S, K, T, volAntes), depois = precoBS(tipo, S, K, T, volDepois);
  return { antes, depois, perda: antes - depois };
}

/** Densidade lognormal neutra ao risco do preço no prazo T (a mesma hipótese do Black-Scholes). */
export function densidade(S: number, xs: number[], T: number, vol: number, r = SELIC_PADRAO): number[] {
  if (!(T > 0) || !(vol > 0)) return xs.map(() => 0);
  const s = vol * Math.sqrt(T), mu = Math.log(S) + (r - (vol * vol) / 2) * T;
  return xs.map((x) => (x > 0 ? Math.exp(-((Math.log(x) - mu) ** 2) / (2 * s * s)) / (x * s * Math.sqrt(2 * Math.PI)) : 0));
}

/** Probabilidade (do modelo) de o resultado ser positivo: ∫ densidade onde ys > 0, por trapézios. */
export function probLucro(xs: number[], ys: number[], dens: number[]): number {
  let p = 0;
  for (let i = 1; i < xs.length; i++) {
    const a = ys[i - 1] > 0 ? dens[i - 1] : 0, b = ys[i] > 0 ? dens[i] : 0;
    p += ((a + b) / 2) * (xs[i] - xs[i - 1]);
  }
  return p;
}
