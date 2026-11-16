// Plano por cenário: antes de cada vencimento, com as séries seguintes da grade-base, as mesmas decisões do
// estudo do vencimento (encerrar, exercer, manejar, hedge) para o ativo parado, a ±1σ e a ±2σ no vencimento.
// Hipótese declarada: as séries seguintes são reprecificadas no cenário com a vol implícita de cada uma na
// grade-base (sticky strike). No dia, o estudo com a grade real confere o plano. Funções puras.
import { precoBS, DIAS_UTEIS_ANO } from '../motor/bs.ts';
import { diasUteis } from '../motor/calendario.ts';
import type { GradeJson } from '../catalogo/gradeManejo.ts';
import type { Serie } from '../otimizacao/otimizar.ts';
import type { EstruturaRegistro } from '../otimizacao/diario.ts';
import { avaliarVencimento, type Caminho, type DiaMercado, type EstudoVencimento } from './vencimento.ts';

export interface Cenario { nome: string; k: number; spot: number }
export interface CenarioPlano extends Cenario {
  resultado: number; exercicio: EstudoVencimento['exercicio']; alternativas: EstudoVencimento['alternativas']; sugestao: string; motivo: string;
}
export interface Plano { id: string; venc: string; base: string; cenarios: CenarioPlano[] }

const NOMES: Record<number, string> = { [-2]: 'queda de 2σ', [-1]: 'queda de 1σ', 0: 'preço parado', 1: 'alta de 1σ', 2: 'alta de 2σ' };

/** Ativo no vencimento: parado, ±1σ e ±2σ, abrindo com a raiz do tempo (dias úteis) na vol dada. */
export function cenariosDoVencimento(spot: number, data: string, venc: string, sigma: number): Cenario[] {
  const s = sigma * Math.sqrt(diasUteis(data, venc) / DIAS_UTEIS_ANO);
  return [-2, -1, 0, 1, 2].map((k) => ({ nome: NOMES[k], k, spot: k === 0 ? spot : spot * Math.exp(k * s) }));
}

/** O mercado projetado no vencimento: séries seguintes da grade-base, com a vol implícita de cada uma. */
export function diaProjetado(grade: GradeJson, series: Serie[], venc: string, spot: number): DiaMercado {
  return {
    data: venc, spot, tela: new Map(), grade,
    series: series.filter((s) => s.venc > venc).map((s) => ({
      ...s,
      preco: Math.max(Math.round(precoBS(s.tipo, spot, s.strike, Math.max(diasUteis(venc, s.venc), 0.5) / DIAS_UTEIS_ANO, s.vol) * 100) / 100, 0.01),
    })),
  };
}

export function planoDaEstrutura(
  est: { id: string; objetivo?: string }, reg: EstruturaRegistro, base: { data: string; spot: number },
  grade: GradeJson, series: Serie[], caminhos: Caminho[], sigma: number,
): Plano {
  const cenarios = cenariosDoVencimento(base.spot, base.data, reg.venc1, sigma).map((c) => {
    const e = avaliarVencimento(est, reg, base, diaProjetado(grade, series, reg.venc1, c.spot), caminhos, { sigma });
    return { ...c, resultado: e.situacao.resultado, exercicio: e.exercicio, alternativas: e.alternativas, sugestao: e.sugestao, motivo: e.motivo };
  });
  return { id: est.id, venc: reg.venc1, base: base.data, cenarios };
}
