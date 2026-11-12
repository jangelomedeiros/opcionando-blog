# Estudo técnico dos bancos com pregões até 12/11/2026. Rodar da raiz:
#   python3 scripts/estudo-2026-11-12/calc_bancos.py ITUB4 BBDC4 SANB11 BPAC11
import json, math, sys, datetime as dt
import numpy as np
exec(open('scripts/analise.py').read().split('res={}')[0])  # sma, ema, rsi, adx, vp, pct_between, avwap
D = 'dados-brutos/2026-11-12/'
CFG = {  # passo do Volume Profile e âncoras de VWAP específicas
 'ITUB4': dict(step=0.5, balanco='2026-11-04'),
 'BBDC4': dict(step=0.25, balanco='2026-10-23'),
 'SANB11': dict(step=0.25, balanco='2026-10-28'),
 'BPAC11': dict(step=0.5, balanco=None),
 'BBAS3': dict(step=0.25, balanco='2026-11-12'),
}
def load(tk):
    j = json.load(open(D + f'ohlcv/{tk}.json'))
    d = [dt.datetime.fromtimestamp(x, dt.UTC).date() for x in j['t']]
    f = lambda k: np.array([np.nan if x is None else x for x in j[k]], float)
    return d, f('o'), f('h'), f('l'), f('c'), f('v')
def cv(x):
    if isinstance(x, dict): return {k: cv(y) for k, y in x.items()}
    if isinstance(x, (list, tuple)): return [cv(y) for y in x]
    if isinstance(x, (np.floating, float)): return round(float(x), 2)
    if isinstance(x, np.integer): return int(x)
    return x
