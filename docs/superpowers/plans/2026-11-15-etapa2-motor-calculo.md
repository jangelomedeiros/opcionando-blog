# Etapa 2: motor de cálculo (plano de implementação)

> **Para agentes:** SUB-SKILL OBRIGATÓRIA: use superpowers:subagent-driven-development (recomendado) ou superpowers:executing-plans para executar este plano tarefa por tarefa. Os passos usam checkbox (`- [ ]`).

**Objetivo:** criar um motor de cálculo em TypeScript puro e testado, que rode igual no build (Astro) e no navegador. Ele cobre:
- o calendário B3;
- Black-Scholes, as gregas e a vol implícita;
- o valor e as gregas de uma posição em qualquer cenário;
- as curvas "hoje" e "no vencimento", inclusive com vários vencimentos;
- as métricas (ganho máximo, perda máxima e pontos de equilíbrio);
- a aplicação de ajustes de manejo com o resultado realizado guardado.

**Arquitetura:**
- Uma pasta `src/lib/motor/` com cinco módulos de responsabilidade única: `calendario`, `bs`, `posicao`, `metricas` e `manejo`.
- Só funções puras, sem dependências, sem APIs do Node e sem imports específicos do Vite. Os imports entre os módulos usam a extensão `.ts` explícita. Assim, o `node --test` importa o motor direto, e o Astro também.
- Os testes usam valores de referência conhecidos e uma amostra da grade real de BBAS3 de 13/11/2026.

**Stack:** TypeScript (com o type-stripping nativo do Node 24 nos testes), Astro 7 no build. **Nenhuma dependência nova.**

**Spec:** `docs/superpowers/specs/2026-11-15-plataforma-estrategias-design.md` (seções 5.4, 5.5, 5.6, 5.8, 6 etapa 2, 7 e 8)

**Branch:** `motor-calculo`, criado a partir de `visual-novo`, para reaproveitar o `npm test` e a pasta `tests/`.

## Restrições globais

- **Convenção de tempo:** `T = diasUteis(data, venc) / 252`. Os dias úteis são contados **sem incluir** a data do cenário nem a do vencimento, com o calendário de feriados da B3. Essa convenção bate com a coluna "Dias úteis" do opcoes.net.br nos 17 vencimentos da grade de 13/11/2026.
- **Juros:** `SELIC_PADRAO = 0.15` ao ano, com capitalização contínua no Black-Scholes. É a taxa que melhor reproduz os deltas da grade.
- **Unidades das gregas** (o motor tem a sua própria convenção, fixa):
  - `delta` em R$ por R$ 1 de variação do ativo;
  - `gama` em delta por R$ 1;
  - `theta` em R$ **por dia útil** (`dV/dT ÷ 252`, negativo para quem está comprado);
  - `vega` em R$ **por 1 ponto percentual** de vol (`dV/dσ ÷ 100`).
- **Quantidades e sinais:** `q > 0` é comprado e `q < 0` é vendido. Todos os valores são **por unidade**. O multiplicador do lote (100) fica com a interface.
- Os nomes de funções e campos são em português, como no resto do código (`diasUteis`, `precoBS`, `gregasBS`…).
- O motor nunca devolve `NaN`, `Infinity` nem trava em laço. Em entrada degenerada, devolve o valor intrínseco, `null` ou um erro com mensagem em português.
- Nenhuma dependência npm nova. Nada de `import` de `node:*`, JSON ou `?raw` dentro de `src/lib/motor/`.

## Foco de revisão

1. **Perna sem vol** (ação, ou opção com `vol` ausente ou 0): o valor é o intrínseco, sem `NaN`. Teste na Tarefa 3.
2. **Cenário depois do vencimento de uma perna** (calendário depois do 1º vencimento): essa perna vale o intrínseco no spot do cenário, e as outras seguem por Black-Scholes. Teste na Tarefa 3.
3. **Spot muito baixo, inclusive zero, na grade de preços das curvas:** sem `NaN` (o `log(0)` precisa de tratamento). Teste na Tarefa 2.
4. **Vol implícita sem solução** (preço abaixo do intrínseco ou acima do limite): devolve `null` e não fica em laço. Teste na Tarefa 2.
5. **Rolagem para fora da grade** (strike ou vencimento inexistente): `RangeError` com mensagem clara, e a posição original fica intacta. Teste na Tarefa 5.

