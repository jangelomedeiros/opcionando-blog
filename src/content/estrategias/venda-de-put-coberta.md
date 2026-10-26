---
title: 'Venda de put coberta'
description: 'Ser pago para esperar comprar uma ação por um preço abaixo do atual. Você recebe o prêmio e deixa o dinheiro reservado para honrar a compra.'
visao: 'Lateral para alta'
nivel: 'Iniciante'
objetivo: 'Renda'
ganhoMaximo: 'Prêmio recebido'
perdaMaxima: 'Strike − prêmio (se a ação for a zero)'
breakeven: 'Strike − prêmio'
montagem:
  - 'Vender 1 put com strike abaixo (ou perto) do preço atual'
  - 'Manter reservado em caixa o valor do strike × quantidade, para comprar as ações se for exercido'
preset: 'venda-de-put-coberta'
---

## A ideia em uma frase

Você aceita comprar uma ação por um preço que acha bom e recebe um prêmio só por assumir esse compromisso.
É como deixar uma ordem de compra abaixo do mercado, só que **sendo pago para esperar**.

## Por que "coberta"

Quem vende put assume a obrigação de **comprar** as ações pelo strike, se for exercido. A venda é coberta quando
o dinheiro para essa compra **já está reservado**. Sem essa reserva, você depende de margem e pode ser obrigado a
comprar ações sem ter o dinheiro.

## Exemplo numérico

A ação está a **R$ 38,00**. Você vende 100 puts de strike **R$ 36,00** por **R$ 0,70** e recebe **R$ 70,00**.
Para ficar coberto, deixa **R$ 3.600,00** reservados (36,00 × 100).

| Ação no vencimento | O que acontece | Resultado total |
|---:|---|---:|
| R$ 40,00 | Put vira pó. Você fica com o prêmio | +R$ 70,00 |
| R$ 36,00 | Put vira pó (ou indiferente) | +R$ 70,00 |
| R$ 35,30 | Exercida: compra a 36, ação vale 35,30 | R$ 0,00 |
| R$ 32,00 | Exercida: compra a 36, ação vale 32 | −R$ 330,00 |

Se for exercido, você termina com 100 ações a um **custo efetivo de R$ 35,30** (strike menos prêmio), abaixo
dos R$ 38,00 que a ação valia quando você montou a operação.

## Quando faz sentido

- Você **quer ter** essa ação e acha bom o preço do strike.
- Você tem o dinheiro disponível e aceita deixá-lo parado até o vencimento.
- O prêmio compensa: compare com o que esse dinheiro renderia no CDI pelo mesmo prazo.

## Os riscos de verdade

<div class="caixa alerta">

**1. Queda forte.** Se a ação despencar, você é obrigado a comprar no strike, bem acima do preço de mercado.
O prêmio só amortece até o ponto de equilíbrio.

**2. Comprar uma ação que você não queria.** Só venda put de ação que você aceitaria ter na carteira, no strike
escolhido, mesmo depois de uma queda.

**3. Ganho limitado.** O máximo que você ganha é o prêmio, mesmo que a ação dispare.

</div>

## Venda coberta de call x venda de put coberta

No vencimento, as duas têm um gráfico de payoff **muito parecido**: ganho limitado e risco concentrado na queda.
A diferença está no ponto de partida:

| | Venda coberta de call | Venda de put coberta |
|---|---|---|
| Você começa com | Ações | Dinheiro |
| Se for exercido | Vende as ações | Compra as ações |
| Bom para | Gerar renda numa carteira que já existe | Entrar numa ação por um preço menor |

## Checklist antes de montar

- [ ] Eu quero ter essa ação a esse preço?
- [ ] O dinheiro para a compra (strike × quantidade) está separado?
- [ ] O prêmio, no prazo da operação, compensa em relação ao CDI?
- [ ] Sei o que faço se a ação cair muito abaixo do strike?
