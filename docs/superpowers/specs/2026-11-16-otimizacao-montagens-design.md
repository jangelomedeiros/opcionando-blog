# Otimização das montagens e validação das 62 estruturas (design)

Data: 16/11/2026. O autor delegou a forma ("prossiga da melhor forma que você achar"). Todas as escolhas abaixo são do Claude.

## Intenção

Assumir a posição de **operador**: montar cada estrutura na grade mais recente (BBAS3, 13/11/2026) da forma que **ganha dinheiro**, sem trair o racional de cada uma. Depois, **validar** cada estrutura em quatro aspectos:
- **montagem:** as pernas, o crédito ou débito e se o desenho e as regras do POP foram respeitados;
- **lucro:** valor esperado, probabilidade de lucro, ganho máximo, perda máxima e equilíbrios;
- **contexto:** a visão do POP contra o momento do mercado (tendência e vol implícita contra a realizada);
- **dinâmica do lucro:** de onde vem o ganho (tempo, vol, direção), a partir das gregas da entrada.

## Critério (escolha do Claude)

- **A vantagem vem da vol realizada.** Sob a vol implícita, toda montagem a preço justo tem valor esperado perto de zero. O valor esperado e a probabilidade de lucro são medidos com uma **distribuição lognormal sem tendência** (drift zero), com σ igual à **vol realizada de 120 pregões sem os 2 maiores retornos absolutos** (os gaps do balanço). O relatório mostra também o resultado com a vol implícita, para comparar.
- **Objetivo:** maximizar **valor esperado ÷ risco**, em que o risco é a perda máxima no vencimento ou, se ela for ilimitada, a pior perda numa faixa de 0,3× a 2,5× o spot.
- **Restrições:**
  - probabilidade de lucro de pelo menos 50% (se nenhuma montagem passar, a restrição é relaxada e isso fica marcado);
  - valor esperado positivo; se nenhuma montagem tiver, o veredito é **"não montar agora"** e a página mostra a melhor montagem disponível, com o aviso.
- **Desenho preservado** (a mesma regra de coerência do catálogo):
  - em todo par de pernas de opção, a ordem e a igualdade dos strikes e dos vencimentos são as da referência;
  - as quantidades e os tipos são os da referência (TLAD 3:4 incluída).
- **Janela do primeiro vencimento** (calendário do Prof. Su e POPs):
  - travas de alta e baixa, de 6 a 12 du;
  - borboletas, flies, BWB e THL, mais de 22 du;
  - Mônadas e Módulos (início de série), de 22 a 45 du;
  - B1 (giro de 3 a 5 du) e Anakha (semanal), até 13 du;
  - as janelas do POP já codificadas em `atualizar_mercado.py` valem quando existirem;
  - as demais, de 8 a 45 du.
- **Regras do POP:** nas estruturas de um só tipo e um só vencimento com delta estrutural negativo, crédito ≥ |delta estrutural| (regra de entrada da BWB). Nas estruturas cujo POP pede custo zero ou crédito na entrada, crédito ≥ −R$ 0,05 por unidade.
- **Preços:** só séries **negociadas em 13/11** (último negócio). Se uma estrutura não tiver candidata só com séries negociadas, usam-se preços teóricos e isso fica marcado. A grade não tem oferta de compra e venda, então tudo é marcado como "conferir no book".
- **Espaço de busca:** strikes entre 0,75× e 1,25× o spot, mantendo a ordem do desenho.

## Saídas

- `src/data/laboratorio/mercado.csv`, regerado com as montagens otimizadas, no mesmo formato. O site inteiro passa a usá-las, e as 62 ficam coerentes com o mercado.
- `src/data/laboratorio/validacao.json`, com a validação de cada estrutura (os quatro aspectos e o veredito).
- Uma caixa **"Validação do operador"** na aba Visão de cada estrutura.
- O relatório `docs/revisao/2026-11-16-validacao-estruturas.md`, com o resumo do mercado, a tabela das 62 e os destaques.

## Não objetivos

Previsão de direção, otimização de quantidades ou proporções (são as do POP), e dados de compra e venda (o book).

## Arquitetura

- `src/lib/otimizacao/otimizar.ts`: lógica pura e testada (vol realizada robusta, avaliação de uma montagem, geração de candidatas que respeitam o desenho e as janelas, escolha).
- `scripts/otimizar_montagens.mjs`: lê a grade, os candles e as estruturas, e grava o `mercado.csv`, o `validacao.json` e o relatório.
