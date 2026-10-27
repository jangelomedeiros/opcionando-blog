exec(open('scripts/blocos.py').read())
V = 'VALE3'
cfg = {
 'veredito': [
  {'rotulo': 'Preço-teto de entrada', 'valor': 'R$ 62,00', 'destaque': True, 'texto': 'Fundo do range provisório e banda inferior de Bollinger. Com stop em R$ 60,40, entrega 3,7:1 até o topo do range (67,99). A R$ 64,38 a relação cai para 0,9:1.'},
  {'rotulo': 'Zona de acumulação', 'valor': 'R$ 57,4 – 60,0', 'texto': 'HVN 57,38, Fibonacci 78,6% (57,94) e topo do bloco antigo de volume. É a mesma zona do estudo de 15/10.'},
  {'rotulo': 'Range 6 meses (base)', 'valor': 'R$ 58 – 72', 'texto': 'Extremos plausíveis R$ 52 – 78. Volatilidade 60d: 26% a.a., em linha com a média do ano.'},
  {'rotulo': 'Viés', 'valor': 'Lateral / baixa', 'tom': 'baixa', 'texto': 'Tendência de baixa perdendo força, com oferta pesada no topo do range. O balanço de 29/10 decide a direção.'},
 ],
 'medias': {'diario': 'MMA20 67,46 · MMA50 72,29 · MMA100 74,38 · MMA200 78,71', 'semanal': 'MMA50 77,10 · MMA100 66,41 · MMA200 67,44', 'leitura': 'Preço abaixo de todas as médias diárias, alinhadas para baixo. No semanal, a máxima de hoje parou entre a MMA 100 (66,41) e a MMA 200 (67,44).'},
 'mme': {'nome': 'MME 10 / 20', 'diario': '64,94 / 67,07', 'semanal': '69,22 / 72,40', 'sinal': 'baixa', 'leitura': 'Cruzadas para baixo nos dois tempos. A máxima do gap (67,99) parou logo acima da MME 20 diária.'},
 'estoc': {'nome': 'Estocástico K/D', 'diario': '10,9 / 4,7', 'semanal': '6,6 / 7,2', 'sinal': 'neutro', 'leitura': 'Sobrevenda extrema nos dois tempos: condição típica de repique e lateralização, não de reversão.'},
 'cci': {'nome': 'CCI 20', 'diario': '−61', 'semanal': '−153', 'sinal': 'neutro', 'leitura': 'O semanal segue esticado para baixo. O diário já saiu do extremo.'},
 'atr': {'nome': 'ATR 14', 'diario': 'R$ 2,03 (≈ 3,1% por pregão)', 'sinal': 'neutro', 'leitura': 'Era R$ 1,82 em 15/10. Com o balanço em 29/10, um movimento de R$ 3 a R$ 5 em dois pregões cabe na volatilidade normal.'},
 'rating': {'nome': 'Rating TradingView', 'diario': 'D −0,40 · venda', 'semanal': 'S −0,35 · venda', 'sinal': 'baixa', 'leitura': 'Médias em venda forte nos dois tempos; osciladores neutros.'},
 'nota': 'A Vale foi um dos poucos papéis que subiram no dia do circuit breaker (+4,0%), puxada pelo dólar. O candle conta outra história: abriu com gap de quase 10% e fechou a 6% da amplitude, perto da mínima. **No semanal, a máxima parou no feixe das MMAs de 100 e 200 semanas (66,41–67,44)**, o mesmo ponto da VWAP desde o 1º turno (66,96) e da MMA 20 diária (67,46). Os osciladores em sobrevenda extrema (estocástico semanal em 6,6) sustentam lateralidade, não reversão.',
 'fluxo': [
  '**O fluxo segue vendedor.** Nos 20 pregões até hoje, 260 mi de ações em dias de alta contra 401 mi em dias de queda (8 altas e 12 quedas). Em 15/10 era 176 × 354 mi. Em 60 pregões, 630 × 848 mi.',
  '**Volume de hoje: 4 vezes a média de 250 dias** (22,9 mi) e o maior dos 20 meses (92,3 mi). Abertura em R$ 67,97, gap de quase 10% sobre o fechamento de sexta, e fechamento em R$ 64,38, a 6% da amplitude do dia.',
  '**Leitura Wyckoff:** volume máximo, spread largo e fechamento na mínima depois de um gap de alta é um **upthrust**: a oferta apareceu exatamente onde quem estava preso desde outubro podia sair no zero a zero. A máxima de 67,99 passa a ser o teto do range.',
  '**Ponto a favor:** a queda de 23/09 a 22/10 perdeu aceleração, e o histograma do MACD diário encolhe há dois pregões. O fundo de 61,40 veio com volume alto, mas não climático (1,5×).',
 ],
 'perfilNotas': [
  '**O valor recente está todo acima do preço.** A área de valor de 6 meses vai de 72,12 a 83,88, com POC em 78,38. Quem comprou de abril a setembro está no prejuízo e vende nos repiques.',
  '**Vazio de R$ 60–65.** Só 5% do volume dos 20 meses foi negociado nessa faixa, com LVNs em 60,88 e 63,12. O preço atravessa rápido em qualquer direção.',
  '**O bloco antigo de R$ 50–60** concentra 37% do volume dos 20 meses, com POC em 53,12. Se 61,40 ceder, é para lá que o preço tende a ir.',
  '**Quem está preso.** A VWAP de 2026 está em 78,56 e a de 6 meses em 75,22: quem comprou no ano paga em média 22% acima do preço atual. A VWAP desde o 1º turno (66,96) é o primeiro teto.',
  '**Nós de alto volume (HVN):** 53,62 · 54,88 · 57,38 · 65,38 · 70,88. **Nós de baixo volume (LVN):** 58,88 · 60,88 · 63,12 · 68,62.',
 ],
 'macro': {
  'titulo': 'O dólar a R$ 5,40 segurou a Vale no dia do pânico',
  'fonte': FONTE_MACRO,
  'tabela': marca([
   {'ativo': 'Minério 62% (TIO1!) US$/t', 'ultimo': '90,78', 'dia': '−0,1%', 'm1': '−6,5%', 'm3': '−7,7%', 'm6': '−15,3%', 'ano': '−15,3%', 'efeito': 'pressão'},
   {'ativo': 'Cobre (HG1!) US$/lb', 'ultimo': '6,57', 'dia': '+0,4%', 'm1': '−3,1%', 'm3': '+3,7%', 'm6': '+10,8%', 'ano': '+15,3%', 'efeito': 'suporte em metais básicos'},
   DOLAR, IBOV,
   {'ativo': 'Índice de Materiais (IMAT)', 'ultimo': '6.218', 'dia': '+0,9%', 'm1': '−1,4%', 'm3': '−1,7%', 'm6': '−2,8%', 'ano': '+0,8%', 'efeito': 'exportadoras se salvaram'},
   {'ativo': 'Vale (VALE3)', 'ultimo': '64,38', 'dia': '+4,0%', 'm1': '−8,9%', 'm3': '−15,4%', 'm6': '−22,2%', 'ano': '−11,0%', 'efeito': 'EV/EBITDA 4,0×'},
   {'ativo': 'Vale ADR (NYSE:VALE) US$', 'ultimo': '12,00', 'dia': '−3,2%', 'm1': '−11,5%', 'm3': '−18,1%', 'm6': '−26,3%', 'ano': '−9,4%', 'efeito': 'em dólar, caiu'},
   {'ativo': 'BHP (NYSE) US$', 'ultimo': '79,13', 'dia': '+1,6%', 'm1': '−6,3%', 'm3': '−4,2%', 'm6': '+1,4%', 'ano': '+28,5%', 'efeito': 'par global'},
   {'ativo': 'Rio Tinto (NYSE) US$', 'ultimo': '83,72', 'dia': '+0,4%', 'm1': '−10,9%', 'm3': '−7,6%', 'm6': '−14,1%', 'ano': '+3,2%', 'efeito': 'par global'},
   {'ativo': 'Gerdau (GGBR4)', 'ultimo': '25,45', 'dia': '+0,9%', 'm1': '+3,3%', 'm3': '+3,2%', 'm6': '+12,6%', 'ano': '+24,8%', 'efeito': 'exportadora de aço'},
  ], 'Vale (VALE3)'),
  'pontos': [
   '**Câmbio fez a alta.** O dólar subiu 8,2%, para R$ 5,40, e a Vale subiu 4,0%, entre as maiores altas do Ibovespa num dia de −13,9%. A ADR em Nova York caiu 3,2% em dólar: a alta em reais foi só câmbio. Cada dólar exportado vale mais em reais, o que melhora resultado e dividendos em BRL.',
   '**Minério.** O contrato de 62% está em US$ 90,78, perto da mínima de 21 meses e com queda de 15% no ano. A Genial projeta preço realizado de finos perto de US$ 88,5/t no 3T26, 8% abaixo do 2T26. O diagnóstico do estudo de 15/10 segue: margens ruins nas siderúrgicas chinesas, estoques portuários subindo e oferta nova com Simandou.',
   '**Cobre.** A US$ 6,57/lb e com alta de 15% no ano, é o contrapeso: metais básicos devem passar de 30% para mais de 40% do EBITDA da Vale.',
   '**Juros.** O juro longo subiu para 15,4%. Para uma exportadora com dívida em dólar o efeito é menor que nos bancos e elétricas, mas encarece o custo de capital de todo o mercado.',
  ],
 },
 'micro': {
  'titulo': 'Balanço em três pregões, com a prévia apontando trimestre mais fraco',
  'fundamentos': [
   {'nome': 'Valor de mercado', 'valor': 'R$ 246,7 bi'},
   {'nome': 'EV/EBITDA (TTM)', 'valor': '4,0×'},
   {'nome': 'P/L · P/VP (TTM)', 'valor': '26,6× (distorcido) · 1,39×'},
   {'nome': 'ROE · margem líquida (TTM)', 'valor': '5,0% · 4,8%'},
   {'nome': 'Dividend yield (TradingView)', 'valor': '9,1%'},
   {'nome': 'Prévia Genial 3T26: EBITDA', 'valor': 'US$ 3,5 bi (4% abaixo do consenso)'},
   {'nome': 'Prévia Genial 3T26: lucro', 'valor': 'US$ 1,5 bi'},
   {'nome': 'EBITDA por tonelada de finos', 'valor': 'US$ 31,9 projetado (US$ 36,6 no 2T26)'},
   {'nome': 'Dívida líquida expandida', 'valor': 'US$ 18,1 bi (≈ 1,2× EBITDA 2026)'},
   {'nome': 'Genial', 'valor': 'Neutro, alvo cortado de R$ 86 para R$ 75'},
  ],
  'sustentacao': [
   '**Dólar a R$ 5,40.** A receita é em dólar e parte dos custos em reais: a desvalorização do real compensa parte da queda do minério no resultado em BRL.',
   '**Valuation.** A 4,5× EV/EBITDA de 2026, segundo a Genial, a Vale negocia 24% abaixo da mediana dos pares (6,0×).',
   '**Caixa e dividendos.** Dividend yield de 9% no TradingView. A Genial estima retorno total de 20% em 12 meses somando dividendos.',
   '**Cobre.** Meta de cerca de 700 mil t até 2035, contra 380 mil t em 2025, com Salobo em expansão até 2028.',
  ],
  'pressao': [
   '**3T26 mais fraco.** A Genial projeta EBITDA de US$ 3,5 bi e lucro de US$ 1,5 bi, abaixo do consenso, com o EBITDA por tonelada de finos caindo de US$ 36,6 para US$ 31,9.',
   '**Cobre e níquel no trimestre.** Vendas de cobre cerca de 10% menores pela reforma do moinho de Sossego, e EBITDA de níquel caindo à metade, segundo a Genial.',
   '**STF e lucro de controladas no exterior.** O caso da tributação de controladas na Bélgica, Dinamarca e Luxemburgo foi para o plenário físico e segue aberto (estudo de 15/10).',
   '**Lucro contábil distorcido.** O P/L de 27× reflete provisões e itens não recorrentes, não a geração de caixa.',
  ],
  'evento': '**Resultado do 3T26 em 29/10, após o fechamento** (teleconferência em 30/10), estreando o relatório unificado de produção e finanças. É daqui a três pregões e dentro do prazo do condor. O teste, segundo a Genial, é o EBITDA por tonelada de finos ficar em US$ 31,9 ou mais.',
 },
 'plano': {
  'titulo': 'Teto em R$ 62,00, no fundo do range',
  'texto': 'O range ainda é provisório e o balanço sai em três pregões, então a entrada com assimetria está nas pontas, não no meio. A R$ 64,38, com stop em R$ 60,40, o risco é de R$ 3,98 para um ganho de R$ 3,61 até o topo: **0,9:1**. Em R$ 62,00 a mesma operação entrega **3,7:1**. O teto do estudo de 15/10 (R$ 65,50) foi perdido; a zona de acumulação de R$ 57–60 continua válida.',
  'tranches': [
   {'nome': '1 · fundo do range', 'nota': 'até 1/2 da posição', 'entrada': '61,40 – 62,00', 'gatilho': 'Teste da mínima de 22/10 com volume abaixo da média de 20 dias (29 mi) e candle de rejeição', 'stop': '60,40', 'alvos': '64,05 · 67,99 · 70,20', 'rr': '1,8 · 4,8 · 6,5'},
   {'nome': '2 · acumulação', 'nota': 'até 1/2 da posição', 'entrada': '57,40 – 60,00', 'gatilho': 'Perda de 61,40 atravessando o vazio, com divergência positiva no IFR semanal', 'stop': '56,00', 'alvos': '64,05 · 67,99', 'rr': '2,0 · 3,4'},
   {'nome': 'Alternativa', 'nota': 'compra por força', 'entrada': '> 68,70', 'gatilho': 'Fechamento semanal acima do LVN de 68,62 e da MMA 20 diária, com volume', 'stop': '66,40', 'alvos': '72,29 · 75,22', 'rr': '1,6 · 2,8'},
  ],
  'nota': 'R/R da tranche 1 calculado a partir de 61,70 e da tranche 2 a partir de 58,70. **Com opções:** o condor de ferro desta análise ganha justamente se o preço ficar entre as pontas; quem prefere direção pode trocar a put vendida de 60,20 por uma venda de put coberta, que coloca a entrada na zona de acumulação.',
 },
 'cenarios': {
  'titulo': 'Base R$ 58 – 72: lateral entre o bloco antigo e as médias',
  'linhas': [
   {'cenario': 'Baixista', 'prob': '25%', 'faixa': '52 – 60', 'premissas': 'Minério abaixo de US$ 85, 3T26 abaixo da prévia e STF desfavorável. Perda de 61,40 com volume, travessia do vazio e teste da POC de 20 meses (53,12).'},
   {'cenario': 'Base', 'prob': '50%', 'faixa': '58 – 72', 'premissas': 'Minério entre US$ 85 e US$ 100 e dólar acima de R$ 5,20 sustentando o resultado em reais. Lateralização entre o bloco antigo de volume e as médias de 50 e 100 dias.'},
   {'cenario': 'Altista', 'prob': '25%', 'faixa': '70 – 78', 'premissas': 'Minério acima de US$ 100 com estímulo chinês, guidance de cobre forte e dólar alto. Rompe 68,62 e busca a VWAP de 6 meses (75,22) e a MMA 200 (78,71).'},
  ],
  'nota': '* Probabilidades são julgamento do estudo, não saída de modelo. Para referência estatística: a volatilidade de 60 dias (26% a.a.) projeta, em 126 pregões, R$ 53,52 – 77,45 a 1 desvio-padrão; com a de 250 dias (28%), R$ 52,90 – 78,36.',
 },
 'gatilhos': {
  'melhora': ['Fechamento acima de R$ 68,62 com volume: rompe o range e o upthrust', '3T26 com EBITDA por tonelada de finos de US$ 31,9 ou mais', 'Minério de volta acima de US$ 95', 'Dólar sustentado acima de R$ 5,30', 'Divergência positiva no IFR semanal'],
  'piora': ['Fechamento abaixo de R$ 61,40 com volume acima de 40 mi: abre o vazio até 57–60', '3T26 com corte de guidance ou provisão tributária', 'Minério abaixo de US$ 88', 'Novo teste de 68 com volume alto e fechamento fraco', 'Decisão desfavorável no STF'],
 },
 'fontes': FONTES('VALE3', '; prévia do 3T26 da Genial (19/10) e calendário de balanços da Rankia; contexto do estudo de 15/10'),
 'corpo': [
  ('- **Resultado do 3T26 da Vale:** confira a data. Se ainda não saiu, é um evento binário dentro do prazo da estrutura, e vale reduzir a posição antes dele.',
   '- **Resultado do 3T26 em 29/10, após o fechamento:** evento binário daqui a três pregões. Com ATR de R$ 2,03, o balanço pode levar o preço a uma das pontas. Considere montar o condor só depois do resultado, ou com metade do tamanho antes dele.'),
 ],
}
aplica(V, cfg)
