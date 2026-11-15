# Etapa 3a: catálogo único e página interativa de estrutura (plano de implementação)

> **Para agentes:** SUB-SKILL OBRIGATÓRIA: use superpowers:subagent-driven-development (recomendado) ou superpowers:executing-plans para executar este plano tarefa por tarefa. Os passos usam checkbox (`- [ ]`).

**Objetivo:** juntar `/estrategias` e o Laboratório em um catálogo só, em `/estrategias/`. Cada uma das 62 estruturas ganha uma página com:
- o gráfico de payoff **interativo**, ligado ao motor da etapa 2, com controles de preço, dias e vol, métricas e gregas;
- as abas **Visão · POP · Manejo · Vídeo · Hoje**.

Os endereços antigos redirecionam para os novos.

**Arquitetura:**
- A lógica fica em TypeScript puro e testável, em `src/lib/catalogo/`:
  - conversão dos dados atuais para o formato `Posicao` do motor;
  - geometria do gráfico (pontos da curva, segmentos de lucro e de prejuízo, escalas).
- A página é Astro estática. Só o gráfico é uma ilha Preact (`client:visible`), que chama o motor no navegador.
- As abas são HTML gerado no build, com um script pequeno e acessível.

**Stack:** Astro 7, `@astrojs/preact` 6.x + `preact` (ilhas; dependência aprovada na spec, abordagem B), motor `src/lib/motor/`, `node --test`.

**Spec:** `docs/superpowers/specs/2026-11-15-plataforma-estrategias-design.md` (5.2, 5.3, 5.4, 5.5, 5.7.1, 6 etapa 3, 7)

**Divisão da etapa 3** (decisão do Claude, registrada aqui): a **3a** usa os preços reais **que já estão no repositório** (`mercado.csv`, BBAS3 a 17,38 em 27/10/2026) como cenário inicial do gráfico. A **3b** faz o seguinte:
- ingestão da grade completa de 13/11;
- formato relativo das estruturas (spec 5.8);
- textos sem valores fixos;
- rótulos de visão, nível e objetivo para os filtros.

A 3b só troca a fonte dos dados, sem mudar a página.

**Branch:** `catalogo-interativo`, a partir de `motor-calculo`.

## Restrições globais

- Fica tudo com o visual da etapa 1 (tokens). Cores de payoff:
  - **lucro** `var(--lucro)`, com área `var(--lucro-area)`;
  - **prejuízo** `var(--prejuizo)`, com área `var(--prejuizo-area)`;
  - curva **hoje** em `var(--hoje)`, tracejada;
  - estrutura **original** apagada em `var(--texto-suave)` com 40% de opacidade.
- A **linha do vencimento muda de cor ao cruzar o zero** (spec 5.2): cada trecho é desenhado com a cor do seu sinal.
- **Cor nunca é a única pista.** Valores sempre com sinal `+` ou `−` e em R$ no formato `1.234,56`.
- **Layout 2** (spec 5.4): o gráfico fica fixo à esquerda (`position: sticky`) e as abas à direita. No celular (≤ 820 px), o gráfico fica em cima e as abas embaixo, sem rolagem horizontal da página a 360 px.
- **Nenhum conteúdo some:**
  - o texto das 2 fichas de `src/content/estrategias/*.md` passa para a aba Visão da estrutura correspondente (`venda-coberta` → `covered-call`, `venda-de-put-coberta` → `cash-put`);
  - os 6 cards "em breve" saem, porque as estruturas existem no catálogo (spec 6.1);
  - **todo endereço antigo redireciona.**
- **A aba Vídeo só aparece quando a estrutura tem vídeo.** Hoje, só as fichas com `youtube` no front matter têm.
- O **aviso legal** (`DISCLAIMER`) continua em toda página de estrutura.
- **A interação não pode travar:** cada movimento de controle recalcula em menos de 50 ms numa máquina comum. As métricas no vencimento são calculadas uma vez, no carregamento.
- Os números exibidos são **por unidade (por opção)**, com o lote de 100 entre parênteses quando fizer sentido, como no laboratório atual.

