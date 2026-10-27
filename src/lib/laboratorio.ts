// Laboratório de Estruturas: cálculo, leitura do mercado.csv e gráficos SVG.
// Roda só na hora do build (Astro), então o site continua 100% estático.
import estruturasJson from '../data/laboratorio/estruturas.json';
import popsJson from '../data/laboratorio/pops.json';
import mercadoCsv from '../data/laboratorio/mercado.csv?raw';

// ------------------------------------------------------------------ tipos
export interface Perna {
  t: 'S' | 'C' | 'P';
  q: number;
  k: number | null;
  d: number;
  px: number;
  iv?: number | null;
  tk?: string;
  exp?: string | null;
  n?: number | null;
  origem?: string;
}
export interface Estrutura {
  id: string;
  nome: string;
  familia: string;
  pop: string;
  racional: string;
  esperado: string;
  notas: string[];
  modo: 'vencimento' | 'mtm' | 'expiry';
  comp_label: string | null;
  pernas: Perna[];
  comparacao: Perna[] | null;
  ref: { data: string; spot: number; caixa: number };
  lab_points?: { x: number; y: number }[];
  lab_stats: { prob: number; be: number[]; best: number; worst: number; sig?: number; openUp?: string | null };
  curva_lab?: boolean;
}
export interface Pop {
  nome: string; fam: string; visao: string; objetivo: string; contexto: string; janela: string;
  montagem: string[]; manejo: string; saida?: string; risco: string; regra: string; checklist: string[]; fonte: string;
}
export interface Analise {
  xs: number[]; ys: number[]; lo: number; hi: number; ks: number[]; d0: number; be: number[]; prob: number; sg: number;
  cash: number; gain: number | null; loss: number | null; loss_zero: boolean; pnl_spot: number;
}
export interface MercadoMeta { data?: string; ativo?: string; spot?: string; fonte?: string; [k: string]: string | undefined }

export const ESTRUTURAS = estruturasJson as unknown as Estrutura[];
export const POPS = popsJson as unknown as Record<string, Pop>;

export const FAM_COR: Record<string, string> = {
  'Base': '#0f4a50', 'Direcionais': '#2d6fb0', 'Proteção patrimonial': '#3fa66b', 'Volatilidade': '#8e5bb5',
  'Tempo / rolagem': '#7c7767', 'Asas / proteção': '#c98a1b', 'Booster': '#e8553f', 'Módulos': '#1e8c93',
  'Híbridas / hedge': '#b24a6b', 'Gradiente linear': '#5a7d2a', 'Hedge · ajustes': '#4c5e9e', 'Mônadas': '#0b3b40',
};
export const FAM_ORDEM = Object.keys(FAM_COR);

// ------------------------------------------------------------------ formatação
export function br(v: number, d = 2, sign = false): string {
  const s = Math.abs(v).toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d });
  if (sign) return (v > 0 ? '+' : v < 0 ? '−' : '') + s;
  return (v < 0 ? '−' : '') + s;
}
export function rs(v: number, d = 2, sign = false): string {
  const s = 'R$ ' + br(Math.abs(v), d);
  if (sign) return (v > 0 ? '+' : v < 0 ? '−' : '') + s;
  return (v < 0 ? '−' : '') + s;
}
export const pct = (v: number, d = 0) => (v * 100).toFixed(d).replace('.', ',') + '%';
export const dmy = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`;
export const dmyy = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(0, 4)}`;
export const qfmt = (q: number) => String(Math.abs(q)).replace('.', ',');

// ------------------------------------------------------------------ dias úteis (calendário B3)
const FERIADOS = new Set([
  '2026-10-12', '2026-11-02', '2026-11-20', '2026-12-24', '2026-12-25', '2026-12-31',
  '2027-01-01', '2027-02-15', '2027-02-16', '2027-04-02', '2027-04-21', '2027-05-01', '2027-09-07',
]);
const iso = (d: Date) => d.toISOString().slice(0, 10);
/** Dias úteis entre a data da cotação (exclusive) e o vencimento (exclusive), igual ao laboratório original. */
export function diasUteis(d0: string, d1: string): number {
  const a = new Date(d0 + 'T12:00:00Z'); a.setUTCDate(a.getUTCDate() + 1);
  const b = new Date(d1 + 'T12:00:00Z');
  let n = 0;
  while (a < b) {
    const wd = a.getUTCDay();
    if (wd !== 0 && wd !== 6 && !FERIADOS.has(iso(a))) n++;
    a.setUTCDate(a.getUTCDate() + 1);
  }
  return n;
}

