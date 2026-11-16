// Converte o OHLCV diário do TradingView (linhas [{t,o,h,l,c,v}] ou colunas {t[],o[],...}) no formato dos
// candles do site: [{d, o, h, l, c, v (milhões), m20, m50, m200}], médias simples do fechamento. Só biblioteca padrão.

const r2 = (x) => Math.round(x * 100) / 100;
const dataIso = (t) => new Date(t * 1000).toISOString().slice(0, 10);

function linhas(ohlcv) {
  if (Array.isArray(ohlcv)) return ohlcv.map((b) => ({ t: b.t, o: b.o, h: b.h, l: b.l, c: b.c, v: b.v }));
  const n = ohlcv.t.length;
  return Array.from({ length: n }, (_, i) => ({ t: ohlcv.t[i], o: ohlcv.o[i], h: ohlcv.h[i], l: ohlcv.l[i], c: ohlcv.c[i], v: ohlcv.v[i] }));
}

/** Últimos `n` pregões com médias de 20, 50 e 200 (null quando não há pregões suficientes). */
export function candlesDeOhlcv(ohlcv, n = 123) {
  const rows = linhas(ohlcv).sort((a, b) => a.t - b.t);
  const closes = rows.map((r) => r.c);
  const media = (i, k) => (i + 1 < k ? null : r2(closes.slice(i + 1 - k, i + 1).reduce((a, b) => a + b, 0) / k));
  return rows.slice(-n).map((r, j) => {
    const i = rows.length - Math.min(n, rows.length) + j;
    return { d: dataIso(r.t), o: r2(r.o), h: r2(r.h), l: r2(r.l), c: r2(r.c), v: r2(r.v / 1e6), m20: media(i, 20), m50: media(i, 50), m200: media(i, 200) };
  });
}