## Foco de revisão

1. **Estrutura com perna de ação e quantidades fracionárias** (`quatermine-v2`, `monada-basica-*`, `booster-horizontal`, `dividendo-sint`): o gráfico e as métricas ficam corretos, sem `NaN`. Teste na Tarefa 2.
2. **Estrutura com dois vencimentos** (28 com `modo: 'mtm'`): o controle de dias vai até o **primeiro** vencimento, e a curva "no vencimento" é a do primeiro vencimento, com as pernas longas por BS. Teste na Tarefa 2.
3. **Estrutura sem linha no `mercado.csv`** (ou com o arquivo vazio): o cenário inicial cai para a montagem de referência, e a aba "Hoje" diz que não há preços. Teste na Tarefa 2.
4. **JavaScript desligado:** a página ainda mostra o gráfico estático e todo o texto das abas, empilhado. Teste na Tarefa 4.
5. **Links antigos** (`/ferramentas/laboratorio/<id>/`, `/estrategias/venda-coberta/` e os links internos de posts e da EscadaRisco): todos chegam à página nova. Teste na Tarefa 5.

---

## Estrutura de arquivos

| Arquivo | Responsabilidade |
|---|---|
| `src/lib/catalogo/converter.ts` | `lerMercadoCsv`, `posicaoReferencia`, `posicaoHoje`, `cenarioInicial` |
| `src/lib/catalogo/grafico.ts` | `faixaPrecos`, `segmentosPorSinal`, `escalas`, `caminho` (geometria pura do SVG) |
| `src/components/catalogo/GraficoEstrutura.tsx` | Ilha Preact: controles + SVG + métricas + gregas |
| `src/components/catalogo/Abas.astro` | Abas acessíveis (HTML no build + script pequeno) |
| `src/pages/estrategias/index.astro` | Catálogo único (substitui o índice atual e o do laboratório) |
| `src/pages/estrategias/[id].astro` | Página da estrutura (layout 2) |
| `astro.config.mjs` | Integração Preact e `redirects` |
| `src/styles/catalogo.css` | Estilos do layout 2 e do gráfico |
| `tests/catalogo-*.test.mjs` | Testes de conversão, geometria e HTML gerado |

As páginas antigas `src/pages/ferramentas/laboratorio/*` e `src/pages/estrategias/[...slug].astro` são removidas e substituídas por redirecionamentos.

---

### Task 1: Ilhas Preact e calendário rápido

**Arquivos:**
- Modificar: `package.json`, `astro.config.mjs`, `src/lib/motor/calendario.ts`
- Criar: `tests/catalogo-preact.test.mjs`

**Interfaces:**
- Produz:
  - a integração `preact()` no Astro;
  - o `diasUteis` do motor com **cache** por par `(de, ate)` (um `Map`), com o mesmo resultado de antes.

- [ ] **Passo 1: Criar o branch.** Rode `git switch -c catalogo-interativo` a partir de `motor-calculo`.

- [ ] **Passo 2: Escrever o teste que falha** em `tests/catalogo-preact.test.mjs`:
  - `test('integração preact configurada')`: `astro.config.mjs` contém `preact(` e o `package.json` tem `@astrojs/preact` e `preact` nas dependências;
  - `test('métricas de um calendário saem em menos de 100 ms')`: aplica `metricasVencimento` a um calendário de call (curta 2026-12-18 e longa 2027-09-17, vol 0,35). Faça uma chamada de aquecimento e meça a segunda.

- [ ] **Passo 3: Rodar `npm test`.** Esperado: os dois testes FALHAM. O segundo leva cerca de 300 ms hoje.

- [ ] **Passo 4: Implementar.**
  - Rode `npm install @astrojs/preact preact` e acrescente `preact()` às `integrations`.
  - Acrescente o cache em `diasUteis`. Se o resultado ainda passar de 100 ms, calcule `diasUteis` uma vez por perna em `curva()` e passe adiante, já que a data é a mesma para todos os pontos.

