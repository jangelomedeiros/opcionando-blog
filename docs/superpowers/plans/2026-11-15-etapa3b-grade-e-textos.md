# Etapa 3b: grade de 13/11, estruturas remontadas e textos sem valores fixos (plano de implementação)

> **Para agentes:** SUB-SKILL OBRIGATÓRIA: use superpowers:subagent-driven-development (recomendado) ou superpowers:executing-plans para executar este plano tarefa por tarefa. Os passos usam checkbox (`- [ ]`).

**Objetivo:**
- Importar a grade completa de BBAS3 de 13/11/2026 e guardá-la no repositório por data.
- Remontar as 62 estruturas a partir dela, com o mercado do catálogo passando de 27/10 para 13/11.
- Trocar os números fixos dos textos por marcadores, resolvidos com a montagem atual.
- Criar rótulos de nível e objetivo para os filtros do catálogo.

Tudo o que for rascunho do Claude sai com um **relatório de revisão para o dono**.

**Arquitetura:**
- **Formato relativo (spec 5.8):** cada estrutura fica guardada como **modelo**. São as pernas da referência de 02/10 em `estruturas.json`, mais a regra de remontagem que já existe em `scripts/atualizar_mercado.py`:
  - strike proporcional ao preço (`K × spot_novo / spot_ref`);
  - vencimento pelo número de dias úteis mais próximo, respeitando a janela do POP;
  - asas de borboleta preservadas em passos da grade.

  *Decisão do Claude:* essa regra já é relativa ao preço e à grade, e reescrever os 62 modelos como "N strikes acima do ATM" não muda o resultado para o usuário. Em vez de reescrever, o script passa a ler a grade sem `pandas`.
- **Textos:** os números que vêm da montagem viram marcadores, como `{p2.k}` (strike da perna 2), `{p2.px}`, `{spot}`, `{be1}` e `{p3.k-p2.k}`. Eles são resolvidos no build com a montagem **atual**. Os números que não casam com nada ficam como estão e entram no relatório de revisão.

**Stack:** Python (só biblioteca padrão) para importar e remontar; TypeScript para resolver os marcadores; Astro; `node --test`.

**Spec:** `docs/superpowers/specs/2026-11-15-plataforma-estrategias-design.md` (5.3, 5.7, 5.8, 6.1)

**Branch:** `grade-e-textos`, a partir de `catalogo-interativo`.

## Restrições globais

- **Grade de entrada:** `C:\Users\jange\Documents\Curso claude code\Opções BBAS3 - CALLs e PUTs - lista, pesquisa e cotações (6).xlsx`. Ela tem 939 séries e 17 vencimentos, a data é 13/11/2026 e o spot fica perto de 15,10 (mediana de `Strike/(1+Dist.)`).
- **Nada de `pandas` nem `openpyxl`:** os scripts usam só a biblioteca padrão do Python, com o mesmo leitor de `scripts/fixture_grade.py`.
- **A grade normalizada fica em `src/data/grades/bbas3-2026-11-13.json`**, com todas as séries, para formar o histórico das jornadas futuras (spec 5.6).
- **Os rascunhos do Claude não substituem o texto do dono sem registro.** Toda troca de texto e todo rótulo novo aparecem em `docs/revisao/2026-11-15-textos-e-rotulos.md`, com o antes e o depois.
- **Nenhum texto é removido.** Só os números viram marcadores. Um número sem correspondência fica como está e é listado no relatório.
- **Os rótulos são rascunho.**
  - `nivel` é um de `Iniciante | Intermediário | Avançado`.
  - `objetivo` é um de `Renda | Direcional | Proteção | Volatilidade | Ajuste`.
  - O relatório diz que eles são rascunho.

## Foco de revisão

1. **Estrutura cujo vencimento curto da referência não tem equivalente na grade nova** (por exemplo, semanais de 30/10 já vencidas): a remontagem escolhe um vencimento futuro e a perna nunca fica vencida. Teste na Tarefa 1.
2. **Marcador que aponta para perna inexistente** (por exemplo, `{p5.k}` numa estrutura de 4 pernas): o build falha com mensagem clara, em vez de publicar `{p5.k}`. Teste na Tarefa 2.
3. **Número que coincide por acaso com um valor de perna** (por exemplo, "0,50" de largura igual ao prêmio de uma perna): esses casos vão para o relatório marcados como "conferir". Teste na Tarefa 2.
4. **Hedges com `comparacao`:** os textos e o gráfico continuam coerentes com a posição original remontada. Teste na Tarefa 1.
5. **Quantidades fracionárias** (por exemplo, −1.6) são preservadas na remontagem. Teste na Tarefa 1.

---

### Task 1: Importar a grade e remontar as estruturas

**Arquivos:**
- Criar: `scripts/importar_grade.py`, `src/data/grades/bbas3-2026-11-13.json`, `tests/grade-13-11.test.mjs`
- Modificar: `scripts/atualizar_mercado.py` (lê o JSON da grade, sem `pandas`), `src/data/laboratorio/mercado.csv` (regerado)

