# Validação das 62 estruturas — grade de 13/11/2026

Gerado por `scripts/otimizar_montagens.mjs`. Critério em `docs/superpowers/specs/2026-11-16-otimizacao-montagens-design.md`.

## Mercado

- BBAS3 a R$ 15,10; médias de 20, 50 e 200: R$ 19,28, R$ 21,48, R$ 21,91 — tendência **baixa**.
- Vol realizada: HV20 128%, HV60 84%, HV120 62% (contaminadas pelo gap de −34,7% em 26/10).
- Sem os 2 maiores gaps: **33%** em 120 pregões (base do valor esperado) e 39% em 60 (estresse).
- Vol implícita ATM entre 34% e 45% nos vencimentos usados: a implícita está acima da realizada sem gaps, então **a vantagem estatística hoje é de quem vende vol**.

Veredito: 55 para montar, 2 com ressalva e 5 para não montar agora. Preços de último negócio: conferir no book antes de executar.

## As 62

| Estrutura | Veredito | Montagem | Crédito | VE | VE estresse | Prob. lucro | Pior caso | Viés × tendência | Vol | Θ/du | Avisos |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Venda coberta — benchmark | Montar | +1 ação / -1 BBASL158 15,70 (23 du) | 0,51 | 0,075 | -0,037 | 66% | -10,06 | altista (contra) | vende (a favor) | 0,018 | vantagem frágil: some com a vol do estresse |
| PUT garantida em caixa — benchmark | Montar | -1 BBASX13 13,95 (23 du) | 0,25 | 0,114 | 0,038 | 85% | -9,17 | altista (contra) | vende (a favor) | 0,010 |  |
| Booster CALL integrado à ação | Montar | +1 ação / +1 BBASL145 14,45 / -2 BBASL150 14,95 (23 du) | 0,59 | 0,119 | -0,005 | 70% | -9,98 | altista (contra) | vende (a favor) | 0,021 | vantagem frágil: some com a vol do estresse |
| Booster reverso de PUT | Montar | +1 BBASM163 16,20 / -2 BBASM15 14,70 (39 du) | -0,15 | 0,167 | 0,039 | 50% | -8,82 | neutra | vende (a favor) | 0,010 |  |
| Módulo B1 — Boosters contrapostos ATM | Montar | +1 BBASL13 13,95 / -2 BBASL14 14,70 / +1 BBASX155 15,45 / -2 BBASX14 14,70 (23 du) | 0,84 | 0,445 | 0,218 | 67% | -21,46 | baixista (a favor) | vende (a favor) | 0,039 |  |
| Módulo B2 — Boosters afastados | Montar | +1 BBASA151 13,70 / -2 BBASA161 15,70 / +1 BBASM181 16,70 / -2 BBASM15 14,70 (39 du) | -1,02 | 0,185 | -0,154 | 54% | -21,07 | neutra | vende (a favor) | 0,028 | nenhuma montagem fecha a custo zero hoje: regra do POP relaxada; vantagem frágil: some com a vol do estresse |
| Módulo B3 — versão 2×3 bilateral | Montar | +2 BBASA161 15,70 / -3 BBASA160 15,95 / +2 BBASM160 15,95 / -3 BBASM161 15,70 (39 du) | 1,21 | 0,209 | -0,086 | 63% | -20,09 | neutra | vende (a favor) | 0,021 | vantagem frágil: some com a vol do estresse |
| Módulo B3 — versão 3×4 bilateral | Montar | +3 BBASA161 15,70 / -4 BBASA160 15,95 / +3 BBASM160 15,95 / -4 BBASM161 15,70 (39 du) | 1,02 | 0,263 | -0,032 | 63% | -20,03 | neutra | vende (a favor) | 0,022 | vantagem frágil: some com a vol do estresse |
| Broken Wing Butterfly de CALL | Montar | +1 BBASL145 14,45 / -2 BBASL14 14,70 / +1 BBASL153 15,20 (23 du) | 0,36 | 0,242 | 0,243 | 100% | 0,00 | neutra | vende (a favor) | 0,006 |  |
| Collar — proteção financiada | Não montar agora | +1 ação / -1 BBASL158 15,70 / +1 BBASX151 13,70 (23 du) | 0,31 | -0,029 | -0,077 | 63% | -1,09 | altista (contra) | vende (a favor) | 0,009 | nenhuma montagem tem valor esperado positivo com a vol realizada de hoje |
| Trava de alta com CALL | Não montar agora | +1 BBASK155W4 15,50 / -1 BBASK160W4 16,00 (8 du) | -0,14 | -0,013 | 0,003 | 28% | -0,14 | altista (contra) | compra (contra) | -0,006 | nenhuma montagem tem valor esperado positivo com a vol realizada de hoje |
| Trava de baixa com PUT | Montar | +1 BBASW160W4 16,00 / -1 BBASW155W4 15,50 (8 du) | -0,30 | 0,070 | 0,055 | 72% | -0,30 | baixista (a favor) | vende (a favor) | 0,012 |  |
| THL de CALL — mesmo strike, vencimentos distintos | Montar | +1 BBASA15 14,70 / -1 BBASL14 14,70 (23 du) | -0,10 | 0,145 | 0,124 | 90% | -0,10 | neutra | compra (contra) | 0,006 |  |
| TLAD — Trava de Linha Assimétrica Dupla (antiga Clade) | Montar | +3 BBASA15 14,70 / -4 BBASL14 14,70 / +3 BBASM15 14,70 / -4 BBASX14 14,70 (23 du) | 0,96 | 0,865 | 0,520 | 66% | -21,70 | baixista (a favor) | vende (a favor) | 0,064 |  |
| Short straddle + PUT longa — proxy disponível | Montar | +1 BBASP149 14,82 / -1 BBASK155W4 15,50 / -1 BBASW155W4 15,50 (8 du) | 0,19 | 0,153 | 0,043 | 67% | -22,06 | baixista (a favor) | compra (contra) | 0,048 |  |
| Mônada de Buffon Mannerheim | Montar | -1 BBASL14 14,70 / -1 BBASX151 13,70 / +1 BBASM151 13,70 / -1 BBASX14 14,70 / +1 BBASM15 14,70 / -1 BBASX158 15,70 / +1 BBASM161 15,70 (23 du) | 0,84 | 0,287 | 0,127 | 71% | -22,21 | baixista (a favor) | vende (a favor) | 0,031 | desenho adaptado à grade: vencimento longo livre e strikes a até 10% da moneyness da referência; fora da janela do POP: a grade não tem os strikes do desenho nos vencimentos da janela; sem montagem só com séries negociadas no dia: usa preço teórico em parte das pernas |
| Mônada de Buffon Quatermine — V1 | Montar | -1 BBASK151 15,04 / +1 BBASL160 15,95 / -1 BBASW151 15,04 / +1 BBASX143 14,20 / -1 BBASW159 15,79 / +1 BBASM15 14,70 (3 du) | 0,09 | 0,145 | 0,076 | 75% | -2,30 | altista (contra) | compra (contra) | 0,093 |  |
| Mônada de Buffon Quatermine — V2 | Montar | +1 BBASA178 17,70 / -1.6 BBASX164 16,20 / +1 BBASM163 16,20 / -1.4 BBASX170 16,95 / +1 BBASM170 16,95 (23 du) | 1,33 | 0,186 | 0,136 | 53% | -10,94 | altista (contra) | compra (contra) | 0,002 | fora da janela do POP: a grade não tem os strikes do desenho nos vencimentos da janela |
| Hexabox — Mônada de 6 pontas | Montar | +1 BBASL145 14,45 / -2 BBASL14 14,70 / +1 BBASX158 15,70 / -2 BBASX155 15,45 / +1 BBASA154 15,45 / +1 BBASM15 14,70 (23 du) | 0,36 | 0,311 | 0,255 | 84% | -0,27 | neutra | compra (contra) | 0,014 | fora da janela do POP: a grade não tem os strikes do desenho nos vencimentos da janela |
| Mônada Básica / Primal — CALL | Montar | +1 BBASA15 14,70 / -1.2 BBASL14 14,70 / -0.2 BBASX14 14,70 (23 du) | 0,21 | 0,203 | 0,139 | 71% | -4,27 | neutra | vende (a favor) | 0,013 | fora da janela do POP: a grade não tem os strikes do desenho nos vencimentos da janela |
| Mônada Básica / Primal — PUT | Montar | +1 BBASM15 14,70 / -1.2 BBASX14 14,70 / -0.2 BBASL14 14,70 (23 du) | 0,21 | 0,105 | 0,039 | 63% | -4,40 | neutra | vende (a favor) | 0,011 | fora da janela do POP: a grade não tem os strikes do desenho nos vencimentos da janela |
| Compra de CALL ATM | Montar com ressalva | +1 BBASA154 15,45 (39 du) | -0,78 | 0,004 | 0,152 | 33% | -0,78 | altista (contra) | compra (contra) | -0,014 | valor esperado positivo, mas probabilidade de lucro abaixo de 50% |
| Venda de CALL a seco | Montar | -1 BBASL158 15,70 (23 du) | 0,51 | 0,075 | -0,037 | 74% | -21,54 | baixista (a favor) | vende (a favor) | 0,018 | vantagem frágil: some com a vol do estresse |
| Compra de PUT ATM | Não montar agora | +1 BBASM154 15,45 (39 du) | -0,85 | -0,071 | 0,077 | 36% | -0,85 | baixista (a favor) | compra (contra) | -0,006 | nenhuma montagem tem valor esperado positivo com a vol realizada de hoje |
| Trava de alta com PUT (crédito) | Montar com ressalva | -1 BBASW155W4 15,50 / +1 BBASW150W4 15,00 (8 du) | 0,30 | 0,029 | 0,030 | 45% | -0,20 | altista (contra) | compra (contra) | -0,000 | valor esperado positivo, mas probabilidade de lucro abaixo de 50% |
| Trava de baixa com CALL (crédito) | Montar | -1 BBASK150W4 15,00 / +1 BBASK155W4 15,50 (8 du) | 0,25 | 0,024 | 0,022 | 55% | -0,25 | baixista (a favor) | vende (a favor) | 0,003 |  |
| Seagull — PUT vendida financia trava de alta | Montar | -1 BBASX13 13,95 / +1 BBASL165 16,45 / -1 BBASL180 17,45 (23 du) | 0,12 | 0,127 | 0,088 | 83% | -9,30 | altista (contra) | vende (a favor) | 0,006 |  |
| Fence — defesa financiada da custódia | Montar | +1 ação / -1 BBASL158 15,70 / +1 BBASX150 14,95 / -1 BBASX14 14,70 (23 du) | 0,43 | 0,092 | -0,014 | 70% | -9,89 | altista (contra) | vende (a favor) | 0,018 | vantagem frágil: some com a vol do estresse |
| Straddle comprado ATM | Não montar agora | +1 BBASA154 15,45 / +1 BBASM154 15,45 (39 du) | -1,63 | -0,067 | 0,229 | 41% | -1,61 | neutra | compra (contra) | -0,020 | nenhuma montagem tem valor esperado positivo com a vol realizada de hoje |
| Strangle comprado | Não montar agora | +1 BBASA154 15,45 / +1 BBASM15 14,70 (39 du) | -1,33 | -0,096 | 0,188 | 38% | -1,33 | altista (contra) | compra (contra) | -0,021 | nenhuma montagem tem valor esperado positivo com a vol realizada de hoje |
| Straddle vendido ATM | Montar | -1 BBASL14 14,70 / -1 BBASX14 14,70 (23 du) | 1,56 | 0,287 | 0,079 | 67% | -21,49 | baixista (a favor) | vende (a favor) | 0,032 |  |
| Strangle vendido | Montar | -1 BBASL158 15,70 / -1 BBASX14 14,70 (23 du) | 0,96 | 0,189 | -0,028 | 67% | -21,09 | neutra | vende (a favor) | 0,029 | vantagem frágil: some com a vol do estresse |
| Iron condor | Montar | +1 BBASX2 13,45 / -1 BBASX13 13,95 / -1 BBASL158 15,70 / +1 BBASL165 16,45 (23 du) | 0,36 | 0,069 | 0,028 | 58% | -0,39 | baixista (a favor) | vende (a favor) | 0,006 |  |
| Borboleta clássica de CALL | Montar | +1 BBASL143 14,20 / -2 BBASL14 14,70 / +1 BBASL153 15,20 (23 du) | 0,18 | 0,242 | 0,234 | 100% | 0,00 | neutra | vende (a favor) | 0,006 |  |
| THL/p com PUT — curva invertida | Montar | -1 BBASX14 14,70 / +1 BBASM14 14,45 (23 du) | -0,03 | 0,039 | 0,009 | 60% | -0,41 | neutra | compra (contra) | 0,004 |  |
| THL perene de CALL — proxy | Montar | -1 BBASL14 14,70 / +1 BBASA15 14,70 (23 du) | -0,10 | 0,145 | 0,124 | 90% | -0,10 | neutra | compra (contra) | 0,006 |  |
| Calendar butterfly de CALL | Montar | -1 BBASK150W4 15,00 / +2 BBASA161 15,70 / -1 BBASK160W4 16,00 (8 du) | -0,69 | 0,103 | 0,054 | 68% | -0,69 | altista (contra) | compra (contra) | 0,026 |  |
| Booster e Fly sobre custódia | Montar | +1 ação / +1 BBASL150W1 15,00 / -2 BBASL155W1 15,50 / +1 BBASA176 17,45 (13 du) | -0,04 | 0,050 | 0,002 | 56% | -10,61 | altista (contra) | compra (contra) | 0,013 |  |
| Malha de broken wings 2:3:1 | Montar | +2 BBASL145 14,45 / -3 BBASL155 15,45 / +1 BBASL181 16,70 (23 du) | -0,68 | 0,082 | 0,019 | 63% | -0,68 | altista (contra) | vende (a favor) | 0,007 |  |
| Hyperfly 1-3-2 | Montar | +1 BBASL13 13,95 / -3 BBASL14 14,70 / +2 BBASL153 15,20 (23 du) | 0,39 | 0,362 | 0,352 | 100% | 0,00 | neutra | vende (a favor) | 0,010 |  |
| Fly modular com PUT vendida (par binário) | Montar | +1 BBASL143 14,20 / -2 BBASL14 14,70 / +1 BBASL153 15,20 / -1 BBASX143 14,20 (23 du) | 0,48 | 0,353 | 0,258 | 85% | -9,19 | altista (contra) | vende (a favor) | 0,017 |  |
| Módulo Q — CALL longa contra 2 curtas | Montar | +1 BBASA14 14,45 / -2 BBASK150W4 15,00 (8 du) | -0,29 | 0,155 | 0,051 | 70% | -22,23 | baixista (a favor) | vende (a favor) | 0,050 |  |
| Booster horizontal de PUT 1,5×1 | Montar | -1.5 BBASX14 14,70 / +1 BBASM15 14,70 (23 du) | 0,13 | 0,104 | 0,028 | 78% | -5,09 | altista (contra) | vende (a favor) | 0,010 | fora da janela do POP: a grade não tem os strikes do desenho nos vencimentos da janela |
| Linha de Mannerheim (LM) | Montar | -1 BBASX14 14,70 / +3 BBASA15 14,70 / -3 BBASL14 14,70 (23 du) | 0,15 | 0,549 | 0,381 | 83% | -10,02 | altista (contra) | vende (a favor) | 0,031 | fora da janela do POP: a grade não tem os strikes do desenho nos vencimentos da janela |
| GL short put + booster horizontal | Montar | +1 ação / -1 BBASX14 14,70 / +2 BBASA15 14,70 / -3 BBASL14 14,70 (23 du) | 1,36 | 0,577 | 0,326 | 81% | -19,38 | altista (contra) | vende (a favor) | 0,045 | fora da janela do POP: a grade não tem os strikes do desenho nos vencimentos da janela |
| Asymmetric wings + diagonal de PUT | Montar | +1 BBASW160W4 16,00 / -2 BBASW155W4 15,50 / +1 BBASM15 14,70 (8 du) | -0,21 | 0,138 | 0,086 | 66% | -0,77 | neutra | compra (contra) | 0,026 |  |
| Straddle perene (ZCC) | Montar | -1 BBASX14 14,70 / -1 BBASL14 14,70 / +1 BBASA15 14,70 (23 du) | 0,35 | 0,259 | 0,133 | 78% | -9,82 | altista (contra) | vende (a favor) | 0,018 | fora da janela do POP: a grade não tem os strikes do desenho nos vencimentos da janela |
| Strangle/P coberto | Montar | -1 BBASL14 14,70 / +1 BBASA163 16,20 / -1 BBASX164 16,20 (23 du) | 1,88 | 0,261 | 0,143 | 75% | -9,79 | altista (contra) | vende (a favor) | 0,016 | fora da janela do POP: a grade não tem os strikes do desenho nos vencimentos da janela |
| Box 23,54/24,54 | Montar | +1 BBASA14 14,45 / -1 BBASA160 15,95 / +1 BBASM160 15,95 / -1 BBASM14 14,45 (39 du) | -1,38 | 0,086 | 0,086 | 100% | 0,00 | neutra | vende (a favor) | 0,002 |  |
| Box/p diagonal | Montar | +1 BBASA14 14,45 / -1 BBASL164 16,20 / +1 BBASM163 16,20 / -1 BBASX145 14,45 (23 du) | -1,90 | 0,129 | 0,096 | 81% | -0,29 | neutra | compra (contra) | 0,009 | fora da janela do POP: a grade não tem os strikes do desenho nos vencimentos da janela |
| Colar perene — PUT longa de dezembro | Montar | +1 ação / +1 BBASM15 14,70 / -1 BBASL155 15,45 (23 du) | 0,06 | 0,009 | -0,026 | 70% | -0,47 | altista (contra) | compra (contra) | 0,012 | vantagem frágil: some com a vol do estresse |
| Financiamento — CALL ITM 22,54 | Montar | +1 ação / -1 BBASL14 14,70 (23 du) | 1,11 | 0,173 | 0,069 | 81% | -9,46 | altista (contra) | vende (a favor) | 0,021 |  |
| Dividendo sintético — 30% lançado | Montar | +1 ação / -0.3 BBASL158 15,70 (23 du) | 0,15 | 0,023 | -0,011 | 56% | -10,42 | altista (contra) | vende (a favor) | 0,005 | vantagem frágil: some com a vol do estresse |
| Crédito de Anakha — semanal | Montar | -1 BBASK146 14,54 / -1 BBASW146 14,54 / +1 BBASL155W1 15,50 (3 du) | 0,43 | 0,117 | 0,088 | 67% | -9,58 | baixista (a favor) | compra (contra) | 0,065 |  |
| Hedge — Inverse Line | Montar | -1 BBASK155W4 15,50 / +1 BBASK155W4 15,50 / -1 BBASW155W4 15,50 (8 du) | 0,64 | 0,095 | 0,031 | 63% | -10,33 | altista (contra) | vende (a favor) | 0,022 |  |
| Hedge — Straddle dinâmico | Montar | -1 BBASK150W4 15,00 / +1 BBASK150W4 15,00 / -1 BBASK155W4 15,50 / -1 BBASW155W4 15,50 (8 du) | 0,92 | 0,156 | 0,028 | 64% | -21,33 | altista (contra) | vende (a favor) | 0,050 |  |
| Hedge — Booster horizontal | Montar | -1 BBASL14 14,70 / -2 BBASX14 14,70 / +1 BBASM15 14,70 (23 du) | 1,46 | 0,334 | 0,102 | 66% | -21,59 | baixista (a favor) | vende (a favor) | 0,036 | fora da janela do POP: a grade não tem os strikes do desenho nos vencimentos da janela |
| Hedge — Calendar line | Montar | -1 BBASL14 14,70 / -1 BBASX14 14,70 / +1 BBASA15 14,70 / -1 BBASL14 14,70 (23 du) | 1,46 | 0,432 | 0,202 | 70% | -21,46 | baixista (a favor) | vende (a favor) | 0,039 | fora da janela do POP: a grade não tem os strikes do desenho nos vencimentos da janela |
| Hedge — Linha de Mannerheim | Montar | -1 BBASL14 14,70 / -1 BBASX14 14,70 / +3 BBASA15 14,70 / -3 BBASL14 14,70 (23 du) | 1,26 | 0,722 | 0,450 | 71% | -21,40 | baixista (a favor) | vende (a favor) | 0,052 | fora da janela do POP: a grade não tem os strikes do desenho nos vencimentos da janela |
| Hedge — Booster vertical | Montar | -1 BBASK155W4 15,50 / +1 BBASW160W4 16,00 / -2 BBASW155W4 15,50 (8 du) | 0,62 | 0,227 | 0,083 | 67% | -21,63 | neutra | vende (a favor) | 0,062 |  |
| Hedge — Assimétrico (PUT vendida) | Montar | -1 BBASW150W4 15,00 / -1 BBASK150W4 15,00 / +2 BBASA163 16,20 (8 du) | -0,09 | 0,130 | 0,062 | 73% | -10,56 | altista (contra) | compra (contra) | 0,029 |  |
| Hedge — Straddle HA (PUT vendida) | Montar | -1 BBASW150W4 15,00 / -1 BBASK150W4 15,00 / +2 BBASA163 16,20 (8 du) | -0,09 | 0,130 | 0,062 | 73% | -10,56 | altista (contra) | compra (contra) | 0,029 |  |

\* preço teórico (série sem negócio no dia).
