// Geometria pura do gráfico de payoff (sem DOM): faixa de preços, segmentos por sinal, escalas e caminhos SVG.
import type { Posicao } from '../motor/posicao.ts';

export type Ponto = [number, number];
export interface Segmento { sinal: 1 | -1; pontos: Ponto[] }
export interface Caixa { L: number; R: number; T: number; B: number; W: number; H: number }

const ancoras = (pos: Posicao) => pos.pernas.map((p) => (p.tipo === 'acao' ? p.entrada : p.strike ?? 0)).filter((x) => x > 0);

/** Preços do eixo X: de 70% do menor (strike, spot) a 130% do maior, incluindo strikes e spot. */
export function faixaPrecos(posicao: Posicao, spot: number, n = 161): number[] {
  const a = ancoras(posicao);
  const lo = Math.max(0, Math.min(...a, spot) * 0.7);
  const hi = Math.max(...a, spot) * 1.3;
  const xs = Array.from({ length: n }, (_, i) => lo + ((hi - lo) * i) / (n - 1));
  return [...new Set([...xs, ...a, spot])].sort((x, y) => x - y);
}

/** Divide a curva em trechos de lucro e de prejuízo, cortando no zero por interpolação linear. */
export function segmentosPorSinal(xs: number[], ys: number[]): Segmento[] {
  const out: Segmento[] = [];
  let atual: Ponto[] = [];
  let sinal: 0 | 1 | -1 = 0;
  for (let i = 0; i < xs.length; i++) {
    const p: Ponto = [xs[i], ys[i]];
    const s = Math.sign(ys[i]) as 0 | 1 | -1;
    if (s === 0 || sinal === 0 || s === sinal) {
      atual.push(p);
      if (sinal === 0 && s !== 0) sinal = s;
      continue;
    }
    const [x0, y0] = [xs[i - 1], ys[i - 1]];
    const corte: Ponto = y0 === 0 ? [x0, 0] : [x0 + ((xs[i] - x0) * -y0) / (ys[i] - y0), 0];
    if (y0 !== 0) atual.push(corte);
    out.push({ sinal, pontos: atual });
    atual = [corte, p];
    sinal = s;
  }
  if (atual.length) out.push({ sinal: sinal === 0 ? 1 : sinal, pontos: atual });
  return out;
}

export function escalas(xs: number[], series: number[][], caixa: Caixa) {
  const todos = series.flat().filter(Number.isFinite);
  let yMin = Math.min(0, ...todos), yMax = Math.max(0, ...todos);
  if (yMax - yMin < 1e-9) { yMin -= 1; yMax += 1; }
  const folga = (yMax - yMin) * 0.08;
  yMin -= folga; yMax += folga;
  const [x0, x1] = [xs[0], xs[xs.length - 1]];
  const X = (x: number) => caixa.L + ((x - x0) / (x1 - x0 || 1)) * (caixa.W - caixa.L - caixa.R);
  const Y = (y: number) => caixa.T + ((yMax - y) / (yMax - yMin)) * (caixa.H - caixa.T - caixa.B);
  return { X, Y, yMin, yMax };
}

const fmt = (v: number) => v.toFixed(1);

export function caminho(pontos: Ponto[], X: (x: number) => number, Y: (y: number) => number): string {
  return pontos.map(([x, y], i) => `${i ? ' L' : 'M'}${fmt(X(x))},${fmt(Y(y))}`).join('');
}

/** Polígono fechado entre a curva e a linha do zero. */
export function area(pontos: Ponto[], X: (x: number) => number, Y: (y: number) => number): string {
  if (!pontos.length) return '';
  const ini = pontos[0][0], fim = pontos[pontos.length - 1][0];
  return `M${fmt(X(ini))},${fmt(Y(0))} ` + caminho(pontos, X, Y).replace(/^M/, 'L') + ` L${fmt(X(fim))},${fmt(Y(0))} Z`;
}
