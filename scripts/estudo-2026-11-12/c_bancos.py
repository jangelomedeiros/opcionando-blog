# Fichas de ITUB4, BBDC4, SANB11 e BPAC11 com pregões até 12/11/2026.
# Números de calculados/stats_*.json (calc_bancos.py) e TradingView (conector Trade).
# Opções: últimos negócios do opcoes.net.br (11/11, a grade de 12/11 ainda não estava publicada),
# com a volatilidade implícita de 11/11 reaplicada ao preço de 12/11 por Black-Scholes.
import yaml
MACRO_TAB = [
 {'ativo': 'Título 10 anos BR (BR10Y)', 'ultimo': '15,40%', 'dia': '+1,4%', 'm1': '+22,9%', 'm3': '+4,4%', 'm6': '+8,0%', 'ano': '+12,0%', 'efeito': 'IPCA e fiscal no radar', 'inverte': True},
 {'ativo': 'Dólar (USD/BRL)', 'ultimo': 'R$ 5,64', 'dia': '+1,0%', 'm1': '+13,1%', 'm3': '+8,9%', 'm6': '+13,2%', 'ano': '+3,0%', 'efeito': 'pressão no câmbio', 'inverte': True},
 {'ativo': 'Ibovespa', 'ultimo': '171.324', 'dia': '−0,4%', 'm1': '−18,1%', 'm3': '+2,5%', 'm6': '−3,9%', 'ano': '+6,3%', 'efeito': 'segurado pelos privados'},
 {'ativo': 'Índice Financeiro (IFNC)', 'ultimo': '17.041', 'dia': '−1,8%', 'm1': '−28,1%', 'm3': '−0,4%', 'm6': '−6,2%', 'ano': '−1,5%', 'efeito': 'BB puxou o índice'},
 {'ativo': 'Itaú (ITUB4)', 'ultimo': '41,68', 'dia': '−0,1%', 'm1': '−16,1%', 'm3': '+8,9%', 'm6': '+4,8%', 'ano': '+5,2%', 'efeito': 'ROE 23,6%, P/VP 2,0×'},
 {'ativo': 'Bradesco (BBDC4)', 'ultimo': '14,32', 'dia': '−0,1%', 'm1': '−33,2%', 'm3': '−13,5%', 'm6': '−18,2%', 'ano': '−22,0%', 'efeito': 'ROE 15,6%, P/VP 0,78×'},
 {'ativo': 'Banco do Brasil (BBAS3)', 'ultimo': '15,48', 'dia': '−8,3%', 'm1': '−36,8%', 'm3': '−14,9%', 'm6': '−24,7%', 'ano': '−29,8%', 'efeito': 'ROE 2,8% no 3T26, P/VP 0,49×'},
 {'ativo': 'BTG Pactual (BPAC11)', 'ultimo': '54,14', 'dia': '−3,2%', 'm1': '−33,2%', 'm3': '+8,3%', 'm6': '−0,8%', 'ano': '+1,8%', 'efeito': 'ROAE 26,7% no 2T26'},
 {'ativo': 'Santander (SANB11)', 'ultimo': '28,39', 'dia': '+3,6%', 'm1': '−1,4%', 'm3': '−4,4%', 'm6': '+5,2%', 'ano': '−17,2%', 'efeito': 'ROE 11,9%; +8,9% na semana'},
 {'ativo': 'BB Seguridade (BBSE3)', 'ultimo': '37,68', 'dia': '−5,0%', 'm1': '−7,2%', 'm3': '+1,5%', 'm6': '+9,5%', 'ano': '+4,0%', 'efeito': 'precificada como fonte de capital do BB'},
]
MACRO_PONTOS = [
 '**O choque de 12/11 foi do BB.** No dia do balanço do Banco do Brasil (−8,3%), Itaú e Bradesco fecharam praticamente estáveis e o Santander subiu 3,6%. O mercado escolheu bancos, não vendeu o setor.',
 '**Selic parada em 13,75%** desde o Copom de 04/11, e o título de 10 anos de volta a 15,40%. Juro alto por mais tempo adia a queda da inadimplência em todo o sistema.',
 '**A eleição de 25/10 segue no preço.** Todos os bancos ainda estão entre 13% e 37% abaixo de onde estavam um mês atrás, com o prêmio de risco do país mais alto.',
]
def fonte(tk, extra=''):
    return (f'**Dados:** TradingView via conector Trade (BMFBOVESPA:{tk} diário até 12/11/2026; indicadores D/S; pares e índices no fechamento de 12/11, após o leilão). '
            'Balanços do 3T26 e opiniões de analistas: Times Brasil, Investidor10, Bloomberg Línea, Money Times, Visno Invest, BB Investimentos, Genial e BP Money. '
            'Volume Profile com volume de cada pregão distribuído entre mínima e máxima, área de valor de 70%. ' + extra +
            ' Scripts em `scripts/estudo-2026-11-12/`. **Ressalvas:** probabilidades de cenário são julgamento do estudo. Material educacional do canal Opcionando, não é recomendação de investimento.')
