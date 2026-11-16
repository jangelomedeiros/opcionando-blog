# Depuração: anotações de aula ("Imersão em opções", 04/03/2022) e análise do NotebookLM

Fontes cruzadas:
1. **Anotações de aula**: PDF "Imersão em opções" (Google Drive), da série do Prof. Su. É a fonte primária.
2. **Análise do NotebookLM** ("Manual Prático de POP e Manejos"), gerada a partir do material.
3. **O catálogo do site**: `estruturas.json`, que vem do Laboratório do autor.

**Regra de desempate:** quando há conflito, valem as **anotações de aula**. Elas batem com o catálogo em todos os hedges.

## 1. Arquitetura dos 8 hedges: o NotebookLM diverge das anotações em 7 deles

| Hedge | Anotações de aula = catálogo | NotebookLM | Veredito |
|---|---|---|---|
| Inverse Line | −M25 + A25 sobre a −A25 (recompra a CALL e vende PUT no mesmo strike) | recompra a curta e vende a CALL longa (B30) | ❌ NotebookLM inventou uma inversão de calendário |
| Straddle dinâmico | +A23 − A25 − M25 sobre a −A23 | vende de 30% a 50% de PUT ATM | ❌ |
| Booster horizontal | −2M25 + N25 (PUTs) | versão em CALL, com strike deslocado | ❌ |
| Calendar Line | −M25 + B25 − A25 | +B30 − A32, sem a PUT | ❌ |
| Linha de Mannerheim | −M25 + 3B25 − 3A25 (3 THLs de **CALL**) | CALL vendida + 3 THLs de **PUT** | ❌ confundiu com a Mônada e com a Linha reversa (LMR) |
| Booster vertical | +M29 − 2M27 (**PUTs**) | +A28 − 2A30 (CALLs) | ❌ |
| Assimétrico (PUT vendida) | −A20 + 2B21 (**CALLs**) | 2×3 em PUTs | ❌ |
| Straddle HA (PUT vendida) | −A20 + 2D22, mantendo −M20 (**CALLs longas**) | +2 PUTs longas | ❌ |

**Integrado:** a arquitetura do catálogo, que é a das anotações. **Do NotebookLM, só as ideias de manejo** compatíveis com as pernas reais e com a metodologia:
- rolar as curtas com redução de 10%;
- zerar no miolo;
- zerar a ponta que virou pó e rolar a viva;
- rolar as curtas entre 12 e 6 du;
- aplicar a regra dos R$ 0,20.

## 2. Outras correções ao NotebookLM

- **Strangle/P coberto:** o NotebookLM descreve uma PUT longa de 1 a 2 anos. O catálogo tem CALL vendida, CALL longa e PUT vendida, sem PUT longa. As anotações só citam "Box/p ou Strangle Coberto Long Put" (título e vídeo) e "ideal montar em mercados sem volatilidade". Os cenários seguem o catálogo. **O dono precisa confirmar qual é a montagem certa.**
- **Box:** "a B3 liquida compulsoriamente pelo valor exato" é impreciso. O box é liquidado pelo exercício das opções, e as CALLs da B3 são americanas (risco de exercício antecipado). O cenário do box cita esse risco.
- **Tickers de exemplo** ("BBASJ24", "BBASJ247"): foram inventados pelo NotebookLM e não foram usados.
- **"Hedge colateral consome até 7% do patrimônio ao ano":** número sem fonte nas anotações. Não foi usado.
- **TLAD:** as anotações dão 3B30 − 4A30 + 3N30 − 4M30 (proporção 3:4), com regras de rolagem na alta e na baixa. O catálogo tem 1:2. Os cenários seguem o catálogo; a proporção 3:4 fica para o dono decidir.

## 3. O que as anotações acrescentam e já foi integrado

- **Os 8 hedges e os 2 Box, o Booster horizontal 1,5×1 e o Strangle/P** ganharam cenários de manejo. Agora as **62 estruturas** têm manejo.
- **THL/p:** novo cenário "caiu muito abaixo do strike", com o caminho "hedge com broken wings" (delta estrutural de no máximo −1).
- **Fly modular:** as anotações confirmam o **par binário** (PUT vendida). A divergência apontada antes no relatório foi corrigida.

## 4. Regras de entrada das anotações: sugestão para o contexto dos POPs (para o dono aprovar)

| Estrutura | Quando montar (anotações) |
|---|---|
| Trava de alta com CALL | depois de grandes quedas |
| Trava de baixa com PUT | depois de grandes altas |
| Seagull | quando o mercado cai forte |
| Fence | quando o mercado sobe forte (defesa de quem tem o ativo) |
| Straddle perene | quando o mercado cai muito; a custo zero (−M24 −A24 +F24) |
| Strangle/P | mercado sem volatilidade |
| Box perene | mercado lateral |
| Módulo Q | quando se está com CALL ou PUT dentro do dinheiro |
| Financiamento | ativos de taxa menor: índices, ETFs, empresas sólidas, baixa vol |
| Dividendo sintético | só sobre uma pequena parcela da carteira |
| THL perene | opções de 3 a 6 meses, não de 2 anos; calcular o custo mensal (unidade temporal) |
| Borboleta | asas com no mínimo 2,5 desvios padrão (PETR4: 1,5); opções fora do dinheiro; stop na metade da segunda asa |
| Calendar butterfly | com CALL e ratio; BOVA11, PETR4, ABEV3 |
| GL short put + booster | PETR4/ABEV3, com custódia e exposição pequena |
| Módulo B3 | custódia e caixa para assumir; delta intermodular zero |
| Booster, Straddle com PUT longa | com ativos em custódia |
| Venda coberta | é taxa: se a opção ficar muito no dinheiro e a rolagem não der crédito, deixar exercer |

## 5. Conceitos para a página do protocolo (sugestão)

- **Teoria Modular:** uma estrutura fechada (sem ponta aberta) tem delta estrutural; se não for fechada, calcula-se o delta de transição. Preferência por delta estrutural positivo.
- **Atributos da riqueza:** propriedade, usufruto, lastro e assunção. **Equivalência binária e cardinal.**
- **Efeito hole em 22/21, 12 e 6 du:** confirma o calendário publicado.

## 6. Descartado

- Links de vídeos e de sites: são referências, sem conteúdo.
- Seções vazias das anotações: TLAD coberta, GL TLAD, GL de Módulo Q, Box/p.
- A notação truncada do booster para PUT vendida ("−R17 → F120 − 2F127 + F17").
- A oferta de planilha do NotebookLM.

## 7. Decisões do autor (16/11/2026)

1. **Strangle/P coberto:** vale a montagem do catálogo (CALL vendida, CALL longa e PUT vendida). Nada muda.
2. **TLAD:** passa à proporção **3:4** das anotações (3 longas para 4 curtas em cada lado). As pernas, o texto e o POP foram atualizados, e a estrutura foi remontada na grade de 13/11.
3. **Regras de entrada das anotações:** aprovadas. Entraram no "Contexto de entrada" dos POPs, com o prefixo "Anotações de aula:".
