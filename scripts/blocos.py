import yaml, json, re, sys
ST = json.load(open('dados-brutos/2026-10-26/calculados/stats6.json'))
DIR = 'src/content/analises/'

def br(x, d=2):
    s = f'{x:,.{d}f}'
    return s.replace(',', 'X').replace('.', ',').replace('X', '.')

def faixas(tk):
    out = []
    for a, b, p in ST[tk]['faixas']:
        if p == 0: continue
        fa = br(a, 1 if a % 1 else 0); fb = br(b, 1 if b % 1 else 0)
        out.append({'faixa': f'{fa} – {fb}', 'pct': p})
    return out

DOLAR = {'ativo': 'Dólar (USD/BRL)', 'ultimo': 'R$ 5,40', 'dia': '+8,2%', 'm1': '—', 'm3': '—', 'm6': '—', 'ano': '—', 'efeito': '5ª maior alta diária desde o Real', 'inverte': True}
BR10 = {'ativo': 'Título 10 anos BR (BR10Y)', 'ultimo': '15,42%', 'm1': '+8,3%', 'm3': '+4,3%', 'm6': '+10,1%', 'ano': '+12,1%', 'efeito': 'juro longo voltou a subir', 'inverte': True}
IBOV = {'ativo': 'Ibovespa', 'ultimo': '176.608', 'dia': '−13,9%', 'm1': '−4,0%', 'm3': '+0,7%', 'm6': '−6,4%', 'ano': '+9,6%', 'efeito': 'circuit breaker'}
FONTE_MACRO = 'Fechamento de 26/10. Dólar segundo o InfoMoney; demais dados do TradingView. Para títulos e dólar, as colunas sem dado aparecem com traço. Nos juros e no dólar, alta aparece em vermelho.'
BANCOS = [
    BR10, DOLAR, IBOV,
    {'ativo': 'Índice Financeiro (IFNC)', 'ultimo': '18.089', 'dia': '−22,5%', 'm1': '−7,2%', 'm3': '−3,4%', 'm6': '−8,0%', 'ano': '+4,6%', 'efeito': 'setor puxou a queda'},
    {'ativo': 'Itaú (ITUB4)', 'ultimo': '41,70', 'dia': '−13,7%', 'm1': '−0,4%', 'm3': '−4,1%', 'm6': '−4,9%', 'ano': '+5,2%', 'efeito': 'ROE 22%, P/VP 2,1×'},
    {'ativo': 'Bradesco (BBDC4)', 'ultimo': '15,95', 'dia': '−21,7%', 'm1': '−10,1%', 'm3': '−15,7%', 'm6': '−18,1%', 'ano': '−13,1%', 'efeito': 'ROE 14%, P/VP 0,86×'},
    {'ativo': 'Banco do Brasil (BBAS3)', 'ultimo': '17,47', 'dia': '−29,3%', 'm1': '−18,9%', 'm3': '−16,5%', 'm6': '−20,9%', 'ano': '−20,8%', 'efeito': 'ROE 6,8%, P/VP 0,55×'},
    {'ativo': 'BTG Pactual (BPAC11)', 'ultimo': '60,00', 'dia': '−24,8%', 'm1': '−4,2%', 'm3': '+4,6%', 'm6': '+0,2%', 'ano': '+12,8%', 'efeito': 'devolveu o ano em um dia'},
    {'ativo': 'Santander (SANB11)', 'ultimo': '26,30', 'dia': '−4,5%', 'm1': '−11,1%', 'm3': '−5,1%', 'm6': '−9,8%', 'ano': '−23,3%', 'efeito': 'menor queda do setor'},
]
PETROLEO = [
    {'ativo': 'Brent (BRN1!) US$/barril', 'ultimo': '109,70', 'dia': '−0,9%', 'm1': '+10,0%', 'm3': '+30,6%', 'm6': '−1,7%', 'ano': '+80,2%', 'efeito': 'barril de três dígitos'},
    {'ativo': 'WTI (CL1!) US$/barril', 'ultimo': '100,84', 'dia': '−0,9%', 'm1': '+6,4%', 'm3': '+26,0%', 'm6': '−7,5%', 'ano': '+75,6%', 'efeito': 'acompanha o Brent'},
    DOLAR, BR10, IBOV,
    {'ativo': 'Petrobras (PETR4)', 'ultimo': '53,88', 'dia': '−8,2%', 'm1': '+10,4%', 'm3': '+31,4%', 'm6': '+12,0%', 'ano': '+74,0%', 'efeito': 'P/L 5,2×, ROE 30%'},
    {'ativo': 'Petrobras (PETR3)', 'ultimo': '60,80', 'dia': '−6,8%', 'm1': '+13,0%', 'm3': '+32,2%', 'm6': '+13,9%', 'ano': '+86,4%', 'efeito': 'ordinária'},
    {'ativo': 'PRIO (PRIO3)', 'ultimo': '71,14', 'dia': '−3,6%', 'm1': '+18,6%', 'm3': '+28,4%', 'm6': '+9,4%', 'ano': '+71,8%', 'efeito': 'sem controle estatal'},
    {'ativo': 'Brava (BRAV3)', 'ultimo': '19,09', 'dia': '−12,0%', 'm1': '+9,6%', 'm3': '−10,1%', 'm6': '−0,8%', 'ano': '+13,6%', 'efeito': 'júnior alavancada'},
    {'ativo': 'PetroReconcavo (RECV3)', 'ultimo': '11,14', 'dia': '−13,0%', 'm1': '+4,0%', 'm3': '+7,4%', 'm6': '−15,0%', 'ano': '−2,5%', 'efeito': 'júnior em terra'},
]

