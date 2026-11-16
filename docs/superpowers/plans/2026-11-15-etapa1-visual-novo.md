# Etapa 1: visual novo "petróleo escuro" (plano de implementação)

> **Para agentes:** SUB-SKILL OBRIGATÓRIA: use superpowers:subagent-driven-development (recomendado) ou superpowers:executing-plans para executar este plano tarefa por tarefa. Os passos usam checkbox (`- [ ]`).

**Objetivo:** aplicar ao site inteiro o tema "petróleo escuro" como padrão, com um botão para o tema claro. Todas as cores passam a vir de variáveis (tokens), sem mudar o conteúdo de nenhuma página.

**Arquitetura:**
- Um arquivo `tokens.css` define as variáveis semânticas para os dois temas. O tema escuro fica em `:root` e o claro em `:root[data-theme="light"]`.
- Um script inline no `<head>` aplica o tema salvo antes da primeira pintura, para a página não piscar no tema errado.
- Todos os componentes trocam as cores fixas e os blocos `@media (prefers-color-scheme: dark)` por tokens.
- Um verificador (`checar-cores`) e testes de contraste, ambos em `node --test`, impedem que cores fixas voltem a entrar no código.

**Stack:** Astro 7 (estático), CSS puro com `color-mix()`, Node 24 (`node --test`, com suporte nativo a TypeScript). **Nenhuma dependência nova.**

**Spec:** `docs/superpowers/specs/2026-11-15-plataforma-estrategias-design.md` (seções 5.1, 5.2, 5.7.1, 6.1 e 7)

**Rascunhos aprovados:** `C:\Users\jange\Documents\Curso claude code\.superpowers\brainstorm\1748-1794770901\content\` (`visual-estilo.html` opção C, `cores-payoff.html` opção 1).

## Restrições globais

- O conteúdo não muda. Nenhum texto, endereço ou página é removido. Só o visual muda (spec 5.7.1).
- O tema escuro é o padrão em todo o site. O tema claro é opcional, escolhido no botão e guardado em `localStorage` na chave `opcionando-tema`, com valores `"light"` ou `"dark"` (spec 5.1).
- As fontes continuam as mesmas: Baloo 2 nos títulos, Work Sans no texto e JetBrains Mono nos números e códigos.
- O coral `#f2694d` é a cor da marca (rótulos, abas, botão principal) e **nunca** é usado para indicar prejuízo nem para a curva "hoje" (spec 5.2).
- **Payoff:** lucro em verde-água `#3cc39a`, prejuízo em vermelho rosado `#e25c5c` e curva "hoje" em âmbar `#f3d27a`, tracejada (spec 5.2). Os valores do tema claro são escurecidos só o suficiente para passar no teste de contraste.
- Cor nunca é a única pista: valores de lucro e prejuízo continuam com sinal `+` ou `−`.
- O trabalho é feito no branch `visual-novo`. **Nunca fazer push na `main`.** O push do branch, para gerar a prévia do Cloudflare, só acontece com a autorização do dono (Tarefa 5).
- Nenhuma dependência npm nova.

## Foco de revisão

1. **Tema piscando no carregamento:** um visitante com tema claro salvo não pode ver o escuro piscar antes. O script de tema precisa vir antes do CSS no `<head>` (teste na Tarefa 2).
2. **`localStorage` bloqueado** (aba anônima, cookies bloqueados): o botão continua alternando o tema na sessão, sem erro no console (teste na Tarefa 2).
3. **Gráficos SVG gerados em TypeScript** (`laboratorio.ts`, `GraficoCandles`, `PerfilVolume`, `PayoffEstrutura`) com cor fixa ficariam invisíveis no tema escuro. Por isso o verificador também varre `.ts` e `.mdx` (teste na Tarefa 3).
4. **Cores das 12 famílias** do Laboratório precisam ser visíveis no fundo escuro **e** no claro (teste na Tarefa 3).
5. **Celular com 360 px de largura:** o cabeçalho, agora com o botão de tema, não pode gerar rolagem horizontal (verificação na Tarefa 5).

---

## Estrutura de arquivos