---

## Estrutura de arquivos

| Arquivo | Responsabilidade |
|---|---|
| `src/lib/motor/calendario.ts` | Feriados B3 de 2026 e 2027, `ehDiaUtil`, `diasUteis`, `somarDiasUteis` |
| `src/lib/motor/bs.ts` | `precoBS`, `gregasBS`, `volImplicita`, constantes |
| `src/lib/motor/posicao.ts` | Tipos `Perna`, `Cenario`, `Posicao`; valor, resultado, gregas e curvas |
| `src/lib/motor/metricas.ts` | Ganho máximo, perda máxima (ou ilimitado) e pontos de equilíbrio |
| `src/lib/motor/manejo.ts` | Operações de ajuste, `aplicarAjuste`, `reconstruir` (histórico e desfazer) |
| `src/lib/motor/index.ts` | Reexporta a API pública |
| `scripts/fixture_grade.py` | Extrai da planilha do opcoes.net.br a amostra usada nos testes (só biblioteca padrão) |
| `tests/fixtures/grade-bbas3-2026-11-13.json` | Amostra da grade real |
| `tests/motor-*.test.mjs` | Um arquivo de teste por módulo |

---

### Task 1: Amostra da grade e calendário B3

**Arquivos:**
- Criar: `scripts/fixture_grade.py`, `tests/fixtures/grade-bbas3-2026-11-13.json`, `src/lib/motor/calendario.ts`, `tests/motor-calendario.test.mjs`

**Interfaces:**
- Produz:
  - `FERIADOS_B3: ReadonlySet<string>` (ISO `AAAA-MM-DD`);
  - `ehDiaUtil(iso: string): boolean`;
  - `diasUteis(de: string, ate: string): number` (sem incluir nenhuma das duas datas; `0` se `ate <= de`);
  - `somarDiasUteis(de: string, n: number): string` (o n-ésimo dia útil depois de `de`).
- Produz o arquivo de amostra `{ data, spot, r, vencimentos: Record<iso, du>, series: Serie[] }`, com `Serie = { ticker, tipo: 'call'|'put', strike, venc, du, ultimo, vol, delta, gama, theta, vega }`. Os valores de `vol`, `delta`, `gama`, `theta` e `vega` vêm crus do opcoes.net.br (vol em fração, gama dividido pelo spot, vega por 1,0 de vol, theta por dia útil).

- [ ] **Passo 1: Criar o branch.** Rode `git switch visual-novo && git switch -c motor-calculo`.

- [ ] **Passo 2: Gerar a amostra.**
  - Crie `scripts/fixture_grade.py` (só biblioteca padrão: `zipfile` e `xml.etree`; a planilha usa *inline strings*, sem `sharedStrings.xml`).
  - O script lê a planilha passada como argumento e calcula o **spot** como a mediana de `Strike / (1 + Dist. (%) do Strike)`. Para 13/11, o esperado é cerca de 15,0994.
  - Ele grava `vencimentos` (cada vencimento com o seu "Dias úteis") e `series`, filtradas por: negócio em 13/11/2026 (`Data/Hora`), `|Strike/spot − 1| ≤ 0,10` e `Dias úteis ≥ 8`.
  - A amostra também inclui `"r": 0.15` e `"data": "2026-11-13"`.
  - Rode `python -I scripts/fixture_grade.py "<planilha>" tests/fixtures/grade-bbas3-2026-11-13.json`. A planilha está em `C:\Users\jange\Documents\Curso claude code\Opções BBAS3 - CALLs e PUTs - lista, pesquisa e cotações (6).xlsx`.
  - Esperado: **74 séries** e **17 vencimentos** (de 2026-11-19 com 3 dias úteis até 2027-12-17 com 270).

