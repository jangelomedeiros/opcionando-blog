// Jornada do prêmio: uma opção real vista pelos dois lados (comprador e vendedor), dia a dia.
// A decomposição é exata e sequencial: em cada dia, primeiro move o preço, depois passa o tempo (a vol muda só no dia 0).
import { diasUteis, somarDiasUteis } from '../motor/calendario.ts';
import { precoBS, volImplicita, DIAS_UTEIS_ANO } from '../motor/bs.ts';
import { valorPerna, type Perna } from '../motor/posicao.ts';

export type TipoCenario = 'alta-lenta' | 'queda-brusca' | 'lateral' | 'gap-balanco';
export interface Opcao { tipo: 'call' | 'put'; strike: number; venc: string; ticker: string; premio: number; vol: number; data: string; spot: number }
export interface Contrib { preco: number; tempo: number; vol: number }
export interface Dia {
  n: number; data: string; spot: number; du: number; valor: number; intrinseco: number; extrinseco: number;
  comprador: number; vendedor: number; contrib: Contrib;
}
export interface Trecho { id: string; nome: string; precos: number[] }
interface SerieGrade { ticker: string; tipo: string; strike: number; venc: string; ultimo: number | null; data_ultimo: string | null; vol: number | null }
interface GradeJson { data: string; spot: number; vencimentos: Record<string, number>; series: SerieGrade[] }