| Arquivo | Responsabilidade |
|---|---|
| `src/styles/tokens.css` (novo) | A única fonte de cores, nos dois temas |
| `src/styles/global.css` | Estilos base e classes compartilhadas, só com tokens |
| `src/styles/laboratorio.css` | Estilos do laboratório, só com tokens |
| `src/lib/familias.ts` (novo) | Paleta das 12 famílias. Módulo puro, que pode ser testado |
| `src/lib/laboratorio.ts` | Passa a importar `FAM_COR` de `familias.ts` e usa classes ou tokens nos SVGs |
| `src/components/TemaToggle.astro` (novo) | Botão de tema claro ou escuro |
| `src/components/BaseHead.astro` | Script inline de tema e `<meta name="theme-color">` |
| `src/components/Header.astro`, `Footer.astro`, `Logo.astro` | Novo visual de cabeçalho e rodapé |
| `scripts/lib/contraste.mjs` (novo) | Funções de contraste WCAG |
| `scripts/checar-cores.mjs` (novo) | Verificador de cores fixas (biblioteca e linha de comando) |
| `tests/*.test.mjs` (novo) | Testes de tokens, contraste, famílias, verificador e HTML gerado |

---

### Task 1 (Tarefa 1): Tokens dos dois temas, com contraste testado

**Arquivos:**
- Criar: `src/styles/tokens.css`, `scripts/lib/contraste.mjs`, `tests/contraste.test.mjs`
- Modificar: `package.json` (script `"test": "node --test tests/"`)

**Interfaces:**
- Produz: as variáveis CSS abaixo, usadas por todas as tarefas seguintes. Também produz `razaoContraste(hexA: string, hexB: string): number` e `lerTokens(css: string): { dark: Record<string,string>, light: Record<string,string> }`, ambas em `scripts/lib/contraste.mjs`.

- [ ] **Passo 1: Criar o branch.** Rode `git switch -c visual-novo` na raiz do repositório. Esperado: `Switched to a new branch 'visual-novo'`.

- [ ] **Passo 2: Escrever o teste que falha** em `tests/contraste.test.mjs`. Ele lê `src/styles/tokens.css`, roda `lerTokens` e, **para cada tema**, verifica:

```js
const texto = [ // mínimo 4,5
  ['--texto','--fundo'], ['--texto','--superficie'], ['--texto-suave','--fundo'],
  ['--texto-suave','--superficie'], ['--titulo','--fundo'], ['--destaque','--fundo'],
  ['--marca-texto','--fundo'], ['--texto-sobre-marca','--marca'],
  ['--lucro-texto','--superficie'], ['--prejuizo-texto','--superficie'],
];
const grafico = [ // mínimo 3
  ['--lucro','--superficie'], ['--prejuizo','--superficie'], ['--hoje','--superficie'],
  ['--borda-forte','--superficie'], ['--marca','--fundo'],
];
test('todos os tokens existem nos dois temas', ...)    // os mesmos nomes em dark e light
test('contraste de texto ≥ 4,5 (dark e light)', ...)
test('contraste gráfico ≥ 3 (dark e light)', ...)
test('razaoContraste("#000000","#ffffff") === 21', ...)
```

- [ ] **Passo 3: Rodar `npm test`.** Esperado: FALHA (módulo `scripts/lib/contraste.mjs` não encontrado).

- [ ] **Passo 4: Implementar `scripts/lib/contraste.mjs`** (luminância relativa WCAG 2.x, aceitando hex de 3 ou 6 dígitos) **e `src/styles/tokens.css`**. Os valores iniciais estão na tabela abaixo. Se algum par não passar no teste, ajuste **só a luminosidade** daquele token no tema que falhou e anote o valor final no commit.

| Token | Escuro (`:root`) | Claro (`:root[data-theme="light"]`) |
|---|---|---|
| `--fundo` | `#0b2329` | `#fbf6ec` |
| `--fundo-profundo` (rodapé) | `#071a1f` | `#0e4a55` |
| `--superficie` | `#10313a` | `#ffffff` |
| `--superficie-2` (hover, controles) | `#153b45` | `#f4f2ee` |
| `--borda` | `#1f4650` | `#e3ddd0` |
| `--borda-forte` | `#4a6a71` | `#8a8f86` |
| `--texto` | `#e6ebe9` | `#2a2d31` |
| `--texto-suave` | `#a9b8ba` | `#5b6168` |
| `--titulo` | `#fbf6ec` | `#0e4a55` |
| `--destaque` (links, petróleo claro) | `#7fc6d1` | `#0e4a55` |
| `--marca` (coral, preenchimentos) | `#f2694d` | `#f2694d` |
| `--marca-hover` | `#ff7d63` | `#e0573b` |
| `--marca-texto` (coral como texto) | `#f2694d` | `#b8432c` |
| `--texto-sobre-marca` | `#0b2329` | `#0b2329` |
| `--lucro` | `#3cc39a` | `#1f9a74` |
| `--prejuizo` | `#e25c5c` | `#cc4444` |
| `--lucro-texto` | `#3cc39a` | `#17775a` |
| `--prejuizo-texto` | `#e25c5c` | `#b23434` |
| `--hoje` | `#f3d27a` | `#b7860b` |
| `--petroleo` (fixo da marca, logo) | `#0e4a55` | `#0e4a55` |
| `--creme` (fixo da marca, logo) | `#fbf6ec` | `#fbf6ec` |

