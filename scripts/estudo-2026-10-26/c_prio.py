exec(open('scripts/blocos.py').read())
cfg = {
 'veredito': [
  {'rotulo': 'Preço-teto de entrada', 'valor': 'R$ 68,40', 'destaque': True, 'texto': 'HVN de 6 meses (68,38) e Fibonacci 38,2% da perna desde setembro (68,67). Com stop em R$ 65,40, entrega 2,1:1 até a máxima e 4,9:1 até a projeção. A R$ 71,14 a relação cai para 0,6:1 até a máxima.'},
  {'rotulo': 'Zona de acumulação', 'valor': 'R$ 62,6 – 65,6', 'texto': 'POC de 6 meses (62,62), MMA 50 (63,80) e VAH de 6 meses (65,62).'},
  {'rotulo': 'Range 6 meses (base)', 'valor': 'R$ 62 – 83', 'texto': 'Extremos plausíveis R$ 55 – 92. Volatilidade 60d: 36% a.a., igual à média do ano.'},
  {'rotulo': 'Viés', 'valor': 'Alta', 'tom': 'alta', 'texto': 'Único papel da série com médias e MACD em compra nos dois tempos. O choque de hoje foi um teste aprovado.'},
 ],
 'medias': {'diario': 'MMA20 66,51 · MMA50 63,80 · MMA100 60,66 · MMA200 59,93', 'semanal': 'MMA20 61,27 · MMA50 57,34 · MMA200 45,61'},
 'mme': {'nome': 'MME 10 / 20', 'diario': '70,20 / 67,81', 'semanal': '66,26 / 63,49', 'sinal': 'alta', 'leitura': 'Cruzadas para cima nos dois tempos, e o preço fechou acima de todas.'},
 'estoc': {'nome': 'Estocástico K/D', 'diario': '88,2 / 92,7', 'semanal': '90,8 / 90,2', 'sinal': 'neutro', 'leitura': 'Sobrecompra nos dois tempos: o movimento pode pedir uma pausa antes de seguir.'},
 'cci': {'nome': 'CCI 20', 'diario': '+62', 'semanal': '+157', 'sinal': 'neutro', 'leitura': 'O semanal está esticado para cima. Não é sinal de venda, mas reduz a assimetria de comprar agora.'},
 'atr': {'nome': 'ATR 14', 'diario': 'R$ 2,55 (≈ 3,6% por pregão)', 'sinal': 'neutro', 'leitura': 'Era R$ 2,06 em 15/10. Stops precisam de ao menos R$ 2,50 de distância.'},
 'rating': {'nome': 'Rating TradingView', 'diario': 'D +0,31 · compra', 'semanal': 'S +0,31 · compra', 'sinal': 'alta', 'leitura': 'Médias em compra forte nos dois tempos; osciladores em venda pela sobrecompra.'},
 'nota': 'A PRIO é o único papel da série com **médias, MACD e DMI apontando para cima nos dois tempos**. O choque de hoje funcionou como teste: a mínima tocou a MMA 20 e o fechamento voltou para cima da MME 10. O ponto de atenção são os osciladores: estocástico acima de 88 e CCI semanal em +157 mostram um movimento esticado, que costuma pausar antes de seguir.',
 'fluxo': [
  '**Fluxo comprador de 3 para 1.** Nos 20 pregões até hoje, 147 mi de ações em dias de alta contra 44 mi em dias de queda (16 altas e 4 quedas). Em 15/10 era 118 × 65 mi. Em 60 pregões, 295 × 202 mi.',
  '**Volume de hoje: 2 vezes a média de 250 dias** (10,4 mi) e 2,3 vezes a de 20. Alto, mas não climático: só o 25º maior dos 20 meses. Abertura em R$ 69,00, mínima de R$ 66,25 e fechamento a R$ 71,14, a 87% do candle.',
  '**Leitura Wyckoff:** recuo até o suporte com volume acima da média e fechamento forte é um **teste (back-up)** dentro da fase de alta. A demanda absorveu a venda do dia.',
  '**A alta veio sem euforia.** De 14 a 23/10, o avanço até a máxima histórica teve volume de 0,7 a 1,3 vez a média. Não há clímax de compra no topo de 74,60.',
 ],
 'perfilNotas': [
  '**99% do volume dos 20 meses está abaixo do preço.** Acima de R$ 70, só 2% foi negociado. Não há vendedores presos acima.',
  '**O valor migrou para cima ao longo do ano.** A área de valor de 20 meses vai de 32,88 a 59,38 (POC 39,38). A de 6 meses vai de 56,12 a 65,62, com POC em 62,62.',
  '**Todos os compradores do ano estão no lucro.** VWAP de 2026 em 59,64, de 6 meses em 62,03 e desde o 1º turno em 67,80, todas abaixo do preço. Sem oferta de quem quer sair no zero a zero.',
  '**A mínima de hoje parou no LVN de 66,38**, entre o HVN de 68,38 e a VAH de 6 meses.',
  '**Nós de 6 meses:** HVN 56,88 · 59,12 · 62,38 · 68,38. LVN 54,88 · 58,12 · 66,62.',
 ],
 'macro': {
  'titulo': 'Petróleo acima de US$ 100 e nenhum risco estatal',
  'fonte': FONTE_MACRO,
  'tabela': marca(PETROLEO, 'PRIO3'),
  'pontos': [
   '**Eleição.** A PRIO caiu 3,6% num dia de −13,9% do Ibovespa. A Petrobras caiu 8,2%, e as júniores Brava e PetroReconcavo, 12% e 13%. Sem controle estatal e com produção grande, a PRIO não carrega o prêmio político da Petrobras nem o risco de alavancagem das júniores.',
   '**Barril.** O Brent está em US$ 109,70, alta de 80% no ano, e o WTI acima de US$ 100. É a variável que mais pesa no resultado.',
   '**Câmbio.** A PRIO vende em dólar. Com o dólar a R$ 5,40, cada barril vale mais em reais.',
   '**Juros.** O juro longo subiu para 15,4%, mas a PRIO é das empresas menos sensíveis da bolsa a juro doméstico: receita e dívida estão atreladas ao dólar.',
  ],
 },
 'micro': {
  'titulo': 'Produção recorde, custo baixo e desalavancagem',
  'fundamentos': [
   {'nome': 'Valor de mercado', 'valor': 'R$ 61,5 bi'},
   {'nome': 'P/L · P/VP (TTM)', 'valor': '14,9× · 2,0×'},
   {'nome': 'EV/EBITDA (TTM)', 'valor': '6,5×'},
   {'nome': 'ROE · margem líquida (TTM)', 'valor': '14,2% · 18,1%'},
   {'nome': 'Produção média 3T26', 'valor': '191,6 mil boe/d (+11,4% t/t)'},
   {'nome': 'Produção de setembro', 'valor': '192,6 mil boe/d (+3,5% m/m)'},
   {'nome': 'Receita 2T26', 'valor': 'US$ 1,22 bi (+160% a/a)'},
   {'nome': 'EBITDA ajustado 2T26', 'valor': 'US$ 878,6 mi (margem de 72%)'},
   {'nome': 'Lucro líquido 2T26', 'valor': 'US$ 413,3 mi (+169% a/a)'},
   {'nome': 'Lifting cost', 'valor': 'US$ 8,9/barril no 2T26 (projeção de US$ 7–8 no 3T26)'},
   {'nome': 'Dívida líquida', 'valor': 'US$ 4,0 bi (1,5× EBITDA); meta de US$ 3,8 bi no fim de 2026'},
  ],
  'sustentacao': [
   '**Melhor trimestre do ano em produção:** 191,6 mil boe/d no 3T26, 11,4% acima do 2T26, com vendas de 17,15 milhões de barris (+12,5%).',
   '**Custo entre os mais baixos do setor.** Lifting cost de US$ 8,9 por barril no 2T26, com projeção de US$ 7 a US$ 8 no 3T26.',
   '**Peregrino.** A PRIO incorporou mais 40% do campo e prevê comprar os 20% restantes em outubro ou novembro.',
   '**Desalavancagem e recompra.** Dívida líquida caindo para US$ 3,8 bi no fim de 2026, e US$ 114 mi em recompra no 2T26.',
  ],
  'pressao': [
   '**Dividendos em espera.** A política de dividendos só será divulgada depois que o cenário geopolítico se normalizar.',
   '**Paradas operacionais.** Em agosto e setembro houve manutenção em Albacora Leste, falha de bomba em Peregrino e um poço parado no cluster Bravo.',
   '**Dependência do barril alto.** Um acordo de paz que leve o Brent abaixo de US$ 85 tira a principal alavanca do resultado.',
   '**Liquidez das opções.** As séries de dezembro tiveram poucos negócios na grade de 26/10: monte com ordem limitada.',
  ],
  'evento': '**Resultado do 3T26: data ainda não confirmada** (o 2T26 saiu em 04/08). Antes dele vêm os dados operacionais de outubro, no início de novembro, e a conclusão da compra dos 20% restantes de Peregrino, prevista para outubro ou novembro.',
 },
 'plano': {
  'titulo': 'Teto em R$ 68,40: comprar no teste, não na máxima',
  'texto': 'A tendência favorece a compra, então o teto serve para não pagar o topo da consolidação. A R$ 71,14, com stop em R$ 65,40 (abaixo da mínima do teste e da VAH de 6 meses), o risco é de R$ 5,74 para um ganho de R$ 3,46 até a máxima: **0,6:1**. Em R$ 68,40 a operação entrega **2,1:1** até a máxima e 4,9:1 até a projeção da consolidação (82,95).',
  'tranches': [
   {'nome': '1 · pullback', 'nota': 'até 1/2 da posição', 'entrada': '66,25 – 68,40', 'gatilho': 'Recuo até a mínima do teste e o HVN de 68,38 com volume abaixo da média de 20 dias (8,9 mi) e candle de rejeição', 'stop': '65,40', 'alvos': '74,60 · 82,95', 'rr': '2,8 · 6,3'},
   {'nome': '2 · valor', 'nota': 'até 1/2 da posição', 'entrada': '62,60 – 65,60', 'gatilho': 'Teste da área de valor de 6 meses sem perder a MMA 50 em fechamento semanal', 'stop': '61,00', 'alvos': '74,60 · 82,95', 'rr': '3,4 · 6,1'},
   {'nome': 'Alternativa', 'nota': 'compra por força', 'entrada': '> 74,60', 'gatilho': 'Rompimento da máxima histórica com volume acima de 1,5 vez a média de 20 dias', 'stop': '71,00', 'alvos': '78,00 · 82,95', 'rr': '0,9 · 2,3'},
  ],
  'nota': 'R/R da tranche 1 calculado a partir de 67,80 e da tranche 2 a partir de 64,10. A projeção de 82,95 soma a altura da consolidação (8,35) ao topo. **Com opções:** a trava de alta com call 72/77 desta análise compra o rompimento com risco limitado ao débito, sem precisar esperar o pullback.',
 },
 'cenarios': {
  'titulo': 'Base R$ 62 – 83: consolidação e continuação da alta',
  'linhas': [
   {'cenario': 'Baixista', 'prob': '20%', 'faixa': '55 – 62', 'premissas': 'Brent abaixo de US$ 85 com acordo de paz e paradas operacionais repetidas. Perda da MMA 50 e da POC de 6 meses.'},
   {'cenario': 'Base', 'prob': '50%', 'faixa': '62 – 83', 'premissas': 'Brent entre US$ 95 e US$ 115 e produção acima de 190 mil boe/d. Consolidação entre 66 e 75 e rompimento até a projeção de 82,95.'},
   {'cenario': 'Altista', 'prob': '30%', 'faixa': '75 – 92', 'premissas': 'Brent acima de US$ 115, conclusão de Peregrino a 100% e anúncio da política de dividendos.'},
  ],
  'nota': '* Probabilidades são julgamento do estudo, não saída de modelo. Para referência estatística: a volatilidade de 60 dias (36% a.a.) projeta, em 126 pregões, R$ 55,17 – 91,73 a 1 desvio-padrão; a de 250 dias dá praticamente a mesma faixa.',
 },
 'gatilhos': {
  'melhora': ['Rompimento de R$ 74,60 com volume acima da média', 'Produção de outubro acima de 190 mil boe/d', 'Conclusão da compra de 100% de Peregrino', 'Anúncio da política de dividendos', 'Brent acima de US$ 110'],
  'piora': ['Fechamento abaixo de R$ 66,25: perde a mínima do teste e a MMA 20', 'Perda da MMA 50 (63,80) em fechamento semanal', 'Rompimento de 74,60 sem volume, seguido de volta para dentro da consolidação', 'Brent abaixo de US$ 95', 'Novas paradas não programadas'],
 },
 'fontes': FONTES('PRIO3', '; resultado do 2T26 segundo a Nord Investimentos (06/08) e produção de setembro e do 3T26 segundo o BP Money (06/10)'),
}
aplica('PRIO3', cfg)