- [ ] **Passo 5: Rodar `npm run build && npm test`.** Esperado: PASSA, com 140 páginas.

- [ ] **Passo 6: Commit.** Mensagem: `"Catálogo: ilhas Preact e calendário com cache"`.

---

### Task 2: Conversão dos dados para o motor

**Arquivos:**
- Criar: `src/lib/catalogo/converter.ts`, `tests/catalogo-converter.test.mjs`

**Interfaces:**
- Consome: `Perna`, `Posicao` e `Cenario` do motor, e os formatos atuais de `estruturas.json` (pernas `{t,q,k,d,px,iv,exp}`, `ref {data,spot}`) e de `mercado.csv` (separador `;`, decimal `,`, linhas de comentário com `#`, cabeçalho `estrutura;grupo;tipo;qtd;ticker;strike;vencimento;preco;vi;negocios;origem`, metadados `# data=`, `# spot=` e `# ativo=`).
- Produz:
  ```ts
  interface LinhaMercado { estrutura: string; grupo: 'principal' | 'comparacao'; tipo: 'acao' | 'call' | 'put'; q: number; ticker: string; strike: number | null; venc: string | null; preco: number; vol: number | null; negocios: number | null; origem: string }
  interface Mercado { data: string; spot: number; ativo: string; linhas: LinhaMercado[] }
  lerMercadoCsv(texto: string): Mercado
  posicaoReferencia(est: EstruturaJson): { posicao: Posicao; cenario: Cenario }            // pernas de est.pernas; cenario = { data: est.ref.data, spot: est.ref.spot }
  posicaoHoje(est: EstruturaJson, m: Mercado): { posicao: Posicao; cenario: Cenario } | null   // linhas 'principal' da estrutura; null se não houver
  comparacaoHoje(est: EstruturaJson, m: Mercado): Posicao | null                          // linhas 'comparacao' (hedges)
  cenarioInicial(est: EstruturaJson, m: Mercado): { posicao: Posicao; cenario: Cenario; fonte: 'mercado' | 'referencia' }
  ```
- **Regras de conversão:**
  - `t: 'S'` vira `tipo: 'acao'`, `'C'` vira `'call'` e `'P'` vira `'put'`.
  - O `id` da perna é `p1`, `p2`… na ordem.
  - `entrada = px` ou `preco`, e `vol = iv` ou `vi` (`null` vira `undefined`).
  - Na referência, a ação usa `entrada = ref.spot`.

- [ ] **Passo 1: Escrever o teste que falha** em `tests/catalogo-converter.test.mjs`. Ele lê os arquivos reais do repositório (`src/data/laboratorio/estruturas.json` e `mercado.csv`) com `fs`:
  - `test('lerMercadoCsv lê metadados e linhas')`: `data === '2026-10-27'`, `spot === 17.38` e a primeira linha é covered-call/AÇÃO com q 1 e preço 17,38;
  - `test('as 62 estruturas têm cenário inicial do mercado')`: `cenarioInicial` de todas tem `fonte === 'mercado'`, e `resultado(posicao, cenario)` é finito e com `|·| < 0,05`, porque a entrada é o próprio preço do dia;
  - `test('quantidades fracionárias e ação')`: `quatermine-v2` e `dividendo-sint` geram métricas finitas (`metricasVencimento` sem `NaN` em ganho, perda e equilíbrios);
  - `test('estrutura de dois vencimentos: primeiroVencimento é o mais curto')`: para `thl-call`, `primeiroVencimento(posicao)` é a menor data entre as pernas;
  - `test('sem linhas no mercado cai para a referência')`: `cenarioInicial(est, { ...m, linhas: [] }).fonte === 'referencia'`, e o cenário é `ref.data` e `ref.spot`;
  - `test('referência da venda coberta')`: a `posicaoReferencia` de covered-call tem 2 pernas, e a ação tem `entrada 23.72`.

