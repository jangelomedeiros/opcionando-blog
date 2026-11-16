#!/usr/bin/env python3
"""Gera src/data/laboratorio/mercado.csv a partir da grade de opções importada (opcoes.net.br).

Uso:
  python -I scripts/importar_grade.py PLANILHA.xlsx src/data/grades/bbas3-AAAA-MM-DD.json
  python -I scripts/atualizar_mercado.py src/data/grades/bbas3-AAAA-MM-DD.json [--spot 15.10] [--data AAAA-MM-DD]

Regras:
- Cada estrutura do laboratório é remapeada para as séries atuais: mesma moneyness (strike × spot/ref),
  vencimentos pelos dias úteis mais próximos (os curtos caem no 1º vencimento mensal), sempre em ordem crescente.
- Preço = último negócio do dia da planilha. Série sem negócio no dia (ou com preço abaixo do intrínseco)
  usa preço teórico: Black-Scholes (carry zero) com VI interpolada pelos strikes negociados do mesmo vencimento.
- Só biblioteca padrão (lê o JSON gerado por scripts/importar_grade.py).
"""
import argparse, json, math, os, sys

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.dirname(AQUI)
EST = os.path.join(RAIZ, 'src/data/laboratorio/estruturas.json')
SAIDA = os.path.join(RAIZ, 'src/data/laboratorio/mercado.csv')
NPHI = lambda x: 0.5 * (1 + math.erf(x / math.sqrt(2)))

def bs(t, S, K, T, v):
    if T <= 0 or v <= 0:
        return max(S - K, 0) if t == 'C' else max(K - S, 0)
    d1 = (math.log(S / K) + 0.5 * v * v * T) / (v * math.sqrt(T)); d2 = d1 - v * math.sqrt(T)
    return S * NPHI(d1) - K * NPHI(d2) if t == 'C' else K * NPHI(-d2) - S * NPHI(-d1)

def impl(t, S, K, T, px):
    intr = max(S - K, 0) if t == 'C' else max(K - S, 0)
    if px < intr - 0.02 or px <= 0: return None
    lo, hi = 0.02, 4.0
    if bs(t, S, K, T, hi) < px: return None
    for _ in range(80):
        m = (lo + hi) / 2
        if bs(t, S, K, T, m) < px: lo = m
        else: hi = m
    return (lo + hi) / 2

# Janela de dias úteis do 1º vencimento exigida pelo POP: (mínimo, máximo, alvo)
JANELA = {'b1': (12, 24, 15), 'b2': (30, 45, 38), 'b3': (25, 999, 35), 'trava-alta': (6, 12, 8), 'trava-baixa': (6, 12, 8),
          'thl': (23, 999, 35), 'thl-put': (23, 999, 35), 'tlad': (23, 999, 35)}