OPC = '**Opções:** últimos negócios do opcoes.net.br de 11/11 (a grade de 12/11 ainda não estava publicada), com a volatilidade implícita de 11/11 reaplicada ao preço de 12/11 por Black-Scholes. Confira a grade antes de montar.'
F = {}
# ============ ITUB4 ============
F['itub4'] = dict(
 ticker='ITUB4', empresa='Itaú Unibanco',
 title='Teste secundário feito, balanço em linha e o preço de volta ao meio do range',
 description='O Itaú testou R$ 38,11 em 03/11, passou pelo 3T26 sem sustos (ROE de 23,6%) e voltou a R$ 41,68. O range de 38,11 a 42,60 está montado; acima dele, médias e VWAPs entre 42,9 e 43,8 seguram a alta.',
 data='2026-11-12', precoReferencia=41.68, cenario='Lateral para alta', timeframe='Diário e semanal',
 suportes=[40.36, 39.75, 38.11], resistencias=[42.6, 43.21, 44.25],
 range={'inferior': 38.11, 'superior': 42.6, 'rotulo': 'Range pós-eleição'},
 volatilidade='Implícita da grade: ~25% · HV10 27% · HV20 58% (inflada pelo gap de 26/10)',
 grafico='itub4-2026-11-12', perfil='itub4-2026-11-12',
 veredito=[
  {'rotulo': 'Preço-teto de entrada', 'valor': 'R$ 40,40', 'destaque': True, 'texto': 'Recuo à VWAP do dia do balanço (40,60), à VWAP desde a eleição (40,41) e à retração de 50% do repique (40,36). Com stop em 39,20, abaixo da POC de 20 meses, entrega 1,8:1 até 42,60 e 3,2:1 até a VAH de 20 meses (44,25).'},
  {'rotulo': 'Zona de acumulação', 'valor': 'R$ 39,75 – 40,60', 'texto': 'POC de 20 meses (39,75), POC pós-eleição (39,70), VWAP da mínima de 03/11 (40,19) e VWAP do balanço (40,60). É a maior base de volume do papel.'},
  {'rotulo': 'Range até o vencimento (18/12)', 'valor': 'R$ 38,1 – 42,6', 'texto': 'A implícita de 25% projeta R$ 38,53 – 45,11 a 1 desvio-padrão até 18/12. A volatilidade de 10 dias (27%) está alinhada à implícita: opção no preço justo.'},
  {'rotulo': 'Viés', 'valor': 'Lateral para alta', 'tom': 'neutro', 'texto': 'Clímax de 26/10, teste secundário em 03/11 sem volume climático e balanço que confirmou a qualidade. Falta vencer o bloco de médias de 42,9–43,8 para virar alta.'},
 ],
 indicadores=[
  {'nome': 'Médias móveis', 'diario': 'MMA10 40,33 · MMA20 43,21 · MMA50 43,77 · MMA200 42,92', 'semanal': 'MMA20 42,66 · MMA50 42,43 · MMA200 32,63', 'sinal': 'neutro', 'leitura': 'Acima da MMA 10, abaixo das de 20, 50 e 200 dias. No semanal, o preço está colado nas médias de 20 e 50 semanas e muito acima da de 200: a tendência longa segue de alta.'},
  {'nome': 'MME 10 / 20', 'diario': '41,43 / 42,44', 'semanal': '43,04 / 42,82', 'sinal': 'neutro', 'leitura': 'Preço acima da MME 10 diária pelo terceiro pregão. A MME 20 (42,44) é a primeira resistência dinâmica.'},
  {'nome': 'IFR 14', 'diario': '44,4 (mínima de 27,6 em 03/11)', 'semanal': '48,3', 'sinal': 'neutro', 'leitura': 'Saiu da sobrevenda para a zona neutra. O semanal mal registrou o choque.'},
  {'nome': 'Estocástico K/D', 'diario': '31,6 / 29,8', 'semanal': '21,9 / 39,0', 'sinal': 'neutro', 'leitura': 'Diário cruzado para cima; semanal ainda descendo.'},
  {'nome': 'CCI 20', 'diario': '−31', 'semanal': '−30', 'sinal': 'neutro', 'leitura': 'Neutro nos dois tempos.'},
  {'nome': 'MACD', 'diario': '−1,17 × −1,07 (hist. −0,10)', 'semanal': '0,40 × 0,60', 'sinal': 'neutro', 'leitura': 'O histograma diário encolheu de −0,22 para −0,10 e está perto de cruzar para cima.'},
  {'nome': 'ADX / DMI', 'diario': 'ADX 30,2 · +DI 24,8 · −DI 33,5', 'semanal': 'ADX 19,4', 'sinal': 'baixa', 'leitura': 'O −DI ainda lidera, mas a distância caiu. Semanal sem tendência definida.'},
  {'nome': 'Bandas de Bollinger', 'diario': '35,47 – 50,96', 'sinal': 'neutro', 'leitura': 'Abertas pelo gap de 26/10; sem utilidade como referência por enquanto.'},
  {'nome': 'ATR 14', 'diario': 'R$ 1,40 (≈ 3,4% por pregão)', 'sinal': 'neutro', 'leitura': 'Caiu de R$ 1,85 em 26/10. Stops com pelo menos R$ 1,20 de distância.'},
  {'nome': 'Volatilidade', 'diario': 'HV10 27% · HV20 58% · implícita ~25%', 'sinal': 'neutro', 'leitura': 'Sem o gap, a volatilidade realizada voltou ao normal do papel. A opção não está cara nem barata.'},
  {'nome': 'OBV', 'diario': '−135 mi desde 26/10 · −298 mi em 20 pregões', 'sinal': 'baixa', 'leitura': 'O saldo pós-eleição ainda é vendedor, concentrado em 27–30/10. De 04/11 em diante, as altas vieram com volume em queda.'},
  {'nome': 'Rating TradingView', 'diario': 'D −0,38 · venda', 'semanal': 'S −0,11 · venda', 'sinal': 'baixa', 'leitura': 'Melhorou de venda forte (−0,60 em 26/10) para venda. Osciladores neutros; médias em venda forte.'},
 ],
 indicadoresNota='O Itaú é o banco com o quadro técnico mais saudável: **IFR, CCI e estocástico já em zona neutra** e MACD perto de cruzar para cima. O que falta é preço: as médias de 20, 50 e 200 dias e a VWAP de 2026 formam um bloco entre 42,92 e 43,77 que precisa ser vencido com volume.',
 eventos=[
  {'data': '06/out', 'evento': 'Máxima histórica de R$ 50,85', 'leitura': 'Clímax de compra pós 1º turno.'},
  {'data': '26/out', 'evento': 'Clímax de venda: −13,7% com 147 mi (5,1×)', 'leitura': 'Mínima de 39,59 sobre a POC de 20 meses e fechamento a 82% do candle.'},
  {'data': '27/out–03/nov', 'evento': 'Reação a 42,60 e queda até 38,11', 'leitura': 'O teste secundário furou a mínima do clímax em R$ 1,48 com 43,5 mi (30% do volume de 26/10).'},
  {'data': '04/nov', 'evento': '3T26: lucro de R$ 12,6 bi, ROE de 23,6%. Ação +3,2%', 'leitura': 'Resultado em linha com o consenso e capital principal subindo para 12,7%.'},
  {'data': '09–12/nov', 'evento': 'Lateral entre 41,12 e 42,50 com volume de 18–22 mi', 'leitura': 'No dia do tombo do BB, o Itaú fechou em −0,1%.'},
 ],
 fluxo=[
  '**Volume secando.** Os pregões de 09 a 12/11 negociaram entre 18 e 22 milhões de ações, abaixo da média de 250 dias (28,9 mi). Sem vendedor forte e sem comprador agressivo: é o desenho de um range.',
  '**Saldo pós-eleição ainda vendedor:** 145 mi em dias de alta contra 280 mi em dias de queda nos últimos 12 pregões. O peso está nos dias 27 a 30/10.',
  '**Leitura Wyckoff:** clímax (26/10), reação automática (42,60 em 27/10) e teste secundário (38,11 em 03/11) desenham uma **fase B**. Rompimento de 42,60 com volume seria o primeiro sinal de força.',
 ],
 perfilFaixas=[{'faixa': '48 – 51', 'pct': 6.7}, {'faixa': '45 – 48', 'pct': 7.7}, {'faixa': '42 – 45', 'pct': 17.4}, {'faixa': '39 – 42', 'pct': 24.9}, {'faixa': '36 – 39', 'pct': 19.8}, {'faixa': '33 – 36', 'pct': 12.8}, {'faixa': '30 – 33', 'pct': 6.7}, {'faixa': '27 – 30', 'pct': 4.1}],
 perfilNotas=[
  '**O preço está sobre a maior base de volume do papel.** A faixa de R$ 39 a 42 concentra 25% do volume de 20 meses, e a POC está em 39,75.',
  '**Área de valor de 6 meses** de 38,75 a 42,75, com POC em 39,75: o range atual é praticamente a área de valor.',
  '**Perfil pós-eleição:** área de valor de 38,90 a 41,50, POC em 39,70. O preço fechou acima dela: quem comprou depois do choque está, na média, no lucro.',
  '**VWAPs:** balanço 40,60 · eleição 40,41 · mínima de 03/11 40,19 · 6 meses 42,06 · 2026: 42,97 · 1º turno 44,70.',
 ],
 mapa=[
  {'preco': '44,25 – 44,70', 'tipo': 'resistencia', 'confluencia': 'VAH de 20 meses e VWAP desde o 1º turno'},
  {'preco': '42,92 – 43,77', 'tipo': 'resistencia', 'confluencia': 'MMA 200 (42,92), VWAP de 2026 (42,97), MMA 20 (43,21) e MMA 50 (43,77)'},
  {'preco': '42,50 – 42,60', 'tipo': 'resistencia', 'confluencia': 'Reação automática de 27/10 e máxima de 10/11: topo do range'},
  {'preco': '41,68', 'tipo': 'preco', 'confluencia': 'Fechamento de 12/11'},
  {'preco': '40,36 – 40,60', 'tipo': 'pivo', 'confluencia': 'Retração de 50% (40,36), VWAP desde a eleição (40,41) e VWAP do dia do balanço (40,60)'},
  {'preco': '39,70 – 40,19', 'tipo': 'suporte', 'confluencia': 'POC de 20 meses (39,75), POC pós-eleição (39,70) e VWAP da mínima de 03/11 (40,19)'},
  {'preco': '38,75', 'tipo': 'suporte', 'confluencia': 'VAL de 6 meses'},
  {'preco': '38,11', 'tipo': 'suporte', 'confluencia': 'Teste secundário de 03/11: fundo do range'},
 ],
 macro={'titulo': 'O banco que o mercado comprou no dia do tombo do BB', 'fonte': 'Fechamento de 12/11/2026, TradingView. Nos juros e no dólar, alta aparece em vermelho.', 'tabela': [dict(x, destaque=True) if x['ativo'].startswith('Itaú') else x for x in MACRO_TAB], 'pontos': MACRO_PONTOS},
 micro={'titulo': '3T26: em linha, com capital subindo', 'fundamentos': [
   {'nome': 'Valor de mercado', 'valor': 'R$ 484,8 bi'}, {'nome': 'P/L · P/VP', 'valor': '10,2× · 2,0×'},
   {'nome': 'Lucro recorrente 3T26', 'valor': 'R$ 12,6 bi (+6,2% a/a)'}, {'nome': 'ROE recorrente 3T26', 'valor': '23,6% (24,3% no 2T26)'},
   {'nome': 'Inadimplência 90d', 'valor': '2,0% (+0,1 p.p. no tri e no ano)'}, {'nome': 'Capital principal', 'valor': '12,7% (12,3% em junho)'},
   {'nome': 'Índice de eficiência', 'valor': '37,5% (38,8% há 1 ano)'}, {'nome': 'Carteira de crédito', 'valor': 'R$ 1,5 tri'},
   {'nome': 'Consenso pós-balanço', 'valor': 'BTG e XP mantiveram compra'}],
  'sustentacao': ['**Capital principal subindo com o próprio lucro**, de 12,3% para 12,7%.', '**Inadimplência praticamente parada** em 2,0%, a menor entre os grandes.', '**Eficiência de 37,5%**, entre as melhores do setor.'],
  'pressao': ['**ROE recuou** 0,7 p.p. sobre o 2T26.', '**Atrasos de pequenas empresas em alta**, segundo a Bloomberg Línea.', '**Preço de 2× o patrimônio:** a qualidade já está no preço.'],
  'evento': '**Sem balanço até o vencimento de dezembro.** O próximo resultado (4T26) sai em fevereiro de 2027. Até lá, o papel responde ao juro longo e ao fluxo estrangeiro.'},
 estrutura={'nome': 'Venda de put coberta (caixa reservado)', 'racional': 'Transforma o preço-teto em ordem: vende a put de R$ 40,41 (ITUBX445), na zona de pivô do range. Se exercida em 18/12, a compra sai a R$ 39,88 líquidos, em cima da POC de 20 meses. Se não, o prêmio de 1,3% em 25 pregões fica no caixa. Delta de −0,27: cerca de 71% de chance de a put virar pó. Exige o caixa para comprar 100 ações por contrato.', 'vencimento': 'Dezembro/2026 (18/12)',
  'pernas': [{'op': 'venda', 'tipo': 'put', 'strike': 40.41, 'premio': 0.53, 'qtd': 100, 'codigo': 'ITUBX445'}]},
 plano={'titulo': 'Teto em R$ 40,40, no pivô do range', 'texto': 'A R$ 41,68, com stop em 39,20, o risco é de R$ 2,48 para R$ 0,92 até o topo do range: **0,4:1**. No pivô (40,40), a mesma operação entrega **1,8:1** até 42,60. O plano espera o recuo ou o rompimento com volume.',
  'tranches': [
   {'nome': '1 · pivô do range', 'nota': 'até 1/2 da posição', 'entrada': '40,20 – 40,60', 'gatilho': 'Recuo às VWAPs do balanço e da eleição com volume abaixo de 29 mi', 'stop': '39,20', 'alvos': '42,60 · 44,25', 'rr': '1,8 · 3,2'},
   {'nome': '2 · base de volume', 'nota': 'até 1/2 da posição', 'entrada': '38,75 – 39,75', 'gatilho': 'Teste da POC de 20 meses sem volume climático (abaixo de 50 mi)', 'stop': '37,60', 'alvos': '42,60 · 44,25', 'rr': '2,0 · 3,0'},
   {'nome': 'Alternativa', 'nota': 'compra por força', 'entrada': '> 43,80', 'gatilho': 'Fechamento acima da MMA 50 com volume acima de 38 mi (média de 20 dias)', 'stop': '42,40', 'alvos': '46,25 · 47,50', 'rr': '1,8 · 2,6'},
  ],
  'nota': 'R/R da tranche 1 a partir de 40,40; da 2, a partir de 39,25; da alternativa, a partir de 43,80. **Estrutura anterior (26/10):** a trava de alta com call 41,91/44,41 (strikes ajustados pelo JCP) foi montada com débito de R$ 1,13 e vale cerca de R$ 1,01 pelo valor teórico de 12/11: −11%, com 25 pregões e o preço em cima do strike comprado. Pode ser mantida até 18/12; o ganho máximo (R$ 2,50) exige fechamento acima de 44,41.'},
 cenarios={'titulo': 'Base R$ 39,7 – 43,8: o range entre a POC e as médias', 'linhas': [
   {'cenario': 'Baixista', 'prob': '20%', 'faixa': '37 – 39,7', 'premissas': 'Perda da POC de 20 meses com volume, juro longo acima de 16% ou contágio do BB para o setor. Novo teste de 38,11 e da VAL de 20 meses.'},
   {'cenario': 'Base', 'prob': '50%', 'faixa': '39,7 – 43,8', 'premissas': 'Range entre a base de volume e o bloco de médias, com volume abaixo da média até o vencimento.'},
   {'cenario': 'Altista', 'prob': '30%', 'faixa': '43,8 – 46,5', 'premissas': 'Rompimento de 42,60 e da MMA 50 com volume, puxado pela troca de BB por Itaú e por alívio no juro longo.'}],
  'nota': '* Probabilidades são julgamento do estudo. Com a implícita de 25% até 18/12 (25 pregões), 1 desvio-padrão vai de R$ 38,53 a 45,11.'},
 gatilhos={'melhora': ['Fechamento acima de 42,60 com volume acima de 38 mi', 'Fechamento acima da MMA 50 (43,77)', 'Título de 10 anos abaixo de 15%'],
  'piora': ['Fechamento abaixo de 39,75 (POC de 20 meses) com volume', 'Perda de 38,11', 'Contágio do BB: queda do Itaú acima de 3% em dia de notícia do setor']},
 fontes=fonte('ITUB4', OPC + ' Volatilidade implícita da série ITUBX445: 23,7%.'),
 invalidacao='Fechamento abaixo de R$ 38,11 com volume acima de 50 mi anula o teste secundário: o range rompe para baixo e o caminho fica aberto até a VAL de 20 meses (34,25).',
 validade='2026-12-18', status='Em acompanhamento', draft=False)
