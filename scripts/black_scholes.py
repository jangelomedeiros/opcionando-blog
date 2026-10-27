from math import log,sqrt,exp,erf
N=lambda x:0.5*(1+erf(x/sqrt(2)))
r=log(1.14); T=53/365
def bs(S,K,v,tipo):
    d1=(log(S/K)+(r+v*v/2)*T)/(v*sqrt(T)); d2=d1-v*sqrt(T)
    if tipo=='call': return S*N(d1)-K*exp(-r*T)*N(d2), N(d1)
    return K*exp(-r*T)*N(-d2)-S*N(-d1), N(d1)-1
def pdist(S,X,v):  # prob S_T > X (risk-neutral-ish w/ drift r)
    d=(log(S/X)+(r-v*v/2)*T)/(v*sqrt(T)); return N(d)
casos={'VALE3':(64.38,0.35,[('venda','call',68),('compra','call',72)]),
'PETR4':(53.88,0.50,[('venda','put',50),('compra','put',46)]),
'BBAS3':(17.47,0.90,[('venda','call',20),('compra','call',22)]),
'BBDC4':(15.95,0.80,[('venda','put',14)]),
'PRIO3':(71.14,0.40,[('compra','call',72),('venda','call',78)])}
for tk,(S,v,pernas) in casos.items():
    out=[]; net=0
    for op,tipo,K in pernas:
        p,dl=bs(S,K,v,tipo); p=round(p,2); out.append((op,tipo,K,p,round(dl,2))); net+= (p if op=='venda' else -p)
    print(tk,S,v,out,'net',round(net,2))
    if tk=='VALE3': be=68+net; print('  BE',be,'P(S>68)',round(pdist(S,68,v),2),'P(S>BE)',round(pdist(S,be,v),2))
    if tk=='PETR4': be=50-net; print('  BE',be,'P(S<50)',round(1-pdist(S,50,v),2),'P(S<BE)',round(1-pdist(S,be,v),2))
    if tk=='BBAS3': be=20+net; print('  BE',be,'P(S>20)',round(pdist(S,20,v),2),'P(S>BE)',round(pdist(S,be,v),2))
    if tk=='BBDC4': be=14-net; print('  BE',be,'P(S<14)',round(1-pdist(S,14,v),2),'P(S<BE)',round(1-pdist(S,be,v),2), 'retorno s/ caixa', round(net/14*100,2),'%')
    if tk=='PRIO3': be=72-net; print('  BE',be,'P(S>BE)',round(pdist(S,be,v),2),'P(S>78)',round(pdist(S,78,v),2))
