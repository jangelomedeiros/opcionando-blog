// Protocolo de manejo da metodologia do Prof. Su (Teoria da Binarização e Maximização das Estruturas Híbridas):
// os 3 pilares que todo ajuste deve atender, a regra dos R$ 0,20 e o calendário do efeito hole.
import { gregasPosicao, valorPerna, type Cenario, type Posicao } from '../motor/posicao.ts';

export interface Comp { antes: number; depois: number; melhorou: boolean }
const EPS = 1e-9;

/** Soma de |q| das opções vendidas (lotes vendidos: exposição líquida e margem). */
export function exposicaoVendida(p: Posicao): number {
  return p.pernas.filter((x) => x.tipo !== 'acao' && x.q < 0).reduce((s, x) => s + Math.abs(x.q), 0);
}

/**
 * Os 3 pilares: melhorar o delta (menos sensibilidade direcional: |Δ| menor), melhorar o theta
 * (mais decaimento a favor: Θ maior) ou reduzir a exposição vendida. O ajuste atende se melhorar ao menos um.
 */
export function avaliarPilares(antes: Posicao, depois: Posicao, c: Cenario) {
  const ga = gregasPosicao(antes, c), gd = gregasPosicao(depois, c);
  const delta: Comp = { antes: ga.delta, depois: gd.delta, melhorou: Math.abs(gd.delta) < Math.abs(ga.delta) - EPS };
  const theta: Comp = { antes: ga.theta, depois: gd.theta, melhorou: gd.theta > ga.theta + EPS };
  const ea = exposicaoVendida(antes), ed = exposicaoVendida(depois);
  const exposicao: Comp = { antes: ea, depois: ed, melhorou: ed < ea - EPS };
  return { delta, theta, exposicao, atende: delta.melhorou || theta.melhorou || exposicao.melhorou };
}

/** Regra dos R$ 0,20: opções vendidas que já valem R$ 0,20 ou menos (quase só risco, quase nenhum extrínseco). */
export function pernasRegra020(p: Posicao, c: Cenario): string[] {
  return p.pernas
    .filter((x) => x.tipo !== 'acao' && x.q < 0)
    .filter((x) => { const v = valorPerna(x, c); return v > 0 && v <= 0.2 + EPS; })
    .map((x) => x.id);
}

/** Janela do calendário operacional (efeito hole) pelos dias úteis que faltam. */
export function janelaHole(du: number) {
  if (du > 22) return { id: 'montagem' as const, nome: 'Mais de 22 du', texto: 'Janela de montagem de operações de intervalo (borboletas e THL).' };
  if (du > 12) return { id: 'manutencao' as const, nome: 'De 22 a 12 du', texto: 'Manutenção de borboletas e THL; início gradual de travas direcionais.' };
  if (du > 6) return { id: 'travas' as const, nome: 'De 12 a 6 du', texto: 'Janela das travas de alta e de baixa.' };
  return { id: 'final' as const, nome: 'Menos de 6 du', texto: 'Só compras a seco de curtíssimo prazo ou encerramento final de rolagens.' };
}
