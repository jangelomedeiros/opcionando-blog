# Monta a ficha src/content/analises/bbas3-2026-11-12.md. Números de calculados/stats_BBAS3.json (calc_bbas.py),
# 5 minutos de 12/11 em intraday/, TradingView (conector Trade). Prêmios de opção TEÓRICOS (Black-Scholes):
# a grade do opcoes.net.br ainda mostrava os negócios de 11/11 quando o estudo foi feito.
import yaml
exec(open('scripts/estudo-2026-11-12/c_bancos.py').read().split('def fonte')[0].split('import yaml',1)[1])  # MACRO_TAB final de 12/11
fm = {
 'ticker': 'BBAS3', 'empresa': 'Banco do Brasil',
 'title': 'O balanço rompeu o range: gap de 11%, mínima do ano e o preço abaixo de toda a história recente',
 'description': 'O 3T26 abriu um gap entre R$ 15,67 e R$ 16,89 e jogou o BB abaixo do piso de 16,08 com 146 mi de ações. O alvo do rompimento (14,70) foi tocado no primeiro minuto. Agora, o gap é a resistência e 14,10–14,72 é o chão a defender.',
 'data': '2026-11-12', 'precoReferencia': 15.48, 'cenario': 'Baixa', 'timeframe': 'Diário, semanal e 5 minutos',
 'suportes': [14.72, 14.1, 13.85], 'resistencias': [15.67, 16.37, 16.89],
 'range': {'inferior': 14.72, 'superior': 16.89, 'rotulo': 'Do fundo do dia ao topo do gap'},
 'volatilidade': 'HV10 53% · HV20 128% (dois gaps em 13 pregões) · implícita a confirmar na grade de 13/11 (premissa do estudo: 45%)',
 'grafico': 'bbas3-2026-11-12', 'perfil': 'bbas3-2026-11-12',
 'veredito': [
  {'rotulo': 'Preço-teto de entrada', 'valor': 'R$ 14,70', 'destaque': True, 'texto': 'Só no reteste da mínima do balanço (14,72), que coincide com a extensão de 161,8% do range rompido (14,70). Com stop em 13,80, dá 1,7:1 até 15,67 e 2,7:1 até 16,37. A R$ 15,48, comprar é apostar contra um gap aberto logo acima.'},
  {'rotulo': 'Zona de defesa', 'valor': 'R$ 14,10 – 14,72', 'texto': 'Mínima de 12/11 e fundos de dezembro de 2021 e janeiro de 2022 (14,10–14,40), os últimos negócios a esses preços. Abaixo dela, o alvo medido do range é 13,85.'},
  {'rotulo': 'Resistência do gap', 'valor': 'R$ 15,67 – 16,89', 'texto': 'Gap aberto entre a máxima de 12/11 e a mínima de 11/11. No meio dele estão a retração de 61,8% (16,37), a VAL pós-clímax (16,35) e a VWAP do teste de 03/11 (16,18): é onde deve aparecer oferta.'},
  {'rotulo': 'Viés', 'valor': 'Baixa', 'tom': 'baixa', 'texto': 'A fase B falhou: o range 16,08–18,31 foi rompido com gap e 4,7× o volume médio. Tendência de baixa retomada em todos os tempos gráficos. O fechamento a 80% do candle mostra absorção no dia, mas não muda a tendência.'},
 ],
 'indicadores': [
  {'nome': 'Médias móveis', 'diario': 'MMA10 16,57 · MMA20 19,28 · MMA50 21,47 · MMA200 21,91', 'semanal': 'MMA20 20,77 · MMA50 21,87 · MMA200 24,06', 'sinal': 'baixa', 'leitura': 'O preço perdeu até a MMA 10, que tinha sido recuperada em 06/11. Está 20% abaixo da MMA 20 e 30% abaixo da MMA 200.'},
  {'nome': 'MME 10 / 20', 'diario': '17,12 / 18,58', 'semanal': '19,90 / 20,66', 'sinal': 'baixa', 'leitura': 'A MME 10 diária (17,12) passou para cima do gap: o primeiro alvo de qualquer repique já é resistência dupla.'},
  {'nome': 'IFR 14', 'diario': '25,9', 'semanal': '35,6', 'sinal': 'neutro', 'leitura': 'Sobrevenda no diário, mas acima da mínima de 24,1 do dia do clímax. Com o preço em mínima nova e o IFR acima da mínima anterior, há uma divergência de alta embrionária. Precisa de confirmação.'},
  {'nome': 'Estocástico K/D', 'diario': '9,2 / 10,3', 'semanal': '6,1 / 27,0', 'sinal': 'neutro', 'leitura': 'No piso nos dois tempos. Repique técnico é provável, reversão não.'},
  {'nome': 'CCI 20', 'diario': '−81', 'semanal': '−163', 'sinal': 'baixa', 'leitura': 'O semanal segue em extremo de venda, sem sinal de virada.'},
  {'nome': 'MACD', 'diario': '−1,73 × −1,50 (hist. −0,23)', 'semanal': '−0,73 × −0,16', 'sinal': 'baixa', 'leitura': 'O histograma diário, que vinha encolhendo, voltou a abrir. No semanal, o cruzamento para baixo se aprofundou.'},
  {'nome': 'ADX / DMI', 'diario': 'ADX 36,8 · +DI 16,4 · −DI 46,5', 'semanal': 'ADX 21,1', 'sinal': 'baixa', 'leitura': 'O −DI voltou a 46,5, perto do pico do clímax. Tendência de baixa forte e renovada.'},
  {'nome': 'Bandas de Bollinger', 'diario': '12,23 – 26,33', 'sinal': 'neutro', 'leitura': 'Bandas abertas pelos dois gaps. Sem utilidade como referência.'},
  {'nome': 'ATR 14', 'diario': 'R$ 1,01 (≈ 6,5% por pregão)', 'sinal': 'neutro', 'leitura': 'O dobro do normal do papel. Stops abaixo de R$ 0,80 serão atingidos pelo ruído.'},
  {'nome': 'Volatilidade histórica', 'diario': 'HV10 53% · HV20 128% · HV250 48%', 'sinal': 'neutro', 'leitura': 'Dois gaps (−29% e −9%) em 13 pregões. A volatilidade de 10 dias (53%) é a referência mais limpa para dimensionar risco.'},
  {'nome': 'OBV', 'diario': '−391 mi desde 26/10 · −691 mi em 20 pregões', 'sinal': 'baixa', 'leitura': 'O saldo pós-clímax piorou em 189 mi só em 12/11. A recuperação de volume dos dias 4 a 10/11 foi apagada.'},
  {'nome': 'Rating TradingView', 'diario': 'D −0,65 · venda forte', 'semanal': 'S −0,65 · venda forte', 'sinal': 'baixa', 'leitura': 'Voltou a venda forte no diário (era −0,35 em 06/11). Médias e osciladores em venda.'},
 ],
 'indicadoresNota': 'O quadro voltou ao pior momento de 26/10: médias todas acima do preço, ADX acima de 36 com o −DI em 46,5 e rating em venda forte nos dois tempos. O único ponto a favor é o **IFR diário em 25,9, acima da mínima de 24,1** do dia do clímax, mesmo com o preço R$ 1,76 abaixo daquele fundo. É uma divergência de alta inicial: vale como alerta para não vender no buraco, não como sinal de compra.',
 'eventos': [
  {'data': '26/out', 'evento': 'Clímax de venda: −29,3% com 286 mi', 'leitura': 'Primeiro gap, depois da eleição.'},
  {'data': '27/out–03/nov', 'evento': 'Reação até 18,31 e teste secundário em 16,08 (43,7 mi)', 'leitura': 'Desenho de fase B entre 16,08 e 18,31.'},
  {'data': '04–11/nov', 'evento': 'Lateral entre 16,23 e 17,39 com volume abaixo da média', 'leitura': 'Em 11/11, véspera do balanço, fechou na mínima do dia (16,89): o mercado se protegeu antes do número.'},
  {'data': '12/nov 10h10', 'evento': 'Abertura em 15,00 (−11,2%) e mínima de 14,72 no primeiro candle, com 14,8 mi em 5 minutos', 'leitura': 'O primeiro negócio só saiu às 10h10, após leilão prolongado. A mínima coincidiu com a extensão de 161,8% do range (14,70).'},
  {'data': '12/nov 10h40–15h00', 'evento': 'Repique a 15,60, recuo a 15,10 e máximas de 15,67 às 14h10 e às 15h00', 'leitura': 'A tarde foi de absorção: a ação recuperou 41% da perda máxima até as 15h.'},
  {'data': '12/nov 15h00–18h00', 'evento': 'Devolução lenta até 15,36 (17h25) e fechamento em 15,48 (−8,3%) no leilão', 'leitura': 'Duas tentativas em 15,67 falharam. O leilão de fechamento puxou o preço de 15,43 para 15,48, acima da VWAP do dia (15,35).'},
 ],
 'fluxo': [
  '**Volume de 146 mi, 4,7× a média de 250 dias** e o segundo maior pós-eleição, só atrás do clímax de 26/10 (286 mi). Rompimento de range com esse volume é sinal de fraqueza (SOW, na linguagem Wyckoff), não de pânico isolado.',
  '**Distribuição do volume no dia:** 34% na primeira hora (10h10–11h10), 24% até as 13h, 18% até as 15h e 24% nas três horas finais. O pânico teve hora marcada, mas a última hora voltou a pesar.',
  '**Duas máximas iguais em 15,67** (14h10 e 15h00) e devolução até o fechamento: a oferta apareceu exatamente no início do gap.',
  '**Saldo dos 13 pregões pós-clímax:** 91 mi em dias de alta contra 258 mi em dias de queda nos últimos 8 pregões. O fluxo comprador de 04 a 10/11 foi insuficiente.',
  '**Leitura Wyckoff:** a estrutura de 16,08–18,31 não era acumulação. O rompimento com gap e volume alto (SOW) retoma a fase de markdown. Um novo fundo exige outro clímax ou um teste da mínima com volume em queda, o que ainda não aconteceu.',
 ],
 'perfilFaixas': [{'faixa': f'{a} – {b}', 'pct': p} for a, b, p in [(28,30,5.8),(26,28,6.8),(24,26,15.0),(22,24,19.6),(20,22,32.4),(18,20,12.9),(16,18,6.4)]],
 'perfilNotas': [
  '**O preço saiu de vez da história recente.** Só 0,9% do volume de 20 meses foi negociado abaixo de R$ 15,48, praticamente só o pregão de 12/11. Não há suporte de volume embaixo: os suportes passam a ser gráficos (fundos de 2021–22) e medidos (extensões do range).',
  '**O perfil pós-clímax virou teto.** A área de valor de 26/10 a 11/11 vai de 16,35 a 17,85, com POC em 16,55. Quem comprou nesse período está, na média, 8% acima do preço: é oferta potencial em qualquer repique até 16,35–16,55.',
  '**Gap aberto de R$ 15,67 a R$ 16,89.** Gaps de balanço costumam ser testados, mas nem sempre são fechados. O meio do gap (16,28) está colado na VAL pós-clímax (16,35) e na retração de 61,8% (16,37).',
  '**VWAPs:** dia do balanço 15,35 (intradiário, 5 min) · teste de 03/11: 16,18 · clímax 16,82 · 1º turno 20,10 · 6 meses 20,47 · 2026: 21,76.',
  '**Alvos medidos:** a altura do range (2,23) projetada do piso rompido dá 13,85. A extensão de 161,8% (14,70) foi tocada no primeiro minuto do pregão.',
 ],
 'mapa': [
  {'preco': '18,31', 'tipo': 'resistencia', 'confluencia': 'Reação automática de 27/10: topo do range rompido'},
  {'preco': '17,85', 'tipo': 'resistencia', 'confluencia': 'VAH do perfil pós-clímax'},
  {'preco': '16,82 – 16,89', 'tipo': 'resistencia', 'confluencia': 'Topo do gap (mínima de 11/11) e VWAP ancorada no clímax'},
  {'preco': '16,18 – 16,37', 'tipo': 'resistencia', 'confluencia': 'Meio do gap: VWAP do teste de 03/11, VAL pós-clímax (16,35) e retração de 61,8% (16,37)'},
  {'preco': '15,67', 'tipo': 'resistencia', 'confluencia': 'Início do gap e máxima dupla de 12/11 (14h10 e 15h00)'},
  {'preco': '15,48', 'tipo': 'preco', 'confluencia': 'Fechamento de 12/11, a 80% do candle'},
  {'preco': '15,35', 'tipo': 'pivo', 'confluencia': 'VWAP intradiária do dia do balanço'},
  {'preco': '14,70 – 14,72', 'tipo': 'suporte', 'confluencia': 'Mínima de 12/11 e extensão de 161,8% do range'},
  {'preco': '14,10 – 14,40', 'tipo': 'suporte', 'confluencia': 'Fundos mensais de dez/2021 e jan/2022'},
  {'preco': '13,85', 'tipo': 'suporte', 'confluencia': 'Alvo medido do range (altura de 2,23 projetada de 16,08)'},
  {'preco': '13,51', 'tipo': 'suporte', 'confluencia': 'Fundo mensal de mar/2021'},
 ],
 'macro': {
  'titulo': 'O choque foi do BB: o setor caiu 1,8%, o Santander subiu 3,6%',
  'fonte': 'Fechamento de 12/11/2026, TradingView. Nos juros e no dólar, alta aparece em vermelho.',
  'tabela': [dict(x, destaque=True) if x['ativo'].startswith('Banco do Brasil') else x for x in MACRO_TAB],
  'pontos': [
   '**Choque idiossincrático.** O BB caiu 8,3% num dia em que Itaú e Bradesco fecharam praticamente estáveis e o Santander subiu 3,6%. O problema é do banco, não do setor.',
   '**BB Seguridade no radar.** A queda de 5,0% (mínima de −9%) mostra o mercado precificando a seguradora como fonte de capital do controlador.',
   '**Juro e dólar subindo juntos.** O título de 10 anos voltou a 15,40% e o dólar a R$ 5,64, com IPCA e fiscal no radar. É o ambiente que adia a queda da inadimplência.',
  ],
 },
 'micro': {
  'titulo': 'O 3T26 em números',
  'fundamentos': [
   {'nome': 'Lucro ajustado 3T26', 'valor': 'R$ 1,27 bi (−66,5% a/a)'},
   {'nome': 'Consenso LSEG', 'valor': 'R$ 3,5 bi'},
   {'nome': 'Resultado antes de impostos', 'valor': 'prejuízo de R$ 832 mi'},
   {'nome': 'ROE 3T26 · 9M26', 'valor': '2,8% · 6,2%'},
   {'nome': 'Custo do crédito 3T26', 'valor': 'R$ 21,2 bi (+18,4%)'},
   {'nome': 'Inadimplência 90d total · agro · PF', 'valor': '6,08% · 6,92% · 9,14%'},
   {'nome': 'Custeio agro · cartão', 'valor': '12,52% · 16,35%'},
   {'nome': 'Cobertura', 'valor': '137,8% (era 174,3%)'},
   {'nome': 'Capital principal', 'valor': '10,80% (conforto: ~11%)'},
   {'nome': 'Guidance de lucro 2026', 'valor': 'R$ 9–11 bi (era R$ 18–22 bi)'},
   {'nome': 'Payout 2026 · 2027', 'valor': '25% · 25%, sem intermediários em 2027'},
   {'nome': 'P/VP', 'valor': '0,48×'},
  ],
  'sustentacao': [
   '**Fechamento a 80% do candle**, acima da VWAP do dia: houve comprador na mínima.',
   '**Desconto de 0,48× o patrimônio**, o menor da série.',
   '**Guidance novo implica 4T26 de R$ 0,4 a 2,4 bi**: a barra para o próximo balanço ficou muito baixa.',
   '**Leitura cíclica (Suno):** crise do agro, não de solvência; tese de dividendos adiada, não perdida.',
  ],
  'pressao': [
   '**Prejuízo antes de impostos** e lucro sustentado por R$ 3,1 bi de crédito tributário.',
   '**Capital principal abaixo da linha de conforto** e créditos tributários de prejuízo fiscal saltando de R$ 0,2 bi para R$ 14,7 bi em nove meses.',
   '**"Risco moral" de médios e grandes produtores**, que não se resolve com safra boa.',
   '**Dividendo no mínimo legal até 2027**, tirando o principal motivo de compra do investidor pessoa física.',
   '**Consenso negativo:** BTG, Citi, XP, Itaú BBA e Empiricus cautelosos; Safra rebaixou para venda.',
  ],
  'evento': '**Próximos marcos:** data-com do JCP do 4T26 cancelada com os intermediários; balanço do 4T26 em fevereiro de 2027. Antes disso, qualquer notícia sobre capital (venda de ativos, BB Seguridade, aporte) é o que move o papel.',
 },
 'estrutura': {
  'nome': 'Trava de baixa com call acima do gap',
  'racional': 'Repete a lógica que funcionou em 26/10: vender o repique em vez de apostar na queda. Vende a call de R$ 16,45 (BBASL165), acima do meio do gap e da VAL pós-clímax, e compra a de R$ 17,45 (BBASL180) para limitar o risco. Ganha se o BB ficar abaixo de 16,45 até 18/12, inclusive de lado. PRÊMIOS TEÓRICOS (Black-Scholes, vol de 45%, Selic 13,75%): a grade de 12/11 ainda não estava publicada. Monte só com crédito de pelo menos R$ 0,25.',
  'vencimento': 'Dezembro/2026 (18/12)',
  'pernas': [
   {'op': 'venda', 'tipo': 'call', 'strike': 16.45, 'premio': 0.57, 'qtd': 100, 'codigo': 'BBASL165'},
   {'op': 'compra', 'tipo': 'call', 'strike': 17.45, 'premio': 0.30, 'qtd': 100, 'codigo': 'BBASL180'},
  ],
 },
 'plano': {
  'titulo': 'Não comprar o gap: esperar o teste do fundo',
  'texto': 'O rompimento cancelou a tese de fase B. Comprar a R$ 15,48 é ficar entre um gap aberto acima (15,67–16,89) e nenhum suporte de volume abaixo. O plano só compra em duas situações: **teste da mínima com volume em queda** (o desenho de um novo fundo) ou **fechamento do gap com volume** (o mercado desfazendo o balanço). Fora disso, a estrutura é vender o repique.',
  'tranches': [
   {'nome': '1 · teste do fundo', 'nota': 'até 1/2 da posição', 'entrada': '14,10 – 14,72', 'gatilho': 'Reteste da mínima de 12/11 com volume abaixo de 60 mi e fechamento acima de 14,70', 'stop': '13,80', 'alvos': '15,67 · 16,37', 'rr': '1,7 · 2,7'},
   {'nome': '2 · após o fundo', 'nota': 'até 1/2 da posição', 'entrada': '15,40 – 15,70', 'gatilho': 'Só depois da tranche 1: rompimento de 15,67 com volume acima de 60 mi', 'stop': '14,65', 'alvos': '16,37 · 16,89', 'rr': '0,9 · 1,5'},
   {'nome': 'Alternativa', 'nota': 'compra por força', 'entrada': '> 16,95', 'gatilho': 'Fechamento do gap: fechamento acima de 16,89 com volume acima de 60 mi', 'stop': '15,95', 'alvos': '17,85 · 18,31', 'rr': '0,9 · 1,4'},
  ],
  'nota': 'R/R da tranche 1 a partir de 14,50; da tranche 2, a partir de 15,55; da alternativa, a partir de 16,95. **Estrutura anterior (06/11):** a put de 16,20 vendida a R$ 0,36 está dentro do dinheiro (valor intrínseco de 0,72; valor teórico perto de R$ 1,17). Se for exercida em 18/12, a compra sai a 15,84 efetivos, 2,3% acima do fechamento. Quem quer a ação pode aceitar o exercício e usar o stop de 13,80; quem não quer pode rolar para janeiro em strike menor ou zerar, assumindo a perda.',
 },
 'cenarios': {
  'titulo': 'Base R$ 14,7 – 16,4: digestão abaixo do gap até o vencimento',
  'linhas': [
   {'cenario': 'Baixista', 'prob': '35%', 'faixa': '13,4 – 14,7', 'premissas': 'Perda de 14,72 com volume: alvo medido em 13,85 e fundo de 2021 em 13,51. Gatilhos: notícia de capitalização, venda de ativos em condição ruim ou nova piora de crédito.'},
   {'cenario': 'Base', 'prob': '45%', 'faixa': '14,7 – 16,4', 'premissas': 'Digestão do balanço entre a mínima e o meio do gap, com volume caindo. Repiques param entre 15,67 e 16,37.'},
   {'cenario': 'Altista', 'prob': '20%', 'faixa': '16,4 – 17,8', 'premissas': 'Fechamento do gap com volume, apoiado em sinais de capital (repactuação, BB Seguridade) ou em inadimplência estabilizando nos dados mensais do Banco Central.'},
  ],
  'nota': '* Probabilidades são julgamento do estudo, não saída de modelo. Para referência estatística: com volatilidade de 45% até 18/12 (25 pregões), 1 desvio-padrão vai de R$ 13,43 a 17,84.',
 },
 'gatilhos': {
  'melhora': ['Teste de 14,72 com volume abaixo de 60 mi e fechamento acima', 'Rompimento de 15,67 com volume', 'Fechamento acima de 16,89 (gap fechado)', 'Anúncio de medida de capital sem diluição do acionista'],
  'piora': ['Fechamento abaixo de 14,72 com volume acima de 60 mi', 'Perda de 14,10 (fundos de 2021–22)', 'Notícia de capitalização com emissão de ações ou venda de ativos a desconto', 'Novos rebaixamentos com cortes de estimativa para 2027'],
 },
 'fontes': '**Dados:** TradingView via conector Trade (BMFBOVESPA:BBAS3 diário, 434 pregões de 17/fev/25 a 12/nov/26; 5 minutos de 12/11; mensal desde 2020 para os fundos de 2021–22; indicadores D/S; pares e índices no fechamento de 12/11). Balanço do 3T26 e opiniões de analistas: Exame, InfoMoney, Seu Dinheiro e Investidor10 (12/11). Volume Profile com volume de cada pregão distribuído entre mínima e máxima, área de valor de 70%. **Prêmios da estrutura são teóricos** (Black-Scholes, vol de 45%, Selic de 13,75%, 25 pregões até 18/12): a grade do opcoes.net.br ainda mostrava os negócios de 11/11. Confira a grade antes de montar. Scripts em `scripts/estudo-2026-11-12/`. **Ressalvas:** probabilidades de cenário são julgamento do estudo. Material educacional do canal Opcionando, não é recomendação de investimento.',
 'invalidacao': 'Fechamento acima de R$ 16,89 com volume acima de 60 mi fecha o gap e invalida o viés de baixa: a trava deve ser desmontada e o cenário muda para lateral. Na outra ponta, fechamento abaixo de 14,72 com volume cancela a tranche 1 até um novo teste.',
 'validade': '2026-12-18', 'status': 'Em acompanhamento', 'draft': False,
}
body = '''
## A leitura em uma frase

O balanço do 3T26 abriu um **gap de R$ 15,67 a R$ 16,89** e rompeu para baixo o range de 16,08–18,31 com
**146 milhões** de ações. A fase B que a [análise de 06/11](/analises/bbas3-2026-11-06/) acompanhava falhou: o BB
voltou à tendência de baixa, com o preço abaixo de 99% do volume negociado em 20 meses.

## O pregão do balanço, em 5 minutos

| Horário | Preço | Leitura |
|---|---:|---|
| 10h10 | 15,00 → **14,72** | Primeiro negócio só depois de leilão prolongado. Mínima no primeiro candle, com 14,8 mi em 5 minutos, exatamente na extensão de 161,8% do range (14,70) |
| 10h40 | 15,60 | Repique de R$ 0,88 em meia hora |
| 11h15 – 13h00 | 15,10 – 15,40 | Lateral, com 24% do volume do dia |
| 14h10 e 15h00 | **15,67** | Máxima dupla: a oferta apareceu no início do gap |
| 17h25 | 15,36 | Devolução lenta na última hora |
| Fechamento | **15,48** | −8,3% no leilão de fechamento, a 80% do candle e acima da VWAP do dia (15,35) |

O desenho é de **pânico na abertura e absorção ao longo do dia**, mas sem força para atacar o gap. Isso é comum em
balanços muito negativos: o primeiro dia vende o susto; os seguintes decidem se o mercado acredita na recuperação.

## Por que a trava de baixa com call

Em 26/10, a melhor estrutura foi **vender o repique**, e ela capturou 71% do ganho máximo. O quadro de agora é
parecido: tendência de baixa forte, gap aberto acima e oferta esperando entre 16,18 e 16,89.

- **Vende BBASL165 (16,45) e compra BBASL180 (17,45)**, vencimento em 18/12.
- **Crédito teórico de R$ 0,27** por ação, com risco máximo de R$ 0,73: 1 para 2,7.
- **Ganha se o BB ficar abaixo de 16,45**, o que inclui os cenários de baixa e de lateral (80% no julgamento do
  estudo). Pela volatilidade de 45%, a chance de a call vendida virar pó é de cerca de 67%.

<div class="caixa alerta">

**Prêmios teóricos.** A grade do opcoes.net.br ainda mostrava os negócios de 11/11 quando este estudo foi feito. Os
valores da tabela vêm de Black-Scholes com volatilidade de 45%. **Confira a grade de 13/11** e monte só se o crédito
for de pelo menos R$ 0,25. A volatilidade implícita depois de um balanço costuma cair; se cair muito, o crédito
some e a estrutura não vale a pena.

</div>

## E a put de 16,20 de 06/11?

A put vendida a R$ 0,36 está **dentro do dinheiro**. Três caminhos, conforme a tese de quem a vendeu:

1. **Aceitar o exercício** em 18/12 e comprar a 15,84 efetivos, com o stop de 13,80 desta ficha.
2. **Rolar para janeiro** (15/01) em strike menor, empurrando a compra para mais perto do fundo testado.
3. **Zerar**, recomprando a put e assumindo a perda, para quem não quer mais a ação depois do balanço.

Não há resposta certa: depende de você ainda querer ser sócio do banco ao preço de 15,84.

## Plano de acompanhamento

- **Próximos pregões:** o teste de 14,72 com volume baixo é o sinal de fundo a esperar. Um fechamento abaixo dele
  com volume leva a 13,85.
- **Repiques:** 15,67 é o primeiro teto; 16,18–16,37 o principal. A trava ganha se o preço parar ali.
- **Para a história completa** do balanço e da reação do mercado, leia
  [O curioso caso de BBAS3, parte 2: depois do balanço](/blog/o-curioso-caso-de-bbas3-depois-do-balanco/).
'''
txt = yaml.dump(fm, allow_unicode=True, sort_keys=False, width=4000, default_flow_style=None)
open('src/content/analises/bbas3-2026-11-12.md', 'w').write('---\n' + txt + '---\n' + body)
print('ok')