- [ ] **Passo 2: Rodar `npm test`.** Esperado: FALHA.

- [ ] **Passo 3: Implementar `converter.ts`.** Só funções puras, imports com `.ts` e nada de JSON nem `?raw`.

- [ ] **Passo 4: Rodar `npm test`.** Esperado: PASSA.

- [ ] **Passo 5: Commit.** Mensagem: `"Catálogo: conversão das estruturas e do mercado para o motor"`.

---

### Task 3: Geometria do gráfico e ilha interativa

**Arquivos:**
- Criar: `src/lib/catalogo/grafico.ts`, `src/components/catalogo/GraficoEstrutura.tsx`, `tests/catalogo-grafico.test.mjs`

**Interfaces:**
- Consome: `curva`, `curvaVencimento`, `metricasVencimento`, `gregasPosicao`, `primeiroVencimento`, `diasUteis`, `somarDiasUteis` (motor) e `cenarioInicial` (Task 2).
- Produz em `grafico.ts`:
  ```ts
  faixaPrecos(posicao: Posicao, spot: number, n = 161): number[]   // de max(0, min(ancoras, spot)·0,7) a max(ancoras, spot)·1,3, n pontos, incluindo os strikes
  segmentosPorSinal(xs: number[], ys: number[]): Array<{ sinal: 1 | -1; pontos: [number, number][] }>  // corta no zero por interpolação; trechos zerados ficam no segmento anterior
  escalas(xs: number[], series: number[][], caixa: { L: number; R: number; T: number; B: number; W: number; H: number }): { X: (x: number) => number; Y: (y: number) => number; yMin: number; yMax: number }
  caminho(pontos: [number, number][], X, Y): string   // 'M x,y L x,y ...' com 1 casa decimal
  area(pontos: [number, number][], X, Y): string      // polígono fechado até y = 0
  ```
- Produz o componente `<GraficoEstrutura dados={...} client:visible />`, com `dados = { posicao, cenario, comparacao?: Posicao | null, rotulo: string }`. Ele é serializável: só números, strings e arrays.
- **Comportamento da ilha:**
  - Controle **Preço**: de 0,7× a 1,3× do spot inicial, com passo de 0,01.
  - Controle **Dias até o 1º vencimento**: de `diasUteis(data, primeiroVencimento)` até 0. A data do cenário vem de `somarDiasUteis`.
  - Controle **Vol**: choque de −20 a +20 p.p., com passo de 1.
  - Botão **"Voltar ao início"**.
  - **Curvas:** a curva no vencimento é `curvaVencimento` (calculada uma vez). A curva hoje é `curva(posicao, {data, choqueVol}, xs)`, recalculada a cada movimento. Há uma linha vertical no preço escolhido e um ponto na curva hoje.
  - **Painel:** resultado no cenário (R$ com sinal), ganho máximo, perda máxima, equilíbrios ("ilimitado" quando for `null`) e as gregas da posição (Δ, Γ, Θ por dia útil, Vega por p.p.).
  - **Acessibilidade:** os controles são `<input type="range">` com `<label>`. O resultado fica em `aria-live="polite"`.
  - **Comparação:** quando houver `comparacao` (hedges), ela é desenhada apagada, com legenda.

- [ ] **Passo 1: Escrever o teste que falha** em `tests/catalogo-grafico.test.mjs`:
  - `test('segmentosPorSinal corta no zero')`: xs [0,1,2,3] e ys [-1,-1,1,1] dão 2 segmentos. O primeiro tem sinal −1 e termina em [1.5,0]; o segundo tem sinal 1 e começa em [1.5,0];
  - `test('segmentos de uma venda coberta')`: com a referência de covered-call, há exatamente 2 segmentos (prejuízo e lucro), e o ponto de corte arredondado é 22,23 (o break-even);
  - `test('faixaPrecos inclui strikes e o spot e começa em >= 0')`;
  - `test('escalas: yMin <= 0 <= yMax e X/Y mapeiam as bordas da caixa')`;
  - `test('caminho e area produzem strings sem NaN')`.

