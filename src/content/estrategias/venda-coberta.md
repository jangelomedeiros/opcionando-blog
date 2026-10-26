---
title: 'Venda coberta de call'
description: 'Receber prêmio sobre ações que você já tem, aceitando vendê-las por um preço combinado. A porta de entrada mais comum no mercado de opções.'
visao: 'Lateral para alta'
nivel: 'Iniciante'
objetivo: 'Renda'
ganhoMaximo: '(Strike − preço de compra da ação) + prêmio'
perdaMaxima: 'Preço de compra da ação − prêmio (se a ação for a zero)'
breakeven: 'Preço de compra da ação − prêmio'
montagem:
  - 'Ter (ou comprar) as ações, em lotes de 100'
  - 'Vender 1 call para cada ação, com strike acima do preço atual'
preset: 'venda-coberta'
---

## A ideia em uma frase

Você tem as ações e "aluga" a possibilidade de alguém comprá-las de você por um preço combinado. O aluguel é o
prêmio, e ele fica com você aconteça o que acontecer.

## Exemplo numérico

Você tem 100 ações compradas a **R$ 38,00** e vende 100 calls de strike **R$ 40,00** por **R$ 0,80**.
Recebe na hora **R$ 80,00**.

| Ação no vencimento | O que acontece | Resultado total |
|---:|---|---:|
| R$ 34,00 | Call vira pó. Você fica com as ações e o prêmio | −R$ 320,00 |
| R$ 37,20 | Call vira pó. A queda da ação é compensada pelo prêmio | R$ 0,00 |
| R$ 38,00 | Call vira pó. Você ganha o prêmio | +R$ 80,00 |
| R$ 40,00 | Call vira pó (ou fica indiferente) | +R$ 280,00 |
| R$ 45,00 | Call é exercida: você vende a 40 | +R$ 280,00 |

O **ganho máximo** é R$ 280,00: R$ 2,00 de valorização até o strike, mais R$ 0,80 de prêmio, vezes 100.
Acima de R$ 40,00, o ganho para de crescer, porque você vai entregar as ações pelo strike.

## Quando faz sentido

- Você tem uma visão **neutra ou levemente positiva** para a ação.
- Você **aceita vender** as ações no strike escolhido. Se não aceita, não venda a call.
- Você quer gerar renda recorrente sobre uma carteira que pretende manter.

## Os riscos de verdade

<div class="caixa alerta">

**1. O prêmio não protege contra quedas fortes.** No exemplo, ele só cobre R$ 0,80 de queda. Se a ação cair 20%,
você perde quase tanto quanto quem só tinha a ação.

**2. Você abre mão da alta acima do strike.** Se a ação disparar para R$ 50,00, quem só tinha a ação ganha
R$ 1.200,00. Você ganha R$ 280,00.

**3. Exercício antecipado.** No Brasil, a maioria das calls de ações é americana: pode ser exercida antes do
vencimento, especialmente perto da data de dividendos.

</div>

## Como escolher o strike

| Strike | Prêmio | Chance de exercício | Perfil |
|---|---|---|---|
| Dentro do dinheiro (ITM) | Maior | Alta | Mais proteção, menos alta |
| No dinheiro (ATM) | Médio | Média | Equilíbrio |
| Fora do dinheiro (OTM) | Menor | Baixa | Mais espaço para a ação subir |

Não existe strike certo: existe o strike coerente com a sua visão e com o preço pelo qual você aceita vender.

## Checklist antes de montar

- [ ] Eu aceito vender as ações pelo strike escolhido?
- [ ] A quantidade de calls vendidas é **igual ou menor** que a quantidade de ações? (senão, parte fica descoberta)
- [ ] Sei o que faço se a ação cair forte?
- [ ] Conferi se há data de dividendos antes do vencimento?