// ------------------------------------------------------------------ Black-Scholes (carry zero)
function erf(x: number): number {
  const s = Math.sign(x); x = Math.abs(x);
  const t = 1 / (1 + 0.3275911 * x);
  const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
  return s * y;
}
const ncdf = (x: number) => 0.5 * (1 + erf(x / Math.SQRT2));
function bs(t: 'C' | 'P', S: number, K: number, T: number, v: number): number {
  if (T <= 0 || v <= 0) return t === 'C' ? Math.max(S - K, 0) : Math.max(K - S, 0);
  const d1 = (Math.log(S / K) + (v * v * T) / 2) / (v * Math.sqrt(T)), d2 = d1 - v * Math.sqrt(T);
  return t === 'C' ? S * ncdf(d1) - K * ncdf(d2) : K * ncdf(-d2) - S * ncdf(-d1);
}
function viImplicita(t: 'C' | 'P', S: number, K: number, T: number, p: number): number {
  const intr = t === 'C' ? Math.max(S - K, 0) : Math.max(K - S, 0);
  if (T <= 0 || p <= intr + 1e-6) return 0.5;
  let lo = 0.01, hi = 3;
  for (let i = 0; i < 60; i++) {
    const m = (lo + hi) / 2;
    if (bs(t, S, K, T, m) > p) hi = m; else lo = m;
  }
  return Math.round(((lo + hi) / 2) * 1e4) / 1e4;
}

// ------------------------------------------------------------------ análise de uma estrutura
function completarVi(legs: Perna[], spot: number, ancorar: boolean): Perna[] {
  // ancorar: VI implícita pelo próprio preço de entrada (P/L zero se nada mudar). Senão usa a VI gravada na perna.
  return legs.map((l) => {
    if (l.t === 'S') return l;
    if (ancorar || !l.iv) return { ...l, iv: viImplicita(l.t, spot, l.k as number, l.d / 252, l.px) };
    return l;
  });
}
function valor(legs: Perna[], S: number, d0: number): number {
  let v = 0;
  for (const l of legs) {
    if (l.t === 'S') { v += l.q * (S - l.px); continue; }
    const T = (l.d - d0) / 252, K = l.k as number;
    const p = T > 0 ? bs(l.t, S, K, T, l.iv as number) : l.t === 'C' ? Math.max(S - K, 0) : Math.max(K - S, 0);
    v += l.q * (p - l.px);
  }
  return v;
}

