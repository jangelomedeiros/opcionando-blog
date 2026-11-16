// Dinâmica do lucro no tempo: o resultado da posição dia útil a dia útil, da entrada ao 1º vencimento,
// em três caminhos de preço: parado, +1σ e −1σ (o preço abre com a raiz do tempo, na vol dada).
// A vol das opções fica congelada na de entrada, como no gráfico. Funções puras.
import { ehDiaUtil } from '../motor/calendario.ts';
import { resultado, primeiroVencimento, type Cenario, type Posicao } from '../motor/posicao.ts';

export interface Trajetoria {
  datas: string[]; parado: number[]; alta: number[]; baixa: number[]; precoAlta: number[]; precoBaixa: number[];
}

const DIAS_UTEIS_ANO = 252;
const proximoDia = (iso: string) => { const d = new Date(`${iso}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + 1); return d.toISOString().slice(0, 10); };

// Só data, preço e juros: o choque de vol do simulador não entra (a vol fica congelada na de entrada).
const semChoque = (c: Cenario): Cenario => ({ data: c.data, spot: c.spot, ...(c.r !== undefined ? { r: c.r } : {}) });

export function trajetoria(pos: Posicao, cen: Cenario, sigma: number): Trajetoria {
  const c = semChoque(cen);
  const fim = primeiroVencimento(pos) ?? c.data;
  const datas = [c.data];
  for (let d = proximoDia(c.data); d <= fim; d = proximoDia(d)) if (ehDiaUtil(d)) datas.push(d);
  const t: Trajetoria = { datas, parado: [], alta: [], baixa: [], precoAlta: [], precoBaixa: [] };
  datas.forEach((data, i) => {
    const passo = sigma * Math.sqrt(i / DIAS_UTEIS_ANO);
    const up = c.spot * Math.exp(passo), dn = c.spot * Math.exp(-passo);
    t.precoAlta.push(up); t.precoBaixa.push(dn);
    t.parado.push(resultado(pos, { ...c, data, spot: c.spot }));
    t.alta.push(resultado(pos, { ...c, data, spot: up }));
    t.baixa.push(resultado(pos, { ...c, data, spot: dn }));
  });
  return t;
}

export const rs = (v: number) => `${v < -0.0049 ? '−' : ''}R$ ${Math.abs(v).toFixed(2).replace('.', ',')}`;
const verbo = (v: number) => (v > 0.0049 ? `ganha ${rs(v)}` : v < -0.0049 ? `perde ${rs(-v)}` : 'fica no zero a zero');

/** Leitura da trajetória (dias úteis na contagem do site, sem as pontas): o que o tempo sozinho entrega e o que um movimento de 1σ faz. */
export function fraseTrajetoria(t: Trajetoria): string {
  // Medido a partir do ponto de partida: o que já foi acumulado (ex.: realizado num ajuste) não é obra do tempo.
  const n = t.datas.length - 1, base = t.parado[0], fim = t.parado[n] - base;
  let ritmo = '';
  if (n > 2 && Math.abs(fim) > 0.0049) {
    const meio = t.parado.findIndex((v) => (fim > 0 ? v - base >= fim / 2 : v - base <= fim / 2));
    const resto = n - meio;
    ritmo = resto <= n / 3 ? ` (metade disso só nos últimos ${resto} du: o tempo acelera no fim)`
      : resto >= (2 * n) / 3 ? ` (metade disso já nos primeiros ${meio} du)` : '';
  }
  const acumulado = Math.abs(base) > 0.0049 ? `, além de ${rs(base)} já acumulado até aqui` : '';
  return `Com o preço parado, a estrutura ${verbo(fim)} por unidade até o 1º vencimento, em ${Math.max(n - 1, 0)} du${ritmo}${acumulado}. `
    + `Se o preço subir 1σ (até ${rs(t.precoAlta[n])}), ${verbo(t.alta[n] - base)}; se cair 1σ (até ${rs(t.precoBaixa[n])}), ${verbo(t.baixa[n] - base)}.`;
}

/** De onde a trajetória parte: o cenário do último ajuste do simulador ou, sem ajustes, o da montagem. */
export function pontoDePartida(ajustes: { cenario: Cenario }[], inicial: Cenario): Cenario {
  return ajustes.length ? ajustes[ajustes.length - 1].cenario : inicial;
}

/** Resultado de uma posição nas datas dadas, com o preço parado no cenário (linha "sem o ajuste" da comparação). */
export function paradoEm(pos: Posicao, c: Cenario, datas: string[]): number[] {
  return datas.map((data) => resultado(pos, { ...semChoque(c), data }));
}