**Interfaces:**
- **`importar_grade.py PLANILHA.xlsx SAIDA.json`** grava:
  ```
  { ativo: 'BBAS3', data: '2026-11-13', spot, fonte, vencimentos: { iso: du }, series: [{ ticker, tipo: 'call'|'put', strike, venc, du, ultimo|null, data_ultimo|null, negocios|null, vol|null, delta|null, gama|null, theta|null, vega|null }] }
  ```
  com todas as 939 séries.
- **`atualizar_mercado.py GRADE.json`** faz o mesmo que o script atual (regras de remontagem, preço teórico com vol interpolada quando não houve negócio no dia), lendo o JSON. Ele grava `mercado.csv` no **mesmo formato**, com `data=2026-11-13` e `spot=15,10`.
  - As quantidades são escritas com ponto decimal, como hoje.
- **Mudança de regra (Foco 1):** o vencimento escolhido é sempre posterior à data da grade.

- [ ] **Passo 1: Criar o branch.** Rode `git switch -c grade-e-textos`.

- [ ] **Passo 2: Escrever o teste que falha** em `tests/grade-13-11.test.mjs`:
  - `test('grade importada completa')`: o JSON tem 939 séries e 17 vencimentos, `data === '2026-11-13'` e `|spot − 15,10| < 0,01`;
  - `test('mercado.csv é de 13/11 e cobre as 62 estruturas')`: `lerMercadoCsv` dá `data === '2026-11-13'`, e cada id de `estruturas.json` tem linhas `principal`;
  - `test('toda perna existe na grade e vence depois de 13/11')`: cada linha de opção tem `(venc, tipo, strike)` presente nas séries da grade, e `venc > '2026-11-13'`;
  - `test('janelas do POP respeitadas')`: para as estruturas cujo `pop` está em `JANELA` do script, os dias úteis do 1º vencimento ficam dentro da janela, quando a grade tiver um vencimento nela;
  - `test('quantidades e hedges preservados')`: as quantidades de cada estrutura são iguais às de `estruturas.json` (com as fracionárias), e as 8 estruturas com `comparacao` têm linhas `comparacao`;
  - `test('cenário inicial de todas fecha em zero na entrada')`: `resultado(cenarioInicial)` tem `|·| < 0,05` e `metricasVencimento` não tem `NaN`.

- [ ] **Passo 3: Rodar `npm test`.** Esperado: FALHA.

- [ ] **Passo 4: Implementar.**
  - Rode `python -I scripts/importar_grade.py "<planilha>" src/data/grades/bbas3-2026-11-13.json`.
  - Rode `python -I scripts/atualizar_mercado.py src/data/grades/bbas3-2026-11-13.json`.
  - Atualize `scripts/README.md`, que hoje exige `pandas`.

- [ ] **Passo 5: Rodar `npm run build && npm test`.** Esperado: PASSA.

- [ ] **Passo 6: Commit.** Mensagem: `"Grade de 13/11 importada e estruturas remontadas"`.

---

### Task 2: Marcadores nos textos

**Arquivos:**
- Criar: `scripts/marcar_textos.mjs` (migração única e repetível), `src/lib/catalogo/textos.ts`, `tests/textos.test.mjs`, `docs/revisao/2026-11-15-textos-e-rotulos.md` (seção 1)
- Modificar: `src/data/laboratorio/estruturas.json` (campos `racional`, `esperado` e `notas` com marcadores), `src/pages/estrategias/[id].astro` e o índice do catálogo (resolvem os marcadores)

**Interfaces:**
- **Marcadores:**
  - `{spot}`;
  - `{pN.k}` e `{pN.px}`, onde N é a perna, a partir de 1, na ordem de `pernas`;
  - `{cN.k}` e `{cN.px}`, as pernas de `comparacao`;
  - `{beN}`, o N-ésimo ponto de equilíbrio da curva no vencimento;
  - `{pA.k-pB.k}`, a diferença de strikes, em valor absoluto;
  - `{pN.k+pN.px}` e `{pN.k-pN.px}`.
  - Todos são formatados como `1.234,56`.
- **`textos.ts`:**
  ```ts
  interface Valores { spot: number; pernas: { k: number | null; px: number }[]; comparacao: { k: number | null; px: number }[]; be: number[] }
  resolverTexto(texto: string, v: Valores): string     // lança Error('Marcador inválido {..} em <id>') se apontar para perna ou BE inexistente
  valoresDaMontagem(posicao: Posicao, cenario: Cenario, comparacao: Posicao | null): Valores   // be por metricasVencimento
  ```
- **`marcar_textos.mjs`:**
  - para cada número `\d+,\d{2}` nos textos, procura o marcador cujo valor **na referência** seja igual a ele, na ordem `pN.k`, `spot`, `beN`, `pN.px`, diferenças e somas;
  - se mais de um marcador servir, usa o primeiro e anota "conferir" no relatório;
  - se nenhum servir, deixa o número e anota "sem correspondência".
