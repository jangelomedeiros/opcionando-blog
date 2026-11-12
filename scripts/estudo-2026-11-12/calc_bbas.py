# Atualização de BBAS3 com pregões até 06/11/2026. Rodar da raiz: python3 scripts/estudo-2026-11-12/calc_bbas.py
import json, math, datetime as dt
import numpy as np
src = open('scripts/analise.py').read().split('res={}')[0]
exec(src)  # funções sma, ema, rsi, adx, vp, pct_between, avwap
D = 'dados-brutos/2026-11-12/'
def load(tk):
    j = json.load(open(D + f'ohlcv/{tk}.json'))
    d = [dt.datetime.fromtimestamp(x, dt.UTC).date() for x in j['t']]
    f = lambda k: np.array([np.nan if x is None else x for x in j[k]], float)
    return d, f('o'), f('h'), f('l'), f('c'), f('v')
tk = 'BBAS3'; d, o, h, l, c, v = load(tk); n = len(c); R = {}
idx = lambda day: d.index(day)
S = {k: sma(c, k) for k in (10, 20, 50, 100, 200)}
R['sma'] = {k: round(S[k][-1], 2) for k in S}
R['ema10_20'] = (round(ema(c, 10)[-1], 2), round(ema(c, 20)[-1], 2))
r = rsi(c); R['rsi'] = round(r[-1], 1); R['rsi_min_pos26'] = round(np.nanmin(r[idx(dt.date(2026,10,26)):]), 1)
m = ema(c, 12) - ema(c, 26); sg = ema(m, 9); R['macd'] = (round(m[-1], 2), round(sg[-1], 2), round(m[-1]-sg[-1], 2), round(m[-2]-sg[-2], 2))
a, pdi, ndi, _ = adx(h, l, c); R['adx'] = (round(a, 1), round(pdi, 1), round(ndi, 1))
sd = c[-20:].std(ddof=0); R['bb'] = (round(S[20][-1]-2*sd, 2), round(S[20][-1]+2*sd, 2))
tr = np.maximum.reduce([h[1:]-l[1:], abs(h[1:]-c[:-1]), abs(l[1:]-c[:-1])]); at = tr[:14].mean()
for x in tr[14:]: at = (at*13 + x)/14
R['atr'] = (round(at, 2), round(at/c[-1]*100, 1))
lr = np.diff(np.log(c))
for k in (10, 20, 60, 250):
    s = lr[-k:].std(ddof=1)*math.sqrt(252); f = s*math.sqrt(126/252)
    R[f'hv{k}'] = round(s*100); R[f'proj{k}'] = (round(c[-1]*math.exp(-f), 2), round(c[-1]*math.exp(f), 2))
obv = np.concatenate([[0], np.cumsum(np.sign(np.diff(c))*v[1:])])
i26 = idx(dt.date(2026, 10, 26))
R['obv_desde_26'] = round((obv[-1]-obv[i26])/1e6); R['obv_20d'] = round((obv[-1]-obv[-21])/1e6)
for k in (8, 20, 60):
    dc = np.diff(c[-k-1:]); vv = v[-k:]
    R[f'flow{k}'] = (round(vv[dc > 0].sum()/1e6), round(vv[dc < 0].sum()/1e6), int((dc > 0).sum()), int((dc < 0).sum()))
R['v_med'] = dict(v250=round(v[-251:-1].mean()/1e6, 1), v20=round(v[-21:-1].mean()/1e6, 1), v50=round(v[-51:-1].mean()/1e6, 1))
R['pos26'] = [(str(d[i]), o[i], h[i], l[i], c[i], round(v[i]/1e6, 1), round(100*(c[i]/c[i-1]-1), 2), round((c[i]-l[i])/(h[i]-l[i]), 2)) for i in range(i26, n)]
# Volume Profile
st = 0.25; vp20 = vp(h, l, v, 0, n, st); i6 = [i for i in range(n) if d[i] >= dt.date(2026, 5, 6)][0]; vp6 = vp(h, l, v, i6, n, st)
vpc = vp(h, l, v, i26, n, 0.10)
R['vp20'] = {k: vp20[k] for k in ['poc', 'val', 'vah', 'hvn', 'lvn']}; R['vp6'] = {k: vp6[k] for k in ['poc', 'val', 'vah', 'hvn', 'lvn']}
R['vp_pos26'] = {k: vpc[k] for k in ['poc', 'val', 'vah']}
R['pct20_abaixo'] = round(pct_between(vp20, 0, c[-1]), 1); R['pct20_16_18'] = round(pct_between(vp20, 16, 18), 1)
mids, prof = vp20['mids'], vp20['prof']; tot = prof.sum(); fx = []
for x in range(28, 14, -2):
    mm = (mids >= x) & (mids < x+2); p = round(100*prof[mm].sum()/tot, 1)
    if p > 0: fx.append((x, x+2, p))
