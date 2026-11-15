// Black-Scholes europeu com juros contínuos (sem dividendos).
// Unidades: T em anos (dias úteis / 252); theta em R$ por dia útil; vega em R$ por 1 ponto percentual de vol.

export type TipoOpcao = 'call' | 'put';
export interface Gregas { preco: number; delta: number; gama: number; theta: number; vega: number }

export const SELIC_PADRAO = 0.15;
export const DIAS_UTEIS_ANO = 252;

const RAIZ_PI = Math.sqrt(Math.PI);

// erf com precisão de ~1e-14: série de termos positivos para |x| < 3, fração contínua de erfc acima.
function erf(x: number): number {
  const a = Math.abs(x);
  let r: number;
  if (a < 3) {
    let termo = a, soma = a;
    for (let n = 1; n < 200 && termo > 1e-17 * soma; n++) {
      termo *= (2 * a * a) / (2 * n + 1);
      soma += termo;
    }
    r = (2 / RAIZ_PI) * Math.exp(-a * a) * soma;
  } else {
    let f = a;
    for (let n = 60; n >= 1; n--) f = a + n / 2 / f;
    r = 1 - Math.exp(-a * a) / (RAIZ_PI * f);
  }
  return x < 0 ? -r : r;
}

export const normalAcumulada = (x: number) => 0.5 * (1 + erf(x / Math.SQRT2));
export const normalDensidade = (x: number) => Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);

const intrinseco = (tipo: TipoOpcao, S: number, K: number) =>
  tipo === 'call' ? Math.max(Math.max(S, 0) - K, 0) : Math.max(K - Math.max(S, 0), 0);

function degenerado(tipo: TipoOpcao, S: number, K: number): Gregas {
  const delta = tipo === 'call' ? (S > K ? 1 : 0) : (S < K ? -1 : 0);
  return { preco: intrinseco(tipo, S, K), delta, gama: 0, theta: 0, vega: 0 };
}

export function gregasBS(tipo: TipoOpcao, S: number, K: number, T: number, vol: number, r = SELIC_PADRAO): Gregas {
  if (!(T > 0) || !(vol > 0) || !(S > 0) || !(K > 0)) return degenerado(tipo, S, K);
  const raizT = Math.sqrt(T);
  const d1 = (Math.log(S / K) + (r + (vol * vol) / 2) * T) / (vol * raizT);
  const d2 = d1 - vol * raizT;
  const desconto = K * Math.exp(-r * T);
  const pd1 = normalDensidade(d1);
  const gama = pd1 / (S * vol * raizT);
  const vega = (S * pd1 * raizT) / 100;
  const decaimento = -(S * pd1 * vol) / (2 * raizT); // parte comum de dV/dt
  if (tipo === 'call') {
    const preco = S * normalAcumulada(d1) - desconto * normalAcumulada(d2);
    const theta = (decaimento - r * desconto * normalAcumulada(d2)) / DIAS_UTEIS_ANO;
    return { preco, delta: normalAcumulada(d1), gama, theta, vega };
  }
  const preco = desconto * normalAcumulada(-d2) - S * normalAcumulada(-d1);
  const theta = (decaimento + r * desconto * normalAcumulada(-d2)) / DIAS_UTEIS_ANO;
  return { preco, delta: normalAcumulada(d1) - 1, gama, theta, vega };
}

export function precoBS(tipo: TipoOpcao, S: number, K: number, T: number, vol: number, r = SELIC_PADRAO): number {
  return gregasBS(tipo, S, K, T, vol, r).preco;
}

/** Vol implícita por bissecção em [0,005; 5]. `null` quando o preço está fora dos limites de não arbitragem. */
export function volImplicita(tipo: TipoOpcao, S: number, K: number, T: number, preco: number, r = SELIC_PADRAO): number | null {
  if (!(T > 0) || !(S > 0) || !(K > 0) || !(preco > 0)) return null;
  const desconto = K * Math.exp(-r * T);
  const piso = tipo === 'call' ? Math.max(S - desconto, 0) : Math.max(desconto - S, 0);
  const teto = tipo === 'call' ? S : desconto;
  if (preco <= piso || preco >= teto) return null;
  let lo = 0.005, hi = 5;
  if (precoBS(tipo, S, K, T, lo, r) > preco || precoBS(tipo, S, K, T, hi, r) < preco) return null;
  for (let i = 0; i < 100; i++) {
    const m = (lo + hi) / 2;
    if (precoBS(tipo, S, K, T, m, r) > preco) hi = m; else lo = m;
    if (hi - lo < 1e-10) break;
  }
  return (lo + hi) / 2;
}