- [ ] **Passo 3: Escrever o teste que falha** em `tests/motor-calendario.test.mjs`:
  - `test('dias úteis batem com a grade de 13/11/2026 nos 17 vencimentos')`: para cada `[venc, du]` da amostra, `diasUteis('2026-11-13', venc) === du`;
  - `test('Consciência Negra (20/11) e fim de semana não contam')`: `diasUteis('2026-11-18','2026-11-23') === 1` (só 19/11);
  - `test('ate <= de devolve 0')`: `diasUteis('2026-11-13','2026-11-13') === 0` e `diasUteis('2026-11-20','2026-11-13') === 0`;
  - `test('somarDiasUteis inverte diasUteis')`: `somarDiasUteis('2026-11-13', 3) === '2026-11-18'` e `diasUteis('2026-11-13', somarDiasUteis('2026-11-13', 10)) === 9`;
  - `test('ehDiaUtil')`: `'2027-02-08'` (Carnaval) → `false`; `'2027-03-26'` (Sexta-feira Santa) → `false`; `'2027-05-27'` (Corpus Christi) → `false`; `'2026-11-19'` → `true`.

- [ ] **Passo 4: Rodar `npm test`.** Esperado: FALHA, porque `calendario.ts` não existe.

- [ ] **Passo 5: Implementar `calendario.ts`** com os feriados abaixo, que já foram conferidos contra a grade:
  - **2026:** 01/01, 16/02, 17/02, 03/04, 21/04, 01/05, 04/06, 07/09, 12/10, 02/11, 20/11, 24/12, 25/12, 31/12.
  - **2027:** 01/01, 08/02, 09/02, 26/03, 21/04, 27/05, 07/09, 12/10, 02/11, 15/11, 24/12, 31/12.
  - As datas são tratadas como **strings ISO em UTC ao meio-dia**, para não sofrer efeito de fuso.
  - Há um comentário no arquivo dizendo que é preciso acrescentar os feriados de 2028 antes de usar vencimentos de 2028.

- [ ] **Passo 6: Rodar `npm test`.** Esperado: PASSA.

- [ ] **Passo 7: Commit.** Rode `git add scripts/fixture_grade.py tests src/lib/motor && git commit -m "Motor: calendário B3 conferido contra a grade de 13/11"`.

---

### Task 2: Black-Scholes, gregas e vol implícita

**Arquivos:**
- Criar: `src/lib/motor/bs.ts`, `tests/motor-bs.test.mjs`

**Interfaces:**
- Produz:
  - `type TipoOpcao = 'call' | 'put'`;
  - `SELIC_PADRAO = 0.15`, `DIAS_UTEIS_ANO = 252`;
  - `interface Gregas { preco: number; delta: number; gama: number; theta: number; vega: number }`;
  - `precoBS(tipo: TipoOpcao, S: number, K: number, T: number, vol: number, r = SELIC_PADRAO): number`;
  - `gregasBS(tipo: TipoOpcao, S: number, K: number, T: number, vol: number, r = SELIC_PADRAO): Gregas`;
  - `volImplicita(tipo: TipoOpcao, S: number, K: number, T: number, preco: number, r = SELIC_PADRAO): number | null`.
- **Casos degenerados:**
  - `T <= 0`, `vol <= 0` ou `S <= 0`: preço intrínseco (`max(S−K,0)` ou `max(K−S,0)`, com `S` limitado a no mínimo 0). O delta é o degrau (call: 1 se `S > K`, senão 0; put: −1 se `S < K`, senão 0). Gama, theta e vega valem 0.