- **A página** usa os `Valores` da **montagem atual** (cenário inicial do mercado), tanto no texto da Visão quanto no racional do cabeçalho e do card do catálogo.

- [ ] **Passo 1: Escrever o teste que falha** em `tests/textos.test.mjs`:
  - `test('resolverTexto troca marcadores')`: `'Acima de R$ {p2.k}, ganho {p2.k-p1.k}'` com p1.k = 15 e p2.k = 16,5 dá `'Acima de R$ 16,50, ganho 1,50'`;
  - `test('marcador inválido lança erro')`: `{p5.k}` com 2 pernas lança erro com a mensagem pedida;
  - `test('textos das estruturas só têm marcadores válidos e números listados no relatório')`: todo `{...}` de `estruturas.json` resolve, com a referência de cada estrutura, sem erro. Todo número `\d+,\d{2}` que sobrou aparece no relatório de revisão como "sem correspondência";
  - `test('resolver com a referência reproduz o texto original')`: para as 62 estruturas, `resolverTexto(texto_marcado, valores_da_referência)` é igual ao texto original de `git show catalogo-interativo:src/data/laboratorio/estruturas.json` (leia esse arquivo no teste a partir de `tests/fixtures/estruturas-antes-dos-marcadores.json`, copiado no Passo 3). Isso prova que a migração não mudou nenhuma palavra;
  - `test('página mostra o texto com a montagem atual')` (lê `dist`): em `covered-call`, o "O que esperar" contém o strike atual da call (do `mercado.csv`) e não contém `{`.

- [ ] **Passo 2: Rodar `npm test`.** Esperado: FALHA.

- [ ] **Passo 3: Implementar.**
  - Copie o `estruturas.json` atual para `tests/fixtures/estruturas-antes-dos-marcadores.json`.
  - Rode `node scripts/marcar_textos.mjs`, que atualiza `estruturas.json` e grava a seção 1 do relatório.
  - Ligue `resolverTexto` nas páginas.

- [ ] **Passo 4: Rodar `npm run build && npm test`.** Esperado: PASSA.

- [ ] **Passo 5: Commit.** Mensagem: `"Textos das estruturas com marcadores resolvidos pela montagem atual"`.

---

### Task 3: Rótulos de nível e objetivo e filtros do catálogo

**Arquivos:**
- Modificar: `src/data/laboratorio/estruturas.json` (campos `nivel` e `objetivo`), `src/lib/laboratorio.ts` (tipo `Estrutura`), `src/pages/estrategias/index.astro` (filtros), `src/pages/estrategias/[id].astro` (chips), `docs/revisao/2026-11-15-textos-e-rotulos.md` (seção 2)
- Criar: `tests/rotulos.test.mjs`

**Interfaces:**
- `nivel` e `objetivo` com os enums das restrições globais.
- **Rascunho por família**, ajustado por estrutura quando o racional indicar outra coisa:
  - **Base:** Iniciante e Renda. Exceções: compra de call e de put são Direcional; compra de PUT é Proteção.
  - **Direcionais:** Intermediário e Direcional.
  - **Proteção patrimonial:** Intermediário e Proteção.
  - **Volatilidade:** Intermediário e Volatilidade.
  - **Tempo / rolagem:** Avançado e Renda.
  - **Asas / proteção:** Avançado e Volatilidade.
  - **Booster:** Intermediário e Renda.
  - **Módulos, Híbridas / hedge, Gradiente linear e Mônadas:** Avançado (o objetivo segue o racional).
  - **Hedge · ajustes:** Avançado e Ajuste.
- **Catálogo:** além do filtro por família, há dois grupos de filtro, **Nível** e **Objetivo**.
  - Os filtros se combinam: uma estrutura aparece se passar em todos os grupos ativos.
  - Sem JavaScript, tudo aparece.
- **Página da estrutura:** chips de nível e objetivo ao lado da família.

- [ ] **Passo 1: Escrever o teste que falha** em `tests/rotulos.test.mjs`:
  - `test('62 estruturas com nivel e objetivo válidos')`;
  - `test('relatório lista os 62 rótulos como rascunho')`: a seção 2 do relatório tem uma linha por id;
  - `test('catálogo tem filtros de nível e objetivo')` (lê `dist`): os botões `data-nivel` e `data-objetivo` existem, e cada card tem `data-nivel` e `data-objetivo`.

- [ ] **Passo 2: Rodar `npm test`.** Esperado: FALHA.

- [ ] **Passo 3: Implementar.**

- [ ] **Passo 4: Rodar `npm run build && npm test`.** Esperado: PASSA.

- [ ] **Passo 5: Verificar à mão.** Com Chrome headless:
  - no catálogo, filtrar por "Iniciante" mostra só as estruturas desse nível;
  - a página `covered-call` mostra os preços de 13/11 e o texto com o strike atual;
  - a 360 px, nada rola na horizontal.

- [ ] **Passo 6: Commit.** Mensagem: `"Catálogo: rótulos de nível e objetivo (rascunho) e filtros"`.