const T = (data: string, venc: string) => (data < venc ? Math.max(diasUteis(data, venc), 0.5) / DIAS_UTEIS_ANO : 0);
const brl = (v: number) => Math.abs(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const dataBr = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`;

/** CALL ou PUT ATM do vencimento com dias úteis mais perto de `alvoDu`, com prêmio real (ou teórico, sem negócio no dia). */
export function opcaoDaGrade(grade: GradeJson, tipo: 'call' | 'put', alvoDu = 23): Opcao {
  const venc = Object.entries(grade.vencimentos).reduce((m, v) => (Math.abs(v[1] - alvoDu) < Math.abs(m[1] - alvoDu) ? v : m))[0];
  const series = grade.series.filter((s) => s.tipo === tipo && s.venc === venc);
  const s = series.reduce((m, x) => (Math.abs(x.strike - grade.spot) < Math.abs(m.strike - grade.spot) ? x : m));
  const volSerie = s.vol ?? series.filter((x) => x.vol).reduce((m, x) => (Math.abs(x.strike - s.strike) < Math.abs(m.strike - s.strike) ? x : m)).vol ?? 0.4;
  const t = T(grade.data, venc);
  const premio = s.ultimo !== null && s.data_ultimo === grade.data ? s.ultimo : Math.round(precoBS(tipo, grade.spot, s.strike, t, volSerie) * 100) / 100;
  const vol = volImplicita(tipo, grade.spot, s.strike, t, premio) ?? volSerie;
  return { tipo, strike: s.strike, venc, ticker: s.ticker, premio, vol, data: grade.data, spot: grade.spot };
}

/** Número de passos da jornada até o vencimento (inclui o próprio dia do vencimento). */
export const diasDaOpcao = (op: Opcao) => diasUteis(op.data, op.venc) + 1;

export function trajetoriaCenario(tipo: TipoCenario, spot: number, dias: number): number[] {
  return Array.from({ length: dias + 1 }, (_, i) => {
    switch (tipo) {
      case 'alta-lenta': return spot * (1 + (0.08 * i) / dias);
      case 'queda-brusca': { const k = Math.floor(dias / 3); return i < k ? spot : i === k ? spot * 0.95 : spot * 0.9; }
      case 'lateral': return spot * (1 + 0.02 * Math.sin((2 * Math.PI * i) / 8));
      case 'gap-balanco': return i < Math.floor(dias / 2) ? spot : spot * 0.91;
    }
  });
}

/** Trechos reais do histórico do papel, reescalados para começar em `spot`: maior alta, maior queda, mais lateral, mais recente. */
export function trechosHistoricos(candles: { d: string; c: number }[], dias: number, spot: number): Trecho[] {
  const c = candles.map((x) => x.c);
  const inicios = Array.from({ length: Math.max(0, c.length - dias) }, (_, i) => i);
  if (!inicios.length) return [];
  const ret = (s: number) => c[s + dias] / c[s] - 1;
  const amp = (s: number) => { const w = c.slice(s, s + dias + 1); return (Math.max(...w) - Math.min(...w)) / c[s]; };
  // Cada trecho escolhido exclui os que se sobrepõem a ele em mais da metade (não repete trajetória).
  const usados: number[] = [];
  const livre = (s: number) => usados.every((u) => Math.abs(u - s) > dias / 2);
  const escolher = (f: (s: number) => number, max: boolean): number | null => {
    const cand = inicios.filter(livre);
    if (!cand.length) return null;
    const s = cand.reduce((m, x) => ((max ? f(x) > f(m) : f(x) < f(m)) ? x : m));
    usados.push(s);
    return s;
  };
  const periodo = (s: number) => `${dataBr(candles[s].d)} a ${dataBr(candles[s + dias].d)}`;
  const montar = (id: string, nome: string, s: number): Trecho => ({ id, nome: `${nome} (${periodo(s)}/${candles[s + dias].d.slice(2, 4)})`, precos: c.slice(s, s + dias + 1).map((x) => (spot * x) / c[s]) });
  const recente = (s: number) => s; // o mais recente é o de maior início ainda livre
  const escolhas: [string, string, number | null][] = [
    ['maior-alta', 'Maior alta', escolher(ret, true)],
    ['maior-queda', 'Maior queda', escolher(ret, false)],
    ['mais-lateral', 'Menor oscilação', escolher(amp, false)],
    ['mais-recente', 'Mais recente', escolher(recente, true)],
  ];
  return escolhas.filter((e): e is [string, string, number] => e[2] !== null).map(([id, nome, s]) => montar(id, nome, s));
}

export function jornada(op: Opcao, precos: number[], choqueVol = 0): Dia[] {
  const perna: Perna = { id: 'o', tipo: op.tipo, q: 1, strike: op.strike, venc: op.venc, entrada: op.premio, vol: op.vol };
  const V = (spot: number, data: string, choque: number) => valorPerna(perna, { spot, data, choqueVol: choque });
  const ultimo = precos.length - 1;
  const dataDe = (n: number) => { if (n === 0) return op.data; const d = somarDiasUteis(op.data, n); return n === ultimo || d >= op.venc ? op.venc : d; };
  const acum: Contrib = { preco: 0, tempo: 0, vol: V(op.spot, op.data, choqueVol) - V(op.spot, op.data, 0) };
  const dias: Dia[] = [];
  precos.forEach((spot, n) => {
    const data = dataDe(n);
    if (n > 0) {
      const [s0, d0] = [precos[n - 1], dataDe(n - 1)];
      const a = V(s0, d0, choqueVol), b = V(spot, d0, choqueVol), cc = V(spot, data, choqueVol);
      acum.preco += b - a;
      acum.tempo += cc - b;
    }
    const valor = V(spot, data, choqueVol);
    const intrinseco = op.tipo === 'call' ? Math.max(spot - op.strike, 0) : Math.max(op.strike - spot, 0);
    const comprador = valor - op.premio;
    dias.push({ n, data, spot, du: diasUteis(data, op.venc), valor, intrinseco, extrinseco: valor - intrinseco, comprador, vendedor: -comprador, contrib: { ...acum } });
  });
  return dias;
}

/** "R$ valor = intrínseco ± extrínseco" (o extrínseco de uma PUT europeia funda pode ser negativo com juros altos). */
export function equacaoValor(d: { valor: number; intrinseco: number; extrinseco: number }): string {
  const ext = d.extrinseco;
  return `R$ ${brl(d.valor)} = ${brl(d.intrinseco)} ${ext < -0.005 ? '−' : '+'} ${brl(ext < -0.005 ? ext : Math.max(ext, 0))}`;
}

/** Frase curta, descritiva (nunca prescreve), do ponto de vista dos dois lados. */
export function comentario(op: Opcao, d: Dia): string {
  const direito = op.tipo === 'call' ? 'comprar' : 'vender';
  if (d.n === 0) {
    const base = `Entrada: o comprador paga R$ ${brl(op.premio)} ao vendedor pelo direito de ${direito} a ação a R$ ${brl(op.strike)} até ${dataBr(op.venc)}. O tempo ainda não passou.`;
    return Math.abs(d.contrib.vol) > 0.0005 ? `${base} A mudança de vol já ${d.contrib.vol > 0 ? 'soma' : 'tira'} R$ ${brl(d.contrib.vol)} do comprador.` : base;
  }
  const varAcao = (d.spot / op.spot - 1) * 100;
  const mov = Math.abs(varAcao) < 0.05 ? 'ficou estável' : `${varAcao > 0 ? 'subiu' : 'caiu'} ${brl(Math.abs(varAcao)).replace(/,00$/, '')}%`;
  const parte = (v: number, nome: string) => `${nome} ${v >= 0 ? 'somou' : 'tirou'} R$ ${brl(v)}`;
  const { preco, tempo, vol } = d.contrib;
  const partes = [parte(preco, 'o preço'), parte(tempo, 'o tempo'), ...(Math.abs(vol) > 0.0005 ? [parte(vol, 'a vol')] : [])].join(', ');
  const lider = Math.abs(tempo) > Math.abs(preco) && Math.abs(tempo) > Math.abs(vol) ? ' Quem mais pesou foi o tempo.' : '';
  const fim = d.data === op.venc ? ` No vencimento a opção vale só o intrínseco (R$ ${brl(d.intrinseco)}): o valor de tempo acabou.` : '';
  return `${dataBr(d.data)}: a ação ${mov} desde a entrada. Para o comprador, ${partes}: resultado ${d.comprador >= 0 ? '+' : '−'}R$ ${brl(d.comprador)}; o vendedor fica com o oposto.${lider}${fim}`;
}