- [ ] **Passo 1: Escrever o teste que falha** em `tests/motor-bs.test.mjs`:
  - `test('valor de referência (Hull): S=42 K=40 r=10% σ=20% T=0,5')`: call ≈ 4,7594 e put ≈ 0,8086 (tolerância 1e-3).
  - `test('paridade put-call')`: para S ∈ {10, 15,1, 20}, K = 15, T = 0,3 e σ = 0,4, vale `call − put ≈ S − K·e^{−rT}` (1e-9).
  - `test('gregas por diferença finita')`: em S = 15,1, K = 15, T = 23/252, σ = 0,45:
    - `delta ≈ (P(S+h)−P(S−h))/2h`;
    - `gama ≈ (P(S+h)−2P+P(S−h))/h²`;
    - `vega ≈ (P(σ+0,0001)−P(σ−0,0001))/0,0002/100`;
    - `theta ≈ (P(T−1/252)−P(T))` (tolerância 2e-3).
  - `test('grade 13/11: delta do motor dentro de 0,03 do opcoes.net.br')`: para todas as séries da amostra, `|gregasBS(tipo, spot, strike, du/252, vol).delta − delta| ≤ 0,03`.
  - `test('grade 13/11: gama, vega e theta na mesma escala do opcoes.net.br')`: em todas as séries, `gama_deles / (gama/spot)` fica em [0,90; 1,15] e `vega_deles / (vega·100)` em [0,95; 1,30]. A **mediana** de `theta_deles / theta` fica em [0,90; 1,10].
  - `test('grade 13/11: preço teórico perto do último negócio')`: a mediana de `|precoBS − ultimo| / ultimo` é ≤ 0,05.
  - `test('volImplicita recupera a vol')`: para σ ∈ {0,15, 0,45, 1,2}, `volImplicita(precoBS(...σ)) ≈ σ` (1e-4).
  - `test('volImplicita sem solução devolve null')`: preço abaixo do intrínseco, preço ≥ S (call) e `T = 0` devolvem `null`. Cada chamada termina em menos de 50 ms.
  - `test('casos degenerados sem NaN')`: com `S = 0`, `T = 0`, `vol = 0` e `T < 0`, todos os campos de `gregasBS` são finitos, e `precoBS('put', 0, 15, 0.3, 0.4) === 15`.

- [ ] **Passo 2: Rodar `npm test`.** Esperado: FALHA (módulo inexistente).

- [ ] **Passo 3: Implementar `bs.ts`.**
  - A normal acumulada usa a aproximação de Abramowitz-Stegun 7.1.26 sobre `erf` (a mesma do `laboratorio.ts`). Se o teste de Hull não chegar a 1e-3, troque por uma `erf` de precisão maior.
  - A vol implícita usa **bissecção** em [0,005; 5] com no máximo 100 iterações. Antes, confira se o preço está entre os limites de não-arbitragem; se não estiver, devolva `null`.

- [ ] **Passo 4: Rodar `npm test`.** Esperado: PASSA.

- [ ] **Passo 5: Commit.** Rode `git add src/lib/motor/bs.ts tests/motor-bs.test.mjs && git commit -m "Motor: Black-Scholes, gregas e vol implícita conferidos contra a grade"`.

---

### Task 3: Posição, cenário e curvas

**Arquivos:**
- Criar: `src/lib/motor/posicao.ts`, `tests/motor-posicao.test.mjs`

**Interfaces:**
- Consome: `diasUteis` (Task 1), `precoBS`, `gregasBS` e `SELIC_PADRAO` (Task 2).
- Produz:
  ```ts
  interface Perna { id: string; tipo: 'acao' | 'call' | 'put'; q: number; strike?: number; venc?: string; entrada: number; vol?: number }
  interface Cenario { data: string; spot: number; choqueVol?: number /* pontos percentuais somados à vol de cada opção */; r?: number }
  interface Posicao { pernas: Perna[]; realizado: number }
  valorPerna(p: Perna, c: Cenario): number          // preço unitário da perna no cenário
  resultado(pos: Posicao, c: Cenario): number       // realizado + Σ q·(valorPerna − entrada)
  gregasPosicao(pos: Posicao, c: Cenario): { delta: number; gama: number; theta: number; vega: number }  // Σ q·grega; ação: delta = q
  primeiroVencimento(pos: Posicao): string | null   // menor venc entre as opções
  curva(pos: Posicao, c: Omit<Cenario, 'spot'>, xs: number[]): number[]   // resultado para cada spot em xs
  curvaVencimento(pos: Posicao, xs: number[], r?: number): number[]        // curva na data do primeiroVencimento; pernas mais longas seguem por BS
  ```