R['faixas'] = fx
j26 = [i for i in range(n) if d[i] >= dt.date(2026, 1, 1)][0]; jo = idx(dt.date(2026, 10, 5))
il = int(np.argmin(l)); ih = int(np.argmax(h))
R['vwap'] = {k: round(x, 2) for k, x in dict(a2026=avwap(h, l, c, v, j26), m6=avwap(h, l, c, v, i6), turno1=avwap(h, l, c, v, jo),
            sc26=avwap(h, l, c, v, i26), balanco=avwap(h, l, c, v, idx(dt.date(2026,11,12))), st0311=avwap(h, l, c, v, idx(dt.date(2026,11,3))), min_abs=avwap(h, l, c, v, il), max20=avwap(h, l, c, v, ih)).items()}
R['min'] = (l.min(), str(d[il])); R['max20'] = (h.max(), str(d[ih]))
# semanal
wk = {}
for i, x in enumerate(d): wk.setdefault(x.isocalendar()[:2], []).append(i)
W = list(wk.values()); wc = np.array([c[g[-1]] for g in W]); wh = np.array([h[g].max() for g in W]); wl = np.array([l[g].min() for g in W]); wv = np.array([v[g].sum() for g in W])
R['sem'] = dict(n=len(wc), rsi=round(rsi(wc)[-1], 1), sma20=round(sma(wc, 20)[-1], 2), sma50=round(sma(wc, 50)[-1], 2),
    macd=(round((ema(wc, 12)-ema(wc, 26))[-1], 2), round(ema(ema(wc, 12)-ema(wc, 26), 9)[-1], 2)),
    ultimas=[(round(float(wc[i]), 2), round(float(wh[i]), 2), round(float(wl[i]), 2), round(float(wv[i])/1e6)) for i in range(-4, 0)])
# extensões / fibo da queda 23/10 -> mínima
hi_pre = 24.97; lo = l.min()
R['ext'] = {f: round(18.31 - f*(18.31 - 16.08), 2) for f in (1.272, 1.618, 2.0, 2.618)}
R['retr'] = {f: round(lo + f*(hi_pre - lo), 2) for f in (0.236, 0.382, 0.5, 0.618)}
R['retr_curta'] = {f: round(lo + f*(18.31 - lo), 2) for f in (0.236, 0.382, 0.5, 0.618)}
R['retr_gap'] = {f: round(lo + f*(17.39 - lo), 2) for f in (0.382, 0.5, 0.618)}
cv = lambda x: round(float(x), 2) if isinstance(x, (np.floating, float)) else x
def deep(x):
    if isinstance(x, dict): return {k: deep(y) for k, y in x.items()}
    if isinstance(x, (list, tuple)): return [deep(y) for y in x]
    return cv(x)
R = deep(R)
json.dump(R, open(D + 'calculados/stats_BBAS3.json', 'w'), ensure_ascii=False)
for k, x in R.items(): print(k, ':', x)
# arquivos do site
json.dump(dict(step=st, periodo20=f'{d[0]}|{d[-1]}', periodo6=f'{d[i6]}|{d[-1]}',
    bins=[[round(float(x), 3), round(float(y)/1e6, 3)] for x, y in zip(vp20['mids'], vp20['prof'])],
    bins6=[[round(float(x), 3), round(float(y)/1e6, 3)] for x, y in zip(vp6['mids'], vp6['prof'])],
    poc=vp20['poc'], vah=vp20['vah'], val=vp20['val'], poc6=vp6['poc'], vah6=vp6['vah'], val6=vp6['val'], preco=round(float(c[-1]), 2)),
    open('src/data/perfil/bbas3-2026-11-12.json', 'w'))
rows = []
for i in range(n-123, n):
    g = lambda a: None if np.isnan(a[i]) else round(float(a[i]), 2)
    rows.append(dict(d=str(d[i]), o=g(o), h=g(h), l=g(l), c=g(c), v=round(float(v[i])/1e6, 2), m20=g(S[20]), m50=g(S[50]), m200=g(S[200])))
json.dump(rows, open('src/data/candles/bbas3-2026-11-12.json', 'w'))