Os tokens derivados ficam no mesmo arquivo, **fora** dos blocos de tema, e se recalculam sozinhos:
- `--lucro-area: color-mix(in srgb, var(--lucro) 24%, transparent)`
- `--prejuizo-area: color-mix(in srgb, var(--prejuizo) 28%, transparent)`
- `--destaque-area: color-mix(in srgb, var(--destaque) 10%, transparent)`
- `--marca-area: color-mix(in srgb, var(--marca) 10%, transparent)`
- `--sombra: 0 8px 24px color-mix(in srgb, #000 28%, transparent)`

Mais um detalhe: o bloco `:root` declara `color-scheme: dark`, e o bloco claro declara `color-scheme: light`.

- [ ] **Passo 5: Rodar `npm test`.** Esperado: PASSA, com 4 testes.

- [ ] **Passo 6: Commit.** Rode `git add package.json src/styles/tokens.css scripts/lib tests && git commit -m "Visual: tokens dos temas escuro e claro com teste de contraste"`.

---

### Task 2 (Tarefa 2): Mecanismo de tema, estilos base, cabeçalho e rodapé

**Arquivos:**
- Criar: `src/components/TemaToggle.astro`, `tests/html.test.mjs`
- Modificar: `src/components/BaseHead.astro`, `src/styles/global.css`, `src/components/Header.astro`, `src/components/Footer.astro`, `src/components/Logo.astro`

**Interfaces:**
- Consome: os tokens da Tarefa 1.
- Produz: o atributo `data-theme` em `<html>` (`"dark"` ou `"light"`). Também mantém as classes globais atuais (`.caixa`, `.card-link`, `.selo`, `.botao`, `.grade-cards`, `.cta-artigo` etc.) com os **mesmos nomes**, para que nenhuma página precise mudar o HTML.

- [ ] **Passo 1: Escrever o teste que falha** em `tests/html.test.mjs`. Ele lê `dist/index.html` e `dist/glossario/index.html` (gerados por `npm run build`) e verifica:
  - `test('script de tema vem antes de qualquer <link rel="stylesheet"> e <style>')`: o índice de `opcionando-tema` no HTML é menor que o índice do primeiro `rel="stylesheet"` e do primeiro `<style`;
  - `test('script de tema trata localStorage indisponível')`: o trecho inline contém `try` e `catch`;
  - `test('botão de tema presente')`: o HTML contém `data-tema-toggle` e `aria-label=`;
  - `test('meta theme-color presente')`: o HTML contém `name="theme-color"`.

- [ ] **Passo 2: Rodar `npm run build && npm test`.** Esperado: os testes de `html.test.mjs` FALHAM.

