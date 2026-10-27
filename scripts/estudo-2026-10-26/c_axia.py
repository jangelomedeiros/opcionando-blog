exec(open('scripts/blocos.py').read())
ELETRICAS = [
 {'ativo': 'Índice de Energia Elétrica (IEEX)', 'ultimo': '123.173', 'dia': '−17,2%', 'm1': '−5,7%', 'm3': '−2,1%', 'm6': '−11,2%', 'ano': '0,0%', 'efeito': 'setor devolveu o ano'},
 BR10, DOLAR, IBOV,
 {'ativo': 'Axia (AXIA3)', 'ultimo': '50,80', 'dia': '−12,4%', 'm1': '−6,3%', 'm3': '−3,2%', 'm6': '−17,8%', 'ano': '−0,2%', 'efeito': 'P/L 11,6×, DY 7,8%'},
 {'ativo': 'Equatorial (EQTL3)', 'ultimo': '34,84', 'dia': '−28,7%', 'm1': '−11,9%', 'm3': '−12,3%', 'm6': '−17,2%', 'ano': '−9,8%', 'efeito': 'distribuidora, liderou outubro'},
 {'ativo': 'Energisa (ENGI11)', 'ultimo': '47,29', 'dia': '−28,9%', 'm1': '−7,3%', 'm3': '−8,0%', 'm6': '−11,2%', 'ano': '−0,6%', 'efeito': 'distribuidora, liderou outubro'},
 {'ativo': 'Copel (CPLE3)', 'ultimo': '15,10', 'dia': '−12,9%', 'm1': '−3,0%', 'm3': '−0,3%', 'm6': '−6,1%', 'ano': '+21,7%', 'efeito': 'par ex-estatal'},
 {'ativo': 'Engie Brasil (EGIE3)', 'ultimo': '27,50', 'dia': '−10,7%', 'm1': '−5,0%', 'm3': '−10,6%', 'm6': '−21,0%', 'ano': '−11,8%', 'efeito': 'geradora'},
 {'ativo': 'Cemig (CMIG4)', 'ultimo': '10,34', 'dia': '−11,4%', 'm1': '−5,1%', 'm3': '−9,3%', 'm6': '−19,2%', 'ano': '−7,8%', 'efeito': 'estatal mineira'},
 {'ativo': 'Taesa (TAEE11)', 'ultimo': '40,50', 'dia': '−9,5%', 'm1': '−1,1%', 'm3': '0,0%', 'm6': '−6,1%', 'ano': '−4,0%', 'efeito': 'transmissão'},
]
cfg = {
 'veredito': [
  {'rotulo': 'Preço-teto de entrada', 'valor': 'R$ 48,70', 'destaque': True, 'texto': 'Fundo de agosto (48,64) e Fibonacci 50% da alta desde fev/25 (48,58). Com stop em R$ 45,90, entrega 2,2:1 até a POC de 6 meses e 2,8:1 até o topo da caixa. A R$ 50,80 a relação cai para 0,8:1.'},
  {'rotulo': 'Zona de acumulação', 'valor': 'R$ 46,4 – 48,6', 'texto': 'Mínima do spring (46,40), VWAP desde a mínima de 20 meses (47,57), LVN 47,88 e fundo de agosto.'},
  {'rotulo': 'Range 6 meses (base)', 'valor': 'R$ 46 – 60', 'texto': 'Extremos plausíveis R$ 40 – 66. Volatilidade 20d: 60% a.a., quase o dobro da média do ano (34%).'},
  {'rotulo': 'Viés', 'valor': 'Lateral / spring', 'tom': 'neutro', 'texto': 'Furou a caixa e voltou com volume alto. Tendência primária de alta no semanal; falta o teste do spring.'},
 ],
 'medias': {'diario': 'MMA20 57,93 · MMA50 55,45 · MMA100 53,88 · MMA200 55,82', 'semanal': 'MMA20 54,00 · MMA50 54,86 · MMA200 37,30', 'leitura': 'Abaixo de todas as médias diárias, emboladas entre R$ 53,88 e R$ 57,93, que viram resistência. No semanal, a MMA de 200 semanas (37,30) mostra que a tendência primária segue de alta.'},
 'mme': {'nome': 'MME 10 / 20', 'diario': '57,29 / 57,40', 'semanal': '55,36 / 54,89', 'sinal': 'baixa', 'leitura': 'Cruzadas para baixo no diário e R$ 6,50 acima do preço. No semanal, ainda cruzadas para cima.'},
 'estoc': {'nome': 'Estocástico K/D', 'diario': '29,8 / 42,6', 'semanal': '60,0 / 75,2', 'sinal': 'baixa', 'leitura': 'Cruzado para baixo nos dois tempos. Em 15/10, o semanal estava em sobrecompra (86).'},
 'cci': {'nome': 'CCI 20', 'diario': '−251', 'semanal': '−133', 'sinal': 'neutro', 'leitura': 'Esticado para baixo nos dois tempos. Em 15/10 o CCI semanal estava em +178.'},
 'atr': {'nome': 'ATR 14', 'diario': 'R$ 2,29 (≈ 4,5% por pregão)', 'sinal': 'neutro', 'leitura': 'Era R$ 1,61 (2,8%) em 15/10. Stops precisam de mais espaço.'},
 'rating': {'nome': 'Rating TradingView', 'diario': 'D −0,60 · venda forte', 'semanal': 'S −0,20 · venda', 'sinal': 'baixa', 'leitura': 'Venda forte no diário, venda no semanal. Em 15/10 era compra nos dois (D +0,45 · S +0,42).'},
 'nota': 'Em sete pregões, a Axia foi da sobrecompra semanal (estocástico em 86, CCI em +178) ao extremo oposto no diário (**CCI em −251, IFR em 31**). As médias de 50, 100 e 200 dias estão emboladas entre R$ 53,88 e R$ 57,93 e formam o teto do range. O que segura a leitura de longo prazo é o semanal: a MMA de 200 semanas está em 37,30 e o MACD semanal segue acima do sinal.',
 'fluxo': [
  '**O saldo de outubro segue comprador.** Nos 20 pregões até hoje, 248 mi de ações em dias de alta contra 210 mi em dias de queda (10 a 10). Em 15/10 era 229 × 182 mi. Em 60 pregões, 521 × 432 mi.',
  '**Volume de hoje: 3,8 vezes a média de 250 dias** (12,1 mi) e o 2º maior dos 20 meses (45,7 mi), atrás só do rompimento de 05/10. Abertura em R$ 47,00, mínima de R$ 46,40 e fechamento a R$ 50,80, a 89% do candle.',
  '**O aviso veio em 16/10.** 38 mi de ações com o preço parado no topo (candle de R$ 0,76): esforço sem resultado, sinal de oferta absorvendo a demanda. Depois disso o volume secou até o choque.',
  '**Leitura Wyckoff:** furar o suporte da caixa e voltar para dentro dela no mesmo pregão, com volume alto e fechamento forte, é um **spring**. A confirmação vem com um teste da região de 47,50–49,60 com volume bem menor.',
 ],
 'perfilNotas': [
  '**Dois blocos de valor.** O antigo, de R$ 30–35, concentra 24,5% do volume dos 20 meses (POC 33,12). O atual, de R$ 50–60, concentra 46%. A área de valor de 6 meses (49,62–56,62) é a própria caixa de reacumulação.',
  '**O fechamento caiu sobre os HVNs de 50,62 e 50,88.** Metade do volume dos 20 meses foi negociado abaixo do preço atual.',
  '**Quem está preso.** A VWAP desde o 1º turno está em 58,39: quem comprou depois da eleição paga em média 15% acima do preço. As VWAPs de 6 meses (54,80), do topo histórico (55,07), da mínima de agosto (56,03) e de 2026 (55,74) formam um feixe de resistência.',
  '**Vazio abaixo.** O LVN de 47,88 separa o preço da mínima do spring. Se 46,40 ceder, o próximo nó relevante é o Fibonacci de 61,8% (44,03).',
  '**Nós de 6 meses:** HVN 50,88 · 54,62 · 59,62. LVN 47,88 · 57,62.',
 ],
 'macro': {
  'titulo': 'Elétricas caíram 17% com o salto dos juros longos',
  'fonte': FONTE_MACRO,
  'tabela': marca(ELETRICAS, 'AXIA3'),
  'pontos': [
   '**Juros.** No estudo de 15/10, a queda do juro longo era o vento mais forte a favor do setor, com o título de 10 anos em 13,04%. Hoje está em 15,42%, e o DI de janeiro de 2031 subiu 2,67 pontos no dia. Elétricas são ativos de prazo longo: o valor presente do fluxo de caixa cai quando o juro sobe.',
   '**Eleição.** Lula foi reeleito com 51,79% dos votos válidos. O Índice de Energia Elétrica caiu 17,2%. As distribuidoras que lideraram outubro devolveram mais: Equatorial e Energisa caíram quase 29%. A Axia caiu 12,4%.',
   '**Câmbio.** O dólar a R$ 5,40 aumenta o risco-país, que subiu 26% no dia, e o custo de capital do setor.',
   '**Hidrologia e preço de energia.** A empresa acompanha os efeitos do El Niño sobre os preços de curto prazo e pretende ampliar vendas no Norte e Nordeste (estudo de 15/10). Volatilidade de preço tem sido fonte de margem para as hidrelétricas.',
  ],
 },
 'micro': {
  'titulo': 'Caixa forte e retorno ao acionista via resgate de PNC',
  'fundamentos': [
   {'nome': 'Valor de mercado', 'valor': 'R$ 140,6 bi'},
   {'nome': 'P/L · P/VP (TTM)', 'valor': '11,6× · 1,26×'},
   {'nome': 'EV/EBITDA (TTM)', 'valor': '13,1×'},
   {'nome': 'ROE · margem líquida (TTM)', 'valor': '10,6% · 27,0%'},
   {'nome': 'Dividend yield (TradingView)', 'valor': '7,8%'},
   {'nome': 'Lucro ajustado 2T26', 'valor': 'R$ 1,6 bi (+9,5% a/a)'},
   {'nome': 'EBITDA ajustado 2T26', 'valor': 'R$ 6,3 bi (+22,5% a/a)'},
   {'nome': 'Margem da comercialização', 'valor': 'R$ 96/MWh (R$ 73 um ano antes)'},
   {'nome': 'Capital alocável 1S26', 'valor': 'R$ 7,7 bi'},
   {'nome': 'Resgate de PNC (out)', 'valor': '67,25 mi de ações, R$ 4 bi'},
  ],
  'sustentacao': [
   '**Retorno via resgate de ações PNC.** A empresa prefere resgatar PNC, que funciona como recompra. Desde agosto o conselho aprovou resgates de R$ 2 bi, R$ 6,2 bi e R$ 3,9 bi, e em outubro mais R$ 4 bi.',
   '**Resultado operacional forte.** EBITDA ajustado +22,5% no 2T26 e margem de comercialização de R$ 96/MWh.',
   '**Limpeza de passivos.** Acordo com União e Piauí encerrou a ação no STF sobre a Cepisa; migração para o Novo Mercado aprovada.',
   '**Crescimento.** Capex de R$ 3,1 bi no 2T26 (+53%), puxado por transmissão, e mais de 4 GW em baterias em estudo.',
  ],
  'pressao': [
   '**Juro longo em 15,4%.** Pesa mais em elétricas do que em qualquer outro setor da bolsa.',
   '**Venda de grandes acionistas.** GQG reduziu para 4,87% logo após o salto de outubro; o BNDES vendeu ações em maio.',
   '**Baixa contábil de cerca de R$ 1,1 bi** ligada a obrigações judiciais, anunciada em agosto, deve aparecer no 3T26.',
   '**Alavancagem subindo** com emissões de debêntures e R$ 3 bi em linhas rotativas para financiar capex e resgates.',
  ],
  'evento': '**Resultado do 3T26 em 04/11** (teleconferência em 05/11), dentro do prazo da estrutura. Pontos a observar: efeito da baixa contábil, novo valor de capital alocável e ritmo dos resgates.',
 },
 'plano': {
  'titulo': 'Teto em R$ 48,70, no teste do spring',
  'texto': 'Spring só vale depois do teste. A R$ 50,80, com stop em R$ 45,90 (abaixo da mínima do spring), o risco é de R$ 4,90 para um ganho de R$ 4,08 até a POC de 6 meses: **0,8:1**. Em R$ 48,70 a operação entrega **2,2:1** até a POC e 2,8:1 até o topo da caixa. O teto do estudo de 15/10 (R$ 58,00) e o stop de R$ 55,40 ficaram para trás no gap.',
  'tranches': [
   {'nome': '1 · teste do spring', 'nota': 'até 1/2 da posição', 'entrada': '47,50 – 48,70', 'gatilho': 'Volta à zona de acumulação com volume abaixo da metade de 26/10 (23 mi) e candle de rejeição', 'stop': '45,90', 'alvos': '51,33 · 54,88 · 56,62', 'rr': '1,0 · 2,3 · 3,0'},
   {'nome': '2 · sinal de força', 'nota': 'até 1/2 da posição', 'entrada': '> 51,40', 'gatilho': 'Fechamento acima da máxima do spring com volume crescente', 'stop': '48,60', 'alvos': '54,88 · 56,62 · 58,39', 'rr': '1,2 · 1,9 · 2,5'},
   {'nome': 'Alternativa', 'nota': 'compra por força', 'entrada': '> 57,70', 'gatilho': 'Volta acima do topo da caixa e da base do gap de 05/10, com volume', 'stop': '54,80', 'alvos': '61,96 · 65,90', 'rr': '1,5 · 2,8'},
  ],
  'nota': 'R/R da tranche 1 calculado a partir de 48,60. **Com opções:** a trava de alta com call 51/55 desta análise compra a reação até a POC com risco limitado ao débito; a put coberta de 45,25 coloca a entrada abaixo da mínima do spring.',
 },
 'cenarios': {
  'titulo': 'Base R$ 46 – 60: reacumulação dentro da caixa',
  'linhas': [
   {'cenario': 'Baixista', 'prob': '25%', 'faixa': '40 – 46', 'premissas': 'O spring falha: juro longo acima de 16%, 3T26 com baixa contábil maior que a esperada e novas vendas de grandes acionistas. Alvo no Fibonacci de 61,8% (44,03).'},
   {'cenario': 'Base', 'prob': '50%', 'faixa': '46 – 60', 'premissas': 'Teste secundário confirma o spring e o preço volta a negociar na caixa. Resgates de PNC dão suporte, e o 3T26 sai sem surpresa.'},
   {'cenario': 'Altista', 'prob': '25%', 'faixa': '57 – 66', 'premissas': 'A curva de juros devolve parte da alta e o 3T26 traz capital alocável grande. Volta acima do gap e busca 61,96 e a projeção de 65,90.'},
  ],
  'nota': '* Probabilidades são julgamento do estudo, não saída de modelo. Para referência estatística: a volatilidade de 60 dias (39% a.a.) projeta, em 126 pregões, R$ 38,47 – 67,09 a 1 desvio-padrão; com a de 250 dias (34%), R$ 40,04 – 64,45.',
 },
 'gatilhos': {
  'melhora': ['Teste de 47,50–49,60 com volume abaixo de 23 mi', 'Fechamento acima de R$ 51,33 com volume (sinal de força)', '3T26 com novo capital alocável e resgates executados', 'Título de 10 anos de volta abaixo de 14%'],
  'piora': ['Fechamento abaixo de R$ 46,40: o spring falhou', 'Fechamento abaixo de R$ 48,64 com volume acima de 30 mi', 'Novas reduções de posição de grandes gestores', 'Título de 10 anos acima de 16%'],
 },
 'fontes': FONTES('AXIA3', '; fundamentos do 2T26, resgates e fatores de pressão vêm do estudo de 15/10; calendário de balanços da Rankia'),
 'corpo': [
  ('- **Resultado do 3T26 da Axia:** data ainda não confirmada. O 2T26 saiu no início de agosto, o que aponta para o início de novembro, dentro do prazo da estrutura.',
   '- **Resultado do 3T26 em 04/11:** dentro do prazo da estrutura. Pontos a observar: baixa contábil, capital alocável e ritmo dos resgates.'),
 ],
}
aplica('AXIA3', cfg)
