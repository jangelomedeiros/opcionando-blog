# Revisão: textos e rótulos do catálogo (rascunho do Claude)

## 1. Números dos textos que viraram marcadores

Os textos das estruturas (racional, "o que esperar" e notas) citavam os números do exemplo de 02/10/2026.
Agora cada número vira um marcador que a página preenche com a montagem atual (grade mais recente).
**Nenhuma palavra mudou**: com os valores de 02/10, os marcadores reproduzem o texto original.

**Quando a página usa os números atuais:** só se a remontagem preservou o desenho da estrutura e o texto não tem
nenhum número, percentual, data ou mês fixo nem marcador "conferir". Nos outros casos, o texto e a tabela da aba Visão
mostram o exemplo de 02/10 (com a nota "Exemplo calibrado") e só o gráfico usa a grade mais recente. Para uma estrutura
passar a usar os números atuais, reescreva os trechos fixos dela (veja as linhas "sem correspondência" e "conferir").

- **ok**: só um valor da montagem servia.
- **conferir**: mais de um valor servia; foi usado o primeiro. Confira se o sentido é esse.
- **sem correspondência**: o número não vem direto da montagem; continua fixo e pode ficar desatualizado. Reescreva à mão se precisar.

| Estrutura | Número | Marcador | Situação |
|---|---|---|---|
| covered-call | 25,04 | `{p2.k}` | ok |
| booster-call | 23,54 | `{p2.k}` | ok |
| booster-call | 24,54 | `{p3.k}` | ok |
| booster-call | 25,54 | — | sem correspondência: continua fixo |
| booster-call | 23,54 | `{p2.k}` | ok |
| booster-call | 25,54 | — | sem correspondência: continua fixo |
| booster-put | 22,54 | — | sem correspondência: continua fixo |
| bwb | 0,25 | — | sem correspondência: continua fixo |
| bwb | 0,25 | — | sem correspondência: continua fixo |
| bull-spread | 23,54 | `{p1.k}` | ok |
| bull-spread | 24,54 | `{p2.k}` | ok |
| quatermine-v1 | 0,28 | — | sem correspondência: continua fixo |
| quatermine-v2 | 1,19 | — | sem correspondência: continua fixo |
| call-compra | 23,79 | `{p1.k}` | ok |
| call-compra | 2,04 | `{p1.px}` | ok |
| call-compra | 25,83 | `{be1}` | conferir (também serviria: `{p1.k+p1.px}`) |
| call-compra | 23,79 | `{p1.k}` | ok |
| call-venda | 25,04 | `{p1.k}` | ok |
| call-venda | 1,49 | `{p1.px}` | ok |
| call-venda | 26,53 | `{be1}` | conferir (também serviria: `{p1.k+p1.px}`) |
| call-venda | 25,04 | `{p1.k}` | ok |
| call-venda | 26,53 | `{be1}` | conferir (também serviria: `{p1.k+p1.px}`) |
| put-compra | 23,79 | `{p1.k}` | ok |
| put-compra | 1,75 | `{p1.px}` | ok |
| put-compra | 22,04 | `{be1}` | conferir (também serviria: `{p1.k-p1.px}`) |
| put-compra | 23,79 | `{p1.k}` | ok |
| trava-alta-put | 23,79 | `{p1.k}` | ok |
| trava-alta-put | 23,29 | `{p2.k}` | ok |
| trava-alta-put | 23,79 | `{p1.k}` | ok |
| trava-alta-put | 23,79 | `{p1.k}` | ok |
| trava-alta-put | 23,29 | `{p2.k}` | ok |
| trava-alta-put | 0,50 | `{p2.k-p1.k}` | ok |
| trava-baixa-call | 23,79 | `{p1.k}` | ok |
| trava-baixa-call | 24,54 | `{p2.k}` | ok |
| trava-baixa-call | 23,79 | `{p1.k}` | ok |
| trava-baixa-call | 24,54 | `{p2.k}` | ok |
| seagull | 22,54 | `{p1.k}` | ok |
| seagull | 25,04 | `{p2.k}` | ok |
| seagull | 26,79 | `{p3.k}` | ok |
| seagull | 1,75 | `{p3.k-p2.k}` | ok |
| seagull | 26,79 | `{p3.k}` | ok |
| seagull | 22,54 | `{p1.k}` | ok |
| fence | 25,04 | `{p2.k}` | ok |
| fence | 23,54 | `{p3.k}` | ok |
| fence | 22,54 | `{p4.k}` | ok |
| fence | 22,54 | `{p4.k}` | ok |
| fence | 25,04 | `{p2.k}` | ok |
| straddle-compra | 23,79 | `{p1.k}` | conferir (também serviria: `{p2.k}`) |
| straddle-compra | 20,00 | `{be1}` | ok |
| straddle-compra | 27,58 | `{be2}` | ok |
| straddle-compra | 3,79 | — | sem correspondência: continua fixo |
| strangle-compra | 25,04 | `{p1.k}` | ok |
| strangle-compra | 22,54 | `{p2.k}` | ok |
| strangle-compra | 19,86 | `{be1}` | ok |
| strangle-compra | 27,72 | `{be2}` | ok |
| straddle-venda | 23,79 | `{p1.k}` | conferir (também serviria: `{p2.k}`) |
| straddle-venda | 3,79 | — | sem correspondência: continua fixo |
| straddle-venda | 23,79 | `{p1.k}` | conferir (também serviria: `{p2.k}`) |
| straddle-venda | 20,00 | `{be1}` | ok |
| straddle-venda | 27,58 | `{be2}` | ok |
| strangle-venda | 25,04 | `{p1.k}` | ok |
| strangle-venda | 22,54 | `{p2.k}` | ok |
| strangle-venda | 2,68 | — | sem correspondência: continua fixo |
| strangle-venda | 22,54 | `{p2.k}` | ok |
| strangle-venda | 25,04 | `{p1.k}` | ok |
| strangle-venda | 19,86 | `{be1}` | ok |
| strangle-venda | 27,72 | `{be2}` | ok |
| condor | 22,54 | `{p2.k}` | ok |
| condor | 25,04 | `{p3.k}` | ok |
| condor | 21,54 | `{p1.k}` | ok |
| condor | 26,79 | `{p4.k}` | ok |
| condor | 0,90 | — | sem correspondência: continua fixo |
| borboleta | 1,25 | `{p2.k-p1.k}` | conferir (também serviria: `{p3.k-p2.k}`) |
| borboleta | 23,79 | `{p2.k}` | ok |
| borboleta | 0,15 | — | sem correspondência: continua fixo |
| borboleta | 1,10 | — | sem correspondência: continua fixo |
| borboleta | 23,79 | `{p2.k}` | ok |
| thl-put | 23,79 | `{p1.k}` | ok |
| thl-put | 23,70 | `{p2.k}` | ok |
| thl-put | 0,02 | — | sem correspondência: continua fixo |
| thl-put | 0,09 | `{p2.k-p1.k}` | ok |
| thl-put | 23,79 | `{p1.k}` | ok |
| thl-put | 23,70 | `{p2.k}` | ok |
| thl-perene | 23,79 | `{p1.k}` | conferir (também serviria: `{p2.k}`) |
| thl-perene | 23,79 | `{p1.k}` | conferir (também serviria: `{p2.k}`) |
| calendar-butterfly | 22,79 | `{p1.k}` | ok |
| calendar-butterfly | 24,54 | `{p3.k}` | ok |
| calendar-butterfly | 23,79 | `{p2.k}` | ok |
| calendar-butterfly | 23,79 | `{p2.k}` | ok |
| booster-fly | 23,54 | `{p2.k}` | ok |
| booster-fly | 24,54 | `{p3.k}` | ok |
| booster-fly | 26,79 | `{p4.k}` | ok |
| booster-fly | 23,54 | `{p2.k}` | ok |
| booster-fly | 25,54 | — | sem correspondência: continua fixo |
| malha-bw | 23,54 | `{p1.k}` | ok |
| malha-bw | 24,54 | `{p2.k}` | ok |
| malha-bw | 26,79 | `{p3.k}` | ok |
| malha-bw | 24,54 | `{p2.k}` | ok |
| malha-bw | 23,54 | `{p1.k}` | ok |
| malha-bw | 24,54 | `{p2.k}` | ok |
| malha-bw | 26,79 | `{p3.k}` | ok |
| malha-bw | 0,25 | — | sem correspondência: continua fixo |
| hyperfly | 22,54 | `{p1.k}` | ok |
| hyperfly | 23,79 | `{p2.k}` | ok |
| hyperfly | 24,54 | `{p3.k}` | ok |
| hyperfly | 0,25 | — | sem correspondência: continua fixo |
| hyperfly | 0,02 | — | sem correspondência: continua fixo |
| hyperfly | 23,79 | `{p2.k}` | ok |
| hyperfly | 24,54 | `{p3.k}` | ok |
| fly-modular | 22,54 | `{p1.k}` | conferir (também serviria: `{p4.k}`) |
| fly-modular | 23,79 | `{p2.k}` | ok |
| fly-modular | 25,04 | `{p3.k}` | ok |
| fly-modular | 22,54 | `{p1.k}` | conferir (também serviria: `{p4.k}`) |
| fly-modular | 1,19 | `{p4.px}` | ok |
| fly-modular | 22,54 | `{p1.k}` | conferir (também serviria: `{p4.k}`) |
| modulo-q | 23,54 | `{p1.k}` | ok |
| modulo-q | 24,54 | `{p2.k}` | ok |
| modulo-q | 24,54 | `{p2.k}` | ok |
| booster-horizontal | 1,75 | `{p2.px}` | ok |
| booster-horizontal | 1,14 | `{p1.px}` | ok |
| booster-horizontal | 23,79 | `{p1.k}` | conferir (também serviria: `{p2.k}`) |
| booster-horizontal | 23,79 | `{p1.k}` | conferir (também serviria: `{p2.k}`) |
| booster-horizontal | 0,04 | — | sem correspondência: continua fixo |
| linha-mannerheim | 23,79 | `{p1.k}` | conferir (também serviria: `{p2.k}`, `{p3.k}`) |
| linha-mannerheim | 23,79 | `{p1.k}` | conferir (também serviria: `{p2.k}`, `{p3.k}`) |
| gl-shortput-booster | 23,79 | `{p2.k}` | conferir (também serviria: `{p3.k}`, `{p4.k}`) |
| asym-wings-diagonal | 24,54 | `{p1.k}` | ok |
| asym-wings-diagonal | 23,79 | `{p2.k}` | ok |
| asym-wings-diagonal | 22,70 | `{p3.k}` | ok |
| asym-wings-diagonal | 23,79 | `{p2.k}` | ok |
| straddle-perene | 23,79 | `{p1.k}` | conferir (também serviria: `{p2.k}`, `{p3.k}`) |
| straddle-perene | 23,79 | `{p1.k}` | conferir (também serviria: `{p2.k}`, `{p3.k}`) |
| straddle-perene | 0,33 | — | sem correspondência: continua fixo |
| strangle-p | 23,29 | `{p1.k}` | ok |
| strangle-p | 24,29 | `{p2.k}` | conferir (também serviria: `{p3.k}`) |
| strangle-p | 24,29 | `{p2.k}` | conferir (também serviria: `{p3.k}`) |
| strangle-p | 1,08 | — | sem correspondência: continua fixo |
| box-perene | 1,00 | `{p2.k-p1.k}` | conferir (também serviria: `{p3.k-p1.k}`, `{p4.k-p2.k}`, `{p4.k-p3.k}`) |
| box-perene | 0,96 | — | sem correspondência: continua fixo |
| box-p | 23,54 | `{p1.k}` | conferir (também serviria: `{p4.k}`) |
| box-p | 24,54 | `{p2.k}` | conferir (também serviria: `{p3.k}`) |
| box-p | 24,54 | `{p2.k}` | conferir (também serviria: `{p3.k}`) |
| box-p | 23,54 | `{p1.k}` | conferir (também serviria: `{p4.k}`) |
| colar-perene | 22,70 | `{p2.k}` | ok |
| colar-perene | 25,04 | `{p3.k}` | ok |
| colar-perene | 22,70 | `{p2.k}` | ok |
| colar-perene | 25,04 | `{p3.k}` | ok |
| financiamento | 23,72 | `{spot}` | conferir (também serviria: `{p1.px}`) |
| financiamento | 22,54 | `{p2.k}` | ok |
| financiamento | 2,74 | `{p2.px}` | ok |
| financiamento | 20,98 | `{be1}` | ok |
| financiamento | 22,54 | `{p2.k}` | ok |
| financiamento | 20,98 | `{be1}` | ok |
| dividendo-sint | 25,04 | `{p2.k}` | ok |
| dividendo-sint | 0,45 | — | sem correspondência: continua fixo |
| dividendo-sint | 25,04 | `{p2.k}` | ok |
| anakha | 23,20 | `{p1.k}` | conferir (também serviria: `{p2.k}`) |
| anakha | 24,54 | `{p3.k}` | ok |
| anakha | 1,16 | — | sem correspondência: continua fixo |
| hedge-inverse | 23,79 | `{p1.k}` | conferir (também serviria: `{p2.k}`, `{p3.k}`, `{c1.k}`) |
| hedge-straddle-din | 23,29 | `{p1.k}` | conferir (também serviria: `{p2.k}`, `{c1.k}`) |
| hedge-straddle-din | 24,54 | `{p3.k}` | conferir (também serviria: `{p4.k}`) |
| hedge-straddle-din | 24,54 | `{p3.k}` | conferir (também serviria: `{p4.k}`) |
| hedge-booster-h | 23,79 | `{p1.k}` | conferir (também serviria: `{p2.k}`, `{p3.k}`, `{c1.k}`) |
| hedge-booster-v | 24,54 | `{p2.k}` | ok |
| hedge-booster-v | 23,79 | `{p1.k}` | conferir (também serviria: `{p3.k}`, `{c1.k}`) |
| hedge-assimetrico | 23,79 | `{p1.k}` | conferir (também serviria: `{p2.k}`, `{c1.k}`) |
| hedge-assimetrico | 23,79 | `{p1.k}` | conferir (também serviria: `{p2.k}`, `{c1.k}`) |
| hedge-assimetrico | 24,29 | `{p3.k}` | ok |
| hedge-straddle-ha | 23,79 | `{p1.k}` | conferir (também serviria: `{p2.k}`, `{c1.k}`) |
| hedge-straddle-ha | 23,79 | `{p1.k}` | conferir (também serviria: `{p2.k}`, `{c1.k}`) |
| hedge-straddle-ha | 25,04 | `{p3.k}` | ok |