- **Regras:**
  - Para opções, `T = diasUteis(c.data, venc)/252`. Se `c.data >= venc`, a perna vale o intrínseco.
  - A vol efetiva é `vol + (choqueVol ?? 0)/100`, com piso de 0.
  - Uma perna sem `vol` vale o intrínseco.

- [ ] **Passo 1: Escrever o teste que falha** em `tests/motor-posicao.test.mjs`:
  - `test('venda coberta no vencimento')`: ação q=1 com entrada 15 e call q=−1 com strike 16, entrada 0,50, vol 0,4 e venc `'2026-12-18'`. `curvaVencimento` em xs = [12, 15, 16, 20] dá [−2,5; 0,5; 1,5; 1,5] (1e-9).
  - `test('resultado no cenário de entrada é zero quando a entrada é o preço teórico')`: para uma trava de alta montada com `entrada = precoBS(...)` no cenário c, `resultado(pos, c) ≈ 0` (1e-9).
  - `test('realizado soma ao resultado')`: a mesma posição com `realizado: 0.37` dá `resultado ≈ 0,37`.
  - `test('gregas da posição: ação tem delta 1 e o resto 0; call vendida inverte sinal')`.
  - `test('calendário depois do 1º vencimento: perna vencida vale intrínseco e a longa segue por BS')`: call vendida com venc 2026-12-18 e call comprada com venc 2027-01-15, ambas strike 15. Em `data: '2026-12-21'`, a perna curta vale `max(S−15,0)` e a longa é `> intrínseco`. Nenhum `NaN`.
  - `test('choqueVol aumenta o valor de uma call comprada')`.
  - `test('xs com zero não gera NaN')`: `curva(pos, c, [0, 0.01, 15])` dá só números finitos.
  - `test('perna sem vol vale intrínseco')`.

- [ ] **Passo 2: Rodar `npm test`.** Esperado: FALHA.

- [ ] **Passo 3: Implementar `posicao.ts`** conforme as interfaces e regras acima.

- [ ] **Passo 4: Rodar `npm test`.** Esperado: PASSA.

- [ ] **Passo 5: Commit.** Rode `git add src/lib/motor/posicao.ts tests/motor-posicao.test.mjs && git commit -m "Motor: posição, cenário, gregas da posição e curvas"`.

---

### Task 4: Métricas (ganho máximo, perda máxima, pontos de equilíbrio)

**Arquivos:**
- Criar: `src/lib/motor/metricas.ts`, `tests/motor-metricas.test.mjs`

**Interfaces:**
- Consome: `curvaVencimento`, `Posicao` e `primeiroVencimento` (Task 3).
- Produz:
  - `interface Metricas { ganhoMax: number | null; perdaMax: number | null; equilibrios: number[] }`. `null` significa **ilimitado**. `perdaMax` é negativa ou zero.
  - `metricasVencimento(pos: Posicao, r?: number): Metricas`.
  - `equilibrios(xs: number[], ys: number[]): number[]`. São as raízes por interpolação linear entre trocas de sinal, arredondadas em 2 casas, sem repetição. Se um ponto da grade valer exatamente 0 e a curva trocar de sinal ao redor dele, ele também conta.
- **Algoritmo:**
  1. Avalie `curvaVencimento` em uma grade de 2001 pontos de 0 até `3 × max(strikes, entradas da ação, 1)`.
  2. Os extremos limitados são o máximo e o mínimo da grade.
  3. O **lado direito** é ilimitado se a inclinação entre os dois últimos pontos for `> 1e-6` (o ganho fica `null`) ou `< −1e-6` (a perda fica `null`).
  4. O lado esquerdo é sempre limitado, porque o preço não fica negativo.

