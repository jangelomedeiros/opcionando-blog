// Estado do simulador de manejo: histórico de ajustes sobre o motor (aplicar, desfazer, recomeçar).
import { aplicarAjuste, reconstruir, type Ajuste, type GradeRef, type Operacao } from '../motor/manejo.ts';
import type { Cenario, Posicao } from '../motor/posicao.ts';

export interface Estado { inicial: Posicao; ajustes: Ajuste[]; posicao: Posicao; fluxos: number[]; erro: string | null }

export function iniciar(p: Posicao): Estado {
  return { inicial: p, ajustes: [], posicao: p, fluxos: [], erro: null };
}

/** Aplica um ajuste no cenário. Em erro (ex.: fora da grade), devolve o estado com `erro` e a posição intacta. */
export function aplicar(e: Estado, nome: string, ops: Operacao[], c: Cenario, g: GradeRef): Estado {
  try {
    const { posicao, fluxo } = aplicarAjuste(e.posicao, ops, c, g, e.ajustes.length + 1);
    return { ...e, ajustes: [...e.ajustes, { nome, cenario: c, ops }], posicao, fluxos: [...e.fluxos, fluxo], erro: null };
  } catch (err) {
    return { ...e, erro: err instanceof Error ? err.message : String(err) };
  }
}

export function desfazer(e: Estado, g: GradeRef): Estado {
  const ajustes = e.ajustes.slice(0, -1);
  const { posicao, fluxos } = reconstruir({ inicial: e.inicial, ajustes }, g);
  return { ...e, ajustes, posicao, fluxos, erro: null };
}

export function recomecar(e: Estado): Estado {
  return iniciar(e.inicial);
}