- [ ] **Passo 3: Implementar.**
  - **`BaseHead.astro`:** inclua `<script is:inline>` como **primeiro** filho do head, antes do `import` de CSS. Ele lê `localStorage['opcionando-tema']` dentro de `try/catch` e faz `document.documentElement.dataset.theme = salvo === 'light' ? 'light' : 'dark'`. Também inclua `<meta name="theme-color" content="#0b2329">`.
    - Para garantir a ordem, o `import '../styles/global.css'` deve ir para o `Base.astro`. Confirme com o teste.
  - **`TemaToggle.astro`:** um `<button type="button" data-tema-toggle>` com ícone SVG de sol ou lua, `aria-label` dinâmico ("Mudar para tema claro" ou "Mudar para tema escuro") e `aria-pressed`. Ao clicar, ele alterna `data-theme` e tenta gravar no `localStorage` dentro de `try/catch`, ignorando a falha.
  - **`global.css`:**
    - importa `tokens.css` no topo;
    - remove o bloco `:root` antigo e o `@media (prefers-color-scheme: dark)`;
    - toda cor passa a ser um token (`--bg` vira `--fundo`, `--bg-card` vira `--superficie`, `--acento` vira `--marca`, e assim por diante);
    - `.botao` usa fundo `--marca` com texto `--texto-sobre-marca`;
    - `.card-link` perde a borda superior de 5 px e ganha borda de 1 px `--borda` e, no hover, borda `--marca` com `--sombra`;
    - `.erros b` usa `--prejuizo`;
    - `.barra-premio .int` e `.ext` usam `--destaque` e `--marca`, com texto `--texto-sobre-marca`;
    - os títulos usam `--titulo`.
  - **`Header.astro`:**
    - fundo `--fundo` com borda inferior de 1 px `--borda`, sem a faixa coral de 4 px;
    - itens do menu em `--texto-suave`;
    - item ativo em `--titulo`, com sublinhado de 2 px `--marca`;
    - botão do YouTube com contorno coral;
    - `<TemaToggle />` à direita, ao lado do YouTube;
    - **mesmos itens e mesma ordem** do menu atual.
  - **`Footer.astro`:** fundo `--fundo-profundo`, aviso com borda e fundo `--marca-area`, links em `--texto`.
  - **`Logo.astro`:** retângulo em `--petroleo` com contorno de 1 px `--borda-forte`.

- [ ] **Passo 4: Rodar `npm run build && npm test`.** Esperado: PASSA em todos os testes, e o build sem erros.

- [ ] **Passo 5: Verificar à mão.** Rode `npm run preview` e abra `/` e `/glossario`.
  - O site abre escuro.
  - O botão alterna o tema, e o tema escolhido continua depois de recarregar a página.
  - Numa janela anônima com cookies bloqueados, o botão alterna o tema e o console não mostra erros.

- [ ] **Passo 6: Commit.** Rode `git commit -am "Visual: tema escuro padrão, botão de tema, cabeçalho e rodapé novos"`, incluindo os arquivos novos com `git add`.

---

### Task 3 (Tarefa 3): Verificador de cores fixas e migração do Laboratório

**Arquivos:**
- Criar: `scripts/checar-cores.mjs`, `src/lib/familias.ts`, `tests/cores.test.mjs`, `tests/familias.test.mjs`
- Modificar: `src/lib/laboratorio.ts`, `src/styles/laboratorio.css`, `src/pages/ferramentas/laboratorio/[id].astro`, `src/pages/ferramentas/laboratorio/index.astro`

**Interfaces:**
- Produz:
  - `encontrarCoresFixas(arquivos: string[]): Array<{ arquivo: string, linha: number, trecho: string }>`, em `scripts/checar-cores.mjs`. A linha de comando `node scripts/checar-cores.mjs [dir=src]` imprime as ocorrências e sai com código 1 se houver alguma.
  - `FAM_COR: Record<string,string>` e `FAM_ORDEM: string[]`, em `src/lib/familias.ts`. O `laboratorio.ts` reexporta os dois com os mesmos nomes, para não quebrar quem já importa.
- Consome: `razaoContraste` e `lerTokens` (Tarefa 1).

**Regras do verificador:**
- Ocorrência é qualquer `#rgb`, `#rrggbb`, `#rrggbbaa`, `rgb(` ou `rgba(` em `.astro`, `.css`, `.ts`, `.mdx` e `.md`, dentro de `src/`.
- **Exceções:** `src/styles/tokens.css`, `src/lib/familias.ts` e a linha com `name="theme-color"`.
- Ignora âncoras de link como `href="#secao"`. Para isso, considere `#` seguido de 3, 6 ou 8 dígitos hexadecimais e sem letras de `g` a `z` logo depois.

- [ ] **Passo 1: Escrever os testes que falham.**
  - `tests/cores.test.mjs`:
    - `test('detecta hex, rgb e rgba em fixture')`: cria um arquivo temporário com `color:#d64545;` e `rgba(1,2,3,.5)` e espera 2 ocorrências;
    - `test('ignora âncora href="#metodo" e tokens.css')`;
    - `test('laboratório sem cores fixas')`: roda `encontrarCoresFixas` em `src/lib/laboratorio.ts`, `src/styles/laboratorio.css` e `src/pages/ferramentas/laboratorio/**` e espera `[]`.
  - `tests/familias.test.mjs`:
    - importa `FAM_COR` de `../src/lib/familias.ts`;
    - `test('12 famílias na ordem atual')`: compara com `['Base','Direcionais','Proteção patrimonial','Volatilidade','Tempo / rolagem','Asas / proteção','Booster','Módulos','Híbridas / hedge','Gradiente linear','Hedge · ajustes','Mônadas']`;
    - `test('cada cor tem contraste ≥ 3 contra --superficie nos dois temas')`.