- [ ] **Passo 2: Rodar `npm test`.** Esperado: FALHA.

- [ ] **Passo 3: Implementar `grafico.ts`, e depois a ilha `GraficoEstrutura.tsx`.**
  - A ilha só usa as funções testadas.
  - O SVG usa classes de `catalogo.css`: `.g-lucro`, `.g-prejuizo`, `.g-area-lucro`, `.g-area-prejuizo`, `.g-hoje`, `.g-comp`, `.g-spot`, `.g-zero` e `.g-grade`.

- [ ] **Passo 4: Rodar `npm test`.** Esperado: PASSA.

- [ ] **Passo 5: Commit.** Mensagem: `"Catálogo: geometria do gráfico e ilha interativa"`.

---

### Task 4: Página da estrutura (layout 2) e catálogo único

**Arquivos:**
- Criar: `src/pages/estrategias/[id].astro`, `src/components/catalogo/Abas.astro`, `src/styles/catalogo.css`, `tests/catalogo-html.test.mjs`
- Substituir: `src/pages/estrategias/index.astro`, que passa a ser o catálogo único, reaproveitando os filtros e os mini gráficos do índice do Laboratório
- Remover: `src/pages/estrategias/[...slug].astro`

**Interfaces:**
- Consome: `ESTRUTURAS`, `POPS`, `FAM_COR`, `grafico` (mini estático) e `lerMercado`/`hoje` (bloco Hoje atual), de `laboratorio.ts`; `cenarioInicial` (Task 2); `<GraficoEstrutura>` (Task 3); a coleção `estrategias` (para o texto e o `youtube` das 2 fichas).
- **Página `/estrategias/<id>/`:**
  - **Cabeçalho:** família (chip), nome, racional e "Voltar ao catálogo".
  - **Coluna esquerda** (sticky, com `top: 1rem`):
    - a ilha `<GraficoEstrutura client:visible>`;
    - dentro de `<noscript>`, o gráfico estático atual (`grafico(...)`) e as métricas estáticas (`Metricas.astro`).
  - **Coluna direita:** `<Abas>`.
    - **Visão:** "O que esperar", notas, tabela de pernas da referência e o corpo da ficha .md, quando houver.
    - **POP:** os blocos atuais de `pops.json`, com checklist.
    - **Manejo:** `pop.manejo` + `pop.saida` + `pop.risco`, com a nota: "Cenários de manejo simuláveis chegam em breve."
    - **Vídeo:** o embed do YouTube, só se houver `youtube`.
    - **Hoje:** o `BlocoHoje.astro` atual.
  - O aviso legal fica no rodapé da página, e os links "anterior/próxima" e "mesma família" continuam.
- **`Abas.astro`:**
  - `role="tablist"`, `role="tab"` com `aria-selected` e `aria-controls`, e `role="tabpanel"`;
  - setas ←/→ trocam de aba;
  - **sem JavaScript,** todos os painéis ficam visíveis em sequência, cada um com o seu título. O script esconde os painéis inativos só depois de carregar.
- **Catálogo `/estrategias/`:** título "Catálogo de estratégias", introdução, filtros por família e cards com mini payoff, apontando para `/estrategias/<id>/`.

- [ ] **Passo 1: Escrever o teste que falha** em `tests/catalogo-html.test.mjs` (lê `dist/` depois do build):
  - `test('62 páginas de estrutura em /estrategias/<id>/')`: um `index.html` para cada id de `estruturas.json`;
  - `test('página de estrutura tem ilha, abas e aviso legal')`: em `dist/estrategias/covered-call/index.html` há `astro-island`, `role="tablist"`, as abas "Visão", "POP", "Manejo" e "Hoje", e o `DISCLAIMER`;
  - `test('aba Vídeo só aparece com vídeo')`: em `thl-call` não aparece `>Vídeo<`;
  - `test('sem JS o gráfico estático existe em noscript')`: em `covered-call` há `<noscript>` contendo `class="pf"`;
  - `test('conteúdo das fichas migrou')`: a página `covered-call` contém uma frase característica do corpo de `src/content/estrategias/venda-coberta.md` (pegue a primeira frase do corpo no próprio teste);
  - `test('catálogo lista as 62')`: `dist/estrategias/index.html` tem 62 links `href="/estrategias/<id>/"`.

