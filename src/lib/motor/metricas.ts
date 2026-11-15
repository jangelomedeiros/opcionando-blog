// Métricas no primeiro vencimento: ganho máximo, perda máxima (null = ilimitado) e pontos de equilíbrio.
import { curvaVencimento, type Posicao } from './posicao.ts';

export interface Metricas { ganhoMax: number | null; perdaMax: number | null; equilibrios: number[] }

const PONTOS = 2001;
const INCLINACAO_MIN = 1e-6;

/** Raízes por interpolação linear entre trocas de sinal, em 2 casas, sem repetição. */
export function equilibrios(xs: number[], ys: number[]): number[] {
  const out: number[] = [];
  const add = (x: number) => {
    const v = Math.round(x * 100) / 100;
    if (!out.some((o) => Math.abs(o - v) < 1e-9)) out.push(v);
  };
  for (let i = 0; i < xs.length - 1; i++) {
    const [y0, y1] = [ys[i], ys[i + 1]];
    if (y0 === 0) {
      const antes = i > 0 ? ys[i - 1] : 0;
      if (antes * y1 < 0) add(xs[i]);
    } else if (y0 * y1 < 0) {
      add(xs[i] + ((xs[i + 1] - xs[i]) * -y0) / (y1 - y0));
    }
  }
  return out;
}

export function metricasVencimento(pos: Posicao, r?: number): Metricas {
  const ancoras = pos.pernas.map((p) => (p.tipo === 'acao' ? p.entrada : p.strike ?? 0));
  const fim = 3 * Math.max(...ancoras, 1);
  // Grade uniforme + os próprios strikes (onde o payoff dobra), ordenada e sem repetição.
  const xs = [...new Set([...Array.from({ length: PONTOS }, (_, i) => (fim * i) / (PONTOS - 1)), ...ancoras])]
    .filter((x) => x >= 0 && x <= fim)
    .sort((a, b) => a - b);
  const ys = curvaVencimento(pos, xs, r);
  const n = xs.length;
  const inclinacao = (ys[n - 1] - ys[n - 2]) / (xs[n - 1] - xs[n - 2]);
  return {
    ganhoMax: inclinacao > INCLINACAO_MIN ? null : Math.max(...ys),
    perdaMax: inclinacao < -INCLINACAO_MIN ? null : Math.min(0, Math.min(...ys)),
    equilibrios: equilibrios(xs, ys),
  };
}
