// Diário do operador: guarda o veredito de cada grade e, no 1º vencimento, confere com o que o mercado fez.
// Resultado no vencimento pelo fechamento do dia: pernas que vencem valem o intrínseco; as mais longas são
// marcadas por Black-Scholes com a vol de entrada (a mesma convenção do gráfico). Funções puras.
import { volImplicita, DIAS_UTEIS_ANO } from '../motor/bs.ts';
import { diasUteis } from '../motor/calendario.ts';
import { resultado, type Perna, type Posicao } from '../motor/posicao.ts';

export interface PernaRegistro { tipo: 'acao' | 'call' | 'put'; q: number; strike: number | null; venc: string | null; preco: number }
export interface EstruturaRegistro { id: string; veredito: string; venc1: string; credito: number; ev: number; prob: number; pernas: PernaRegistro[] }
export interface Registro { data: string; spot: number; sigma: number; estruturas: EstruturaRegistro[] }
export interface Apuracao extends EstruturaRegistro {
  data: string; status: 'pendente' | 'apurado'; fechamento: number | null; resultado: number | null; acerto: boolean | null;
}

/** Registro do diário a partir de validacao.json. */
export function registroDe(v: any): Registro {
  return {
    data: v.mercado.data, spot: v.mercado.spot, sigma: v.mercado.sigma,
    estruturas: v.estruturas.map((e: any) => ({
      id: e.id, veredito: e.veredito, credito: e.montagem.credito, ev: e.lucro.ev, prob: e.lucro.prob,
      venc1: e.montagem.pernas.filter((p: any) => p.venc).map((p: any) => p.venc).sort()[0],
      pernas: e.montagem.pernas.map((p: any) => ({ tipo: p.tipo, q: p.q, strike: p.strike, venc: p.venc, preco: p.preco })),
    })),
  };
}

/** Posição de entrada de uma estrutura do registro (pernas pelo preço do dia, vol ancorada nele). */
export function posicaoDoRegistro(r: { data: string; spot: number }, e: { pernas: PernaRegistro[] }): Posicao {
  return {
    realizado: 0,
    pernas: e.pernas.map((p, i): Perna => {
      if (p.tipo === 'acao') return { id: `p${i + 1}`, tipo: 'acao', q: p.q, entrada: p.preco };
      const T = Math.max(diasUteis(r.data, p.venc as string), 0.5) / DIAS_UTEIS_ANO;
      const vol = volImplicita(p.tipo, r.spot, p.strike as number, T, p.preco) ?? undefined;
      return { id: `p${i + 1}`, tipo: p.tipo, q: p.q, strike: p.strike as number, venc: p.venc as string, entrada: p.preco, vol };
    }),
  };
}

/** Confere cada estrutura do registro com o fechamento do 1º vencimento (se já houver candle desse dia). */
export function apurar(r: Registro, candles: { d: string; c: number }[]): Apuracao[] {
  const fech = new Map(candles.map((x) => [x.d, x.c]));
  return r.estruturas.map((e) => {
    const c = fech.get(e.venc1);
    if (c === undefined) return { ...e, data: r.data, status: 'pendente', fechamento: null, resultado: null, acerto: null };
    const res = resultado(posicaoDoRegistro(r, e), { data: e.venc1, spot: c });
    // "Montar" acerta quando dá lucro; "não montar" acerta quando a montagem teria perdido (ou empatado).
    const acerto = e.veredito === 'nao-montar' ? res <= 0 : res > 0;
    return { ...e, data: r.data, status: 'apurado', fechamento: c, resultado: res, acerto };
  });
}

/** Placar do diário: recomendadas (montar e com ressalva) e evitadas (não montar). */
export function resumoDiario(apuracoes: Apuracao[][]) {
  const todas = apuracoes.flat(), ap = todas.filter((x) => x.status === 'apurado');
  const grupo = (f: (x: Apuracao) => boolean) => {
    const xs = ap.filter(f);
    return { n: xs.length, acertos: xs.filter((x) => x.acerto).length, resultado: xs.reduce((s, x) => s + (x.resultado ?? 0), 0), ev: xs.reduce((s, x) => s + x.ev, 0) };
  };
  return {
    apuradas: ap.length, pendentes: todas.length - ap.length,
    montar: grupo((x) => x.veredito !== 'nao-montar'),
    evitadas: grupo((x) => x.veredito === 'nao-montar'),
  };
}