def fnum(x, d=2):
    return f"{x:.{d}f}".replace('.', ',')

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('grade', help='JSON gerado por scripts/importar_grade.py')
    ap.add_argument('--spot', type=float, default=None, help='padrão: spot da grade')
    ap.add_argument('--data', default=None, help='data dos preços (AAAA-MM-DD); padrão: data da grade')
    a = ap.parse_args()
    g = json.load(open(a.grade, encoding='utf-8'))
    a.ativo = g['ativo']
    data = a.data or g['data']
    S = a.spot or round(g['spot'], 2)
    rows = []
    for s in g['series']:
        if s['venc'] <= data: continue  # nunca monta perna já vencida
        fresh = s['ultimo'] is not None and s['data_ultimo'] == data
        rows.append(dict(tk=s['ticker'], exp=s['venc'], du=s['du'], t='C' if s['tipo'] == 'call' else 'P', k=round(s['strike'], 2),
                         px=s['ultimo'] if fresh else None, n=s['negocios'] if fresh else None))
    series = sorted({(r['exp'], r['du']) for r in rows}, key=lambda x: x[1])
    du_de = dict(series)
    # VI implícita dos negócios do dia, por vencimento e tipo
    for r in rows:
        r['iv'] = impl(r['t'], S, r['k'], r['du'] / 252, r['px']) if r['px'] is not None else None
        if r['px'] is not None and r['iv'] is None: r['px'] = None; r['n'] = None
    def smile(exp, t, k):
        pts = sorted((x['k'], x['iv']) for x in rows if x['exp'] == exp and x['t'] == t and x['iv'])
        if not pts:
            pts = sorted((x['k'], x['iv']) for x in rows if x['exp'] == exp and x['iv'])
        if not pts:
            ex = sorted({x['exp'] for x in rows if x['iv']}, key=lambda e: abs(du_de[e] - du_de[exp]))
            if not ex: raise SystemExit('planilha sem nenhum negócio na data')
            return smile(ex[0], t, k)
        if k <= pts[0][0]: return pts[0][1]
        if k >= pts[-1][0]: return pts[-1][1]
        for (k0, v0), (k1, v1) in zip(pts, pts[1:]):
            if k0 <= k <= k1: return v0 + (v1 - v0) * (k - k0) / (k1 - k0)
    for r in rows:
        r['teo'] = r['px'] is None
        if r['teo']:
            v = smile(r['exp'], r['t'], r['k'])
            r['iv'] = v; r['px'] = max(round(bs(r['t'], S, r['k'], r['du'] / 252, v), 2), 0.01)
    idx = {(r['exp'], r['t'], r['k']): r for r in rows}
    est = json.load(open(EST, encoding='utf-8'))
    out = []; relatorio = []
    for e in est:
        fact = S / e['ref']['spot']
        def mapear(legs):
            exps = sorted({(l['d'], l['exp']) for l in legs if l['t'] != 'S'})
            tmap = {}; prev = -1
            for n_, (d, ex) in enumerate(exps):
                alvo_du = d; jan = JANELA.get(e['pop']) if n_ == 0 else None
                if jan:
                    dentro = [i for i in range(len(series)) if jan[0] <= series[i][1] <= jan[1]]
                    if dentro: alvo_du = series[min(dentro, key=lambda i: abs(series[i][1] - jan[2]))][1]
                cand = sorted(range(len(series)), key=lambda i: abs(series[i][1] - alvo_du))
                i = next(i for i in cand if i > prev) if any(i > prev for i in cand) else len(series) - 1
                tmap[ex] = series[i][0]; prev = i
            kmap = {}
            for (ex, t) in sorted({(l['exp'], l['t']) for l in legs if l['t'] != 'S'}):
                tt = 'C' if t == 'C' else 'P'
                disp = [x for x in rows if x['exp'] == tmap[ex] and x['t'] == tt]
                used = set()
                ks = sorted({l['k'] for l in legs if l['t'] == t and l['exp'] == ex})
                grade = sorted({x['k'] for x in disp})
                passo = min(b - a_ for a_, b in zip(grade, grade[1:])) if len(grade) > 1 else 0.25
                porK = {x['k']: x for x in disp}
                if len(ks) >= 3:
                    # borboletas e afins: preserva o desenho (razão entre as asas) em passos da grade
                    cand = sorted(disp, key=lambda x: abs(x['k'] - ks[0] * fact) + (0.15 if x['teo'] else 0.0) + (0.10 if (x['n'] or 0) < 5 else 0.0))
                    kk = cand[0]['k']; picks = [kk]
                    for g in (b - a_ for a_, b in zip(ks, ks[1:])):
                        kk = kk + max(1, round(g * fact / passo)) * passo
                        near = min(grade, key=lambda z: abs(z - kk)); picks.append(near); kk = near
                    for k, kp in zip(ks, picks): kmap[(ex, t, k)] = porK[kp]
                    continue
                for k in ks:
                    alvo = k * fact
                    cand = sorted(disp, key=lambda x: abs(x['k'] - alvo) + (0.15 if x['teo'] else 0.0) + (0.10 if (x['n'] or 0) < 5 else 0.0))
                    pick = next((x for x in cand if x['k'] not in used), cand[0])
                    used.add(pick['k']); kmap[(ex, t, k)] = pick
            res = []
            for l in legs:
                if l['t'] == 'S': res.append(('S', l['q'], None)); continue
                res.append((l['t'], l['q'], kmap[(l['exp'], l['t'], l['k'])]))
            return res
        for grupo, legs in (('principal', e['pernas']), ('comparacao', e.get('comparacao') or [])):
            if not legs: continue
            for t, q, x in mapear(legs):
                if t == 'S':
                    out.append(f"{e['id']};{grupo};AÇÃO;{q:g};{a.ativo};;;{fnum(S)};;;ultimo")
                else:
                    out.append(f"{e['id']};{grupo};{'CALL' if t == 'C' else 'PUT'};{q:g};{x['tk']};{fnum(x['k'])};{x['exp']};{fnum(x['px'])};{fnum(x['iv'], 4)};{x['n'] if x['n'] is not None else ''};{'teorico' if x['teo'] else 'ultimo'}")
    cab = [
        '# Preços reais para o bloco "Como essa estrutura seria montada hoje?"',
        f'# data={data}', f'# ativo={a.ativo}', f'# spot={fnum(S)}',
        '# fonte=B3 via opcoes.net.br · último negócio do dia de cada série (teórico por Black-Scholes quando não houve negócio)',
        '# Gerado por scripts/atualizar_mercado.py. tipo: AÇÃO, CALL ou PUT. qtd: positivo compra, negativo venda.',
        '# vencimento: AAAA-MM-DD. origem: ultimo, mid ou teorico. grupo: principal ou comparacao (posição original dos hedges).',
        'estrutura;grupo;tipo;qtd;ticker;strike;vencimento;preco;vi;negocios;origem']
    open(SAIDA, 'w', encoding='utf-8-sig').write('\n'.join(cab + out) + '\n')
    teo = sum(1 for l in out if l.endswith('teorico')); tot = sum(1 for l in out if ';AÇÃO;' not in l)
    print(f'{len(est)} estruturas · {len(out)} linhas · data {data} · spot {S} · {teo}/{tot} pernas com preço teórico')

if __name__ == '__main__':
    main()
