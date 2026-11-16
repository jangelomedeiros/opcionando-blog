// Frases da "Validação do operador" (aba Visão), a partir de src/data/laboratorio/validacao.json.
// Funções puras, sem acesso a arquivos.

export interface GregasV { delta: number; gama: number; theta: number; vega: number }
export interface ContextoV {
  tendencia: 'alta' | 'baixa' | 'lateral'; vies: 'altista' | 'baixista' | 'neutra'; aFavorDaTendencia: boolean | null;
  ivAtm: number; volRealizada: number; vendeVol: boolean; aFavorDaVol: boolean;
}

export const VEREDITO: Record<string, string> = {
  montar: 'Montar',
  'montar-com-ressalva': 'Montar com ressalva',
  'nao-montar': 'Não montar agora',
};

const pct = (v: number) => `${Math.round(v * 100)}%`;
const n = (v: number, d = 3) => (v < 0 ? '−' : v > 0 ? '+' : '') + Math.abs(v).toFixed(d).replace('.', ',');

/** De onde vem o lucro: tempo (theta), vol (vega) e direção (delta), na entrada. */
export function fraseDinamica(g: GregasV): string {
  const partes: string[] = [];
  partes.push(g.theta > 1e-4 ? `tempo a favor (Θ ${n(g.theta)} por dia útil)` : g.theta < -1e-4 ? `tempo contra (Θ ${n(g.theta)} por dia útil)` : 'tempo neutro');
  partes.push(g.vega < -1e-3 ? `ganha com a queda da vol (vega ${n(g.vega, 2)} por p.p.)` : g.vega > 1e-3 ? `ganha com a alta da vol (vega ${n(g.vega, 2)} por p.p.)` : 'indiferente à vol');
  const dir = g.delta > 0.1 ? `direção altista (Δ ${n(g.delta, 2)})` : g.delta < -0.1 ? `direção baixista (Δ ${n(g.delta, 2)})` : `direção neutra (Δ ${n(g.delta, 2)})`;
  partes.push(dir + (Math.abs(g.gama) > 0.02 ? (g.gama < 0 ? ', e o gama vendido pede manejo se o preço andar' : ', e o gama comprado acelera a favor se o preço andar') : ''));
  return partes.join('; ') + '.';
}

export interface MercadoV {
  data: string; ativo: string; spot: number; sigma: number; sigmaEstresse: number; hv20: number; hv60: number; hv120: number;
  tendencia: 'alta' | 'baixa' | 'lateral'; m20: number; m50: number; m200: number; ivMin: number; ivMax: number;
}

/** Frases do painel "Hoje no mercado": tendência, vol realizada, implícita e a conclusão (vende/compra vol). */
export function resumoMercado(m: MercadoV): { tendencia: string; vol: string; implicita: string; conclusao: string } {
  const rs = (v: number) => `R$ ${v.toFixed(2).replace('.', ',')}`;
  const medias = `médias de 20, 50 e 200 em ${rs(m.m20)}, ${rs(m.m50)} e ${rs(m.m200)}`;
  const tendencia = m.tendencia === 'lateral'
    ? `${m.ativo} a ${rs(m.spot)}, entre as ${medias}: mercado lateral, sem tendência definida.`
    : `${m.ativo} a ${rs(m.spot)}, ${m.tendencia === 'baixa' ? 'abaixo' : 'acima'} das ${medias}: tendência de ${m.tendencia}.`;
  const vol = `Vol realizada HV20 ${pct(m.hv20)}, HV60 ${pct(m.hv60)}, HV120 ${pct(m.hv120)}; sem os dois maiores gaps, ${pct(m.sigma)} em 120 pregões (base do valor esperado) e ${pct(m.sigmaEstresse)} em 60 (estresse).`;
  const implicita = `Vol implícita ATM entre ${pct(m.ivMin)} e ${pct(m.ivMax)} nos vencimentos usados.`;
  const conclusao = m.ivMin > m.sigma
    ? 'A implícita está acima da realizada sem gaps: a vantagem estatística hoje é de quem vende vol, desde que o mercado não repita o gap.'
    : m.ivMax < m.sigma
      ? 'A implícita está abaixo da realizada sem gaps: a vantagem estatística hoje é de quem compra vol.'
      : 'A implícita cruza a realizada sem gaps: não há vantagem clara para vender nem para comprar vol.';
  return { tendencia, vol, implicita, conclusao };
}

/** O momento do mercado contra a visão da montagem: tendência × viés e implícita × realizada. */
export function fraseContexto(c: ContextoV): string {
  const tend = c.tendencia === 'lateral' ? 'mercado lateral' : `tendência de ${c.tendencia} (preço ${c.tendencia === 'baixa' ? 'abaixo' : 'acima'} das médias de 20, 50 e 200)`;
  const vies = c.vies === 'neutra'
    ? 'a montagem não depende da direção'
    : c.tendencia === 'lateral' || c.aFavorDaTendencia === null
      ? `a montagem é ${c.vies}, sem tendência a favor nem contra`
      : `a montagem é ${c.vies} e vai ${c.aFavorDaTendencia ? 'a favor da' : 'contra a'} tendência`;
  const ivHv = `implícita ATM de ${pct(c.ivAtm)}, ${c.ivAtm > c.volRealizada ? 'acima' : 'abaixo'} da realizada de ${pct(c.volRealizada)}`;
  const vol = `a montagem ${c.vendeVol ? 'vende vol' : 'compra vol'}, ${c.aFavorDaVol ? 'a favor' : 'contra'} esse diferencial`;
  return `${tend[0].toUpperCase()}${tend.slice(1)}; ${vies}. Vol ${ivHv}; ${vol}.`;
}