def marca(tab, nome):
    out = []
    for r in tab:
        r = dict(r)
        if nome in r['ativo']: r['destaque'] = True
        out.append(r)
    return out

def rows_ind(tk, novos):
    """novos: dict com 'medias', 'mme', 'estoc', 'cci', 'atr', 'rating'"""
    return novos

def aplica(tk, cfg):
    p = DIR + f'{tk.lower()}-2026-10-26.md'
    raw = open(p).read()
    m = re.match(r'^---\n(.*?)\n---\n(.*)$', raw, re.S)
    fm = yaml.safe_load(m.group(1)); body = m.group(2)
    ind = fm['indicadores']
    novo = []
    for r in ind:
        n = r['nome']
        if n == 'Médias móveis':
            r = {**r, **cfg['medias']}
        elif n.startswith('MME'):
            r = cfg['mme']
        elif n.startswith('Estocástico'):
            continue
        novo.append(r)
        if n.startswith('MACD'):
            pass
    # insere Estocástico e CCI depois do IFR, ATR depois de Bollinger, Rating no fim
    out = []
    for r in novo:
        out.append(r)
        if r['nome'].startswith('IFR'):
            out += [cfg['estoc'], cfg['cci']]
        if r['nome'].startswith('Bandas'):
            out.append(cfg['atr'])
    out.append(cfg['rating'])
    fm['indicadores'] = out
    # monta frontmatter na ordem
    ordem = []
    for k, v in fm.items():
        if k == 'indicadores':
            ordem.append(('veredito', cfg['veredito']))
            ordem.append((k, v))
            ordem.append(('indicadoresNota', cfg['nota']))
        elif k == 'mapa':
            ordem.append(('fluxo', cfg['fluxo']))
            ordem.append(('perfilFaixas', faixas(tk)))
            ordem.append(('perfilNotas', cfg['perfilNotas']))
            ordem.append((k, v))
        elif k == 'estrutura':
            ordem.append(('macro', cfg['macro']))
            ordem.append(('micro', cfg['micro']))
            ordem.append((k, v))
        elif k == 'invalidacao':
            ordem.append(('plano', cfg['plano']))
            ordem.append(('cenarios', cfg['cenarios']))
            ordem.append(('gatilhos', cfg['gatilhos']))
            ordem.append(('fontes', cfg['fontes']))
            ordem.append((k, v))
        elif k in ('veredito', 'indicadoresNota', 'fluxo', 'perfilFaixas', 'perfilNotas', 'macro', 'micro', 'plano', 'cenarios', 'gatilhos', 'fontes'):
            continue
        else:
            ordem.append((k, v))
    novo_fm = dict(ordem)
    txt = yaml.dump(novo_fm, allow_unicode=True, sort_keys=False, width=4000, default_flow_style=None)
    for a, b in cfg.get('corpo', []):
        assert a in body, (tk, a[:50]); body = body.replace(a, b)
    open(p, 'w').write('---\n' + txt + '---\n' + body)
    print('ok', tk)

FONTES = lambda tk, extra: f'**Dados:** TradingView via conector Trade (BMFBOVESPA:{tk} diário, 422 pregões de 17/fev/25 a 26/out/26; indicadores D/S; pares e índices); pregão de 26/10 segundo o InfoMoney{extra}. Volume Profile calculado distribuindo o volume de cada pregão uniformemente entre mínima e máxima, área de valor de 70%. **Ressalvas:** preços antigos aparecem ajustados por proventos. Fundamentos sem data são do snapshot TTM do TradingView. Probabilidades de cenário são julgamento do estudo. Material educacional do canal Opcionando, não é recomendação de investimento.'
