import json,numpy as np,math,datetime as dt
src=open('scripts/analise.py').read().split('res={}')[0]

exec(src)
out={}
for tk in ['VALE3','PETR4','BBAS3','PRIO3','AXIA3','ITUB4']:
    d,o,h,l,c,v=load(tk); n=len(c); R={}
    tr=np.maximum.reduce([h[1:]-l[1:],abs(h[1:]-c[:-1]),abs(l[1:]-c[:-1])])
    a=tr[:14].mean()
    for x in tr[14:]: a=(a*13+x)/14
    R['atr']=round(a,2); R['atr_pct']=round(a/c[-1]*100,1)
    # atr at 15/10
    i15=[i for i in range(n) if d[i]==dt.date(2026,10,15)][0]
    a2=tr[:14].mean()
    for x in tr[14:i15]: a2=(a2*13+x)/14
    R['atr_1510']=round(a2,2); R['c_1510']=round(c[i15],2)
    for k in (20,60):
        dc=np.diff(c[-k-1:]); vv=v[-k:]
        R[f'flow{k}']=(round(vv[dc>0].sum()/1e6),round(vv[dc<0].sum()/1e6),int((dc>0).sum()),int((dc<0).sum()))
    dc=np.diff(c[i15-20:i15+1]); vv=v[i15-19:i15+1]
    R['flow20_1510']=(round(vv[dc>0].sum()/1e6),round(vv[dc<0].sum()/1e6))
    lr=np.diff(np.log(c))
    for k in (20,60,250):
        s=lr[-k:].std(ddof=1)*math.sqrt(252); f=s*math.sqrt(126/252)
        R[f'hv{k}']=round(s*100); R[f'proj{k}']=(round(c[-1]*math.exp(-f),2),round(c[-1]*math.exp(f),2))
    R['v250']=round(v[-251:-1].mean()/1e6,1); R['v20']=round(v[-21:-1].mean()/1e6,1); R['vhoje']=round(v[-1]/1e6,1)
    R['ohlc']=(round(float(o[-1]),2),round(h[-1],2),round(l[-1],2),round(c[-1],2),round(c[-2],2))
    st=STEP[tk]; vp20=vp(h,l,v,0,n,st); i6=[i for i in range(n) if d[i]>=dt.date(2026,4,27)][0]; vp6=vp(h,l,v,i6,n,st)
    R['vp20']={k:vp20[k] for k in ['poc','val','vah','hvn','lvn']}; R['vp6']={k:vp6[k] for k in ['poc','val','vah','hvn','lvn']}
    mids,prof=vp20['mids'],vp20['prof']; tot=prof.sum()
    lo=math.floor(mids.min()); hi=math.ceil(mids.max()); span=hi-lo
    w=[1,2,2.5,5,10,20][[1,2,2.5,5,10,20].index(min([1,2,2.5,5,10,20],key=lambda x:abs(span/x-8)))]
    b0=math.floor(lo/w)*w; fx=[]
    x=b0
    while x<hi:
        m=(mids>=x)&(mids<x+w); fx.append((x,x+w,round(100*prof[m].sum()/tot,1))); x+=w
    R['faixas']=fx[::-1]
    R['pct_below']=round(100*prof[mids<c[-1]].sum()/tot,1)
    j26=[i for i in range(n) if d[i]>=dt.date(2026,1,1)][0]; jo=[i for i in range(n) if d[i]>=dt.date(2026,10,5)][0]
    R['vwap']=dict(a2026=avwap(h,l,c,v,j26),m6=avwap(h,l,c,v,i6),min20=avwap(h,l,c,v,int(l.argmin())),max20=avwap(h,l,c,v,int(h.argmax())),turno1=avwap(h,l,c,v,jo),min6=avwap(h,l,c,v,i6+int(l[i6:-1].argmin())))
    R['vwap']={k:round(x,2) for k,x in R['vwap'].items()}
    R['max20m']=(round(h.max(),2),str(d[int(h.argmax())])); R['min6m_pre']=(round(l[i6:-1].min(),2),str(d[i6+int(l[i6:-1].argmin())]))
    S=lambda k:sma(c,k)[-1]
    R['sma']=[round(S(k),2) for k in (20,50,100,200)]
    up=v[-21:-1]; 
    out[tk]=R
def cv(x):
    if isinstance(x,(np.floating,)): return round(float(x),2)
    if isinstance(x,dict): return {k:cv(v) for k,v in x.items()}
    if isinstance(x,(list,tuple)): return [cv(v) for v in x]
    return x
out=cv(out)
json.dump(out,open('dados-brutos/2026-10-26/calculados/stats6.json','w'),ensure_ascii=False)
for tk,R in out.items(): print(tk,json.dumps(R,ensure_ascii=False))
