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

/** O momento do mercado contra a visão da montagem: tendência × viés e implícita × realizada. */
export function fraseContexto(c: ContextoV): string {
  const tend = c.tendencia === 'lateral' ? 'mercado lateral' : `tendência de ${c.tendencia} (preço ${c.tendencia === 'baixa' ? 'abaixo' : 'acima'} das médias de 20, 50 e 200)`;
  const vies = c.aFavorDaTendencia === null
    ? 'a montagem não depende da direção'
    : `a montagem é ${c.vies} e vai ${c.aFavorDaTendencia ? 'a favor da' : 'contra a'} tendência`;
  const ivHv = `implícita ATM de ${pct(c.ivAtm)}, ${c.ivAtm > c.volRealizada ? 'acima' : 'abaixo'} da realizada de ${pct(c.volRealizada)}`;
  const vol = `a montagem ${c.vendeVol ? 'vende vol' : 'compra vol'}, ${c.aFavorDaVol ? 'a favor' : 'contra'} esse diferencial`;
  return `${tend[0].toUpperCase()}${tend.slice(1)}; ${vies}. Vol ${ivHv}; ${vol}.`;
}