F['itub4_body'] = '''
## A leitura em uma frase

O Itaú cumpriu o roteiro de um fundo: **clímax em 26/10, teste secundário em 03/11 e um balanço que confirmou a
qualidade**. O range de R$ 38,11 a 42,60 está montado sobre a maior base de volume do papel. O que separa o range de
uma nova alta é o bloco de médias entre 42,92 e 43,77.

## O que mudou desde 26/10

A [análise de 26/10](/analises/itub4-2026-10-26/) via um **candidato a clímax de venda** e pedia o teste secundário.
Ele veio em 03/11, em 38,11, com 30% do volume do clímax. Depois, o 3T26 trouxe lucro de R$ 12,6 bilhões e capital
principal subindo: o papel subiu 3,2% no dia e passou a semana do balanço do BB praticamente parado.

## Por que a venda de put

O preço está no meio do range e a opção está no preço justo. Vender a put de **40,41** é pedir para comprar o banco
mais sólido do setor no pivô do range, recebendo **R$ 0,53** por isso. Se o Itaú não voltar lá, o prêmio fica no
caixa. Para a comparação entre os bancos, leia
[Quem aguenta a crise do crédito?](/blog/quem-aguenta-a-crise-do-credito/).
'''
# ============ BBDC4 ============
F['bbdc4'] = dict(
 ticker='BBDC4', empresa='Bradesco',
 title='Novo fundo em R$ 13,44 e um repique que parou na VWAP da eleição',
 description='O Bradesco furou a mínima do clímax, marcou R$ 13,44 em 03/11 e repicou até 14,84. Parou exatamente na VWAP desde a eleição e na VAL de 20 meses. A tendência segue de baixa, com o fluxo vendedor mais pesado entre os bancos.',
 data='2026-11-12', precoReferencia=14.32, cenario='Lateral para baixa', timeframe='Diário e semanal',
 suportes=[14.09, 13.75, 13.44], resistencias=[14.7, 15.25, 16.3],
 range={'inferior': 13.44, 'superior': 14.84, 'rotulo': 'Range de novembro'},
 volatilidade='Implícita da grade: ~29% · HV10 41% · HV20 93% (inflada pelo gap)',
 grafico='bbdc4-2026-11-12', perfil='bbdc4-2026-11-12',
 veredito=[
  {'rotulo': 'Preço-teto de entrada', 'valor': 'R$ 13,60', 'destaque': True, 'texto': 'Só no reteste do fundo de 03/11 (13,44) e da VAL pós-eleição (13,75). Com stop em 13,10, entrega 2,0:1 até a VAL de 20 meses (14,62) e 3,3:1 até 15,25.'},
  {'rotulo': 'Zona de defesa', 'valor': 'R$ 13,44 – 13,92', 'texto': 'Fundo de 03/11, VAL pós-eleição (13,75) e mínima de 12/11 (13,92).'},
  {'rotulo': 'Resistência', 'valor': 'R$ 14,62 – 15,25', 'texto': 'VAL de 20 meses (14,62), VWAP desde a eleição (14,70), VWAP do balanço de 23/10 (15,10) e VAH pós-eleição (15,25).'},
  {'rotulo': 'Viés', 'valor': 'Lateral para baixa', 'tom': 'baixa', 'texto': 'ADX de 42 com −DI em 44 e o pior saldo de volume entre os bancos. Osciladores em sobrevenda limitam a queda de curto prazo.'},
 ],
 indicadores=[
  {'nome': 'Médias móveis', 'diario': 'MMA10 14,15 · MMA20 16,55 · MMA50 18,00 · MMA200 18,61', 'semanal': 'MMA20 17,79 · MMA50 18,58 · MMA200 15,62', 'sinal': 'baixa', 'leitura': 'Só acima da MMA 10. Está 23% abaixo da MMA 200 diária; no semanal, perdeu as médias de 20 e 50 semanas.'},
  {'nome': 'MME 10 / 20', 'diario': '14,79 / 15,94', 'semanal': '16,95 / 17,58', 'sinal': 'baixa', 'leitura': 'O repique de 10/11 parou abaixo da MME 10 diária.'},
  {'nome': 'IFR 14', 'diario': '32,4 (mínima de 22,2 pós-eleição)', 'semanal': '36,8', 'sinal': 'neutro', 'leitura': 'Saiu da sobrevenda extrema, mas sem força para passar de 40.'},
  {'nome': 'Estocástico K/D', 'diario': '13,2 / 13,8', 'semanal': '5,9 / 24,3', 'sinal': 'neutro', 'leitura': 'No piso nos dois tempos.'},
  {'nome': 'CCI 20', 'diario': '−58', 'semanal': '−161', 'sinal': 'baixa', 'leitura': 'Semanal em extremo de venda.'},
  {'nome': 'MACD', 'diario': '−1,37 × −1,22 (hist. −0,16)', 'semanal': '−0,60 × −0,17', 'sinal': 'baixa', 'leitura': 'Histograma diário encolhendo; semanal cruzado para baixo e abrindo.'},
  {'nome': 'ADX / DMI', 'diario': 'ADX 42,5 · +DI 16,4 · −DI 43,8', 'semanal': 'ADX 19,5', 'sinal': 'baixa', 'leitura': 'A tendência de baixa mais forte entre os bancos privados.'},
  {'nome': 'Bandas de Bollinger', 'diario': '10,72 – 22,37', 'sinal': 'neutro', 'leitura': 'Abertas pelo gap; sem utilidade.'},
  {'nome': 'ATR 14', 'diario': 'R$ 0,74 (≈ 5,2% por pregão)', 'sinal': 'neutro', 'leitura': 'Stops com pelo menos R$ 0,50 de distância.'},
  {'nome': 'Volatilidade', 'diario': 'HV10 41% · HV20 93% · implícita ~29%', 'sinal': 'neutro', 'leitura': 'A grade cobra menos que a volatilidade realizada de 10 dias: **opção barata**, o que favorece estruturas compradas.'},
  {'nome': 'OBV', 'diario': '−635 mi desde 26/10 · −967 mi em 20 pregões', 'sinal': 'baixa', 'leitura': 'O pior saldo do setor. Em 12 pregões, 163 mi em dias de alta contra 798 mi em dias de queda.'},
  {'nome': 'Rating TradingView', 'diario': 'D −0,45 · venda', 'semanal': 'S −0,45 · venda', 'sinal': 'baixa', 'leitura': 'Médias em venda forte nos dois tempos; osciladores neutros.'},
 ],
 indicadoresNota='O Bradesco tem o **fluxo mais vendedor** entre os bancos: OBV de −967 milhões em 20 pregões e ADX de 42,5. Os osciladores em sobrevenda (estocástico no piso, IFR em 32) explicam os repiques, mas nenhum deles passou da VWAP da eleição.',
 eventos=[
  {'data': '22–23/out', 'evento': '3T26: lucro de R$ 7,1 bi (+14,6% a/a), ROE de 15,6%', 'leitura': '11º trimestre seguido de melhora, mas inadimplência subindo para 4,6%. Ação +0,7% no dia seguinte.'},
  {'data': '26/out', 'evento': '−21,7% com 258 mi (6,5×)', 'leitura': 'Mínima de 14,58 e fechamento em 15,95, a 92% do candle.'},
  {'data': '27/out–03/nov', 'evento': 'Cinco pregões de queda até 13,44 com 87–137 mi', 'leitura': 'A mínima do clímax caiu com volume alto: não foi um teste secundário, foi continuação.'},
  {'data': '04–10/nov', 'evento': 'Repique até 14,84 com volume caindo (78 → 39 mi)', 'leitura': 'Parou na VWAP da eleição (14,70) e na VAL de 20 meses (14,62).'},
  {'data': '12/nov', 'evento': 'Mínima de 13,92 na abertura e fechamento em 14,32 (−0,1%) com 62 mi', 'leitura': 'Contágio do BB na abertura, absorvido ao longo do dia.'},
 ],
 fluxo=[
  '**Fluxo vendedor dominante:** 163 mi em dias de alta contra 798 mi em dias de queda nos últimos 12 pregões (3 altas, 9 quedas).',
  '**O repique veio com volume em queda** (78 → 45 → 39 mi): demanda fraca. A volta ao fundo com volume menor ainda seria o sinal de exaustão a esperar.',
  '**Leitura Wyckoff:** 26/10 não foi o clímax final. A queda até 13,44 com volume alto prolonga a fase de markdown; 03/11 é o candidato a novo clímax, que precisa de teste.',
 ],
 perfilFaixas=[{'faixa': '21 – 22,75', 'pct': 7.7}, {'faixa': '19,25 – 21', 'pct': 13.2}, {'faixa': '17,5 – 19,25', 'pct': 32.4}, {'faixa': '15,75 – 17,5', 'pct': 21.1}, {'faixa': '14 – 15,75', 'pct': 11.5}, {'faixa': '12,25 – 14', 'pct': 8.9}, {'faixa': '10,5 – 12,25', 'pct': 4.9}],
 perfilNotas=[
  '**O preço caiu abaixo da área de valor de 20 meses** (14,62 – 20,38, POC em 17,88). Só 15% do volume do período foi negociado abaixo de 14,32.',
  '**O perfil pós-eleição** vai de 13,75 a 15,25, com POC em 13,95: a negociação se concentrou perto do fundo.',
  '**VWAPs:** mínima de 03/11 14,09 · eleição 14,70 · balanço 15,10 · 1º turno 17,73 · 6 meses 17,77 · 2026: 18,53.',
 ],
 mapa=[
  {'preco': '16,30 – 16,55', 'tipo': 'resistencia', 'confluencia': 'Reação automática de 27/10 e MMA 20'},
  {'preco': '15,10 – 15,25', 'tipo': 'resistencia', 'confluencia': 'VWAP do balanço de 23/10 e VAH pós-eleição'},
  {'preco': '14,62 – 14,84', 'tipo': 'resistencia', 'confluencia': 'VAL de 20 meses, VWAP da eleição (14,70) e máxima de 10/11'},
  {'preco': '14,32', 'tipo': 'preco', 'confluencia': 'Fechamento de 12/11'},
  {'preco': '14,09', 'tipo': 'pivo', 'confluencia': 'VWAP ancorada no fundo de 03/11'},
  {'preco': '13,75 – 13,95', 'tipo': 'suporte', 'confluencia': 'VAL e POC pós-eleição; mínima de 12/11 (13,92)'},
  {'preco': '13,44', 'tipo': 'suporte', 'confluencia': 'Fundo de 03/11'},
  {'preco': '12,25', 'tipo': 'suporte', 'confluencia': 'Faixa de baixo volume do perfil de 20 meses: sem suporte claro abaixo de 13,44'},
 ],
 macro={'titulo': 'Lucro crescendo, preço caindo: o mercado cobra a inadimplência', 'fonte': 'Fechamento de 12/11/2026, TradingView. Nos juros e no dólar, alta aparece em vermelho.', 'tabela': [dict(x, destaque=True) if x['ativo'].startswith('Bradesco') else x for x in MACRO_TAB], 'pontos': MACRO_PONTOS},
 micro={'titulo': '3T26: lucro crescendo, crédito no radar', 'fundamentos': [
   {'nome': 'Valor de mercado', 'valor': 'R$ 154,2 bi'}, {'nome': 'P/L · P/VP', 'valor': '5,9× · 0,78×'},
   {'nome': 'Lucro recorrente 3T26', 'valor': 'R$ 7,11 bi (+14,6% a/a)'}, {'nome': 'ROE 3T26', 'valor': '15,6% (16,1% sem o aumento de capital)'},
   {'nome': 'Inadimplência 90d', 'valor': '4,6% (+0,5 p.p. a/a)'}, {'nome': 'Capital principal · Basileia', 'valor': '12,1% · 16,0%'},
   {'nome': 'Aumento de capital', 'valor': 'R$ 10 bi, concluído no 3T26'}, {'nome': 'Carteira ampliada', 'valor': 'R$ 1,15 tri (+11,1% a/a)'},
   {'nome': 'Margem financeira', 'valor': 'R$ 21,4 bi (+14,2% a/a)'}],
  'sustentacao': ['**Onze trimestres seguidos de melhora** do lucro recorrente.', '**Capital reforçado** com R$ 10 bilhões: 12,1% de capital principal.', '**Metade da alta da inadimplência tem garantia do governo** (capital de giro com FGI), exigindo menos provisão.', '**P/L de 5,9×:** o investimento se paga mais rápido entre os bancos.'],
  'pressao': ['**Inadimplência subindo** pelo terceiro trimestre.', '**Provisões de R$ 10,6 bi** no trimestre.', '**O CEO espera inadimplência mais apertada** em todo o sistema.', '**Capital reforçado com dinheiro novo**, e não com lucro retido.'],
  'evento': '**Sem balanço até o vencimento de dezembro.** O 4T26 sai em fevereiro de 2027.'},
 estrutura={'nome': 'Trava de baixa com put (débito)', 'racional': 'A grade cobra 29% de volatilidade contra 41% realizados em 10 dias: comprar opção está barato. Compra a put de R$ 14,41 (BBDCX170) e vende a de R$ 13,41 (BBDCX160), logo abaixo do fundo de 03/11. Ganho máximo de R$ 0,69 se o papel voltar ao fundo; perda limitada ao débito de R$ 0,31. Equilíbrio em 14,10, a VWAP do fundo.', 'vencimento': 'Dezembro/2026 (18/12)',
  'pernas': [{'op': 'compra', 'tipo': 'put', 'strike': 14.41, 'premio': 0.46, 'qtd': 100, 'codigo': 'BBDCX170'}, {'op': 'venda', 'tipo': 'put', 'strike': 13.41, 'premio': 0.15, 'qtd': 100, 'codigo': 'BBDCX160'}]},
 plano={'titulo': 'Teto em R$ 13,60: comprar só no teste do fundo', 'texto': 'O fluxo ainda é vendedor e o repique parou na VWAP da eleição. Comprar a R$ 14,32 é ficar no meio do range sem vantagem. O plano espera o **teste do fundo com volume menor** ou o **rompimento de 15,25 com volume**.',
  'tranches': [
   {'nome': '1 · teste do fundo', 'nota': 'até 1/2 da posição', 'entrada': '13,44 – 13,75', 'gatilho': 'Volta ao fundo de 03/11 com volume abaixo de 78 mi (média de 20 dias) e fechamento acima de 13,44', 'stop': '13,10', 'alvos': '14,62 · 15,25', 'rr': '2,0 · 3,3'},
   {'nome': '2 · spring', 'nota': 'até 1/2 da posição', 'entrada': '13,00 – 13,44', 'gatilho': 'Perda rápida de 13,44 e recuperação no mesmo pregão ou no seguinte', 'stop': '12,70', 'alvos': '14,62', 'rr': '2,8'},
   {'nome': 'Alternativa', 'nota': 'compra por força', 'entrada': '> 15,30', 'gatilho': 'Fechamento acima da VAH pós-eleição com volume acima de 78 mi', 'stop': '14,55', 'alvos': '16,30 · 17,00', 'rr': '1,3 · 2,3'},
  ],
  'nota': 'R/R da tranche 1 a partir de 13,60; da 2, a partir de 13,20; da alternativa, a partir de 15,30. **Estrutura anterior (26/10):** a put de 14,43 (hoje 14,41, ajustada pelo JCP) vendida a R$ 0,35 vale cerca de R$ 0,46: −R$ 0,11 por ação, com o preço em cima do strike. Se exercida em 18/12, a compra sai a 14,06 efetivos, perto do fundo do range.'},
 cenarios={'titulo': 'Base R$ 13,4 – 15,3: range com viés de baixa', 'linhas': [
   {'cenario': 'Baixista', 'prob': '35%', 'faixa': '12,4 – 13,4', 'premissas': 'Perda de 13,44 com volume, sem referência de suporte até a faixa de 12,25.'},
   {'cenario': 'Base', 'prob': '45%', 'faixa': '13,4 – 15,3', 'premissas': 'Range entre o fundo de 03/11 e a VAH pós-eleição, com o fluxo vendedor perdendo força.'},
   {'cenario': 'Altista', 'prob': '20%', 'faixa': '15,3 – 16,5', 'premissas': 'Rompimento de 15,25 com volume e volta à reação automática de 27/10 (16,30).'}],
  'nota': '* Probabilidades são julgamento do estudo. Com a implícita de 29% até 18/12, 1 desvio-padrão vai de R$ 13,07 a 15,69.'},
 gatilhos={'melhora': ['Teste de 13,44 com volume abaixo de 78 mi', 'Fechamento acima de 14,84', 'Fechamento acima de 15,25 com volume'],
  'piora': ['Fechamento abaixo de 13,44 com volume acima de 78 mi', 'Novo recorde de inadimplência nos dados do Banco Central', 'Contágio do BB para os privados']},
 fontes=fonte('BBDC4', OPC + ' Volatilidade implícita das puts BBDCX170 e BBDCX160: cerca de 28%.'),
 invalidacao='Fechamento acima de R$ 15,25 com volume acima de 78 mi invalida o viés de baixa: a trava deve ser desmontada e o cenário passa a lateral para alta.',
 validade='2026-12-18', status='Em acompanhamento', draft=False)
