// Grade de strikes e vencimentos para o simulador de manejo.
// Com grade real (opcoes.net.br): strikes e vencimentos da grade + os das pernas.
// Sem grade (estrutura no exemplo de referência): grade sintética em volta do spot e terceiras sextas-feiras.
import { ehDiaUtil } from '../motor/calendario.ts';
import type { GradeRef } from '../motor/manejo.ts';
import type { Cenario, Posicao } from '../motor/posicao.ts';

export interface GradeJson { vencimentos: Record<string, number>; series: { strike: number; venc: string }[] }

const unicosOrdenados = (xs: number[]) => [...new Set(xs.map((x) => Math.round(x * 100) / 100))].sort((a, b) => a - b);
const iso = (d: Date) => d.toISOString().slice(0, 10);

/** Terceira sexta-feira de cada um dos `n` meses seguintes a `data`, recuando para o dia útil anterior se preciso. */
function terceirasSextas(data: string, n: number): string[] {
  const out: string[] = [];
  const [a, m] = data.split('-').map(Number);
  for (let i = 0; i <= n; i++) {
    const d = new Date(Date.UTC(a, m - 1 + i, 1, 12));
    const primeiraSexta = 1 + ((5 - d.getUTCDay() + 7) % 7);
    d.setUTCDate(primeiraSexta + 14);
    while (!ehDiaUtil(iso(d))) d.setUTCDate(d.getUTCDate() - 1);
    if (iso(d) > data) out.push(iso(d));
  }
  return out.slice(0, n);
}

export function gradeParaManejo(posicao: Posicao, cenario: Cenario, grade: GradeJson | null): GradeRef {
  const kPernas = posicao.pernas.filter((p) => p.tipo !== 'acao' && p.strike).map((p) => p.strike as number);
  const vPernas = posicao.pernas.filter((p) => p.tipo !== 'acao' && p.venc).map((p) => p.venc as string);
  if (grade) {
    // Strikes por vencimento: "N strikes acima" anda na escada real daquele vencimento.
    const porVenc: Record<string, number[]> = {};
    for (const s of grade.series) (porVenc[s.venc] ??= []).push(s.strike);
    for (const p of posicao.pernas) if (p.tipo !== 'acao' && p.venc && p.strike) (porVenc[p.venc] ??= []).push(p.strike);
    const strikesPorVenc = Object.fromEntries(Object.entries(porVenc).map(([v, ks]) => [v, unicosOrdenados(ks)]));
    return {
      strikesPorVenc,
      strikes: unicosOrdenados([...grade.series.map((s) => s.strike), ...kPernas]),
      vencimentos: [...new Set([...Object.keys(grade.vencimentos).filter((v) => v > cenario.data), ...vPernas])].sort(),
    };
  }
  const S = cenario.spot;
  const passo = Math.max(0.25, Math.round((S * 0.01) / 0.05) * 0.05);
  const ini = Math.ceil((S * 0.6) / passo) * passo, fim = Math.floor((S * 1.4) / passo) * passo;
  const sinteticos = Array.from({ length: Math.round((fim - ini) / passo) + 1 }, (_, i) => ini + i * passo);
  return {
    strikes: unicosOrdenados([...sinteticos, ...kPernas]),
    vencimentos: [...new Set([...terceirasSextas(cenario.data, 6), ...vPernas])].sort(),
  };
}