- [ ] **Passo 1: Escrever o teste que falha** em `tests/motor-metricas.test.mjs`:
  - **Venda coberta** (ação a 15 + call 16 vendida a 0,50): `ganhoMax ≈ 1,5`, `perdaMax ≈ −14,5` e `equilibrios = [14.5]`.
  - **Call comprada** (strike 15, entrada 0,80): `ganhoMax === null`, `perdaMax ≈ −0,8` e `equilibrios = [15.8]`.
  - **Call vendida a seco** (strike 15, entrada 0,80): `perdaMax === null` e `ganhoMax ≈ 0,8`.
  - **Borboleta** 14/15/16 (1, −2, 1, débito 0,20): `ganhoMax ≈ 0,8`, `perdaMax ≈ −0,2` e `equilibrios = [14.2, 15.8]`.
  - **Straddle vendido** em 15 (crédito 1,0): `equilibrios = [14, 16]` e `perdaMax === null`.

- [ ] **Passo 2: Rodar `npm test`.** Esperado: FALHA.

- [ ] **Passo 3: Implementar `metricas.ts`.**

- [ ] **Passo 4: Rodar `npm test`.** Esperado: PASSA.

- [ ] **Passo 5: Commit.** Rode `git add src/lib/motor/metricas.ts tests/motor-metricas.test.mjs && git commit -m "Motor: métricas de vencimento com detecção de risco ilimitado"`.

---

### Task 5: Manejo: ajustes com resultado realizado

**Arquivos:**
- Criar: `src/lib/motor/manejo.ts`, `src/lib/motor/index.ts`, `tests/motor-manejo.test.mjs`

**Interfaces:**
- Consome: `Perna`, `Posicao`, `Cenario`, `valorPerna` e `resultado` (Task 3).
- Produz:
  ```ts
  interface GradeRef { strikes: number[]; vencimentos: string[] }   // ambos em ordem crescente
  type Operacao =
    | { op: 'encerrar'; perna: string }
    | { op: 'rolarStrike'; perna: string; passos: number }          // ±N posições em grade.strikes
    | { op: 'rolarVencimento'; perna: string; passos: number }      // ±N posições em grade.vencimentos
    | { op: 'quantidade'; perna: string; q: number }                // nova quantidade, com o mesmo sinal ou 0
    | { op: 'adicionar'; tipo: 'acao' | 'call' | 'put'; q: number; strikePassos?: number; vencIndice?: number; vol?: number };
      // strikePassos: relativo ao strike da grade mais próximo do spot (ATM)
      // vencIndice: 0 = primeiro vencimento depois de c.data
  interface Ajuste { nome: string; cenario: Cenario; ops: Operacao[] }
  interface Historico { inicial: Posicao; ajustes: Ajuste[] }
  aplicarAjuste(pos: Posicao, ops: Operacao[], c: Cenario, grade: GradeRef): { posicao: Posicao; fluxo: number }
  reconstruir(h: Historico, grade: GradeRef): { posicao: Posicao; fluxos: number[] }
  ```
- **Semântica:**
  - **Encerrar:** soma `q·(valorPerna − entrada)` ao realizado e remove a perna.
  - **Abrir:** a perna nova tem `entrada = valorPerna` no cenário. A vol da perna nova é a da perna rolada; em `adicionar`, é `vol` ou, na falta dela, a vol da primeira opção da posição.
  - **Rolagem:** é encerrar seguido de abrir. A perna nova recebe o id `${id}~${n}`, onde n é o número do ajuste.
  - **Quantidade:**
    - ao reduzir, realiza só a parte reduzida;
    - ao aumentar, a entrada passa a ser a média ponderada;
    - `q = 0` equivale a encerrar.
  - **`fluxo`:** é o caixa do ajuste, positivo quando é crédito. Vale `Σ q_encerrada·valor − Σ q_aberta·valor`.
  - **A posição original nunca é alterada** (o resultado é uma cópia). Se qualquer operação falhar, nada é aplicado.
  - **Erros:**
    - perna inexistente: `Error('Perna inexistente: <id>')`;
    - strike ou vencimento fora da grade: `RangeError('Rolagem fora da grade: <detalhe>')`;
    - ação com `rolarStrike` ou `rolarVencimento`: `Error`.
- `index.ts` reexporta tudo de `calendario`, `bs`, `posicao`, `metricas` e `manejo`.

