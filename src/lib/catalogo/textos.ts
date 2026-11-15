// Marcadores nos textos das estruturas, resolvidos com a montagem atual (ou a de referência).
// Gramática: {spot} · {beN} · {pN.k} · {pN.px} · {cN.k} · {cN.px} · {A+B} · {A-B}
// (p = pernas, c = pernas da posição original dos hedges; N começa em 1; diferença entre dois strikes é em módulo).
import { metricasVencimento } from '../motor/metricas.ts';
import type { Cenario, Posicao } from '../motor/posicao.ts';
import type { EstruturaJson } from './converter.ts';

export interface ValorPerna { k: number | null; px: number }
export interface Valores { spot: number; pernas: ValorPerna[]; comparacao: ValorPerna[]; be: number[] }

/** Número, percentual, data, prazo em du ou mês escrito direto no texto (fica preso ao exemplo de 02/10). */
export const NUMERO_FIXO = /\d+,\d+|\d+\s*%|\b\d{1,2}\/\d{1,2}\b|\b\d+\s*du\b|(?<!\p{L})(janeiro|fevereiro|março|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)(?!\p{L})/iu;

/**
 * O texto pode usar os números da montagem atual? Só se a página usa o mercado, nenhum número/data ficou fixo
 * e nenhum marcador foi escolhido entre mais de um candidato. Caso contrário, texto e tabela mostram o exemplo de 02/10.
 */
export function textoUsaMontagemAtual(e: { racional: string; esperado: string; notas: string[]; marcadores_ambiguos?: number }, fonte: 'mercado' | 'referencia'): boolean {
  if (fonte !== 'mercado' || (e.marcadores_ambiguos ?? 0) > 0) return false;
  return !NUMERO_FIXO.test([e.racional, e.esperado, ...e.notas].join(' '));
}

export const formatar = (v: number) =>
  v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function termo(t: string, v: Valores): number | null {
  if (t === 'spot') return v.spot;
  let m = t.match(/^be(\d+)$/);
  if (m) return v.be[+m[1] - 1] ?? null;
  m = t.match(/^([pc])(\d+)\.(k|px)$/);
  if (!m) return null;
  const perna = (m[1] === 'p' ? v.pernas : v.comparacao)[+m[2] - 1];
  if (!perna) return null;
  return m[3] === 'k' ? perna.k : perna.px;
}

function avaliar(expr: string, v: Valores): number | null {
  const m = expr.match(/^([\w.]+)(?:([+-])([\w.]+))?$/);
  if (!m) return null;
  const a = termo(m[1], v);
  if (a === null) return null;
  if (!m[2]) return a;
  const b = termo(m[3], v);
  if (b === null) return null;
  if (m[2] === '+') return a + b;
  return m[1].endsWith('.k') && m[3].endsWith('.k') ? Math.abs(a - b) : a - b;
}

/** Troca cada {marcador} pelo valor formatado. Marcador inválido lança erro (melhor falhar o build que publicar "{p5.k}"). */
export function resolverTexto(texto: string, v: Valores, onde = 'texto'): string {
  return texto.replace(/\{([^{}]+)\}/g, (_, expr: string) => {
    const x = avaliar(expr, v);
    if (x === null || !Number.isFinite(x)) throw new Error(`Marcador inválido {${expr}} em ${onde}`);
    return formatar(x);
  });
}

export function valoresDaReferencia(e: EstruturaJson & { lab_stats?: { be?: number[] } }): Valores {
  const pernas = (legs: EstruturaJson['pernas'] | null | undefined) => (legs ?? []).map((l) => ({ k: l.t === 'S' ? null : l.k, px: l.px }));
  return { spot: e.ref.spot, pernas: pernas(e.pernas), comparacao: pernas(e.comparacao), be: e.lab_stats?.be ?? [] };
}

export function valoresDaMontagem(posicao: Posicao, cenario: Cenario, comparacao: Posicao | null): Valores {
  const pernas = (p: Posicao | null) => (p?.pernas ?? []).map((l) => ({ k: l.tipo === 'acao' ? null : l.strike ?? null, px: l.entrada }));
  return { spot: cenario.spot, pernas: pernas(posicao), comparacao: pernas(comparacao), be: metricasVencimento(posicao).equilibrios };
}
