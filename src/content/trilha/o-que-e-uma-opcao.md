---
title: 'O que é uma opção'
description: 'Direito de um lado, obrigação do outro, e um preço no meio. O conceito que sustenta todo o resto da trilha.'
modulo: 1
objetivos:
  - 'Explicar com suas palavras o que é uma call e o que é uma put'
  - 'Saber quem tem direito e quem tem obrigação em cada operação'
  - 'Entender por que o risco do titular é limitado e o do lançador, não'
  - 'Calcular o ponto de equilíbrio de uma call ou put comprada'
---

## Uma opção é um contrato sobre o futuro

Imagine que você quer comprar um apartamento, mas ainda não tem certeza. Você combina com o dono:
"me dá 60 dias para decidir; se eu quiser, compro por R$ 500 mil". Para segurar o negócio, você paga
R$ 5 mil, que não voltam.

Se em 60 dias o bairro valorizou e o apartamento passou a valer R$ 600 mil, você exerce o seu direito
e compra por R$ 500 mil. Se desvalorizou, você simplesmente não compra, e perdeu só os R$ 5 mil.

**Isso é uma opção.** No mercado financeiro, o "apartamento" é uma ação, como <span class="ticker">PETR4</span>
ou <span class="ticker">VALE3</span>, e o contrato é negociado na bolsa.

<div class="caixa">

**Os três números de toda opção**

1. **Strike** (preço de exercício): o preço combinado. No exemplo, R$ 500 mil.
2. **Vencimento**: até quando vale o direito. No exemplo, 60 dias.
3. **Prêmio**: o preço da opção, pago por quem compra. No exemplo, R$ 5 mil.

</div>

## Dois lados: quem compra e quem vende

Toda opção tem duas pontas, e elas são **assimétricas**:

| | **Titular** (compra a opção) | **Lançador** (vende a opção) |
|---|---|---|
| No início | paga o prêmio | recebe o prêmio |
| O que tem | um **direito** | uma **obrigação** |
| Ganho máximo | pode ser grande | limitado ao prêmio |
| Perda máxima | limitada ao prêmio | pode ser grande |

O titular decide se exerce ou não. O lançador não decide nada: se o titular exercer, ele cumpre.

## Call e put

Existem dois tipos de opção, e a diferença é **qual direito** está sendo negociado:

- **Call** (opção de compra): o titular tem o direito de **comprar** a ação pelo strike. Ganha com a **alta**.
- **Put** (opção de venda): o titular tem o direito de **vender** a ação pelo strike. Ganha com a **queda**.

Do lado do lançador, é o espelho: quem vende call se obriga a vender a ação; quem vende put se obriga a comprar.

## Exemplo numérico: comprando uma call

A ação está a **R$ 38,00**. Você compra 100 calls com strike de **R$ 40,00**, pagando **R$ 0,80** por opção.
Custo total: R$ 80,00.

No vencimento, o que importa é se vale a pena exercer:

| Ação no vencimento | Vale exercer? | Resultado total |
|---:|---|---:|
| R$ 36,00 | Não. Comprar a 40 algo que vale 36? | −R$ 80,00 |
| R$ 40,00 | Indiferente | −R$ 80,00 |
| R$ 40,80 | Sim, empata | R$ 0,00 |
| R$ 43,00 | Sim, compra a 40 o que vale 43 | +R$ 220,00 |

O **ponto de equilíbrio** da call comprada é o strike mais o prêmio: `40,00 + 0,80 = 40,80`.

<div class="caixa">

**Teste você mesmo:** abra a [calculadora de payoff com este exemplo](/ferramentas/calculadora-de-payoff?preset=compra-de-call)
e mude o strike e o prêmio para ver o que acontece com o gráfico.

</div>

## E a put?

Mesma lógica, invertida. A ação está a R$ 38,00 e você compra uma put de strike **R$ 36,00** por **R$ 0,70**.

- Se a ação cair para R$ 33,00, você tem o direito de vender a 36 algo que vale 33: ganha R$ 3,00 por opção,
  menos o prêmio de R$ 0,70, ou seja, **R$ 2,30**.
- Se a ação ficar acima de R$ 36,00, você não exerce e perde só o prêmio.

O ponto de equilíbrio da put comprada é o strike menos o prêmio: `36,00 − 0,70 = 35,30`.

## Para que servem as opções?

Na prática, quase toda operação com opções cai em um destes três usos:

1. **Proteção**: comprar put para limitar a perda de ações que você já tem, como um seguro.
2. **Renda**: vender opções para receber o prêmio, aceitando uma obrigação em troca.
3. **Especulação**: comprar opções para ganhar com um movimento, arriscando só o prêmio.

Os três aparecem ao longo da trilha, sempre com o risco à vista.

<div class="caixa alerta">

**O erro mais comum de quem está começando** é olhar só para o ganho possível. Opção comprada que vence fora
do dinheiro vale **zero**, e isso acontece com muita frequência. Opção vendida sem cobertura pode gerar perda
**muito maior** que o prêmio recebido. Antes de qualquer operação, a pergunta é: quanto eu perco se der errado?

</div>

## Resumo do módulo

- Opção é o direito (titular) ou a obrigação (lançador) de negociar uma ação por um preço combinado até uma data.
- **Call** = direito de comprar. **Put** = direito de vender.
- O titular paga o prêmio e arrisca só ele. O lançador recebe o prêmio e assume o risco do outro lado.
- Ponto de equilíbrio: call comprada = **strike + prêmio**; put comprada = **strike − prêmio**.

No próximo módulo, você vai aprender a ler o **código** de uma opção na tela da corretora, e descobrir que
ele já conta se é call ou put e qual é o mês de vencimento.
