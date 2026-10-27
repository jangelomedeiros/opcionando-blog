import json, math, datetime as dt, sys
import numpy as np
D='dados-brutos/2026-10-26/ohlcv/'
OUT='dados-brutos/2026-10-26/calculados/'
STEP={'AXIA3':0.25,'ITUB4':0.25,'VALE3':0.25,'PETR4':0.25,'PRIO3':0.25,'BBAS3':0.25,'BBDC4':0.10}
def load(tk):
    ot=json.load(open(D+'old_t.json')); nt=json.load(open(D+'t.json'))
    o=json.load(open(D+f'old_{tk}.json')); n=json.load(open(D+f'{tk}.json'))
    assert len(o['c'])==len(ot)==299 and len(n['c'])==len(nt)==123
    t=ot+nt
    d=[dt.datetime.utcfromtimestamp(x).date() for x in t]
    c=np.array(o['c']+n['c'],float); h=np.array(o['h']+n['h'],float); l=np.array(o['l']+n['l'],float); v=np.array(o['v']+n['v'],float)
    op=np.array([np.nan]*299+n['o'],float)
    return d,op,h,l,c,v
def sma(x,k): return np.array([x[i-k+1:i+1].mean() if i>=k-1 else np.nan for i in range(len(x))])
def ema(x,k):
    a=2/(k+1); e=np.empty(len(x)); e[0]=x[0]
    for i in range(1,len(x)): e[i]=a*x[i]+(1-a)*e[i-1]
    return e
def rsi(c,p=14):
    d=np.diff(c); up=np.maximum(d,0); dn=np.maximum(-d,0); au=up[:p].mean(); ad=dn[:p].mean(); out=[np.nan]*(p+1)
    for i in range(p,len(d)): au=(au*(p-1)+up[i])/p; ad=(ad*(p-1)+dn[i])/p; out.append(100-100/(1+au/ad) if ad else 100)
    return np.array(out[:len(c)])
def adx(h,l,c,p=14):
    tr=np.maximum.reduce([h[1:]-l[1:],abs(h[1:]-c[:-1]),abs(l[1:]-c[:-1])])
    pdm=np.where((h[1:]-h[:-1])>(l[:-1]-l[1:]),np.maximum(h[1:]-h[:-1],0),0); ndm=np.where((l[:-1]-l[1:])>(h[1:]-h[:-1]),np.maximum(l[:-1]-l[1:],0),0)
    def wil(x):
        o=np.empty(len(x)); o[:p]=np.nan; o[p-1]=x[:p].sum()
        for i in range(p,len(x)): o[i]=o[i-1]-o[i-1]/p+x[i]
        return o
    atr=wil(tr); pdi=100*wil(pdm)/atr; ndi=100*wil(ndm)/atr; dx=100*abs(pdi-ndi)/(pdi+ndi)
    a=np.empty(len(dx)); a[:]=np.nan; s=2*p-2; a[s]=np.nanmean(dx[p-1:s+1])
    for i in range(s+1,len(dx)): a[i]=(a[i-1]*(p-1)+dx[i])/p
    return a[-1],pdi[-1],ndi[-1],(atr/p)[-2]