for tk in sys.argv[1:]:
    cfg = CFG[tk]; d, o, h, l, c, v = load(tk); n = len(c); R = {'n': n, 'de': str(d[0]), 'ate': str(d[-1])}
    idx = lambda s: d.index(dt.date.fromisoformat(s))
    S = {k: sma(c, k) for k in (10, 20, 50, 100, 200)}
    R['preco'] = c[-1]; R['var_dia'] = round(100*(c[-1]/c[-2]-1), 2)
    R['sma'] = {k: S[k][-1] for k in S}; R['ema10_20'] = (ema(c, 10)[-1], ema(c, 20)[-1])
    r = rsi(c); R['rsi'] = r[-1]; R['rsi_min_pos26'] = np.nanmin(r[idx('2026-10-26'):])
    m = ema(c, 12) - ema(c, 26); sg = ema(m, 9); R['macd'] = (m[-1], sg[-1], m[-1]-sg[-1], m[-2]-sg[-2])
    a, pdi, ndi, _ = adx(h, l, c); R['adx'] = (a, pdi, ndi)
    sd = c[-20:].std(ddof=0); R['bb'] = (S[20][-1]-2*sd, S[20][-1]+2*sd)
    tr = np.maximum.reduce([h[1:]-l[1:], abs(h[1:]-c[:-1]), abs(l[1:]-c[:-1])]); at = tr[:14].mean()
    for x in tr[14:]: at = (at*13 + x)/14
    R['atr'] = (at, at/c[-1]*100)
    lr = np.diff(np.log(c))
    for k in (10, 20, 60, 250):
        k2 = min(k, len(lr)); s = lr[-k2:].std(ddof=1)*math.sqrt(252); R[f'hv{k}'] = round(s*100)
    obv = np.concatenate([[0], np.cumsum(np.sign(np.diff(c))*v[1:])]); i26 = idx('2026-10-26')
    R['obv_desde_26'] = (obv[-1]-obv[i26])/1e6; R['obv_20d'] = (obv[-1]-obv[-21])/1e6
    for k in (12, 20, 60):
        dc = np.diff(c[-k-1:]); vv = v[-k:]
        R[f'flow{k}'] = (vv[dc > 0].sum()/1e6, vv[dc < 0].sum()/1e6, int((dc > 0).sum()), int((dc < 0).sum()))
    R['v_med'] = dict(v250=v[-251:-1].mean()/1e6, v20=v[-21:-1].mean()/1e6)
    R['pos'] = [(str(d[i]), o[i], h[i], l[i], c[i], round(v[i]/1e6, 1), round(100*(c[i]/c[i-1]-1), 2)) for i in range(idx('2026-10-01'), n)]
    st = cfg['step']; vpa = vp(h, l, v, 0, n, st); i6 = [i for i in range(n) if d[i] >= dt.date(2026, 5, 12)][0]; vp6 = vp(h, l, v, i6, n, st)
    vpc = vp(h, l, v, i26, n, st/2.5)
    for nome, z in (('vp_all', vpa), ('vp6', vp6), ('vp_pos26', vpc)): R[nome] = {k: z[k] for k in ['poc', 'val', 'vah', 'hvn', 'lvn']}
    R['pct_abaixo'] = pct_between(vpa, 0, c[-1])
    mids, prof = vpa['mids'], vpa['prof']; tot = prof.sum(); faixa = round((np.nanmax(h)-np.nanmin(l))/7/st)*st or st
    lo0 = math.floor(np.nanmin(l)/faixa)*faixa; fx = []; x = lo0
    while x < np.nanmax(h):
        mm = (mids >= x) & (mids < x+faixa); fx.append((round(x, 2), round(x+faixa, 2), round(100*prof[mm].sum()/tot, 1))); x += faixa
    R['faixas'] = fx[::-1]
    anc = dict(a2026=[i for i in range(n) if d[i] >= dt.date(2026, 1, 1)][0], m6=i6, turno1=idx('2026-10-05'), eleicao=i26,
               min_abs=int(np.nanargmin(l)), max_abs=int(np.nanargmax(h)), min_pos26=i26+int(np.nanargmin(l[i26:])))
    if cfg['balanco']: anc['balanco'] = idx(cfg['balanco'])
    R['vwap'] = {k: avwap(h, l, c, v, i) for k, i in anc.items()}
    R['ancoras'] = {k: str(d[i]) for k, i in anc.items()}
    R['min'] = (np.nanmin(l), str(d[int(np.nanargmin(l))])); R['max'] = (np.nanmax(h), str(d[int(np.nanargmax(h))]))
    R['min_pos26'] = (np.nanmin(l[i26:]), str(d[anc['min_pos26']])); R['max_pos26'] = (np.nanmax(h[i26+1:]), str(d[i26+1+int(np.nanargmax(h[i26+1:]))]))
    wk = {}
    for i, x in enumerate(d): wk.setdefault(x.isocalendar()[:2], []).append(i)
    W = list(wk.values()); wc = np.array([c[g[-1]] for g in W]); wh = np.array([np.nanmax(h[g]) for g in W]); wl = np.array([np.nanmin(l[g]) for g in W]); wv = np.array([v[g].sum() for g in W])
    R['sem'] = dict(n=len(wc), rsi=rsi(wc)[-1], ultimas=[(wc[i], wh[i], wl[i], wv[i]/1e6) for i in range(-5, 0)])
    hi_s, lo_s = R['max_pos26'][0], R['min_pos26'][0]
    R['retr_pos26'] = {f: lo_s + f*(hi_s - lo_s) for f in (0.382, 0.5, 0.618)}
    R = cv(R); json.dump(R, open(D + f'calculados/stats_{tk}.json', 'w'), ensure_ascii=False)
    print('=====', tk); [print(k, ':', x) for k, x in R.items() if k != 'pos']; print('pos:', R['pos'][-14:])
    slug = tk.lower() + '-2026-11-12'
    json.dump(dict(step=st, periodo20=f'{d[0]}|{d[-1]}', periodo6=f'{d[i6]}|{d[-1]}',
        bins=[[round(float(x), 3), round(float(y)/1e6, 3)] for x, y in zip(vpa['mids'], vpa['prof'])],
        bins6=[[round(float(x), 3), round(float(y)/1e6, 3)] for x, y in zip(vp6['mids'], vp6['prof'])],
        poc=vpa['poc'], vah=vpa['vah'], val=vpa['val'], poc6=vp6['poc'], vah6=vp6['vah'], val6=vp6['val'], preco=round(float(c[-1]), 2)),
        open(f'src/data/perfil/{slug}.json', 'w'))
    rows = []
    for i in range(max(0, n-123), n):
        g = lambda a: None if np.isnan(a[i]) else round(float(a[i]), 2)
        rows.append(dict(d=str(d[i]), o=g(o), h=g(h), l=g(l), c=g(c), v=round(float(v[i])/1e6, 2), m20=g(S[20]), m50=g(S[50]), m200=g(S[200])))
    json.dump(rows, open(f'src/data/candles/{slug}.json', 'w'))
