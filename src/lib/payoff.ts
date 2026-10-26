// Matemática de payoff no vencimento (usada nas páginas de análise).
export interface PernaPayoff {
  tipo: 'call' | 'put' | 'acao';
  op: 'compra' | 'venda';
  strike: number;
  premio: number;
  qtd: number;
}

export function resultado(pernas: PernaPayoff[], S: number): number {
  return pernas.reduce((acc, p) => {
    const sinal = p.op === 'compra' ? 1 : -1;
    if (p.tipo === 'acao') return acc + sinal * (S - p.strike) * p.qtd;
    const intr = p.tipo === 'call' ? Math.max(S - p.strike, 0) : Math.max(p.strike - S, 0);
    return acc + sinal * (intr - p.premio) * p.qtd;
  }, 0);
}

export function analisar(pernas: PernaPayoff[]) {
  const crit = [...new Set([0, ...pernas.filter((p) => p.tipo !== 'acao').map((p) => p.strike)])].sort((a, b) => a - b);
  const vals = crit.map((s) => resultado(pernas, s));
  const incl = pernas.reduce((a, p) => a + (p.tipo === 'put' ? 0 : (p.op === 'compra' ? 1 : -1) * p.qtd), 0);
  const be: number[] = [];
  const add = (x: number) => { if (x >= 0 && !be.some((b) => Math.abs(b - x) < 1e-6)) be.push(x); };
  for (let i = 0; i < crit.length - 1; i++) {
    const [x0, x1, y0, y1] = [crit[i], crit[i + 1], vals[i], vals[i + 1]];
    if (Math.abs(y0) < 1e-9) add(x0);
    if ((y0 < 0 && y1 > 0) || (y0 > 0 && y1 < 0)) add(x0 + (x1 - x0) * (-y0 / (y1 - y0)));
  }
  const xl = crit[crit.length - 1], yl = vals[vals.length - 1];
  if (Math.abs(yl) < 1e-9) add(xl);
  if (Math.abs(incl) > 1e-9) { const x = xl - yl / incl; if (x > xl) add(x); }
  const fluxo = pernas.reduce((a, p) => a + (p.op === 'compra' ? -1 : 1) * (p.tipo === 'acao' ? p.strike : p.premio) * p.qtd, 0);
  return {
    max: Math.max(...vals), min: Math.min(...vals),
    ganhoIlimitado: incl > 1e-9, perdaIlimitada: incl < -1e-9,
    be: be.sort((a, b) => a - b), fluxo,
  };
}

export function linkCalculadora(pernas: PernaPayoff[], spot: number): string {
  const p = pernas.map((x) => [x.op, x.tipo, x.strike, x.premio, x.qtd].join(':')).join(',');
  return `/ferramentas/calculadora-de-payoff?spot=${spot}&pernas=${encodeURIComponent(p)}`;
}

export const brl = (v: number, casas = 2) =>
  v.toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas });
export const moeda = (v: number) => (v < 0 ? '−R$ ' : 'R$ ') + brl(Math.abs(v));