def vp(h,l,v,i0,i1,step):
    lo=math.floor(l[i0:i1].min()/step)*step; hi=math.ceil(h[i0:i1].max()/step)*step
    edges=np.arange(lo,hi+step/2,step); prof=np.zeros(len(edges)-1)
    for k in range(i0,i1):
        a,b=l[k],h[k]
        if b<=a: prof[min(int((a-lo)//step),len(prof)-1)]+=v[k]; continue
        for j in range(int((a-lo)//step),min(int((b-lo)//step)+1,len(prof))):
            ov=min(b,edges[j+1])-max(a,edges[j])
            if ov>0: prof[j]+=v[k]*ov/(b-a)
    mids=edges[:-1]+step/2; poc=int(prof.argmax()); tot=prof.sum(); inc=prof[poc]; lo_i=hi_i=poc
    while inc<0.7*tot:
        up=prof[hi_i+1] if hi_i+1<len(prof) else -1; dn=prof[lo_i-1] if lo_i-1>=0 else -1
        if up>=dn: hi_i+=1; inc+=up
        else: lo_i-=1; inc+=dn
    k=max(3,int(round(0.75/step))) if step<0.2 else 3
    sm=np.convolve(prof,np.ones(5)/5,mode='same')
    hvn=[round(mids[i],2) for i in range(k,len(sm)-k) if sm[i]==sm[i-k:i+k+1].max() and sm[i]>0.35*sm.max()]
    lvn=[round(mids[i],2) for i in range(k,len(sm)-k) if sm[i]==sm[i-k:i+k+1].min() and sm[i]<0.5*sm.max()]
    return dict(mids=mids,prof=prof,poc=round(mids[poc],2),val=round(mids[lo_i],2),vah=round(mids[hi_i],2),hvn=hvn,lvn=lvn)
def pct_between(vpd,a,b):
    m=(vpd['mids']>=a)&(vpd['mids']<b); return 100*vpd['prof'][m].sum()/vpd['prof'].sum()
def avwap(h,l,c,v,i0):
    tp=(h+l+c)/3; return (tp[i0:]*v[i0:]).sum()/v[i0:].sum()
res={}
for tk in ['VALE3','PETR4','BBAS3','BBDC4','PRIO3','AXIA3','ITUB4']:
    d,o,h,l,c,v=load(tk); n=len(c); R={}
    S20,S50,S200=sma(c,20),sma(c,50),sma(c,200); E9,E21=ema(c,9),ema(c,21)
    R['n']=n; R['periodo']=f'{d[0]} a {d[-1]}'
    R['close']=c[-1]; R['prev']=c[-2]; R['open']=o[-1]; R['hi']=h[-1]; R['lo']=l[-1]
    R['sma20']=S20[-1]; R['sma50']=S50[-1]; R['sma200']=S200[-1]; R['sma200_n']=int(min(n,200))
    R['sma20_prev']=S20[-2]; R['ema9']=E9[-1]; R['ema21']=E21[-1]
    r=rsi(c); R['rsi']=r[-1]; R['rsi_prev']=r[-2]
    m=ema(c,12)-ema(c,26); sig=ema(m,9); R['macd']=m[-1]; R['macd_sig']=sig[-1]; R['macd_hist']=m[-1]-sig[-1]; R['macd_hist_prev']=m[-2]-sig[-2]
    a,pdi,ndi,atr=adx(h,l,c); R['adx']=a; R['+di']=pdi; R['-di']=ndi; R['atr_pre']=atr
    sd=np.array([c[i-19:i+1].std(ddof=0) for i in range(19,n)]); R['bb_up']=S20[-1]+2*sd[-1]; R['bb_dn']=S20[-1]-2*sd[-1]
    R['bb_width_pre']=4*sd[-2]/S20[-2]*100
    lr=np.diff(np.log(c)); R['hv20_pre']=lr[-21:-1].std(ddof=1)*math.sqrt(252)*100; R['hv60_pre']=lr[-61:-1].std(ddof=1)*math.sqrt(252)*100
    R['hv252_pre']=lr[-253:-1].std(ddof=1)*math.sqrt(252)*100
    # percentil HV20 em 1 ano
    hv20s=[lr[i-20:i].std(ddof=1)*math.sqrt(252)*100 for i in range(20,len(lr)+1)]
    R['hv20_now']=hv20s[-1]; R['hv20_pct_1a']=100*np.mean(np.array(hv20s[-252:])<=hv20s[-1])
    # OBV
    obv=np.concatenate([[0],np.cumsum(np.sign(np.diff(c))*v[1:])]); R['obv']=obv[-1]; R['obv_20d_chg']=obv[-1]-obv[-21]
    R['obv_6m_max_idx']=str(d[int(np.argmax(obv[-125:]))+n-125]); R['obv_pre']=obv[-2]
    # price x volume last 20 pregões (antes de hoje)
    up=v[-21:-1][np.diff(c[-22:-1])>0].sum(); dn=v[-21:-1][np.diff(c[-22:-1])<0].sum(); R['volup20']=up; R['voldn20']=dn
    R['vol_hoje_x20']=v[-1]/v[-21:-1].mean(); R['vol_rank_20m']=int((v>v[-1]).sum())+1
    R['range_hoje_x_atr']=(h[-1]-l[-1])/atr; R['close_pos_range']=(c[-1]-l[-1])/(h[-1]-l[-1])
    # top volume days last 6 months
    idx=np.argsort(v[-125:])[::-1][:8]+n-125
    R['top_vol']=[(str(d[i]),round(c[i],2),round(100*(c[i]/c[i-1]-1),2),round(v[i]/1e6,1),round(h[i],2),round(l[i],2)) for i in sorted(idx)]
    # VP
    st=STEP[tk]; vp20=vp(h,l,v,0,n,st); i6=[i for i in range(n) if d[i]>=dt.date(2026,4,27)][0]; vp6=vp(h,l,v,i6,n,st)
    vp6pre=vp(h,l,v,i6,n-1,st)
    R['vp20']={k:vp20[k] for k in ['poc','val','vah','hvn','lvn']}; R['vp6']={k:vp6[k] for k in ['poc','val','vah','hvn','lvn']}
    R['vp6pre']={k:vp6pre[k] for k in ['poc','val','vah']}
    R['pct_vol_hoje_6m']=100*v[-1]/v[i6:].sum()
    # % do volume 20m na faixa do dia de hoje e abaixo do preço
    R['pct20_below_close']=pct_between(vp20,0,c[-1]); R['pct20_today_range']=pct_between(vp20,l[-1],h[-1]+1e-9)
    # extremos
    R['max20m']=(round(h.max(),2),str(d[int(h.argmax())])); R['min20m']=(round(l.min(),2),str(d[int(l.argmin())]))
    R['max6m']=(round(h[i6:].max(),2),str(d[i6+int(h[i6:].argmax())])); R['min6m_pre']=(round(l[i6:-1].min(),2),str(d[i6+int(l[i6:-1].argmin())]))
    # vwaps
    j26=[i for i in range(n) if d[i]>=dt.date(2026,1,1)][0]
    R['avwap_2026']=avwap(h,l,c,v,j26); R['avwap_6m']=avwap(h,l,c,v,i6)
    R['avwap_min20']=avwap(h,l,c,v,int(l.argmin())); R['avwap_max20']=avwap(h,l,c,v,int(h.argmax()))
    jo=[i for i in range(n) if d[i]>=dt.date(2026,10,5)][0]; R['avwap_1turno']=avwap(h,l,c,v,jo)
    R['avwap_max6m']=avwap(h,l,c,v,i6+int(h[i6:].argmax())); R['avwap_min6m']=avwap(h,l,c,v,i6+int(l[i6:-1].argmin()))
    res[tk]=R
    # save perfil json (20m + 6m)
    json.dump(dict(step=st,periodo20=f'{d[0]}|{d[-1]}',periodo6=f'{d[i6]}|{d[-1]}',
        bins=[[round(float(x),3),round(float(y)/1e6,3)] for x,y in zip(vp20['mids'],vp20['prof'])],
        bins6=[[round(float(x),3),round(float(y)/1e6,3)] for x,y in zip(vp6['mids'],vp6['prof'])],
        poc=vp20['poc'],vah=vp20['vah'],val=vp20['val'],poc6=vp6['poc'],vah6=vp6['vah'],val6=vp6['val'],preco=round(float(c[-1]),2)),
        open(OUT+f'perfil_{tk}.json','w'))
    # candles w/ v and médias (últimos 123)
    rows=[]
    for i in range(n-123,n):
        rows.append(dict(d=str(d[i]),o=round(float(o[i]),2),h=round(float(h[i]),2),l=round(float(l[i]),2),c=round(float(c[i]),2),v=round(float(v[i])/1e6,2),
            m20=None if np.isnan(S20[i]) else round(float(S20[i]),2),m50=None if np.isnan(S50[i]) else round(float(S50[i]),2),m200=None if np.isnan(S200[i]) else round(float(S200[i]),2)))
    json.dump(rows,open(OUT+f'candles_{tk}.json','w'))
def fmt(x):
    if isinstance(x,float): return round(x,2)
    if isinstance(x,dict): return {k:fmt(v) for k,v in x.items()}
    return x
for tk,R in res.items():
    print('\n=====',tk); 
    for k,v in R.items(): print(f'  {k}: {fmt(v) if not isinstance(v,(np.floating,)) else round(float(v),2)}')
