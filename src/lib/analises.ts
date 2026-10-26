import { getCollection, type CollectionEntry } from 'astro:content';

export type Analise = CollectionEntry<'analises'>;

/** Análises publicadas, da mais recente para a mais antiga. */
export async function getAnalises(): Promise<Analise[]> {
  const lista = await getCollection('analises', ({ data }) => import.meta.env.DEV || !data.draft);
  return lista.sort((a, b) => b.data.data.valueOf() - a.data.data.valueOf());
}

/** Status efetivo: "Em acompanhamento" vira "Encerrada" depois da validade. */
export function statusAtual(a: Analise, hoje = new Date()): Analise['data']['status'] {
  if (a.data.status === 'Em acompanhamento' && a.data.validade.valueOf() < hoje.valueOf()) return 'Encerrada';
  return a.data.status;
}

export const classeStatus = (s: string) =>
  s === 'Em acompanhamento' ? 'ativa' : s === 'Invalidada' ? 'invalidada' : 'encerrada';

export const iconeCenario = (c: string) => {
  const x = c.toLowerCase();
  return x.includes('alta') ? '📈' : x.includes('baixa') ? '📉' : x === 'lateral' ? '➡️' : '❔';
};

export const dataBR = (d: Date) =>
  d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' });