- [ ] **Passo 2: Rodar `npm test`.** Esperado: FALHA (módulos inexistentes; o laboratório tem cerca de 37 ocorrências).

- [ ] **Passo 3: Implementar.**
  - **`checar-cores.mjs`**, seguindo as regras acima.
  - **`familias.ts`:** as mesmas 12 chaves e a mesma ordem, com cores de tom médio. A luminância relativa precisa ficar entre cerca de 0,18 e 0,30 para ter contraste ≥ 3 contra `#10313a` e contra `#ffffff` ao mesmo tempo. Use como ponto de partida as cores atuais, clareadas ou escurecidas até passar no teste.
  - **Chips de família** (`.lab .chip`): deixam de ser um fundo colorido com texto branco e passam a ser **um ponto colorido (`--fc`) seguido do texto em `--texto`**. Isso evita contraste ruim no texto dos chips.
  - **SVG do payoff em `laboratorio.ts` e `laboratorio.css`:**
    - `.pf-gain` usa `--lucro-area` e `.pf-loss` usa `--prejuizo-area`;
    - `.pf-line` usa `--destaque`;
    - `.pf-comp` usa `--texto-suave`;
    - `.pf-spot` usa `--hoje`, e não mais o coral;
    - nenhum `fill` ou `stroke` com hex dentro do TS; tudo vira classe CSS.
    - A linha mudando de cor ao cruzar o zero fica para a etapa 3 (gráfico interativo).
  - **`.buy`, `.pos`, `.tile.pos`** usam `--lucro-texto`; **`.sell`, `.neg`, `.tile.neg`, `.pb.risk`** usam `--prejuizo-texto` ou `--prejuizo`.
  - **Selos de idade e pills** (`.selo-idade`, `.pill.l2`, `.pill.l3`, `.orig.teo`): usam `color-mix` de `--hoje`, `--lucro` e `--prejuizo` sobre `--superficie`. Remova o `@media (prefers-color-scheme: dark)`.

- [ ] **Passo 4: Rodar `npm run build && npm test`.** Esperado: PASSA em tudo.

- [ ] **Passo 5: Verificar à mão.** No `npm run preview`, abra `/ferramentas/laboratorio` e três estruturas: `covered-call`, uma de Mônadas e uma de Booster. Confira nos dois temas:
  - lucro verde-água e prejuízo vermelho rosado;
  - a linha do preço atual em âmbar;
  - as famílias distinguíveis entre si.

- [ ] **Passo 6: Commit.** Rode `git add -A scripts src tests && git commit -m "Visual: verificador de cores fixas e Laboratório no tema novo"`.

---

### Task 4 (Tarefa 4): Migrar todos os outros componentes e páginas

**Arquivos (modificar, todos os que hoje têm cor fixa):**
- `src/pages/analises/[...slug].astro` (cerca de 39 ocorrências), `src/pages/analises/index.astro`, `src/pages/analises/ativo/[ticker].astro`
- `src/components/analise/GraficoCandles.astro`, `PerfilVolume.astro`, `PayoffEstrutura.astro`, `CardAnalise.astro`
- `src/components/risco/EscadaRisco.astro`
- `src/components/artigo/QuatroLados.astro`, `Alavancagem.astro`, `MapaDecisao.astro`, `ThetaDerrete.astro`, `CemCenarios.astro`, `Quadrinho.astro`
- `src/components/trilha/Decodificador.astro`, `LabPremio.astro`, `GeradorPlano.astro`, `CalcPosicao.astro`
- `src/components/acoes/PrecoTeto.astro`, `Derivativo.astro`, `src/components/PostCard.astro`
- `src/pages/ferramentas/calculadora-de-payoff.astro`, `src/pages/blog/[...slug].astro`, `src/pages/index.astro`, `src/pages/estrategias/[...slug].astro`
- Teste: `tests/cores.test.mjs`

**Interfaces:**
- Consome: os tokens (Tarefa 1) e `encontrarCoresFixas` (Tarefa 3).

