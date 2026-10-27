exec(open('scripts/blocos.py').read())
cfg = {
 'veredito': [
  {'rotulo': 'Preço-teto de entrada', 'valor': 'R$ 51,50', 'destaque': True, 'texto': 'O mesmo teto do estudo de 15/10: gap fechado (51,17) e Fibonacci 38,2% (51,24). Com stop em R$ 49,40, entrega 3,9:1 até a máxima. A R$ 53,88 a relação cai para 1,3:1.'},
  {'rotulo': 'Zona de acumulação', 'valor': 'R$ 48,6 – 49,9', 'texto': 'Fibonacci 50% (48,59), HVN de 6 meses (48,62), MMA 50 (49,74) e VAH de 6 meses (49,88).'},
  {'rotulo': 'Range 6 meses (base)', 'valor': 'R$ 49 – 62', 'texto': 'Extremos plausíveis R$ 43 – 68. Volatilidade 20d: 50% a.a., contra 30% na média do ano.'},
  {'rotulo': 'Viés', 'valor': 'Alta / range', 'tom': 'alta', 'texto': 'Tendência primária intacta (ADX 47). O choque trocou a alta por um range de curto prazo.'},
 ],
 'medias': {'diario': 'MMA20 54,96 · MMA50 49,74 · MMA100 45,08 · MMA200 43,71', 'semanal': 'MMA20 46,21 · MMA50 42,21 · MMA200 35,74'},
 'mme': {'nome': 'MME 10 / 20', 'diario': '56,69 / 55,11', 'semanal': '52,24 / 48,71', 'sinal': 'neutro', 'leitura': 'Cruzadas para cima nos dois tempos, mas o preço fechou abaixo das duas no diário. Primeiro aviso, sem confirmação.'},
 'estoc': {'nome': 'Estocástico K/D', 'diario': '65,7 / 77,1', 'semanal': '87,7 / 94,2', 'sinal': 'baixa', 'leitura': 'Cruzado para baixo saindo da sobrecompra nos dois tempos: espaço para consolidação.'},
 'cci': {'nome': 'CCI 20', 'diario': '−39', 'semanal': '+87', 'sinal': 'neutro', 'leitura': 'O diário zerou o excesso de compra; o semanal segue positivo, sem extremo.'},
 'atr': {'nome': 'ATR 14', 'diario': 'R$ 2,02 (≈ 3,8% por pregão)', 'sinal': 'neutro', 'leitura': 'Era R$ 1,50 em 15/10. Stops abaixo de R$ 2 de distância tendem a ser tocados por ruído.'},
 'rating': {'nome': 'Rating TradingView', 'diario': 'D −0,02 · neutro', 'semanal': 'S +0,35 · compra', 'sinal': 'neutro', 'leitura': 'Médias em compra (forte no semanal); osciladores em venda no diário.'},
 'nota': 'A Petrobras tem a tendência mais forte da série: **ADX de 47 no diário e 37 no semanal**. O choque de hoje virou o DMI e zerou a sobrecompra, mas não chegou às médias de 50, 100 e 200 dias, todas abaixo de R$ 50 e subindo. No semanal, médias e MACD seguem em compra. O que mudou é o curto prazo: o diário entrou em consolidação.',
 'fluxo': [
  '**O melhor saldo de fluxo da série.** Nos 20 pregões até hoje, 749 mi de ações em dias de alta contra 309 mi em dias de queda (15 altas e 5 quedas). Nem o choque de hoje virou o saldo. Em 60 pregões, 1.739 × 1.173 mi.',
  '**Volume de hoje: 3,2 vezes a média de 250 dias** (44,8 mi) e o maior dos 20 meses (141,3 mi). Abertura em R$ 51,20, gap de −12,7%, mínima de R$ 51,17 e fechamento a R$ 53,88, a 89% do candle.',
  '**Leitura Wyckoff:** dentro de uma tendência de alta, um mergulho até o gap anterior com volume climático e fechamento perto da máxima é um **shakeout**: a oferta do pânico foi absorvida. A confirmação vem se o reteste de 51 acontecer com volume menor.',
  '**OBV no máximo.** O OBV marcou o pico em 23/10 e devolveu só parte do saldo hoje: +440 mi em 20 pregões.',
 ],
 'perfilNotas': [
  '**96% do volume dos 20 meses está abaixo do preço.** Acima de R$ 50, só 5,7% foi negociado: o papel está em território novo, sem estoque de vendedores presos.',
  '**O valor migrou para cima.** A área de valor de 20 meses vai de 29,38 a 42,62 (POC 31,38). A de 6 meses vai de 40,38 a 49,88, com POC em 41,88.',
  '**Vazios dentro do range.** LVNs em 51,38, 52,38 e 56,62: o preço atravessa rápido esses níveis, o que explica a amplitude de hoje.',
  '**Quem está preso é pouco.** A VWAP desde o 1º turno está em 56,05 (4% acima do preço) e a VWAP desde a máxima em 54,77. São os primeiros tetos de um repique.',
  '**Nós de alto volume (HVN) de 6 meses:** 38,38 · 41,62 · 45,62 · 48,62. **LVN:** 43,88 · 47,12 · 51,38 · 52,38 · 56,62.',
 ],
 'macro': {
  'titulo': 'Reeleição tirou o prêmio político; o barril segue acima de US$ 100',
  'fonte': FONTE_MACRO,
  'tabela': marca(PETROLEO, 'PETR4'),
  'pontos': [
   '**Eleição.** Lula foi reeleito com 51,79% dos votos válidos, contra 48,21% de Flávio Bolsonaro. A Petrobras caiu 8,2%, menos que o Ibovespa (−13,9%), mas a PRIO caiu só 3,6%: a diferença é o prêmio de risco estatal. No estudo de 15/10, o mercado lia a vitória de Flávio como menor interferência em preços e dividendos. A presidente da Petrobras classificou a queda como "movimento especulativo".',
   '**Barril.** O Brent está em US$ 109,70, alta de 80% no ano. É a premissa central do lucro de +72% e do dividendo de dois dígitos.',
   '**Câmbio.** O dólar a R$ 5,40 aumenta a receita em reais das exportações de óleo, mas também amplia a defasagem dos combustíveis vendidos no mercado interno se a empresa não reajustar.',
   '**Combustíveis e subsídios.** O governo vinha prorrogando medidas para diesel, gasolina e etanol, e a Petrobras já recebeu R$ 16 bi em subvenções (estudo de 15/10). A continuidade dessa política no novo mandato define a margem de refino.',
  ],
 },
 'micro': {
  'titulo': 'Produção recorde, caixa gigante e dividendo de dois dígitos',
  'fundamentos': [
   {'nome': 'Valor de mercado', 'valor': 'R$ 797,2 bi'},
   {'nome': 'P/L · P/VP (TTM)', 'valor': '5,2× · 1,44×'},
   {'nome': 'EV/EBITDA (TTM)', 'valor': '4,0×'},
   {'nome': 'ROE · margem líquida (TTM)', 'valor': '30,3% · 24,3%'},
   {'nome': 'Dividend yield (TradingView)', 'valor': '6,2%'},
   {'nome': 'Lucro líquido (TTM, 15/10)', 'valor': 'R$ 133,4 bi (+72,4%)'},
   {'nome': 'FCL / valor de mercado (15/10)', 'valor': '12,0%'},
   {'nome': 'Produção (15/10)', 'valor': '2,92 mi barris/dia (meta 2026: 2,5 mi ±4%)'},
   {'nome': 'UBS BB (15/10)', 'valor': 'Compra, alvo R$ 62; yield de 10–11% em 2026'},
  ],
  'sustentacao': [
   '**Produção acima do plano:** 2,92 milhões de barris/dia, perto de 3 milhões, contra meta de 2,5 milhões para 2026.',
   '**Dividendos.** O UBS BB projeta yield de 10–11% em 2026 e 13–14% em 2027, com política trimestral ligada ao fluxo de caixa.',
   '**Exploração.** Duas descobertas na Foz do Amazonas e 19 blocos arrematados por R$ 3 bi em outubro.',
   '**Múltiplo baixo.** P/L de 5,2× e EV/EBITDA de 4,0×, mesmo depois de subir 74% no ano.',
  ],
  'pressao': [
   '**Preço de combustível como ferramenta política.** Com o barril alto, a empresa vende diesel e gasolina abaixo da paridade. O resultado da eleição mantém essa política no radar.',
   '**Refino fraco.** No 2T26 foi a única entre pares das Américas e da Europa com queda trimestral do EBITDA por barril no refino.',
   '**Dependência do barril.** Um acordo de paz que derrube o Brent abaixo de US$ 90 desmonta a premissa central do lucro.',
   '**Regulação do gás.** A ANP avança para reduzir a concentração da Petrobras no mercado de gás.',
  ],
  'evento': '**Resultado do 3T26 em 10/11, após o fechamento** (teleconferência em 11/11), com o anúncio de dividendos trimestrais. O plano de negócios 2027–2031 deve sair até o fim do ano. Os dois estão dentro do prazo da estrutura.',
 },
 'plano': {
  'titulo': 'Teto em R$ 51,50: o preço já foi buscá-lo',
  'texto': 'O teto de entrada do estudo de 15/10 era **R$ 51,50**, e a mínima de hoje parou em 51,17. A R$ 53,88, com stop em R$ 49,40 (abaixo da MMA 50 e da VAH de 6 meses), o risco é de R$ 4,48 para um ganho de R$ 5,91 até a máxima: **1,3:1**. Em R$ 51,50 a mesma operação entrega **3,9:1**.',
  'tranches': [
   {'nome': '1 · gap fechado', 'nota': 'até 1/2 da posição', 'entrada': '≤ 51,50', 'gatilho': 'Reteste de 51,17–51,50 com volume abaixo da média de 20 dias (47 mi) e candle de rejeição', 'stop': '49,40', 'alvos': '54,51 · 56,05 · 59,79', 'rr': '1,6 · 2,3 · 4,2'},
   {'nome': '2 · valor', 'nota': 'até 1/2 da posição', 'entrada': '48,60 – 49,90', 'gatilho': 'Teste da MMA 50 e da VAH de 6 meses sem perder 48,59 em fechamento', 'stop': '47,40', 'alvos': '54,51 · 59,79', 'rr': '2,9 · 5,9'},
   {'nome': 'Alternativa', 'nota': 'compra por força', 'entrada': '> 59,80', 'gatilho': 'Fechamento semanal acima da máxima histórica, com volume acima da média de 20 dias', 'stop': '56,90', 'alvos': '68,40 (projeção do range)', 'rr': '3,0'},
  ],
  'nota': 'R/R da tranche 1 calculado a partir de 51,40 e da tranche 2 a partir de 49,20. **Com opções:** a trava de alta com put 50/46 desta análise ganha com o preço acima de 50 e coloca o risco abaixo da zona de acumulação.',
 },
 'cenarios': {
  'titulo': 'Base R$ 49 – 62: range com viés de alta',
  'linhas': [
   {'cenario': 'Baixista', 'prob': '25%', 'faixa': '43 – 49', 'premissas': 'Mudança na política de preços, dividendos ou comando no novo mandato; Brent abaixo de US$ 90 com acordo de paz. Perda de 48,59 e retorno à POC de 6 meses (41,88).'},
   {'cenario': 'Base', 'prob': '50%', 'faixa': '49 – 62', 'premissas': 'Brent entre US$ 95 e US$ 115 e política de dividendos mantida. Range entre 51 e 60 com rompimento lento depois do 3T26.'},
   {'cenario': 'Altista', 'prob': '25%', 'faixa': '60 – 68', 'premissas': 'Brent acima de US$ 115, dividendos do 3T26 acima do esperado e plano 2027–2031 sem aumento relevante de capex. Rompe 59,79 e busca a projeção de 68,40.'},
  ],
  'nota': '* Probabilidades são julgamento do estudo, não saída de modelo. Para referência estatística: a volatilidade de 60 dias (39% a.a.) projeta, em 126 pregões, R$ 40,97 – 70,87 a 1 desvio-padrão; com a de 250 dias (30%), R$ 43,45 – 66,81.',
 },
 'gatilhos': {
  'melhora': ['Reteste de 51,17–51,50 com volume baixo e rejeição', 'Fechamento acima de R$ 56,05 (VWAP desde o 1º turno) com volume', 'Rompimento de 59,79 com volume', 'Dividendos do 3T26 compatíveis com yield de 10% ou mais', 'Brent acima de US$ 110'],
  'piora': ['Fechamento abaixo de R$ 49,74 (MMA 50) com volume acima de 60 mi', 'Anúncio de mudança na política de preços, de dividendos ou no comando', 'Brent abaixo de US$ 95', 'Plano de negócios com capex maior e dividendo menor', 'Volume voltando a crescer nos dias de queda'],
 },
 'fontes': FONTES('PETR4', '; Brent e pares no TradingView; contexto e fundamentos marcados com 15/10 vêm do estudo daquela data; calendário de balanços da Rankia'),
}
aplica('PETR4', cfg)