export function analisar(legsIn: Perna[], spot: number, ancorar = true): Analise {
  const legs = completarVi(legsIn, spot, ancorar);
  const ops = legs.filter((l) => l.t !== 'S');
  const d0 = ops.length ? Math.min(...ops.map((l) => l.d)) : 0;
  const ks = [...new Set(ops.map((l) => l.k as number))].sort((a, b) => a - b);
  const lo0 = Math.min(...ks, spot), hi0 = Math.max(...ks, spot);
  const span = Math.max(hi0 - lo0, spot * 0.16), pad = span * 0.3 + spot * 0.06;
  const lo = Math.max(0.01, lo0 - pad), hi = hi0 + pad;
  const xs = Array.from({ length: 161 }, (_, i) => lo + ((hi - lo) * i) / 160);
  const ys = xs.map((x) => valor(legs, x, d0));
  const top = Math.max(spot * 2.6, (ks.length ? ks[ks.length - 1] : spot) * 1.8), n = 2400;
  const gx = Array.from({ length: n + 1 }, (_, i) => 0.01 + ((top - 0.01) * i) / n);
  const gy = gx.map((x) => valor(legs, x, d0));
  const ymax = Math.max(...gy), ymin = Math.min(...gy);
  const slopeHi = (gy[n] - gy[n - 39]) / (gx[n] - gx[n - 39]);
  const ilimGain = slopeHi > 0.03, ilimLoss = slopeHi < -0.03;
  const be: number[] = []; const eps = 0.004;
  for (let i = 1; i < gx.length; i++) {
    const a = gy[i - 1], b = gy[i];
    if ((a > eps && b <= eps) || (a <= eps && b > eps)) {
      let x = Math.abs(b - a) < 1e-12 ? gx[i - 1] : gx[i - 1] - (a * (gx[i] - gx[i - 1])) / (b - a);
      x = Math.min(Math.max(x, gx[i - 1]), gx[i]);
      if (!be.length || x - be[be.length - 1] > 0.08) be.push(Math.round(x * 100) / 100);
    }
  }
  const beF = be.filter((b) => b >= 0.675 * spot && b <= 1.349 * spot);
  // probabilidade de lucro (lognormal, VI média das pernas do 1º vencimento)
  const near = ops.filter((l) => l.d === d0);
  const w = near.reduce((s, l) => s + Math.abs(l.q), 0);
  const sg = w ? near.reduce((s, l) => s + Math.abs(l.q) * (l.iv as number), 0) / w : 0.5;
  const T = Math.max(d0, 1) / 252, mu = -0.5 * sg * sg * T, sd = sg * Math.sqrt(T);
  const interp = (S: number) => {
    if (S >= top) return gy[n];
    const f = ((S - 0.01) / (top - 0.01)) * n, j = Math.max(Math.floor(f), 0);
    return gy[j] + (gy[Math.min(j + 1, n)] - gy[j]) * (f - j);
  };
  let pw = 0, tw = 0;
  for (let i = 0; i < 1200; i++) {
    const z = -6 + (12 * (i + 0.5)) / 1200, ww = Math.exp((-z * z) / 2), S = spot * Math.exp(mu + sd * z);
    tw += ww; if (interp(S) > 0.005) pw += ww;
  }
  const cash = -ops.reduce((s, l) => s + l.q * l.px, 0);
  const i0 = gy.indexOf(ymin);
  return {
    xs, ys, lo, hi, ks, d0, be: beF, prob: pw / tw, sg, cash,
    gain: ilimGain ? null : ymax, loss: ilimLoss ? null : ymin,
    loss_zero: gx[i0] < 0.05 && legs.some((l) => l.t === 'S'), pnl_spot: valor(legs, spot, d0),
  };
}

/** Mônadas: mantém a curva e as estatísticas do estudo empírico (pernas longas ancoradas no prêmio de entrada). */
export function curvaDoLab(a: Analise, est: Estrutura): Analise {
  const pts = est.lab_points as { x: number; y: number }[], st = est.lab_stats;
  const f = (x: number) => {
    if (x <= pts[0].x) return pts[0].y;
    if (x >= pts[pts.length - 1].x) return pts[pts.length - 1].y;
    const j = Math.min(Math.floor((x - pts[0].x) / (pts[1].x - pts[0].x)), pts.length - 2);
    const p = pts[j], q = pts[j + 1];
    return p.y + ((q.y - p.y) * (x - p.x)) / (q.x - p.x);
  };
  return {
    ...a, ys: a.xs.map(f), be: [...st.be], prob: st.prob, sg: st.sig ?? a.sg,
    gain: st.openUp === 'gain' ? null : st.best, loss: st.openUp === 'loss' ? null : st.worst, loss_zero: false,
  };
}

// ------------------------------------------------------------------ mercado.csv
export interface PernaCsv {
  t: 'S' | 'C' | 'P'; q: number; k: number | null; px: number; tk: string; exp: string | null;
  iv: number | null; n: number | null; origem: string; du: number | null;
}
export type Mercado = Record<string, { principal: PernaCsv[]; comparacao: PernaCsv[] }>;

function splitCsv(line: string, delim: string): string[] {
  const out: string[] = []; let cur = ''; let q = false;
  for (const ch of line) {
    if (ch === '"') q = !q;
    else if (ch === delim && !q) { out.push(cur); cur = ''; } else cur += ch;
  }
  out.push(cur);
  return out;
}
const semAcento = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '');

