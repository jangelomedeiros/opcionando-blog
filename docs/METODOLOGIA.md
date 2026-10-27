# Metodologia de análise · Canal Opcionando

Como o canal lê um papel e escolhe a estrutura de opções. Vale para os estudos completos (15/10/2026) e para as análises do site (a partir de 26/10/2026). Material educacional, não é recomendação de investimento.

## 1. Dados

- **Fonte:** TradingView (conector Trade), símbolos `BMFBOVESPA:TICKER`.
- **Janela:** cerca de 20 meses de pregões diários (17/fev/2025 em diante, 422 pregões em 26/10/2026), mais o semanal reconstruído a partir do diário.
- **Grade de opções:** planilha do opcoes.net.br ou Profit (RTD). Ver `planilhas/` e `scripts/grade.py`.
- **Prêmios:** sempre que houver grade, usar o último negócio. Se o último negócio estiver fora da curva (série vizinha incoerente, pregão com grande amplitude), usar o valor justo por Black-Scholes com a volatilidade implícita da grade e dizer isso no texto. Sem grade, o prêmio é teórico e a análise traz o alerta.
- **Juros no Black-Scholes:** r = ln(1 + Selic). Prazo em dias úteis / 252.

## 2. Indicadores (diário e semanal)

| Indicador | O que olhar |
|---|---|
| MMA 20 / 50 / 100 / 200 | Ordem das médias, preço acima ou abaixo, médias emboladas virando suporte ou resistência |
| MME 10 / 20 | Cruzamento e distância do preço |
| IFR 14 | Sobrecompra (> 70) e sobrevenda (< 30), variação em relação ao dia anterior |
| Estocástico K/D | Cruzamentos e extremos, sobretudo no semanal |
| CCI 20 | Esticamento: abaixo de −200 ou acima de +200 é raro |
| MACD | Cruzamento com a linha de sinal e histograma |
| ADX / DMI | ADX > 25 = tendência; qual DI está à frente |
| Bollinger 20,2 | Fechamento fora da banda = elástico esticado |
| ATR 14 | Volatilidade por pregão em R$ e em %; define distância de stop e tamanho da posição |
| Volatilidade | HV20, HV60, HV250 e implícita da grade. Implícita bem abaixo da realizada = opção barata (favorece comprar); acima = cara (favorece vender) |
| OBV | Máximo recente, variação em 20 pregões, divergências com o preço |
| Rating TradingView | Resumo de médias e osciladores nos dois tempos |

## 3. Relação preço × volume

- **Fluxo:** volume em dias de alta contra dias de queda em 20 e 60 pregões, comparado com o estudo anterior.
- **Volume relativo:** pregão do dia contra as médias de 20 e de 250 dias; ranking nos 20 meses.
- **Posição do fechamento no candle:** (fechamento − mínima) / (máxima − mínima). Acima de 80% com volume alto = demanda absorvendo; abaixo de 20% = oferta.
- **Eventos Wyckoff (Villahermosa):** clímax de venda (SC), reação automática (AR), teste secundário (ST), spring, upthrust, shakeout, esforço sem resultado, ausência de oferta. Clímax e spring só valem depois do teste.

## 4. Volume Profile

- Volume de cada pregão distribuído uniformemente entre mínima e máxima, em faixas de R$ 0,25 (R$ 0,10 para papéis abaixo de R$ 20).
- **Períodos:** 20 meses e 6 meses.
- **Área de valor:** 70% do volume em torno da POC (VAL, POC, VAH).
- **HVN e LVN:** nós de alto e baixo volume. LVN é vazio: o preço atravessa rápido.
- **% do volume abaixo do preço:** quanto do histórico sustenta o preço atual.
- **VWAPs ancoradas:** 2026, 6 meses, mínima e máxima de 20 meses, mínima e máxima de 6 meses e o 1º pregão depois de evento relevante (ex.: 1º turno). Mostram quem está preso.
- **Fibonacci:** retrações da perna relevante (38,2%, 50%, 61,8%, 78,6%) e extensões (127,2%).

## 5. Mapa de níveis e range

- O mapa junta as confluências do mais alto para o mais baixo: resistência, pivô, preço, suporte, vazio.
- **Range de negociação:** definido pelos eventos (mínima do clímax ou do spring, máxima do upthrust) e pelas bordas de valor (VAH/VAL, POC). Pode ser provável ou provisório.

## 6. Preço-teto, zona de acumulação e plano

- **Preço-teto:** preço máximo de entrada que entrega risco/retorno de pelo menos 2:1 com stop estrutural (abaixo do suporte que invalida a leitura).
- **Zona de acumulação:** onde se juntam as melhores confluências de suporte.
- **Tranches:** até metade da posição por tranche, cada uma com gatilho, stop, alvos e R/R calculados a partir do meio da faixa de entrada. Uma alternativa de compra por força com R/R explícito.
- **Ângulo Opcionando:** a estrutura de opções que traduz o plano (put coberta para entrar abaixo, travas para direção com risco definido, condor para lateralidade).

## 7. Escolha da estrutura

| Cenário | Volatilidade implícita | Estrutura típica |
|---|---|---|
| Alta com tendência | Barata | Trava de alta com call (débito) |
| Alta / range com suporte forte | Cara | Trava de alta com put (crédito) ou put coberta |
| Lateral com range definido | Média ou cara | Condor de ferro, strikes fora do range e em LVN/confluências |
| Clímax de venda / spring | Barata | Trava de alta com call até a POC ou o alvo da AR |
| Clímax de venda / spring | Cara | Put coberta abaixo da mínima do clímax |
| Baixa abaixo do valor | Cara | Trava de baixa com call acima da área de valor |

Regras: strikes em confluências do mapa (LVN, POC, VWAPs, Fibonacci); vencimento cobrindo o horizonte do range; conferir eventos binários dentro do prazo (balanços, eleições) e liquidez das séries.

## 8. Cenários de 6 meses e gatilhos

- Três cenários (baixista, base, altista) com probabilidades **de julgamento** e premissas explícitas.
- Referência estatística: projeção de 1 desvio-padrão em 126 pregões pela volatilidade de 60 e de 250 dias.
- Lista do que melhora e do que piora o quadro, com níveis e volumes objetivos.

## 9. Macro e micro

- **Macro:** tabela do setor (índice setorial, pares, commodities, juros, dólar, Ibovespa) com dia, 1M, 3M, 6M e ano, e leitura dos vetores.
- **Micro:** fundamentos TTM, último resultado trimestral, fatores de sustentação e de pressão, próximo evento com data confirmada.

## 10. Onde está o código

`scripts/` deste repositório. Ver `scripts/README.md`.
