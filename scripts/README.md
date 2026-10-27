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