export function lerMercado(raw: string = mercadoCsv): { meta: MercadoMeta; mercado: Mercado } {
  const meta: MercadoMeta = {}; const corpo: string[] = [];
  for (const ln of raw.replace(/^﻿/, '').split(/\r?\n/)) {
    if (ln.startsWith('#')) {
      const m = ln.match(/^#\s*(\w+)\s*=\s*(.*)$/);
      if (m) meta[m[1].toLowerCase()] = m[2].trim();
    } else if (ln.trim()) corpo.push(ln);
  }
  const mercado: Mercado = {};
  if (!corpo.length) return { meta, mercado };
  const delim = (corpo[0].match(/;/g) || []).length >= (corpo[0].match(/,/g) || []).length ? ';' : ',';
  const dec = delim === ';' ? (s: string) => s.replace(',', '.') : (s: string) => s;
  const num = (s: string | undefined) => (s && s.trim() ? parseFloat(dec(s.trim())) : null);
  const head = splitCsv(corpo[0], delim).map((h) => h.trim().toLowerCase());
  for (const ln of corpo.slice(1)) {
    const cols = splitCsv(ln, delim); const r: Record<string, string> = {};
    head.forEach((h, i) => (r[h] = (cols[i] || '').trim()));
    if (!r.estrutura) continue;
    const tipo = semAcento(r.tipo.toUpperCase()).trim();
    const t = ({ S: 'S', ACAO: 'S', CALL: 'C', PUT: 'P', C: 'C', P: 'P' } as Record<string, 'S' | 'C' | 'P'>)[tipo];
    if (!t) { console.warn(`[laboratorio] tipo desconhecido "${r.tipo}" em ${r.estrutura}`); continue; }
    const px = num(r.preco), q = num(r.qtd);
    if (px === null || q === null) { console.warn(`[laboratorio] linha incompleta em ${r.estrutura}`); continue; }
    const leg: PernaCsv = {
      t, q, k: num(r.strike), px, tk: r.ticker || '', exp: r.vencimento || null, iv: num(r.vi),
      n: r.negocios ? Math.round(parseFloat(r.negocios)) : null, origem: (r.origem || 'ultimo').toLowerCase(), du: r.du ? Math.round(parseFloat(r.du)) : null,
    };
    const g = r.grupo === 'comparacao' ? 'comparacao' : 'principal';
    (mercado[r.estrutura] ||= { principal: [], comparacao: [] })[g].push(leg);
  }
  return { meta, mercado };
}

export function montarPernas(legs: PernaCsv[], data: string): Perna[] {
  return legs.map((l) => {
    if (l.t === 'S') return { t: 'S', q: l.q, k: null, d: 0, px: l.px, iv: null, tk: l.tk || 'ação', exp: null, n: null, origem: l.origem };
    const d = l.du ?? diasUteis(data, l.exp as string);
    return { t: l.t, q: l.q, k: l.k, d, px: l.px, iv: l.iv, tk: l.tk, exp: l.exp, n: l.n, origem: l.origem };
  });
}

// ------------------------------------------------------------------ checagens do POP
export function checagens(pop: string, legs: Perna[], spot: number, a: Analise, hoje: string): [number, string][] {
  const out: [number, string][] = [];
  const opt = legs.filter((l) => l.t !== 'S');
  if (!opt.length) return out;
  const d0 = a.d0, cost = -a.cash;
  const teor = opt.filter((l) => l.origem === 'teorico' || l.origem === 'teórico');
  if (teor.length) out.push([1, `${teor.length} perna(s) sem negócio: preço teórico`]);
  const fino = opt.filter((l) => !(l.origem === 'teorico' || l.origem === 'teórico') && l.n != null && l.n < 5);
  if (fino.length) out.push([1, 'baixa liquidez: ' + fino.map((l) => `${l.tk} (${l.n} neg.)`).join(', ')]);
  const venc = [...new Set(opt.filter((l) => l.exp && l.exp < hoje).map((l) => l.exp as string))].sort();
  if (venc.length) out.push([2, `série já vencida (${venc.map(dmy).join(', ')}): atualize a cadeia`]);
  if (pop === 'trava-alta' || pop === 'trava-baixa') out.push(d0 >= 6 && d0 <= 12 ? [0, `${d0} du: dentro da janela de 12 a 6 du`] : [2, `${d0} du: fora da janela de 12 a 6 du`]);
  if (['thl', 'thl-put', 'tlad'].includes(pop)) out.push(d0 > 22 ? [0, `curta com ${d0} du (mais de 22)`] : [d0 < 20 ? 2 : 1, `curta com ${d0} du (a regra pede mais de 22 du)`]);
  if (pop === 'b1') out.push(d0 >= 12 && d0 <= 24 ? [0, `${d0} du: janela 12–24 du`] : [1, `${d0} du: fora da janela 12–24 du`]);
  if (pop === 'b2') out.push(d0 >= 30 && d0 <= 45 ? [0, `${d0} du: janela 30–45 du`] : [1, `${d0} du: fora da janela 30–45 du`]);
  if (pop === 'b3') out.push(d0 > 24 ? [0, `${d0} du (mais de 24)`] : [1, `${d0} du: a regra pede mais de 24 du`]);
  if (['b1', 'b2', 'b3'].includes(pop)) {
    if (cost <= 0.01 * spot * 0.2) out.push([0, 'custo zero ou crédito']);
    else if (cost <= 0.01 * spot) out.push([1, `pequeno débito de ${rs(cost)}`]);
    else out.push([2, `débito de ${rs(cost)}: não fecha a custo zero`]);
  }
  if (pop === 'bwb' && opt.length >= 3) {
    const ks = opt.map((l) => l.k as number).sort((x, y) => x - y), need = ks[0] - 2 * ks[1] + ks[2];
    out.push(-cost >= need ? [0, 'crédito cobre o delta estrutural'] : [2, `montagem ${cost > 0 ? 'paga' : 'recebe só'} ${rs(Math.abs(cost))}, abaixo do delta estrutural de ${rs(Math.max(need, 0))}`]);
  }
  if (pop === 'anakha') out.push(cost < 0 ? [0, 'crédito na entrada'] : [2, 'não gera crédito na entrada']);
  return out;
}

export function moneyness(l: Perna, spot: number): string {
  const d = (l.k as number) / spot - 1;
  if (Math.abs(d) < 0.012) return 'ATM';
  const itm = (l.t === 'C' && (l.k as number) < spot) || (l.t === 'P' && (l.k as number) > spot);
  return `${itm ? 'ITM' : 'OTM'} ${br(d * 100, 1, true)}%`;
}

// ------------------------------------------------------------------ gráfico SVG (usa as cores do site via CSS)
let uid = 0;
export function grafico(a: Analise, spot: number, opts: { W?: number; H?: number; mini?: boolean; comp?: Analise | null; rotSpot?: string } = {}): string {
  const { W = 560, H = 250, mini = false, comp = null, rotSpot = 'hoje' } = opts;
  uid++; const u = uid;
  const { xs, ys, lo, hi } = a;
  const all = [...ys, ...(comp ? comp.ys : []), 0];
  let ymin = Math.min(...all), ymax = Math.max(...all);
  const padv = (ymax - ymin) * 0.16 || 1; ymin -= padv; ymax += padv;
  const [L, R, T, B] = mini ? [4, 4, 6, 6] : [52, 16, 26, 44];
  const iw = W - L - R, ih = H - T - B;
  const X = (x: number) => L + ((x - lo) / (hi - lo)) * iw;
  const Y = (y: number) => T + ((ymax - y) / (ymax - ymin)) * ih;
  const y0 = Y(0), step = mini ? 2 : 1;
  const sel = <V,>(arr: V[]) => arr.filter((_, i) => i % step === 0 || i === arr.length - 1);
  const line = (px: number[], py: number[]) => sel(px.map((x, i) => [x, py[i]] as [number, number])).map(([x, y], i) => `${i ? 'L' : 'M'}${X(x).toFixed(1)},${Y(y).toFixed(1)}`).join(' ');
  const path = line(xs, ys);
  const area = `${path} L${X(xs[xs.length - 1]).toFixed(1)},${y0.toFixed(1)} L${X(xs[0]).toFixed(1)},${y0.toFixed(1)} Z`;
  const o: string[] = [];
  o.push(`<svg class="pf${mini ? ' pf-mini' : ''}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Gráfico de payoff no vencimento">`);
  o.push(`<defs><clipPath id="lg${u}"><rect x="${L}" y="${T}" width="${iw}" height="${Math.max(y0 - T, 0).toFixed(1)}"/></clipPath><clipPath id="lr${u}"><rect x="${L}" y="${y0.toFixed(1)}" width="${iw}" height="${Math.max(T + ih - y0, 0).toFixed(1)}"/></clipPath></defs>`);
  if (!mini) for (const fr of [0.25, 0.5, 0.75]) { const g = T + ih * fr; o.push(`<line class="pf-grid" x1="${L}" y1="${g.toFixed(1)}" x2="${W - R}" y2="${g.toFixed(1)}"/>`); }
  o.push(`<path class="pf-gain" d="${area}" clip-path="url(#lg${u})"/><path class="pf-loss" d="${area}" clip-path="url(#lr${u})"/>`);
  o.push(`<line class="pf-zero" x1="${L}" y1="${y0.toFixed(1)}" x2="${W - R}" y2="${y0.toFixed(1)}"/>`);
  const sx = X(spot);
  o.push(`<line class="pf-spot" x1="${sx.toFixed(1)}" y1="${T}" x2="${sx.toFixed(1)}" y2="${T + ih}"/>`);
  if (comp) o.push(`<path class="pf-comp" d="${line(comp.xs, comp.ys)}"/>`);
  o.push(`<path class="pf-line" d="${path}"/>`);
  if (!mini) {
    let last = -99, row = 0;
    for (const k of a.ks) {
      if (k < lo || k > hi) continue;
      const kx = X(k); row = kx - last < 30 ? (row + 1) % 2 : 0;
      o.push(`<line class="pf-tick" x1="${kx.toFixed(1)}" y1="${T + ih}" x2="${kx.toFixed(1)}" y2="${T + ih + 5}"/>`);
      o.push(`<text class="pf-xl" x="${kx.toFixed(1)}" y="${T + ih + 17 + row * 11}" text-anchor="middle">${br(k)}</text>`);
      last = kx;
    }
    o.push(`<text class="pf-xl pf-spot-l" x="${sx.toFixed(1)}" y="${T - 9}" text-anchor="middle">${rotSpot} · ${br(spot)}</text>`);
    for (const be of a.be) {
      if (be < lo || be > hi) continue;
      const bx = X(be), up = y0 - T > 36;
      o.push(`<circle class="pf-be" cx="${bx.toFixed(1)}" cy="${y0.toFixed(1)}" r="4.4"/>`);
      o.push(`<text class="pf-bel" x="${bx.toFixed(1)}" y="${(up ? y0 - 10 : y0 + 19).toFixed(1)}" text-anchor="middle">BE ${br(be)}</text>`);
    }
    const vals = [...new Set([Math.round(Math.max(...ys) * 100) / 100, 0, Math.round(Math.min(...ys) * 100) / 100])].sort((p, q) => p - q);
    for (const v of vals) { const vy = Y(v); if (vy >= T - 1 && vy <= T + ih + 1) o.push(`<text class="pf-yl" x="${L - 7}" y="${(vy + 3.6).toFixed(1)}" text-anchor="end">${br(v, 2, v !== 0)}</text>`); }
    o.push(`<text class="pf-cap" x="${L}" y="${H - 5}">preço do ativo no vencimento (R$)</text>`);
  }
  o.push('</svg>');
  return o.join('');
}

// ------------------------------------------------------------------ resultado pronto para as páginas
export interface Hoje {
  tem: boolean;
  data?: string; spot?: number; ativo?: string; fonte?: string; idade?: number;
  pernas?: Perna[]; analise?: Analise; comp?: Analise | null; chk?: [number, string][];
}

export function teoria(est: Estrutura) {
  const spot0 = est.ref.spot;
  let at = analisar(est.pernas.map((l) => ({ ...l })), spot0, false);
  if (est.curva_lab) at = curvaDoLab(at, est);
  const comp0 = est.comparacao ? analisar(est.comparacao.map((l) => ({ ...l })), spot0, false) : null;
  return { spot0, at, comp0 };
}

export function hoje(est: Estrutura, meta: MercadoMeta, mercado: Mercado, hojeIso: string): Hoje {
  const m = mercado[est.id];
  const spot = meta.spot ? parseFloat(meta.spot.replace(',', '.')) : NaN;
  if (!(m && m.principal.length && meta.data && !Number.isNaN(spot))) return { tem: false };
  const pernas = montarPernas(m.principal, meta.data);
  const analise = analisar(pernas.map((l) => ({ ...l })), spot, true);
  const comp = m.comparacao.length ? analisar(montarPernas(m.comparacao, meta.data).map((l) => ({ ...l })), spot, true) : null;
  const idade = Math.round((Date.parse(hojeIso) - Date.parse(meta.data)) / 86400000);
  return { tem: true, data: meta.data, spot, ativo: meta.ativo || 'BBAS3', fonte: meta.fonte, idade, pernas, analise, comp, chk: checagens(est.pop, pernas, spot, analise, hojeIso) };
}

export const hojeIso = () => new Date().toISOString().slice(0, 10);
