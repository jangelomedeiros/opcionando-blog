---
title: 'Call e put: o básico que ninguém te explica direito'
description: 'Direito, obrigação, prêmio e strike explicados com um exemplo numérico completo, do pregão até o vencimento.'
pubDate: 2026-10-24
pilar: 'Fundamentos'
tags: ['call', 'put', 'iniciantes']
# youtube: 'COLE_AQUI_O_ID_DO_VIDEO'
---

Antes de qualquer estratégia, trava ou ajuste, existe uma pergunta que precisa estar cristalina:
**o que exatamente eu comprei (ou vendi) quando operei uma opção?** Este artigo responde isso
com um exemplo numérico do começo ao fim.

## Opção é um contrato de direito (para um lado) e de obrigação (para o outro)

Toda opção tem duas pontas:

- **Titular** (quem compra): paga o prêmio e ganha um **direito**.
- **Lançador** (quem vende): recebe o prêmio e assume uma **obrigação**.

O que muda entre call e put é *qual* direito está sendo negociado.

| Tipo | Titular tem o direito de… | Lançador tem a obrigação de… |
|------|---------------------------|------------------------------|
| **Call** (opção de compra) | comprar o ativo pelo strike | vender o ativo pelo strike, se exercido |
| **Put** (opção de venda) | vender o ativo pelo strike | comprar o ativo pelo strike, se exercido |

<div class="caixa">

**Os três números que definem uma opção**

1. **Strike** (preço de exercício): o preço combinado para comprar ou vender o ativo.
2. **Vencimento**: a data limite do direito.
3. **Prêmio**: o preço da opção, pago pelo titular ao lançador.

</div>

## Exemplo completo: comprando uma call

Suponha uma ação cotada a **R$ 38,00**. Você compra uma call com:

- Strike: **R$ 40,00**
- Prêmio: **R$ 0,80** por ação
- Quantidade: **100 opções** (custo total de R$ 80,00)

O seu ponto de equilíbrio no vencimento é o strike mais o prêmio:
`40,00 + 0,80 = 40,80`. Abaixo disso, você perde dinheiro; acima, ganha.

| Ação no vencimento | Valor da call | Resultado por ação | Resultado total |
|-------------------:|--------------:|-------------------:|----------------:|
| R$ 36,00 | R$ 0,00 | −R$ 0,80 | −R$ 80,00 |
| R$ 40,00 | R$ 0,00 | −R$ 0,80 | −R$ 80,00 |
| R$ 40,80 | R$ 0,80 | R$ 0,00 | R$ 0,00 |
| R$ 43,00 | R$ 3,00 | +R$ 2,20 | +R$ 220,00 |

Repare na assimetria: **a perda máxima do titular é o prêmio pago** (R$ 80), enquanto o ganho
cresce conforme a ação sobe.

## E do outro lado da mesa?

O lançador dessa mesma call recebeu os R$ 80 de prêmio. O resultado dele é o espelho do seu:
ganha no máximo R$ 80 e, se a ação disparar, a perda pode crescer bastante, especialmente se
ele **não tiver** as ações em carteira (o famoso lançamento descoberto).

<div class="caixa alerta">

**Atenção:** vender opção não é "renda fácil". Você troca um ganho limitado (o prêmio) por um
risco que pode ser muito maior. É por isso que gestão de risco vem antes de qualquer estratégia.

</div>

## Resumo de bolso

- Comprou opção → pagou prêmio → tem **direito** → risco limitado ao prêmio.
- Vendeu opção → recebeu prêmio → tem **obrigação** → ganho limitado ao prêmio.
- Call aposta na alta (para o titular); put aposta na queda (para o titular).
- Ponto de equilíbrio da call comprada: **strike + prêmio**. Da put comprada: **strike − prêmio**.

No próximo artigo: por que o prêmio muda de valor mesmo quando a ação fica parada.
Spoiler: tem nome, e é **theta**.