## 2. Rótulos de nível e objetivo (rascunho)

Rascunho do Claude para os filtros do catálogo, a partir da família e do racional de cada estrutura. **Revise e corrija direto em `src/data/laboratorio/estruturas.json`** (campos `nivel` e `objetivo`).

| Estrutura | Nível | Objetivo | Motivo |
|---|---|---|---|
| covered-call | Iniciante | Renda | Base: renda sobre ações em carteira |
| cash-put | Iniciante | Renda | Base: prêmio para esperar comprar |
| booster-call | Intermediário | Renda | Booster |
| booster-put | Intermediário | Renda | Booster |
| b1 | Avançado | Renda | Módulos |
| b2 | Avançado | Renda | Módulos |
| b3-2x3 | Avançado | Renda | Módulos |
| b3-3x4 | Avançado | Renda | Módulos |
| bwb | Avançado | Volatilidade | asas |
| collar | Intermediário | Proteção | proteção financiada |
| bull-spread | Intermediário | Direcional | trava |
| bear-put-spread | Intermediário | Direcional | trava |
| thl-call | Avançado | Renda | tempo |
| clade | Avançado | Renda | tempo |
| straddle-long-put | Avançado | Volatilidade | híbrida |
| mannerheim | Avançado | Volatilidade | Mônadas |
| quatermine-v1 | Avançado | Volatilidade | Mônadas |
| quatermine-v2 | Avançado | Volatilidade | Mônadas |
| hexabox | Avançado | Volatilidade | Mônadas |
| monada-basica-call | Avançado | Volatilidade | Mônadas |
| monada-basica-put | Avançado | Volatilidade | Mônadas |
| call-compra | Iniciante | Direcional | compra simples de alta |
| call-venda | Avançado | Renda | venda a seco: risco ilimitado |
| put-compra | Iniciante | Proteção | seguro da carteira |
| trava-alta-put | Intermediário | Direcional | trava de crédito |
| trava-baixa-call | Intermediário | Direcional | trava de crédito |
| seagull | Intermediário | Direcional | trava financiada |
| fence | Intermediário | Proteção | proteção financiada |
| straddle-compra | Intermediário | Volatilidade | compra de vol |
| strangle-compra | Intermediário | Volatilidade | compra de vol |
| straddle-venda | Avançado | Volatilidade | venda de vol: risco ilimitado |
| strangle-venda | Avançado | Volatilidade | venda de vol: risco ilimitado |
| condor | Intermediário | Volatilidade | venda de vol com asas |
| borboleta | Intermediário | Volatilidade | borboleta clássica |
| thl-put | Avançado | Renda | tempo |
| thl-perene | Avançado | Renda | tempo |
| calendar-butterfly | Avançado | Renda | tempo |
| booster-fly | Avançado | Renda | Booster + borboleta |
| malha-bw | Avançado | Volatilidade | asas |
| hyperfly | Avançado | Volatilidade | asas |
| fly-modular | Avançado | Volatilidade | asas |
| modulo-q | Avançado | Renda | Módulos |
| booster-horizontal | Avançado | Renda | dois vencimentos |
| linha-mannerheim | Avançado | Direcional | gradiente |
| gl-shortput-booster | Avançado | Direcional | gradiente |
| asym-wings-diagonal | Avançado | Direcional | gradiente |
| straddle-perene | Avançado | Volatilidade | híbrida |
| strangle-p | Avançado | Renda | híbrida coberta |
| box-perene | Avançado | Renda | box: resultado travado |
| box-p | Avançado | Renda | box diagonal |
| colar-perene | Intermediário | Proteção | proteção longa |
| financiamento | Iniciante | Renda | variação da venda coberta |
| dividendo-sint | Iniciante | Renda | venda coberta parcial |
| anakha | Avançado | Renda | crédito semanal |
| hedge-inverse | Avançado | Ajuste | manejo de opção vendida |
| hedge-straddle-din | Avançado | Ajuste | manejo de opção vendida |
| hedge-booster-h | Avançado | Ajuste | manejo de opção vendida |
| hedge-calendar-line | Avançado | Ajuste | manejo de opção vendida |
| hedge-mannerheim | Avançado | Ajuste | manejo de opção vendida |
| hedge-booster-v | Avançado | Ajuste | manejo de opção vendida |
| hedge-assimetrico | Avançado | Ajuste | manejo de opção vendida |
| hedge-straddle-ha | Avançado | Ajuste | manejo de opção vendida |

