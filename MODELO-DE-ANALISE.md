---
# ===============================================================
# MODELO DE ANÁLISE TÉCNICA
# Copie para src/content/analises/ com um nome como:
#   vale3-2026-11-03.md   →  vira /analises/vale3-2026-11-03/
# ===============================================================

ticker: 'VALE3'
empresa: 'Vale'
title: 'Título curto do estudo (ex.: Pullback no suporte de R$ 58)'
description: 'Uma ou duas frases: o cenário e a estrutura estudada.'
data: 2026-11-03                 # data do estudo
precoReferencia: 60.15           # fechamento usado na análise
cenario: 'Lateral para alta'     # Alta | Baixa | Lateral | Lateral para alta | Lateral para baixa | Indefinido
timeframe: 'Diário'
suportes: [58.20, 55.90]
resistencias: [62.40, 64.80]
volatilidade: 'IV de 28%, abaixo da média de 1 ano'   # opcional
grafico: 'vale3-2026-11-03'      # opcional: arquivo src/data/candles/vale3-2026-11-03.json

estrutura:
  nome: 'Trava de alta com call'
  racional: 'Por que essa estrutura combina com o cenário e com a volatilidade do momento.'
  vencimento: 'Dezembro/2026'
  pernas:
    - { op: 'compra', tipo: 'call', strike: 60.00, premio: 1.85, qtd: 100, codigo: 'VALEL600' }
    - { op: 'venda',  tipo: 'call', strike: 64.00, premio: 0.55, qtd: 100, codigo: 'VALEL640' }

invalidacao: 'Fechamento diário abaixo de R$ 58,20 invalida o cenário de alta.'
validade: 2026-12-18             # até quando o estudo é acompanhado
status: 'Em acompanhamento'      # Em acompanhamento | Encerrada | Invalidada
# resultado: 'Preencha ao encerrar: o que aconteceu com o papel e com a estrutura.'
# youtube: 'ID_DO_VIDEO'
draft: true                      # true = rascunho. Troque para false para publicar.
---

Contexto: tendência principal, onde o preço está em relação a ela.

## O que o gráfico mostra

Leitura dos níveis, volume, padrões (Wyckoff, médias, etc.).

## Por que esta estrutura

Relação entre cenário, volatilidade e a montagem escolhida.

## Plano de acompanhamento

O que observar, quando ajustar, quando encerrar.

## Blocos do estudo completo (opcionais)

Além dos campos básicos, a análise aceita os blocos do estudo completo do canal. Todos são opcionais e
aparecem na página na ordem: veredito (cartões no topo) → indicadores (+ `indicadoresNota`) → preço × volume
(+ `fluxo`) → Volume Profile (+ `perfilFaixas`, `perfilNotas`) → `macro` → `micro` → síntese e estrutura →
`plano` → `cenarios` → `gatilhos` → `fontes`. Textos aceitam `**negrito**`.
Exemplo completo: `src/content/analises/bbdc4-2026-10-26.md`.

```yaml
veredito:
  - { rotulo: 'Preço-teto de entrada', valor: 'R$ 15,40', destaque: true, texto: '...' }
  - { rotulo: 'Viés', valor: 'Lateral / clímax', tom: 'neutro', texto: '...' }   # tom: alta | baixa | neutro
macro:
  titulo: '...'
  tabela:
    - { ativo: 'BR10Y', ultimo: '15,42%', m1: '+8,3%', m3: '+4,3%', m6: '+10,1%', ano: '+12,1%', efeito: '...', inverte: true }
  pontos: ['**Juros.** ...']
micro: { titulo: '...', fundamentos: [{ nome: '...', valor: '...' }], sustentacao: ['...'], pressao: ['...'], evento: '...' }
plano: { titulo: '...', texto: '...', tranches: [{ nome, nota, entrada, gatilho, stop, alvos, rr }], nota: '...' }
cenarios: { titulo: '...', linhas: [{ cenario: Baixista|Base|Altista, prob: '25%', faixa: '12,5 – 14,6', premissas: '...' }], nota: '...' }
gatilhos: { melhora: ['...'], piora: ['...'] }
fontes: '**Dados:** ...'
```
