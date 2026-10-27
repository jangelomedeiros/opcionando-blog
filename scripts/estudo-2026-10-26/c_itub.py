exec(open('scripts/blocos.py').read())
cfg = {
 'veredito': [
  {'rotulo': 'Preço-teto de entrada', 'valor': 'R$ 40,30', 'destaque': True, 'texto': 'Fibonacci 78,6% (40,24), logo acima da POC de 20 meses. Com stop em R$ 38,70, entrega 2,6:1 até o topo do range (44,38). A R$ 41,70 a relação cai para 0,9:1.'},
  {'rotulo': 'Zona de acumulação', 'valor': 'R$ 38,9 – 40,2', 'texto': 'VAL de 6 meses (38,88), mínima do clímax (39,59), VWAP desde a mínima de 20 meses (39,72) e POC de 20 meses (39,88).'},
  {'rotulo': 'Range 6 meses (base)', 'valor': 'R$ 38 – 47', 'texto': 'Extremos plausíveis R$ 34 – 51. Volatilidade 20d: 70% a.a., mais que o dobro da média do ano (31%).'},
  {'rotulo': 'Viés', 'valor': 'Lateral / clímax', 'tom': 'neutro', 'texto': 'Candidato a clímax de venda sobre a maior base de volume dos 20 meses. Falta o teste secundário.'},
 ],
 'medias': {'diario': 'MMA20 47,24 · MMA50 43,39 · MMA100 42,48 · MMA200 42,93', 'semanal': 'MMA20 42,81 · MMA50 42,44 · MMA200 32,46', 'leitura': 'Abaixo de todas as médias diárias. As de 50, 100 e 200 dias, entre 42,48 e 43,39, viram a primeira resistência. No semanal, a MMA de 200 semanas (32,46) mostra a tendência primária de alta.'},
 'mme': {'nome': 'MME 10 / 20', 'diario': '47,07 / 46,71', 'semanal': '44,52 / 43,48', 'sinal': 'neutro', 'leitura': 'Ainda cruzadas para cima nos dois tempos, mas acima do preço. O cruzamento para baixo no diário deve sair nos próximos pregões.'},
 'estoc': {'nome': 'Estocástico K/D', 'diario': '35,1 / 53,3', 'semanal': '64,3 / 80,2', 'sinal': 'baixa', 'leitura': 'Cruzado para baixo nos dois tempos, saindo da sobrecompra de outubro no semanal.'},
 'cci': {'nome': 'CCI 20', 'diario': '−156', 'semanal': '−51', 'sinal': 'neutro', 'leitura': 'Esticado para baixo no diário. O semanal está neutro.'},
 'atr': {'nome': 'ATR 14', 'diario': 'R$ 1,85 (≈ 4,4% por pregão)', 'sinal': 'neutro', 'leitura': 'Era R$ 1,46 em 15/10. Stops precisam de ao menos R$ 1,50 de distância.'},
 'rating': {'nome': 'Rating TradingView', 'diario': 'D −0,60 · venda forte', 'semanal': 'S −0,13 · venda', 'sinal': 'baixa', 'leitura': 'Venda forte no diário. No semanal, venda fraca: a tendência longa ainda não virou.'},
 'nota': 'O Itaú tem o quadro menos extremo entre os bancos: **o semanal mal registrou o choque** (IFR 47, CCI −51, MACD acima do sinal). No diário, o ADX em 33 com −DI em 43 mostra pressão vendedora forte. As médias de 50, 100 e 200 dias estão emboladas entre R$ 42,48 e R$ 43,39, junto da antiga zona de acumulação: é o primeiro teto de qualquer reação.',
 'fluxo': [
  '**O saldo de outubro ainda é comprador.** Nos 20 pregões até hoje, 472 mi de ações em dias de alta contra 431 mi em dias de queda (10 a 10). Em 15/10 era 443 × 299 mi. Em 60 pregões, 1.002 × 893 mi.',
  '**Volume de hoje: 5,3 vezes a média de 250 dias** (27,6 mi), 3,8 vezes a de 20 e o maior dos 20 meses (147 mi). Abertura em R$ 42,00, mínima de R$ 39,59 e fechamento a R$ 41,70, a 82% do candle.',
  '**A máxima não foi aceita.** O teste de 09/10 em 50,78 não superou o topo de 06/10 (50,85), e o recuo seguinte veio com volume de 0,6 a 0,9 vez a média: realização sem pressão, até o choque.',
  '**Leitura Wyckoff:** volume ultra-alto, spread largo e fechamento longe da mínima, exatamente sobre a POC de 20 meses, é o perfil de um **clímax de venda**. A confirmação vem com a reação automática e o teste secundário.',
 ],
 'perfilNotas': [
  '**Mínima na maior base de volume dos 20 meses.** A POC de 20 meses está em 39,88, e as faixas de R$ 37,5–40 e R$ 40–42,5 concentram 37% do volume do período.',
  '**De volta à área de valor de 6 meses** (38,88–43,12, POC 42,38). Dois terços do volume dos 20 meses foram negociados abaixo do preço atual.',
  '**Quem está preso.** A VWAP desde o 1º turno está em 47,50 e a do topo histórico em 47,16: quem comprou depois da eleição paga em média 14% acima do preço.',
  '**Vazio entre o fechamento e a mínima.** O LVN de 41,12 explica por que o preço atravessou tão rápido a faixa de R$ 40–42.',
  '**Nós de 20 meses:** HVN 36,38 · 39,38 · 42,62. LVN 37,88 · 41,12 · 44,88 · 47,12.',
 ],
 'macro': {
  'titulo': 'O banco de maior qualidade caiu menos, mas caiu 14%',
  'fonte': FONTE_MACRO,
  'tabela': marca(BANCOS, 'ITUB4'),
  'pontos': [
   '**Eleição.** Lula foi reeleito com 51,79% dos votos válidos. O Índice Financeiro caiu 22,5%. O Itaú caiu 13,7%, menos que Bradesco (−21,7%), BTG (−24,8%) e BB (−29,3%): o mercado vendeu bancos pelo risco-país, mas pagou menos desconto pela qualidade.',
   '**Juros.** O título de 10 anos foi de 13,04% em 15/10 para 15,42%. Juro longo alto adia o alívio na inadimplência do sistema, ainda que o Itaú tenha a carteira mais estável do setor.',
   '**Ambiente externo.** No 2T26, o CEO citou a guerra no Oriente Médio pressionando a inflação global e a possibilidade de juros mais altos nos EUA (estudo de 15/10). Com o Brent acima de US$ 100, o risco segue.',
   '**Crédito das famílias.** O BofA manteve cautela com bancos brasileiros pelo endividamento recorde das famílias, destacando custo de risco estável em Itaú e Bradesco.',
  ],
 },
 'micro': {
  'titulo': 'Qualidade máxima, crescimento moderado e um preço menos cheio',
  'fundamentos': [
   {'nome': 'Valor de mercado', 'valor': 'R$ 558,7 bi'},
   {'nome': 'P/L · P/VP (TTM)', 'valor': '10,3× · 2,11× (2,61× em 15/10)'},
   {'nome': 'ROE · margem líquida (TTM)', 'valor': '22,0% · 24,9%'},
   {'nome': 'Dividend yield (TradingView)', 'valor': '6,1%'},
   {'nome': 'Lucro recorrente 2T26', 'valor': 'R$ 12,4 bi (+7,8% a/a)'},
   {'nome': 'ROE recorrente 2T26', 'valor': '24,3% (23,3% há 1 ano)'},
   {'nome': 'Carteira de crédito', 'valor': 'R$ 1,5 tri (+9,6% a/a)'},
   {'nome': 'Inadimplência 90d', 'valor': '1,9% (6º trimestre seguido)'},
   {'nome': 'Índice de eficiência', 'valor': '37,4%'},
   {'nome': 'Capital principal', 'valor': '12,3% (13,1% há 1 ano)'},
   {'nome': 'Consenso (15/10)', 'valor': '9 compra · 2 neutro; alvo médio R$ 50,67'},
  ],
  'sustentacao': [
   '**Inadimplência em 1,9% pelo sexto trimestre seguido.** O CEO falou em "super estabilidade" dos atrasos e em carteira crescendo acima do ponto médio do guidance.',
   '**Rentabilidade no topo do setor.** ROE de 24,3% contra 16% do Bradesco e 8% do BB, com eficiência de 37,4%.',
   '**Preço menos cheio.** O P/VP caiu de 2,6× em 15/10 para 2,1×, e o alvo médio dos analistas (R$ 50,67) está 22% acima do preço.',
   '**Gestão de capital.** Recompras de letras financeiras e expansão internacional com autorização preliminar nos EUA.',
  ],
  'pressao': [
   '**Crescimento de lucro desacelerando:** +7,8% a/a e +1% sobre o 1T26, levemente abaixo do consenso.',
   '**Guidance de serviços e seguros cortado** de 5–9% para 2–5%, por volatilidade no mercado de capitais.',
   '**Formação de inadimplência subindo:** R$ 9,7 bi no 1T26 para R$ 10,7 bi no 2T26, com o fim de carências de programas do governo.',
   '**Capital principal caindo** de 13,1% para 12,3% em um ano, o que limita dividendos extraordinários.',
  ],
  'evento': '**Resultado do 3T26 em 03/11, após o fechamento** (teleconferência em 04/11), dentro do prazo da estrutura. Pontos a observar: inadimplência, formação de atrasos e capital principal.',
 },
 'plano': {
  'titulo': 'Teto em R$ 40,30, sobre a POC de 20 meses',
  'texto': 'Depois de um clímax de venda, a entrada com assimetria vem no **teste secundário**. A R$ 41,70, com stop em R$ 38,70 (abaixo da VAL de 6 meses), o risco é de R$ 3,00 para um ganho de R$ 2,68 até o topo do range: **0,9:1**. Em R$ 40,30 a operação entrega **2,6:1**. O teto do estudo de 15/10 (R$ 45,50), o stop de R$ 43 e a zona de R$ 42,40–43,50 ficaram acima do preço.',
  'tranches': [
   {'nome': '1 · teste secundário', 'nota': 'até 1/2 da posição', 'entrada': '39,60 – 40,30', 'gatilho': 'Volta à POC de 20 meses com volume abaixo da metade de 26/10 (74 mi) e candle de rejeição', 'stop': '38,70', 'alvos': '42,38 · 43,16 · 44,38', 'rr': '1,8 · 2,4 · 3,4'},
   {'nome': '2 · fundo de agosto', 'nota': 'até 1/2 da posição', 'entrada': '37,35 – 38,90', 'gatilho': 'Perda da mínima do clímax sem volume climático e recuperação', 'stop': '36,60', 'alvos': '41,70 · 44,38', 'rr': '2,4 · 4,2'},
   {'nome': 'Alternativa', 'nota': 'compra por força', 'entrada': '> 44,40', 'gatilho': 'Fechamento acima da VAH de 20 meses com volume acima da média de 20 dias', 'stop': '42,90', 'alvos': '47,16 · 50,85', 'rr': '1,8 · 4,3'},
  ],
  'nota': 'R/R da tranche 1 calculado a partir de 40,00 e da tranche 2 a partir de 38,10. **Com opções:** a trava de alta com call 41,93/44,43 desta análise compra a reação automática com risco limitado ao débito; a put coberta de 39,46 coloca a entrada na zona do teste.',
 },
 'cenarios': {
  'titulo': 'Base R$ 38 – 47: range entre a POC e as VWAPs da eleição',
  'linhas': [
   {'cenario': 'Baixista', 'prob': '20%', 'faixa': '34 – 38', 'premissas': 'O clímax falha: 3T26 com formação de inadimplência subindo e juro longo acima de 16%. Perda de 37,35 e teste da VAL de 20 meses (34,12).'},
   {'cenario': 'Base', 'prob': '55%', 'faixa': '38 – 47', 'premissas': 'Reação automática até 44,10–44,38, teste secundário e lateralização. 3T26 com ROE perto de 24% e inadimplência estável.'},
   {'cenario': 'Altista', 'prob': '25%', 'faixa': '44 – 51', 'premissas': 'O prêmio de risco cede e o estrangeiro volta ao banco de maior qualidade. Rompe a VAH de 20 meses e busca as VWAPs de 47,16–47,50 e a máxima de 50,85.'},
  ],
  'nota': '* Probabilidades são julgamento do estudo, não saída de modelo. Para referência estatística: a volatilidade de 60 dias (44% a.a.) projeta, em 126 pregões, R$ 30,46 – 57,09 a 1 desvio-padrão; com a de 250 dias (31%), R$ 33,47 – 51,95.',
 },
 'gatilhos': {
  'melhora': ['Teste secundário em 39,59–40,24 com volume abaixo de 74 mi', 'Fechamento acima de R$ 44,38 com volume', '3T26 com inadimplência estável em 1,9% e ROE acima de 24%', 'Título de 10 anos de volta abaixo de 14%'],
  'piora': ['Fechamento abaixo de R$ 39,59 com volume acima de 80 mi', '3T26 com formação de inadimplência subindo de novo', 'Capital principal abaixo de 12%', 'Título de 10 anos acima de 16%'],
 },
 'fontes': FONTES('ITUB4', '; fundamentos do 2T26 e consenso vêm do estudo de 15/10; calendário de balanços da Rankia'),
 'corpo': [
  ('- **Resultado do 3T26 do Itaú:** confira a data. Se ainda não saiu, é um evento binário dentro do prazo da estrutura.',
   '- **Resultado do 3T26 em 03/11, após o fechamento:** evento binário dentro do prazo da estrutura.'),
 ],
}
aplica('ITUB4', cfg)
