// Protocolo de manejo da metodologia do Prof. Su (Teoria da Binarização e Maximização das Estruturas Híbridas):
// os 3 pilares que todo ajuste deve atender, a regra dos R$ 0,20 e o calendário do efeito hole.
import { gregasPosicao, valorPerna, type Cenario, type Posicao } from '../motor/posicao.ts';
import { ehDiaUtil } from '../motor/calendario.ts';

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

/**
 * Delta estrutural (Teoria Modular): o resultado sem prêmios na extremidade, para estruturas de um só tipo
 * e um só vencimento com soma das quantidades zero. CALL: Σ(−Q·K) (preço muito alto); PUT: Σ(Q·K) (preço zero).
 * Ex.: +3 A28 / −4 A29 / +1 A34 → −2,00. Fora dessas condições, null.
 */
export function deltaEstrutural(p: Posicao): number | null {
  const ops = p.pernas.filter((x) => x.tipo !== 'acao');
  if (!ops.length || ops.length !== p.pernas.length) return null;
  const tipos = new Set(ops.map((x) => x.tipo)), vencs = new Set(ops.map((x) => x.venc));
  if (tipos.size !== 1 || vencs.size !== 1) return null;
  if (Math.abs(ops.reduce((s, x) => s + x.q, 0)) > EPS) return null;
  const soma = ops.reduce((s, x) => s + x.q * (x.strike ?? 0), 0);
  const d = ops[0].tipo === 'call' ? -soma : soma;
  return Math.round(d * 100) / 100;
}

/** Crédito (+) ou débito (−) da montagem: −Σ q·entrada. */
export function creditoEntrada(p: Posicao): number {
  return -p.pernas.reduce((s, x) => s + x.q * x.entrada, 0);
}

/** Terceira sexta-feira do mês de `iso`, antecipada para o dia útil anterior se cair em feriado (regra da B3). */
function mensalDoMes(iso: string): string {
  const [a, m] = iso.split('-').map(Number);
  const d = new Date(Date.UTC(a, m - 1, 1, 12));
  d.setUTCDate(1 + ((5 - d.getUTCDay() + 7) % 7) + 14);
  while (!ehDiaUtil(d.toISOString().slice(0, 10))) d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

/** O primeiro vencimento mensal da lista (as semanais ficam de fora); null se não houver. */
export function primeiroMensal(vencimentos: string[]): string | null {
  return [...vencimentos].sort().find((v) => v === mensalDoMes(v)) ?? null;
}