**Regras de tradução:**

| Cor de hoje | Token novo |
|---|---|
| Altas, ganhos, compras: `#1e8c4f`, verdes | `--lucro` (traço/preenchimento) ou `--lucro-texto` (texto) |
| Quedas, perdas, vendas: `#d64545`, vermelhos | `--prejuizo` / `--prejuizo-texto` |
| `#7fc6d1`, petróleo claro | `--destaque` |
| `rgba(127,198,209,x)` | `color-mix(in srgb, var(--destaque) x%, transparent)` |
| `#0e262c`, fundos internos escuros | `--superficie-2` |
| `#fff` como fundo | `--superficie` |
| `#fff` como texto sobre cor | `--texto-sobre-marca` |
| Coral `#f2694d` / `#ff7d63` | `--marca` / `--marca-hover` |
| Cinzas de apoio (`#9aa0a6` e parecidos) | `--texto-suave` |

- Linha do preço atual ou marcador de "agora" em gráficos: `--hoje`.
- Cores de candles: corpo de alta em `--lucro`, corpo de baixa em `--prejuizo`.
- Remova todos os blocos `@media (prefers-color-scheme: dark)`.
- Se uma cor não se encaixar em nenhuma regra, crie um token novo em `tokens.css`, nos dois temas e com o par de contraste adicionado ao teste da Tarefa 1. Nunca deixe a cor fixa no componente.

- [ ] **Passo 1: Escrever o teste que falha** em `tests/cores.test.mjs`:
  - `test('src inteiro sem cores fixas')`: `encontrarCoresFixas` sobre todos os arquivos de `src/` deve retornar `[]`;
  - `test('nenhum prefers-color-scheme em src')`: a busca por `prefers-color-scheme` em `src/` não pode encontrar nada.

- [ ] **Passo 2: Rodar `npm test`.** Esperado: FALHA, com a lista das ocorrências restantes. Use essa lista como checklist da migração.

- [ ] **Passo 3: Migrar arquivo por arquivo** seguindo a tabela de tradução. Rode `node scripts/checar-cores.mjs` entre um arquivo e outro.

- [ ] **Passo 4: Rodar `npm run build && npm test`.** Esperado: PASSA em tudo.

- [ ] **Passo 5: Verificar à mão** nos dois temas:
  - uma análise completa, `/analises/bbas3-2026-11-12`: candles, perfil de volume e payoff;
  - `/trilha/delta`, com o `LabPremio`;
  - `/blog/opcoes-como-ganhar-dinheiro`, com Alavancagem, CemCenarios, QuatroLados e MapaDecisao;
  - `/supercoberta/potencializando-o-risco-assumido`, com EscadaRisco;
  - `/ferramentas/calculadora-de-payoff`;
  - `/acoes/acoes-o-basico`.

  Nada pode ficar ilegível ou invisível.

- [ ] **Passo 6: Commit.** Rode `git commit -am "Visual: todos os componentes e páginas no tema novo"`.

---

### Task 5 (Tarefa 5): Revisão final e prévia para o dono

**Arquivos:** nenhum novo. Só ajustes que a revisão encontrar.

- [ ] **Passo 1: Conferência completa.** Rode `npm run build && npm test && node scripts/checar-cores.mjs`. Esperado: tudo passa e o verificador não imprime nada.

- [ ] **Passo 2: Celular.** No `npm run preview`, com a largura do navegador em **360 px** (modo dispositivo do DevTools), abra `/`, `/ferramentas/laboratorio/covered-call` e `/analises/bbas3-2026-11-12` nos dois temas.
  - O cabeçalho, o menu (que pode rolar na horizontal dentro da própria faixa) e o botão de tema cabem na tela.
  - A **página** não rola na horizontal: `document.documentElement.scrollWidth` não pode passar de `innerWidth`.

- [ ] **Passo 3: Desktop.** Com 1280 px, abra as mesmas páginas e mais `/comece-aqui`, `/macro`, `/glossario`, `/estudos` e `/artigos`. Confirme que **todo o conteúdo continua lá**, com os mesmos textos e endereços (spec 5.7.1).

- [ ] **Passo 4: Pedir autorização ao dono** para enviar o branch: `git push -u origin visual-novo`. **Nunca a `main`.** O Cloudflare Pages gera a prévia em `visual-novo.<projeto>.pages.dev`. Mande o link ao dono e espere a aprovação antes de qualquer merge na `main`.
