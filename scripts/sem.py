import json,numpy as np,datetime as dt,sys
sys.argv=['x']; exec(open('scripts/analise.py').read().split('res={}')[0])
d,o,h,l,c,v=load('AXIA3')
wk={}
for i,x in enumerate(d):
    k=x.isocalendar()[:2]; wk.setdefault(k,[]).append(i)
W=list(wk.values()); wc=np.array([c[g[-1]] for g in W]); wh=np.array([h[g].max() for g in W]); wl=np.array([l[g].min() for g in W])
print('semanas',len(wc))
s20=sma(wc,20); s50=sma(wc,50); print('wSMA20',s20[-1],'wSMA50',s50[-1]); print('wRSI',rsi(wc)[-1])
m=ema(wc,12)-ema(wc,26); sg=ema(m,9); print('wMACD',m[-1],sg[-1])
a=adx(wh,wl,wc); print('wADX',a[0],a[1],a[2])
k=[(wc[i]-wl[i-13:i+1].min())/(wh[i-13:i+1].max()-wl[i-13:i+1].min())*100 for i in range(13,len(wc))]
print('wStoch K',k[-1], np.mean(k[-3:]))
print('w EMA9/21 diário',ema(c,9)[-1],ema(c,21)[-1])
# vols 
print('avg vol20 pre',v[-21:-1].mean()/1e6)
for i in range(-16,0): print(d[i],o[i] if not np.isnan(o[i]) else '',h[i],l[i],c[i],round(v[i]/1e6,1),round(v[i]/v[i-20:i].mean(),2))
