// Métricas no primeiro vencimento: ganho máximo, perda máxima (null = ilimitado) e pontos de equilíbrio.
import { curvaVencimento, type Posicao } from './posicao.ts';

export interface Metricas { ganhoMax: number | null; perdaMax: number | null; equilibrios: number[] }

const PONTOS = 2001;
const INCLINACAO_MIN = 1e-9;

/**
 * Pontos onde o resultado troca de sinal, em 2 casas, sem repetição.
 * Troca direta: interpolação linear. Troca através de um trecho exatamente zerado: as duas pontas do trecho.
 */
export function equilibrios(xs: number[], ys: number[]): number[] {
  const out: number[] = [];
  const add = (x: number) => {
    const v = Math.round(x * 100) / 100;
    if (!out.some((o) => Math.abs(o - v) < 1e-9)) out.push(v);
  };
  let ultimo = -1; // índice do último ponto com resultado diferente de zero
  for (let i = 0; i < xs.length; i++) {
    if (ys[i] === 0) continue;
    if (ultimo >= 0 && ys[ultimo] * ys[i] < 0) {
      if (i === ultimo + 1) {
        add(xs[ultimo] + ((xs[i] - xs[ultimo]) * -ys[ultimo]) / (ys[i] - ys[ultimo]));
      } else {
        add(xs[ultimo + 1]);
        add(xs[i - 1]);
      }
    }
    ultimo = i;
  }
  return out;
}

/** Inclinação do resultado quando o preço tende ao infinito: ações e calls (de qualquer vencimento) contam q; puts, 0. */
function inclinacaoNoInfinito(pos: Posicao): number {
  return pos.pernas.reduce((s, p) => s + (p.tipo === 'put' ? 0 : p.q), 0);
}

export function metricasVencimento(pos: Posicao, r?: number): Metricas {
  const ancoras = pos.pernas.map((p) => (p.tipo === 'acao' ? p.entrada : p.strike ?? 0));
  const fim = 3 * Math.max(...ancoras, 1);
  // Grade uniforme + os próprios strikes (onde o payoff dobra), ordenada e sem repetição.
  const xs = [...new Set([...Array.from({ length: PONTOS }, (_, i) => (fim * i) / (PONTOS - 1)), ...ancoras])]
    .filter((x) => x >= 0 && x <= fim)
    .sort((a, b) => a - b);
  const ys = curvaVencimento(pos, xs, r);
  const inclinacao = inclinacaoNoInfinito(pos);
  return {
    ganhoMax: inclinacao > INCLINACAO_MIN ? null : Math.max(...ys),
    perdaMax: inclinacao < -INCLINACAO_MIN ? null : Math.min(0, Math.min(...ys)),
    equilibrios: equilibrios(xs, ys),
  };
}