- [ ] **Passo 1: Escrever o teste que falha** em `tests/motor-manejo.test.mjs`. A base é uma trava de alta (call 15 comprada e call 16 vendida, venc 2026-12-18, vol 0,45), com `strikes = [13, 13.5, …, 18]` (passo 0,5) e os vencimentos da amostra da grade.
  - `test('ajuste não cria nem destrói valor no instante do ajuste')`: para cada operação (`encerrar`, `rolarStrike +2`, `rolarVencimento +1`, `quantidade` reduzindo e aumentando, `adicionar` put −1 com strikePassos −2), vale `resultado(nova, c) ≈ resultado(antiga, c)` (1e-9).
  - `test('encerrar move o resultado para realizado')`: depois de encerrar todas as pernas, `pernas.length === 0` e `realizado ≈ resultado(antiga, c)`.
  - `test('rolar a call vendida para cima: novo strike, fluxo negativo (débito) e ganho máximo maior')`: `rolarStrike` com `passos: 2` na perna vendida leva o strike a 17. Como recomprar o strike menor custa mais que vender o maior, `fluxo < 0`, e `metricasVencimento(nova).ganhoMax > metricasVencimento(antiga).ganhoMax`.
  - `test('rolarVencimento usa o próximo vencimento da grade')`: venc 2026-12-18 com +1 passa a 2026-12-23.
  - `test('fora da grade: RangeError e posição intacta')`: `rolarStrike +50` lança `RangeError`, e a posição de entrada continua `deepEqual` à cópia anterior.
  - `test('perna inexistente lança erro')`.
  - `test('reconstruir encadeia ajustes e desfazer = remover o último')`: com dois ajustes, `reconstruir` dá a mesma posição que aplicar os dois em sequência, e `reconstruir` sem o último dá a posição depois do primeiro.

- [ ] **Passo 2: Rodar `npm test`.** Esperado: FALHA.

- [ ] **Passo 3: Implementar `manejo.ts` e `index.ts`.**

- [ ] **Passo 4: Rodar `npm test`.** Esperado: PASSA.

- [ ] **Passo 5: Commit.** Rode `git add src/lib/motor tests/motor-manejo.test.mjs && git commit -m "Motor: ajustes de manejo com resultado realizado e histórico"`.

---

### Task 6: O motor no build e o calendário do Laboratório corrigido

**Arquivos:**
- Modificar: `src/lib/laboratorio.ts` (remover `FERIADOS` e `diasUteis` locais e importar de `./motor/calendario.ts`)
- Criar: `tests/motor-integracao.test.mjs`

**Interfaces:**
- Consome: `diasUteis` (Task 1).
- `laboratorio.ts` continua exportando `diasUteis`, agora como reexport, para não quebrar nenhuma página que o importe.
- **Fora do escopo desta etapa:** trocar o Black-Scholes do Laboratório (carry zero) pelo do motor. Isso muda os números exibidos e fica para a etapa 3, junto com a remontagem das estruturas.

- [ ] **Passo 1: Escrever o teste que falha** em `tests/motor-integracao.test.mjs`:
  - `test('motor não usa APIs de Node nem imports do Vite')`: nenhum arquivo de `src/lib/motor/` contém `from 'node:`, `?raw` nem `.json'`.
  - `test('laboratório usa o calendário do motor')`: `src/lib/laboratorio.ts` não contém `const FERIADOS` e contém `from './motor/calendario.ts'`.

- [ ] **Passo 2: Rodar `npm test`.** Esperado: o segundo teste FALHA.

- [ ] **Passo 3: Fazer a mudança em `laboratorio.ts`.**

- [ ] **Passo 4: Rodar `npm run build && npm test`.** Esperado: o build termina com 140 páginas e PASSA em tudo.
  - Isso mostra que o Astro e o Vite aceitam os imports com `.ts`.
  - Os dias úteis dos vencimentos de 2027 no bloco "Hoje" do Laboratório passam a seguir o calendário certo (Carnaval de 2027 em 08 e 09/02, e não 15 e 16/02).

- [ ] **Passo 5: Commit.** Rode `git add src/lib/laboratorio.ts tests/motor-integracao.test.mjs && git commit -m "Laboratório usa o calendário B3 do motor (corrige feriados de 2027)"`.