- [ ] **Passo 2: Rodar `npm run build && npm test`.** Esperado: FALHA.

- [ ] **Passo 3: Implementar a página, as abas, o catálogo e o CSS.**
  - Grade: `grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr)` e, abaixo de 820 px, `minmax(0, 1fr)`.

- [ ] **Passo 4: Rodar `npm run build && npm test`.** Esperado: PASSA.

- [ ] **Passo 5: Verificar à mão.**
  - Com Chrome headless, a 1280 px e a 360 px, nos temas escuro e claro, abra `covered-call`, `thl-call` e `quatermine-v2`. O gráfico interativo aparece, e a página não rola na horizontal.
  - Mova os controles com um script de teste (iframe ou `--dump-dom` com `dispatchEvent`) e confira que o painel muda.

- [ ] **Passo 6: Commit.** Mensagem: `"Catálogo: página da estrutura com gráfico interativo e abas, catálogo único"`.

---

### Task 5: Redirecionamentos e links internos

**Arquivos:**
- Modificar: `astro.config.mjs` (`redirects`), `src/pages/ferramentas/index.astro`, links internos
- Remover: `src/pages/ferramentas/laboratorio/index.astro`, `src/pages/ferramentas/laboratorio/[id].astro`
- Criar: `tests/catalogo-redirects.test.mjs`

**Interfaces:**
- Consome: os ids de `estruturas.json`.
- **Redirecionamentos estáticos** (o Astro gera uma página com `meta refresh` + `rel=canonical`):
  - `/ferramentas/laboratorio` → `/estrategias/`;
  - `/ferramentas/laboratorio/<id>` → `/estrategias/<id>/`, para as 62 estruturas;
  - `/estrategias/venda-coberta` → `/estrategias/covered-call/`;
  - `/estrategias/venda-de-put-coberta` → `/estrategias/cash-put/`.
  - Os redirecionamentos são gerados a partir de `estruturas.json` dentro do `astro.config.mjs`, lendo o JSON com `fs`.
- **Links internos:** atualize todo `href` que aponte para `/ferramentas/laboratorio` em `src/`. Por exemplo, a EscadaRisco usa `/ferramentas/laboratorio/${s.lab}/`. O card do Laboratório em `/ferramentas` passa a apontar para `/estrategias/`, com o texto "Catálogo de estratégias".

- [ ] **Passo 1: Escrever o teste que falha** em `tests/catalogo-redirects.test.mjs`:
  - `test('laboratório antigo redireciona')`: `dist/ferramentas/laboratorio/covered-call/index.html` existe e contém `http-equiv="refresh"` e `/estrategias/covered-call/`;
  - `test('fichas antigas redirecionam')`: `dist/estrategias/venda-coberta/index.html` contém o refresh para `/estrategias/covered-call/`;
  - `test('nenhum link interno aponta para /ferramentas/laboratorio')`: busca em `src/**/*.{astro,ts,md,mdx}`, excluindo `astro.config.mjs`.

- [ ] **Passo 2: Rodar `npm run build && npm test`.** Esperado: FALHA.

- [ ] **Passo 3: Implementar.**

- [ ] **Passo 4: Rodar `npm run build && npm test && node scripts/checar-cores.mjs`.** Esperado: PASSA.
  - Confira a contagem de páginas: 62 novas + redirecionamentos.
  - Nenhuma página de conteúdo pode ter sumido. Compare a lista de `dist/**/index.html` com a da `motor-calculo`: toda página que existia continua existindo, como página ou como redirecionamento.

- [ ] **Passo 5: Commit.** Mensagem: `"Catálogo: redirecionamentos dos endereços antigos e links internos"`.