F['bbdc4_body'] = '''
## A leitura em uma frase

O Bradesco **não teve um clímax em 26/10**: continuou caindo com volume alto até R$ 13,44 em 03/11. O repique
seguinte parou exatamente na VWAP desde a eleição (14,70) e na VAL de 20 meses (14,62). O lucro cresce, mas o
mercado cobra a inadimplência subindo.

## O que mudou desde 26/10

A [análise de 26/10](/analises/bbdc4-2026-10-26/) via um candidato a clímax e esperava o teste secundário acima de
14,58. O teste não segurou: o preço furou a mínima com volume e só parou em 13,44.

## Por que a trava de baixa com put

A grade de opções cobra menos volatilidade do que o papel está entregando: **comprar opção está barato**. A trava
compra a put de 14,41 e vende a de 13,41, apostando na volta ao fundo com risco limitado a R$ 0,31. Para a comparação
entre os bancos, leia [Quem aguenta a crise do crédito?](/blog/quem-aguenta-a-crise-do-credito/).
'''
# ============ SANB11 ============
F['sanb11'] = dict(
 ticker='SANB11', empresa='Santander Brasil',
 title='Alta de 19% desde o fundo, e o preço chegando na parede de volume',
 description='O Santander saiu de R$ 23,77 para 28,39 em oito pregões, recebendo o dinheiro que saiu do BB. Está a 4% do bloco que concentra a POC de 12 meses, a MMA 200 e a VWAP de 2026, entre 29,43 e 29,68.',
 data='2026-11-12', precoReferencia=28.39, cenario='Lateral para alta', timeframe='Diário e semanal',
 suportes=[27.94, 26.94, 26.05], resistencias=[28.9, 29.62, 32.12],
 range={'inferior': 26.94, 'superior': 29.68, 'rotulo': 'Do suporte de volume à resistência de volume'},
 volatilidade='HV10 43% · HV20 46% · HV250 33% · grade com poucos negócios (implícita pouco confiável)',
 grafico='sanb11-2026-11-12', perfil='sanb11-2026-11-12',
 veredito=[
  {'rotulo': 'Preço-teto de entrada', 'valor': 'R$ 27,40', 'destaque': True, 'texto': 'Recuo aos fechamentos de 10 e 11/11 e logo abaixo da VWAP de 6 meses (27,94). Com stop em 26,40, entrega 2,2:1 até a POC de 12 meses (29,62).'},
  {'rotulo': 'Zona de acumulação', 'valor': 'R$ 26,05 – 26,94', 'texto': 'POC pós-eleição (26,05), VAH pós-eleição (26,85) e retração de 61,8% da alta (26,94).'},
  {'rotulo': 'Parede de volume', 'valor': 'R$ 29,43 – 29,88', 'texto': 'MMA 200 (29,43), POC de 12 meses (29,62), VWAP de 2026 (29,68) e VAH de 6 meses (29,88). É onde o papel passou mais tempo no último ano.'},
  {'rotulo': 'Viés', 'valor': 'Lateral para alta', 'tom': 'neutro', 'texto': 'O curto prazo virou (rating diário de compra, MACD cruzado para cima), mas os fundamentos não melhoraram: a alta é de fluxo.'},
 ],
 indicadores=[
  {'nome': 'Médias móveis', 'diario': 'MMA10 26,09 · MMA20 26,69 · MMA50 28,41 · MMA200 29,43', 'semanal': 'MMA20 28,30 · MMA50 30,00 · MMA200 28,68', 'sinal': 'neutro', 'leitura': 'Recuperou as médias de 10 e 20 dias e encostou na de 50. A MMA 200 (29,43) é o próximo teste.'},
  {'nome': 'MME 10 / 20', 'diario': '26,84 / 26,95', 'semanal': '27,62 / 28,16', 'sinal': 'alta', 'leitura': 'Preço acima das duas no diário e acima da MME 20 semanal.'},
  {'nome': 'IFR 14', 'diario': '57,9 (mínima de 20,7 em 30/10)', 'semanal': '49,9', 'sinal': 'alta', 'leitura': 'De sobrevenda extrema a zona compradora em nove pregões.'},
  {'nome': 'Estocástico K/D', 'diario': '86,3 / 76,6', 'semanal': '31,9 / 29,9', 'sinal': 'neutro', 'leitura': 'Diário em sobrecompra: pausa provável no curto prazo.'},
  {'nome': 'CCI 20', 'diario': '+94', 'semanal': '−25', 'sinal': 'alta', 'leitura': 'Diário perto da sobrecompra.'},
  {'nome': 'MACD', 'diario': '−0,35 × −0,72 (hist. +0,37)', 'semanal': '−0,63 × −0,44', 'sinal': 'alta', 'leitura': 'Cruzou para cima no diário, com histograma crescendo.'},
  {'nome': 'ADX / DMI', 'diario': 'ADX 25,6 · +DI 33,9 · −DI 23,4', 'semanal': 'ADX 25,6', 'sinal': 'alta', 'leitura': 'O +DI assumiu a frente: é o único banco grande com tendência de alta no diário.'},
  {'nome': 'Bandas de Bollinger', 'diario': '23,74 – 29,63', 'sinal': 'neutro', 'leitura': 'A banda superior (29,63) coincide com a POC de 12 meses.'},
  {'nome': 'ATR 14', 'diario': 'R$ 0,96 (≈ 3,4% por pregão)', 'sinal': 'neutro', 'leitura': 'Stops com pelo menos R$ 0,80 de distância.'},
  {'nome': 'Volatilidade', 'diario': 'HV10 43% · HV60 33% · HV250 33%', 'sinal': 'neutro', 'leitura': 'Acima da média do ano. A grade de opções tem poucos negócios por série: os preços da tela podem estar desatualizados.'},
  {'nome': 'OBV', 'diario': '+14 mi desde 26/10 · −9 mi em 20 pregões', 'sinal': 'alta', 'leitura': 'O único banco com OBV positivo desde a eleição. Em 12 pregões, 40 mi em dias de alta contra 26 mi em dias de queda.'},
  {'nome': 'Rating TradingView', 'diario': 'D +0,31 · compra', 'semanal': 'S 0,00 · neutro', 'sinal': 'alta', 'leitura': 'Médias diárias em compra forte; semanal neutro.'},
 ],
 indicadoresNota='O Santander é o **único banco com o técnico virado para cima** no diário: MACD cruzado, +DI na frente e OBV positivo desde a eleição. O semanal ainda está neutro, e o estocástico diário em 86 pede pausa. O ponto de decisão é a parede de volume entre 29,43 e 29,88.',
 eventos=[
  {'data': '29/jan', 'evento': 'Máxima de 12 meses: R$ 37,83', 'leitura': 'Início da tendência de baixa de 2026.'},
  {'data': '26/out', 'evento': '−4,5% com 10,7 mi', 'leitura': 'A menor queda entre os bancos no dia da eleição.'},
  {'data': '28/out', 'evento': '3T26: lucro de R$ 2,9 bi (−28% a/a), ROE de 11,9%. Ação −5,9%', 'leitura': 'Abaixo do consenso de R$ 3,16 bi.'},
  {'data': '30/out', 'evento': 'Mínima de 12 meses: R$ 23,77', 'leitura': 'IFR diário em 20,7, a sobrevenda mais extrema do ano.'},
  {'data': '04 e 09/nov', 'evento': 'Duas altas acima de 5%', 'leitura': 'Gaps de alta sem volume excepcional (7,3 e 3,1 mi).'},
  {'data': '12/nov', 'evento': '+3,6% a 28,39 com 8,2 mi (2× a média)', 'leitura': 'Dia do balanço do BB: o mercado trocou um banco pelo outro.'},
 ],
 fluxo=[
  '**Fluxo comprador desde o fundo:** 40 mi em dias de alta contra 26 mi em dias de queda nos últimos 12 pregões (7 altas, 5 quedas).',
  '**O volume de 12/11 (8,2 mi) foi o dobro da média** de 250 dias: a migração vinda do BB apareceu no fluxo.',
  '**Leitura Wyckoff:** 30/10 tem cara de clímax de venda (mínima do ano com IFR em 20,7), e a alta seguinte é a reação automática. Falta o teste secundário: um recuo com volume baixo até 26,0–26,9.',
 ],
 perfilFaixas=[{'faixa': '36 – 38', 'pct': 3.9}, {'faixa': '34 – 36', 'pct': 10.4}, {'faixa': '32 – 34', 'pct': 13.9}, {'faixa': '30 – 32', 'pct': 10.3}, {'faixa': '28 – 30', 'pct': 32.1}, {'faixa': '26 – 28', 'pct': 23.5}, {'faixa': '24 – 26', 'pct': 5.7}, {'faixa': '22 – 24', 'pct': 0.2}],
 perfilNotas=[
  '**A faixa de R$ 28 a 30 concentra 32% do volume** de 12 meses, com POC em 29,62. O preço acabou de entrar nela.',
  '**Área de valor de 6 meses** de 26,88 a 29,88: o preço está no terço superior.',
  '**Perfil pós-eleição** de 24,35 a 26,85, com POC em 26,05. O preço saiu por cima: quem comprou depois da eleição está, na média, 9% no lucro.',
  '**VWAPs:** eleição 25,98 · balanço 25,90 · mínima 26,36 · 1º turno 27,49 · 6 meses 27,94 · 2026: 29,68.',
 ],
 mapa=[
  {'preco': '32,12', 'tipo': 'resistencia', 'confluencia': 'VAH de 12 meses'},
  {'preco': '29,43 – 29,88', 'tipo': 'resistencia', 'confluencia': 'MMA 200, POC de 12 meses (29,62), banda superior de Bollinger, VWAP de 2026 (29,68) e VAH de 6 meses'},
  {'preco': '28,90', 'tipo': 'resistencia', 'confluencia': 'Máxima de 12/11'},
  {'preco': '28,39', 'tipo': 'preco', 'confluencia': 'Fechamento de 12/11, sobre a MMA 50 (28,41)'},
  {'preco': '27,94', 'tipo': 'pivo', 'confluencia': 'VWAP de 6 meses'},
  {'preco': '26,85 – 27,49', 'tipo': 'suporte', 'confluencia': 'VAH pós-eleição (26,85), retração de 61,8% (26,94), VAL de 6 meses (26,88) e VWAP do 1º turno (27,49)'},
  {'preco': '25,90 – 26,36', 'tipo': 'suporte', 'confluencia': 'VWAPs da eleição, do balanço e da mínima; POC pós-eleição (26,05)'},
  {'preco': '23,77', 'tipo': 'suporte', 'confluencia': 'Mínima de 12 meses (30/10)'},
 ],
 macro={'titulo': 'O destino do dinheiro que saiu do BB', 'fonte': 'Fechamento de 12/11/2026, TradingView. Nos juros e no dólar, alta aparece em vermelho.', 'tabela': [dict(x, destaque=True) if x['ativo'].startswith('Santander') else x for x in MACRO_TAB], 'pontos': MACRO_PONTOS},
 micro={'titulo': '3T26: o mais apertado dos privados', 'fundamentos': [
   {'nome': 'Valor de mercado', 'valor': 'R$ 102,7 bi'}, {'nome': 'P/L (12 meses)', 'valor': '8,0×'},
   {'nome': 'Lucro gerencial 3T26', 'valor': 'R$ 2,885 bi (−28% a/a; −4,3% t/t)'}, {'nome': 'Consenso (Bloomberg)', 'valor': 'R$ 3,16 bi'},
   {'nome': 'ROE 3T26', 'valor': '11,9% (17,5% há 1 ano)'}, {'nome': 'Meta de ROE', 'valor': '20% em 2028'},
   {'nome': 'Inadimplência 90d', 'valor': '3,4% (+0,6 p.p. a/a)'}, {'nome': 'Capital principal · Basileia', 'valor': '10,9% · 15,1%'}],
  'sustentacao': ['**Inadimplência de curto prazo caiu** no trimestre.', '**Postura seletiva no crédito** desde 2025.', '**Preço descontado** depois de cair 37% entre janeiro e outubro.'],
  'pressao': ['**ROE abaixo da Selic** e lucro caindo há três trimestres.', '**Capital principal de 10,9%**, o mais baixo entre os privados.', '**A alta recente é de fluxo**, não de melhora nos números.'],
  'evento': '**Sem balanço até o vencimento de dezembro.** O 4T26 sai no início de 2027.'},
 estrutura={'nome': 'Venda coberta (para quem tem a unit)', 'racional': 'Para quem já carrega SANB11: vende a call de R$ 30,45 (SANBL307), acima da parede de volume de 29,43–29,88. Se o papel parar na resistência, o prêmio fica; se romper e for exercido, a venda sai a 30,45 mais o prêmio, perto da VAH de 6 meses. PRÊMIO TEÓRICO (Black-Scholes, vol de 40%): a grade tem de 1 a 8 negócios por série, e o último negócio dessa call (R$ 0,15, em 11/11) não reflete a alta do papel. Use ordem limitada e só monte com prêmio de pelo menos R$ 0,50.', 'vencimento': 'Dezembro/2026 (18/12)',
  'pernas': [{'op': 'compra', 'tipo': 'acao', 'strike': 28.39, 'premio': 0, 'qtd': 100}, {'op': 'venda', 'tipo': 'call', 'strike': 30.45, 'premio': 0.78, 'qtd': 100, 'codigo': 'SANBL307'}]},
 plano={'titulo': 'Teto em R$ 27,40: esperar o teste da alta', 'texto': 'A alta de 19% em oito pregões levou o preço para a frente da maior resistência do ano. Comprar a 28,39, com stop em 26,40, arrisca R$ 1,99 por R$ 1,23 até a POC: **0,6:1**. O plano espera o recuo ou o rompimento da parede com volume.',
  'tranches': [
   {'nome': '1 · recuo', 'nota': 'até 1/2 da posição', 'entrada': '27,00 – 27,94', 'gatilho': 'Recuo à VWAP de 6 meses com volume abaixo de 5,7 mi', 'stop': '26,40', 'alvos': '29,62 · 32,12', 'rr': '2,2 · 4,7'},
   {'nome': '2 · teste secundário', 'nota': 'até 1/2 da posição', 'entrada': '26,05 – 26,94', 'gatilho': 'Teste da POC pós-eleição com volume baixo', 'stop': '25,30', 'alvos': '28,90 · 29,62', 'rr': '2,0 · 2,6'},
   {'nome': 'Alternativa', 'nota': 'compra por força', 'entrada': '> 29,90', 'gatilho': 'Fechamento acima da VAH de 6 meses com volume acima de 5,7 mi', 'stop': '28,80', 'alvos': '32,12 · 33,62', 'rr': '2,0 · 3,4'},
  ],
  'nota': 'R/R da tranche 1 a partir de 27,40; da 2, a partir de 26,50; da alternativa, a partir de 29,90.'},
 cenarios={'titulo': 'Base R$ 26,9 – 29,9: consolidação abaixo da parede', 'linhas': [
   {'cenario': 'Baixista', 'prob': '25%', 'faixa': '24 – 26,9', 'premissas': 'Fim do fluxo vindo do BB e volta da agenda de lucro fraco. Perda de 26,85 e teste das VWAPs da eleição.'},
   {'cenario': 'Base', 'prob': '45%', 'faixa': '26,9 – 29,9', 'premissas': 'Pausa na resistência de volume e teste secundário acima de 26,9.'},
   {'cenario': 'Altista', 'prob': '30%', 'faixa': '29,9 – 32,1', 'premissas': 'Rompimento da POC de 12 meses e da MMA 200 com volume, com o fluxo de troca de bancos continuando.'}],
  'nota': '* Probabilidades são julgamento do estudo. Com volatilidade de 40% até 18/12, 1 desvio-padrão vai de R$ 25,0 a 32,2.'},
 gatilhos={'melhora': ['Fechamento acima de 29,88 com volume acima de 5,7 mi', 'Recuo até 26,9–27,9 com volume baixo', 'Inadimplência estável nos dados do Banco Central'],
  'piora': ['Fechamento abaixo de 26,85', 'Rejeição forte em 29,4–29,9 com volume', 'Corte de estimativas para o 4T26']},
 fontes=fonte('SANB11', 'Histórico diário de 12 meses (250 pregões, de 10/11/2025 a 12/11/2026). **Opções:** grade do opcoes.net.br com 1 a 8 negócios por série em 11/11; prêmio da estrutura calculado por Black-Scholes com volatilidade de 40% (premissa entre a HV10 e a HV20). Confira a grade antes de montar.'),
 invalidacao='Fechamento abaixo de R$ 26,85 com volume acima de 5,7 mi anula a leitura de reação: o papel volta para dentro do perfil pós-eleição e o caminho fica aberto até 25,90.',
 validade='2026-12-18', status='Em acompanhamento', draft=False)