## 3. Conflitos entre os POPs atuais e a metodologia do Prof. Su

Os cenários de manejo seguem a metodologia (pilares, regra dos 10%, regra dos R$ 0,20, sem hedge colateral, calendário do efeito hole). **Os textos dos seus POPs não foram alterados**; estes trechos batem de frente com a metodologia e pedem sua decisão de redação:

| Estrutura | Trecho do POP | Conflito |
|---|---|---|
| put-compra | "Seguro: role para frente quando faltarem cerca de 10 dias úteis" | Rolar seguro a seco mês a mês é o hedge colateral que a metodologia rejeita ("sangria"). |
| trava-alta-put | "role a trava inteira para baixo e para frente a crédito" | A rolagem leva a trava para uma série com mais de 12 du; travas direcionais cabem só entre 12 e 6 du. |
| trava-baixa-call | "role para cima e para frente a crédito" | Mesmo conflito com a janela de 12 a 6 du. |
| call-compra / put-compra | compra a seco com prazo de semanas | A metodologia reserva compras a seco para menos de 6 du (pozinhos assimétricos). |

**Rascunhos do Claude ajustados à metodologia:**
- venda coberta: saiu "Comprar PUT de proteção" (hedge colateral);
- straddle vendido: a proteção virou PUT longa no vencimento mais longo (como no Straddle com PUT longa).

**Para conferir:** as montagens das Mônadas no catálogo (exemplo de 02/10) nem sempre têm a mesma arquitetura dos exemplos dos POPs do Prof. Su (por exemplo, a quantidade de pontas da Quatermine e da Hexabox). Os cenários usam as pernas que estão no catálogo.
