# Scripts de análise · Opcionando

Rodar sempre da raiz do repositório (`python3 scripts/arquivo.py`). Dependências: `numpy`, `openpyxl`, `pyyaml`, `playwright` (só para as prévias). A metodologia está em `docs/METODOLOGIA.md`.

| Ordem | Script | O que faz | Entrada → saída |
|---|---|---|---|
| 1 | *(coleta)* | Baixar o OHLCV diário de cada papel no TradingView (conector Trade) | → `dados-brutos/AAAA-MM-DD/ohlcv/TICKER.json` |
| 2 | `analise.py` | Médias, IFR, MACD, ADX/DMI, Bollinger, HV, OBV, fluxo, Volume Profile 20m/6m, VWAPs ancoradas, extremos | `ohlcv/` → `calculados/perfil_*.json` e `candles_*.json` (copiar para `src/data/perfil/` e `src/data/candles/`) |
| 3 | `sem.py` | Indicadores semanais e a lista dos últimos pregões com volume relativo | `ohlcv/` → terminal |
| 4 | `todos.py` | ATR, fluxo 20/60, projeções de volatilidade, volume por faixa, VWAPs | `ohlcv/` → `calculados/stats6.json` |
| 5 | `grade.py` | Lê a grade de opções (opcoes.net.br) e lista as séries de um vencimento numa faixa de strikes | `grade.py arquivo.xlsx 50 70` → terminal |
| 6 | `black_scholes.py` | Prêmio teórico para conferir últimos negócios | → terminal |
| 7 | `blocos.py` + `estudo-2026-10-26/c_*.py` | Monta os blocos do estudo completo (veredito, indicadores, fluxo, VP, macro, micro, plano, cenários, gatilhos) dentro do `.md` da análise | `stats6.json` + config → `src/content/analises/*.md` |
| 8 | `previa.py` | Screenshots das páginas com o site rodando em `npx astro preview` | → `previas/` |
| — | `planilha_rtd.py` | Gera a planilha RTD do Profit com as séries das estruturas | → `planilhas/opcionando-rtd-estruturas.xlsx` |

Os arquivos `estudo-2026-10-26/c_*.py` são o registro de como cada análise de 26/10 foi escrita: servem de modelo para as próximas.

Em `dados-brutos/2026-10-26/ohlcv/`, os arquivos `old_*.json` têm os 299 primeiros pregões e os demais os 123 últimos; `old_t.json` e `t.json` são os carimbos de tempo.

## Grade de opções e preços do catálogo (só biblioteca padrão)

**Um comando:** `node scripts/nova_grade.mjs PLANILHA.xlsx dados-brutos/AAAA-MM-DD/ohlcv/BBAS3.json` faz os passos abaixo em ordem (importa a grade, gera os candles do OHLCV do TradingView, aponta `src/data/laboratorio/fontes.json` para os dois, otimiza, builda e testa) e para no primeiro erro. Com `--plano`, só lista os passos. O OHLCV diário vem do conector TradingView (formato de colunas `t, o, h, l, c, v`), com pelo menos 323 pregões para a média de 200.

**Diário do operador:** cada execução do otimizador grava `src/data/diario/AAAA-MM-DD.json` (os vereditos daquela grade). A página `/estrategias/diario/` confere cada montagem no 1º vencimento pelo fechamento dos candles em uso; ou seja, a apuração avança sozinha quando chegam candles novos (nova grade, ou só `atualizar_candles.mjs` + `fontes.json`). Não regrave o registro de uma data antiga depois de mudar o otimizador: o diário vale pelo que foi recomendado no dia.

Passo a passo, se preferir:

1. `python -I scripts/importar_grade.py PLANILHA.xlsx src/data/grades/bbas3-AAAA-MM-DD.json` — guarda a grade completa do opcoes.net.br por data (histórico).
2. `node scripts/otimizar_montagens.mjs src/data/grades/bbas3-AAAA-MM-DD.json src/data/candles/bbas3-AAAA-MM-DD.json` — monta as 62 estruturas na grade da forma otimizada (desenho e regras do POP, maior valor esperado por risco com a vol realizada, manejo aplicável) e regrava `src/data/laboratorio/mercado.csv`, `src/data/laboratorio/validacao.json` (caixa "Validação do operador") e o relatório `docs/revisao/AAAA-MM-DD-validacao-estruturas.md` (a seção "Leitura do operador" é preservada). Critério em `docs/superpowers/specs/2026-11-16-otimizacao-montagens-design.md`.
3. `npm run build && npm test` — confere que todas as pernas existem na grade, que nada ficou vencido e que `validacao.json` bate com `mercado.csv`.

`scripts/atualizar_mercado.py` (remontagem proporcional, sem otimização) ficou como referência histórica e como fonte das janelas do POP lidas pelos testes; **não** o use para regravar o `mercado.csv`, porque ele não atualiza o `validacao.json` e os testes acusam a divergência.