F['sanb11_body'] = '''
## A leitura em uma frase

O Santander saiu de **R$ 23,77 para 28,39 em oito pregões**, o melhor desempenho entre os bancos desde a eleição. O
fluxo veio em parte do BB. A alta parou a 4% da maior parede de volume do ano, entre 29,43 e 29,88.

## Por que a venda coberta

O técnico melhorou, mas os números do banco não: ROE de 11,9%, lucro caindo e capital no menor nível entre os
privados. Para quem já tem a unit, a venda coberta acima da parede de volume **cobra para esperar**: se o papel
travar na resistência, o prêmio fica; se romper, a venda sai num preço que o próprio estudo considera um bom alvo.

A grade do Santander tem poucos negócios. **Use ordem limitada** e não aceite o preço da tela sem conferir as
ofertas. Para a comparação entre os bancos, leia
[Quem aguenta a crise do crédito?](/blog/quem-aguenta-a-crise-do-credito/).
'''
# ============ BPAC11 ============
F['bpac11'] = dict(
 ticker='BPAC11', empresa='BTG Pactual',
 title='Do gap de +22% ao gap de −25%: o preço de volta à POC de 12 meses',
 description='O BTG subiu 22% no 1º turno e devolveu tudo na eleição, com mínima de R$ 48,93 e fechamento na máxima em R$ 60. Depois, escorregou até 50 e voltou para 54,14, exatamente sobre a POC de 12 meses. O balanço do 3T26 ainda não saiu.',
 data='2026-11-12', precoReferencia=54.14, cenario='Lateral', timeframe='Diário e semanal',
 suportes=[53.73, 50.9, 50.0], resistencias=[55.54, 58.18, 59.75],
 range={'inferior': 50.0, 'superior': 58.18, 'rotulo': 'Range de novembro'},
 volatilidade='HV10 57% · HV20 111% · HV250 50% · sem grade de opções listada no opcoes.net.br',
 grafico='bpac11-2026-11-12', perfil='bpac11-2026-11-12',
 veredito=[
  {'rotulo': 'Preço-teto de entrada', 'valor': 'R$ 51,20', 'destaque': True, 'texto': 'Na VAL pós-eleição (50,90) e no nó de volume de 51,90, perto do fundo de 03/11 (50,00). Com stop em 48,40, abaixo da mínima de 12 meses, entrega 1,5:1 até 55,50 e 2,5:1 até 58,18.'},
  {'rotulo': 'Zona de acumulação', 'valor': 'R$ 50,00 – 51,90', 'texto': 'Fundo de 03/11, VAL de 12 meses (50,25), VAL pós-eleição (50,90) e HVN de 51,90.'},
  {'rotulo': 'Resistência', 'valor': 'R$ 58,18 – 59,75', 'texto': 'Máxima de 10/11, MMA 200 (58,47), VWAPs de 2026 (58,83) e de 6 meses (58,96) e VAH de 12 meses (59,75).'},
  {'rotulo': 'Viés', 'valor': 'Lateral', 'tom': 'neutro', 'texto': 'Preço sobre a POC de 12 meses e no meio do range de novembro. ADX alto por causa dos dois gaps; o balanço do 3T26 é o próximo evento.'},
 ],
 indicadores=[
  {'nome': 'Médias móveis', 'diario': 'MMA10 54,32 · MMA20 63,68 · MMA50 64,79 · MMA200 58,47', 'semanal': 'MMA20 60,10 · MMA50 57,73 · MMA200 39,94', 'sinal': 'baixa', 'leitura': 'Na MMA 10 e abaixo das demais diárias. No semanal, abaixo das médias de 20 e 50 semanas, mas 36% acima da de 200: a tendência longa ainda é de alta.'},
  {'nome': 'MME 10 / 20', 'diario': '56,84 / 60,55', 'semanal': '61,84 / 60,79', 'sinal': 'baixa', 'leitura': 'O preço perdeu a MME 10 diária em 12/11.'},
  {'nome': 'IFR 14', 'diario': '36,2 (mínima de 27,5 pós-eleição)', 'semanal': '45,3', 'sinal': 'neutro', 'leitura': 'Recuperou da sobrevenda, sem força.'},
  {'nome': 'Estocástico K/D', 'diario': '19,7 / 21,3', 'semanal': '13,5 / 36,0', 'sinal': 'baixa', 'leitura': 'Cruzado para baixo nos dois tempos.'},
  {'nome': 'CCI 20', 'diario': '−58', 'semanal': '−48', 'sinal': 'neutro', 'leitura': 'Neutro.'},
  {'nome': 'MACD', 'diario': '−4,02 × −3,08 (hist. −0,94)', 'semanal': '1,80 × 2,63', 'sinal': 'baixa', 'leitura': 'Histograma diário encolhendo; semanal cruzado para baixo.'},
  {'nome': 'ADX / DMI', 'diario': 'ADX 41,9 · +DI 22,2 · −DI 42,9', 'semanal': 'ADX 25,8', 'sinal': 'baixa', 'leitura': 'O ADX alto reflete os dois gaps de outubro.'},
  {'nome': 'Bandas de Bollinger', 'diario': '40,54 – 86,81', 'sinal': 'neutro', 'leitura': 'Distorcidas pelos gaps; sem utilidade.'},
  {'nome': 'ATR 14', 'diario': 'R$ 3,51 (≈ 6,5% por pregão)', 'sinal': 'neutro', 'leitura': 'O maior ATR relativo entre os bancos privados. Posição menor.'},
  {'nome': 'Volatilidade', 'diario': 'HV10 57% · HV20 111% · HV250 50%', 'sinal': 'neutro', 'leitura': 'Volatilidade estrutural mais alta que a dos bancos de varejo.'},
  {'nome': 'OBV', 'diario': '−66 mi desde 26/10 · −185 mi em 20 pregões', 'sinal': 'baixa', 'leitura': 'Em 12 pregões, 99 mi em dias de alta contra 165 mi em dias de queda.'},
  {'nome': 'Rating TradingView', 'diario': 'D −0,47 · venda', 'semanal': 'S −0,29 · venda', 'sinal': 'baixa', 'leitura': 'Médias diárias em venda forte; osciladores neutros.'},
 ],
 indicadoresNota='Os indicadores do BTG estão distorcidos pelos **dois maiores gaps do setor** (+22,5% em 05/10 e −24,8% em 26/10). Descontado isso, o quadro é de lateralização: IFR em 36, CCI neutro e o preço exatamente sobre a POC de 12 meses.',
 eventos=[
  {'data': '05/out', 'evento': 'Gap de +22,5% com 62 mi, máxima de R$ 84,59', 'leitura': 'O papel mais sensível ao 1º turno entre os bancos.'},
  {'data': '26/out', 'evento': 'Abertura em 50,00 (−37%), mínima de 48,93 e fechamento em 60,00 (−24,8%) com 113 mi', 'leitura': 'Fechamento a 96% do candle: a maior recuperação intradiária entre os bancos no dia da eleição.'},
  {'data': '27/out–03/nov', 'evento': 'Queda de 61,50 a 50,00 em cinco pregões', 'leitura': 'A recuperação de 26/10 foi toda devolvida.'},
  {'data': '04–10/nov', 'evento': 'Repique até 58,18 com volume caindo', 'leitura': 'Parou abaixo da MMA 200 e das VWAPs de 2026.'},
  {'data': '12/nov', 'evento': '−3,2% a 54,14 com 15,4 mi', 'leitura': 'Contágio leve do balanço do BB.'},
 ],
 fluxo=[
  '**Fluxo vendedor nos últimos 12 pregões:** 99 mi em dias de alta contra 165 mi em dias de queda.',
  '**O volume está voltando ao normal** (12–15 mi, contra média de 250 dias de 11,4 mi), depois de 113 mi em 26/10.',
  '**Leitura Wyckoff:** o range de 50,00 a 58,18 é uma área de equilíbrio sobre a POC de 12 meses. Sem clímax claro, a direção deve sair do balanço do 3T26.',
 ],
 perfilFaixas=[{'faixa': '80 – 85', 'pct': 3.0}, {'faixa': '75 – 80', 'pct': 6.4}, {'faixa': '70 – 75', 'pct': 0.0}, {'faixa': '65 – 70', 'pct': 0.3}, {'faixa': '60 – 65', 'pct': 16.1}, {'faixa': '55 – 60', 'pct': 32.8}, {'faixa': '50 – 55', 'pct': 39.3}, {'faixa': '45 – 50', 'pct': 2.1}],
 perfilNotas=[
  '**A faixa de R$ 50 a 55 concentra 39% do volume de 12 meses**, com POC em 54,25. O preço está no centro de gravidade do papel.',
  '**Vazio de volume de 65 a 75:** o gap do 1º turno criou uma faixa sem negociação. Se o preço voltar a 65, tende a atravessá-la rápido.',
  '**Perfil pós-eleição** de 50,90 a 58,10, com POC em 53,90: praticamente o range de novembro.',
  '**VWAPs:** eleição 55,54 · 2026: 58,83 · 6 meses 58,96 · 1º turno 65,36.',
 ],
 mapa=[
  {'preco': '63,68 – 65,36', 'tipo': 'resistencia', 'confluencia': 'MMA 20 e VWAP desde o 1º turno'},
  {'preco': '58,18 – 59,75', 'tipo': 'resistencia', 'confluencia': 'Máxima de 10/11, MMA 200, VWAPs de 2026 e de 6 meses, VAH de 12 meses'},
  {'preco': '55,22 – 56,70', 'tipo': 'resistencia', 'confluencia': 'Retrações de 50% e 61,8% da queda pós-eleição e VWAP desde a eleição (55,54)'},
  {'preco': '54,14', 'tipo': 'preco', 'confluencia': 'Fechamento de 12/11, sobre a POC de 12 meses (54,25)'},
  {'preco': '53,73', 'tipo': 'pivo', 'confluencia': 'Retração de 38,2% e POC pós-eleição (53,90)'},
  {'preco': '50,90 – 51,90', 'tipo': 'suporte', 'confluencia': 'VAL pós-eleição e HVN'},
  {'preco': '50,00 – 50,25', 'tipo': 'suporte', 'confluencia': 'Fundo de 03/11 e VAL de 12 meses'},
  {'preco': '48,73 – 48,93', 'tipo': 'suporte', 'confluencia': 'Mínimas de junho e de 26/10: fundo de 12 meses'},
 ],
 macro={'titulo': 'O banco mais rentável, com a ação mais volátil', 'fonte': 'Fechamento de 12/11/2026, TradingView. Nos juros e no dólar, alta aparece em vermelho.', 'tabela': [dict(x, destaque=True) if x['ativo'].startswith('BTG') else x for x in MACRO_TAB], 'pontos': MACRO_PONTOS},
 micro={'titulo': 'Rentabilidade no topo, 3T26 a caminho', 'fundamentos': [
   {'nome': 'Valor de mercado', 'valor': 'R$ 217,6 bi'}, {'nome': 'P/L (12 meses)', 'valor': '11,9×'},
   {'nome': 'Lucro ajustado 2T26', 'valor': 'R$ 5,1 bi (+23% a/a), recorde'}, {'nome': 'ROAE 2T26', 'valor': '26,7%'},
   {'nome': 'Carteira de crédito', 'valor': 'R$ 366,6 bi (+24% em 12 meses)'}, {'nome': 'Eficiência 2T26', 'valor': '37,1%'},
   {'nome': 'Prévia do 3T26 (Santander)', 'valor': 'R$ 5,25 bi (+15% a/a)'}],
  'sustentacao': ['**O ROE mais alto do setor** e recordes trimestre após trimestre.', '**Pouca exposição ao crédito de pessoa física de baixa renda**, onde a crise mais aperta.', '**Receitas diversificadas:** banco de investimento, gestão de patrimônio e crédito corporativo.'],
  'pressao': ['**Carteira crescendo 24% ao ano:** crédito novo demora a mostrar a qualidade.', '**Ação mais sensível ao risco-país**, como mostraram os gaps de outubro.', '**Captação perdendo força** no 2T26, segundo o Monitor do Mercado.'],
  'evento': '**Balanço do 3T26 ainda não divulgado.** É o evento que deve tirar o papel do range de 50–58.'},
 estrutura={'nome': 'Compra da unit em tranches (sem grade de opções)', 'racional': 'O opcoes.net.br não lista grade de opções para BPAC11, e montar estrutura sem liquidez custa caro no spread. A estrutura é a própria unit, comprada na zona de acumulação de 50,00–51,90 com stop abaixo da mínima de 12 meses (48,40). O risco por unit é de R$ 2,80 a partir de 51,20; dimensione a posição por esse número.', 'vencimento': 'Até o balanço do 3T26',
  'pernas': [{'op': 'compra', 'tipo': 'acao', 'strike': 51.2, 'premio': 0, 'qtd': 100}]},
 plano={'titulo': 'Teto em R$ 51,20: comprar no fundo do range', 'texto': 'A 54,14, com stop em 48,40, o risco é de R$ 5,74 para R$ 4,04 até o topo do range: **0,7:1**. No fundo do range (51,20), a relação sobe para **2,5:1**. Com o balanço a caminho, meia posição no máximo antes do número.',
  'tranches': [
   {'nome': '1 · fundo do range', 'nota': 'até 1/2 da posição', 'entrada': '50,50 – 51,90', 'gatilho': 'Recuo à VAL pós-eleição com volume abaixo de 23 mi (média de 20 dias)', 'stop': '48,40', 'alvos': '55,50 · 58,18', 'rr': '1,5 · 2,5'},
   {'nome': '2 · após o balanço', 'nota': 'até 1/2 da posição', 'entrada': '51,00 – 54,25', 'gatilho': 'Balanço do 3T26 com ROE acima de 25% e fechamento acima da POC (54,25) no dia seguinte', 'stop': '49,90', 'alvos': '58,18 · 59,75', 'rr': '2,1 · 2,6'},
   {'nome': 'Alternativa', 'nota': 'compra por força', 'entrada': '> 58,30', 'gatilho': 'Fechamento acima de 58,18 com volume acima de 23 mi', 'stop': '55,80', 'alvos': '61,50 · 63,70', 'rr': '1,3 · 2,2'},
  ],
  'nota': 'R/R da tranche 1 a partir de 51,20; da 2, a partir de 52,60; da alternativa, a partir de 58,30.'},
 cenarios={'titulo': 'Base R$ 50 – 58: equilíbrio sobre a POC até o balanço', 'linhas': [
   {'cenario': 'Baixista', 'prob': '25%', 'faixa': '46 – 50', 'premissas': 'Balanço com piora de crédito ou captação, e perda do fundo de 12 meses.'},
   {'cenario': 'Base', 'prob': '50%', 'faixa': '50 – 58,3', 'premissas': 'Balanço em linha com a prévia (R$ 5,25 bi) e range mantido.'},
   {'cenario': 'Altista', 'prob': '25%', 'faixa': '58,3 – 63,7', 'premissas': 'Balanço acima da prévia e rompimento da MMA 200 e das VWAPs de 2026.'}],
  'nota': '* Probabilidades são julgamento do estudo. Com a volatilidade de 10 dias (57%) até 18/12, 1 desvio-padrão vai de R$ 45,2 a 64,8.'},
 gatilhos={'melhora': ['Balanço do 3T26 acima da prévia de R$ 5,25 bi', 'Fechamento acima de 58,18 com volume', 'Captação líquida voltando a crescer'],
  'piora': ['Fechamento abaixo de 50,00 com volume', 'Perda da mínima de 12 meses (48,73)', 'Sinal de piora na carteira de crédito no balanço']},
 fontes=fonte('BPAC11', 'Histórico diário de 12 meses (250 pregões, de 10/11/2025 a 12/11/2026). Fundamentos do 2T26 (BP Money e Monitor do Mercado) e prévia do 3T26 do Santander (Eu Quero Investir). Sem grade de opções listada no opcoes.net.br.'),
 invalidacao='Fechamento abaixo de R$ 50,00 com volume acima de 23 mi rompe o range para baixo e cancela a tranche 1: o próximo suporte é a mínima de 12 meses (48,73).',
 validade='2026-12-18', status='Em acompanhamento', draft=False)
F['bpac11_body'] = '''
## A leitura em uma frase

Em três semanas, o BTG subiu 22% num dia e caiu 25% em outro. Depois da poeira, o preço está **exatamente sobre a
POC de 12 meses** (54,25), no meio de um range de 50 a 58. O balanço do 3T26, ainda não divulgado, deve decidir a
saída.

## Por que sem opção

O BTG é o banco mais rentável do setor, mas a ação é a mais volátil e **não tem grade de opções listada** no
opcoes.net.br. Sem liquidez, o spread come qualquer vantagem da estrutura. Por isso a ficha usa a própria unit, em
tranches, com o stop abaixo da mínima de 12 meses. Para a comparação entre os bancos, leia
[Quem aguenta a crise do crédito?](/blog/quem-aguenta-a-crise-do-credito/).
'''
for k in ['itub4', 'bbdc4', 'sanb11', 'bpac11']:
    txt = yaml.dump(F[k], allow_unicode=True, sort_keys=False, width=4000, default_flow_style=None)
    open(f'src/content/analises/{k}-2026-11-12.md', 'w').write('---\n' + txt + '---\n' + F[k + '_body'])
    print('ok', k)
