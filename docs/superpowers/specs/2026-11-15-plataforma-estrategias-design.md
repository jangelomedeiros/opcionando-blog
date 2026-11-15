# Plataforma de estratégias com opções: evolução do opcionando.com.br

Data: 15/11/2026 · Autor do conteúdo e do método: o dono do canal Opcionando · Status: rascunho para aprovação

## 1. Intenção e motivo

O opcionando.com.br vai deixar de ser um blog com algumas ferramentas e passar a ser **a plataforma de referência em estratégias com opções na B3**. Ela deve funcionar como um legado do método Opcionando. São três públicos:

- **O dono do canal**, que usa a plataforma no próprio trabalho.
- **Os alunos de um curso futuro.** Ainda não existem alunos nem plataforma de venda.
- **O público aberto.** O objetivo com ele é atrair alunos, construir reputação e oferecer algo útil por si só.

**O diferencial declarado:** teoria de opções existe em todo lugar. O que falta é a **prática**. O visitante deve entender o prêmio pago ou recebido conforme a perspectiva (comprador ou vendedor) e a **dinâmica da operação ao longo do tempo e da oscilação do mercado**. Também deve conseguir **ver o que acontece com a sua estrutura depois de um manejo**: as novas áreas de lucro e de prejuízo.

**Princípio editorial: "uma trilha, não um trilho".** O site mostra caminhos, consequências e o que pesa em cada escolha. Ele nunca prescreve uma única resposta. O manejo depende da leitura e da experiência do operador.

## 2. Objetivos, não objetivos e antiobjetivos

**Objetivos**
1. Ter um **catálogo único** de estruturas. Cada estrutura tem uma página com gráfico de payoff interativo, gregas, POP (procedimento operacional padrão), manejo por cenário, vídeo e "montar hoje" com preços reais.
2. Criar o **simulador de manejo**: aplicar ajustes (caminhos prontos ou modo livre) num ponto do cenário e ver a estrutura resultante.
3. Criar o **laboratório de conceitos** com foco prático. O módulo central é a **Jornada do prêmio** (comprador × vendedor, dia a dia).
4. Fazer um **visual novo**, moderno e leve, no tema "petróleo escuro", em todo o site.

**Não objetivos (por enquanto)**
- Login, área de alunos e integração com plataforma de venda. Todo o conteúdo continua público.
- Uma fonte de dados de mercado automática ou em tempo real. Isso fica para depois.
- Painel de administração. O conteúdo continua em arquivos editados só pelo dono.
- Trajetória desenhada à mão pelo aluno na jornada (fase futura).

**Antiobjetivos** (coisas que seriam um fracasso mesmo funcionando)
- Ficar **carregado** e sobrecarregar o usuário com informação. A interface deve ser enxuta e mostrar uma coisa por vez.
- Virar **mais um site de teoria**. Cada conceito deve aparecer em uma operação concreta.
- Soar **prescritivo**, como "faça isto".
- Ficar **preso a ferramentas que podem morrer**. O conteúdo precisa sobreviver a uma troca de tecnologia.
- Deixar o site **pesado ou lento**. Hoje ele é estático e rápido.

## 3. Situação atual (o que já existe)

O repositório é `jangelomedeiros/opcionando-blog`. É Astro 7, estático, publicado no Cloudflare Pages a cada push na `main`. Não há testes automatizados.

- **Laboratório** (`/ferramentas/laboratorio`, `/ferramentas/laboratorio/[id]`):
  - Tem **62 estruturas** em 12 famílias, definidas em `src/data/laboratorio/estruturas.json`.
  - Cada perna tem tipo (S, C, P), quantidade, strike, dias, preço, IV e vencimento.
  - O campo `modo` é `expiry` em 34 estruturas e `mtm` em 28, que têm mais de um vencimento.
  - O POP é estruturado em `pops.json`: objetivo, contexto, janela, montagem, manejo (um parágrafo), saída, risco, regra e checklist.
  - Os preços reais vêm de `mercado.csv`, gerado por `scripts/atualizar_mercado.py` a partir da planilha do opcoes.net.br. A data atual é 27/10, com BBAS3.
  - Os gráficos são SVG gerados **na hora do build**, em `src/lib/laboratorio.ts`. O visitante não interage com eles.
- **Estratégias** (`/estrategias`): coleção `estrategias` com 2 fichas prontas e 6 marcadas como "em breve". Tem um schema próprio (visão, nível, objetivo, ganho e perda máximos, ponto de equilíbrio, montagem, preset e youtube). **Ela se sobrepõe ao Laboratório.**
- **Calculadora de payoff** (`/ferramentas/calculadora-de-payoff.astro`): JavaScript puro, até 4 pernas, só no vencimento.
- **Peças de conceito:**
  - `LabPremio`, um Black-Scholes configurável, usado nas páginas da trilha sobre delta, theta, vega, ITM/ATM/OTM e intrínseco/extrínseco.
  - `ThetaDerrete` e `Alavancagem`.
  - O decodificador de código, a calculadora de posição e o gerador de plano.
- **Visual:** `src/styles/global.css`, com fundo creme, petróleo `#0e4a55`, coral `#f2694d`, Baloo 2 nos títulos e Work Sans no texto. Já existe um modo escuro automático simples.
- **Dados históricos:** existe OHLCV diário de 7 papéis em `dados-brutos/2026-10-26/ohlcv/`, com cerca de 422 pregões. Também há scripts Python de análise em `scripts/`.

## 4. Abordagens consideradas

Como construir a parte interativa:

| | Abordagem | Prós | Contras |
|---|---|---|---|
| A | JavaScript puro, como a calculadora atual | Não adiciona dependências | Gráfico, 3 controles, gregas e manejo em 62 páginas e no laboratório ficariam difíceis de manter |
| **B** | **Ilhas do Astro com Preact (cerca de 4 KB), gráficos em SVG próprio, motor de cálculo em TypeScript compartilhado** | Site continua estático e leve; separa cálculo e tela; reaproveita o mesmo motor em estrutura, manejo, jornada e calculadora | Adiciona uma dependência pequena |
| C | B com uma biblioteca de gráficos (Chart.js, ECharts) | Gráficos prontos mais rápido | Página mais pesada e com cara genérica, o que contraria o "moderno, mas leve" |

**Escolhida: B**, pelo dono, em 15/11/2026.

## 5. Decisões tomadas

### 5.1 Visual: "petróleo escuro" em todo o site
- O **tema escuro é o padrão em todo o site**: fundo petróleo muito escuro (cerca de `#0b2329`), superfícies em `#10313a`, texto creme e claro.
- Baloo 2 continua nos títulos e Work Sans no texto. O **coral é a cor da marca** e aparece em rótulos, abas, destaques e no botão principal.
- *Decisão do Claude:* um **botão para o modo claro**, com a escolha guardada no navegador do visitante. Ajuda quem lê textos longos. O modo claro é uma evolução do creme atual.
- O visual deve ser **leve**: muito espaço, poucas bordas, uma ação principal por área e nada piscando.
- Os rascunhos aprovados estão em `Curso claude code/.superpowers/brainstorm/` (`visual-estilo.html` opção C, `layout-estrutura.html` opção 2, `cores-payoff.html`, `jornada-premio.html`).

### 5.2 Cores do gráfico de payoff
- **Lucro em verde-água** (cerca de `#3cc39a`) e **prejuízo em vermelho rosado** (cerca de `#e25c5c`). *Decisão do Claude:* o dono não escolheu entre as duas combinações apresentadas; foi adotada a combinação 1.
- A linha do vencimento muda de cor ao cruzar o zero, e a área entre ela e o zero fica tingida com a mesma cor, translúcida.
- A **curva "hoje"** fica em **âmbar claro tracejado** (cerca de `#f3d27a`). O coral não é usado nela para não ser confundido com prejuízo.
- Uma linha vertical discreta marca o preço atual.
- A estrutura **original**, quando houver ajuste, aparece apagada por trás da nova.

### 5.3 Catálogo único
- `/estrategias` e `/ferramentas/laboratorio` viram **um catálogo só**, com uma página por estrutura (as 62 atuais e as que vierem depois).
- Os endereços antigos **redirecionam** para os novos. Os links do canal e dos posts não podem quebrar.
- O conteúdo editorial das 2 fichas prontas (venda coberta, venda de put coberta) é incorporado às estruturas correspondentes.
- O catálogo tem filtros por família, visão e nível.

### 5.4 Página de uma estrutura (layout 2)
- **À esquerda, fixo** enquanto se lê ao lado:
  - o gráfico de payoff interativo;
  - os controles **preço do ativo, dias até o vencimento e volatilidade implícita**;
  - ganho máximo, perda máxima e pontos de equilíbrio;
  - as **gregas da posição** (delta, gama, theta, vega).
- **À direita, em abas:** **Visão · POP · Manejo · Vídeo · Hoje**.
  - *Visão:* quando usar, como montar e o risco.
  - *POP:* o procedimento operacional padrão atual, com o checklist.
  - *Manejo:* ver 5.5.
  - *Vídeo:* YouTube embutido. A aba some quando não há vídeo. *Decisão do Claude.*
  - *Hoje:* como montar com os preços reais da grade mais recente.
- **No celular,** o gráfico fica em cima e as abas embaixo.

### 5.5 Manejo: por cenário e por estrutura, simulável
- O manejo de cada estrutura é uma lista de **cenários**, por exemplo "subiu rápido antes da metade do prazo", "caiu abaixo do strike comprado" ou "lateralizou".
- Cada cenário tem **sinais** e vários **caminhos possíveis**. Nenhum caminho vem marcado como o certo.
- Cada caminho tem nome, descrição, o que ganha, o que perde e quando faz sentido. Pode também ter um link para uma estrutura de "Hedge · ajustes".
- Cada cenário pode ter um bloco **"o que pesa na escolha"**.
- **A simulação é essencial:** o operador precisa ver como a estrutura fica depois do manejo, com as novas áreas de lucro e de prejuízo.
- **Como a simulação funciona:**
  1. O operador posiciona o cenário: preço, dias decorridos e vol.
  2. Ele aplica um caminho. As pernas que saem são **encerradas pelo preço teórico daquele momento** (Black-Scholes), e o **resultado realizado fica guardado**. As pernas novas são **abertas pelo preço teórico daquele momento**.
  3. O gráfico mostra a **estrutura nova** (com o resultado realizado somado) sobre a **original apagada**.
  4. Um resumo mostra o crédito ou débito do ajuste, o novo ganho máximo, a nova perda máxima e os novos pontos de equilíbrio.
  5. Os ajustes podem se **encadear**: entrada → ajuste 1 → ajuste 2, com um histórico que dá para desfazer.
- **Os caminhos prontos são descritos como operações relativas** e não como pernas fixas. Exemplos: "rolar a perna X em +N strikes", "rolar a perna X para o próximo vencimento", "encerrar a perna X" e "adicionar uma PUT N strikes abaixo do preço". Assim, o mesmo caminho vale para qualquer cenário.
- **Modo livre:** o operador também pode montar o próprio ajuste, adicionando, removendo, rolando e mudando a quantidade de pernas.
- *Decisão do Claude:* o mesmo editor de pernas substitui a calculadora de payoff atual ("monte sua estrutura"), e a calculadora passa a usar o novo motor e o novo gráfico.

### 5.6 Laboratório de conceitos: foco prático
- **O módulo central é a "Jornada do prêmio"** (rascunho em `jornada-premio.html`):
  - Uma opção (CALL ou PUT) **vista pelos dois lados**: o comprador pagou e tem um direito; o vendedor recebeu e tem uma obrigação. O resultado de um é o espelho do outro.
  - O tempo corre dia a dia com ▶ ou arrastando a barra. A vol implícita pode ser alterada.
  - **"De onde veio o resultado":** separa a parte do preço (delta), do tempo (theta) e da vol (vega), com sinais invertidos entre comprador e vendedor.
  - Mostra a evolução do valor da opção, separando intrínseco e extrínseco, contra o prêmio de entrada.
  - Uma frase curta em linguagem simples comenta o momento.
- **De onde vem o mercado oscilando:**
  - **Trajetórias reais**: trechos históricos dos papéis, a partir do OHLCV já existente.
  - **Cenários prontos**: alta lenta, queda brusca, lateral, gap depois de balanço.
  - Desenhar a trajetória fica para uma fase futura.
- **Dados:** a **entrada usa preços reais** da grade de opções do último pregão, que o dono vai fornecer. A **evolução nos dias seguintes é calculada** por Black-Scholes sobre a trajetória. A plataforma fica **preparada para grades diárias**: se o dono salvar a grade todo pregão, jornadas futuras podem reproduzir os prêmios reais.
- *Decisão do Claude:* depois, o mesmo formato serve para a **jornada de estruturas inteiras**, não só de uma opção.
- *Decisão do Claude, para módulos complementares menores* que reaproveitam o motor e podem substituir o `LabPremio` dentro da trilha:
  - anatomia do prêmio;
  - prêmio × preço em vários prazos;
  - gregas ao longo do preço;
  - gregas no tempo;
  - efeito da volatilidade;
  - probabilidade sobre o payoff.
  - A prioridade deles é **abaixo** da Jornada.

### 5.7 Conteúdo em arquivos
- Todo o conteúdo (estruturas, POP, manejo, cenários, caminhos, vídeos e trajetórias de cenário) continua em **arquivos versionados no repositório**, editados só pelo dono ou pelo Claude a pedido dele. Não há painel de administração.
- O formato deve ser **simples, legível e exportável** (JSON, YAML ou Markdown com front matter) e **independente do framework**.
- Cada estrutura terá um campo de **nível de acesso**, que hoje é sempre "público", para permitir restringir algum conteúdo no futuro sem reorganizar nada.

## 6. Ordem de construção

1. **Visual novo** (tokens, tema escuro e claro, cabeçalho, rodapé, tipografia e componentes base) aplicado ao site inteiro. Vem primeiro para que as páginas novas já nasçam no visual final.
2. **Motor de cálculo** em TypeScript compartilhado:
   - Black-Scholes;
   - gregas por perna e por posição;
   - payoff no vencimento e "hoje" para estruturas de vários vencimentos;
   - pontos de equilíbrio, ganho e perda máximos;
   - aplicação de operações de manejo com resultado realizado.
   O motor roda tanto no build quanto no navegador.
3. **Catálogo único e página de estrutura** (layout 2, gráfico interativo, abas). Inclui:
   - a ingestão da grade completa de BBAS3;
   - a migração de `estruturas.json` e `pops.json` para o formato relativo (5.8), com os textos reescritos sem valores fixos;
   - os redirecionamentos dos endereços antigos.
4. **Simulador de manejo**: caminhos prontos, modo livre e a calculadora de payoff migrada.
5. **Jornada do prêmio**, depois os módulos complementares de conceitos.

O manejo por cenário (os textos) é conteúdo do dono e será escrito aos poucos. A plataforma precisa funcionar bem com estruturas que **ainda não têm** cenários, vídeo ou caminhos simuláveis.

### 5.7.1 O resto do site permanece
- **Nenhum conteúdo atual é removido.** Os artigos e o blog, as Análises, a trilha Comece Aqui, Macro e Micro, Supercoberta, Ações, Estudos e o Glossário continuam no ar, com os mesmos endereços.
- Essas seções **só recebem o visual novo**. O texto delas não muda.
- O menu é reorganizado só para acrescentar Catálogo e Conceitos. A troca do `LabPremio` nas páginas da trilha pelos módulos novos é opcional, feita página a página e com o mesmo conteúdo.

### 5.8 Estruturas relativas ao preço e dados de mercado (decidido pelo dono)
- As estruturas passam a ser guardadas **relativas ao preço do ativo e à grade**, por exemplo "vende CALL 1 strike acima do ATM, no 1º vencimento mensal". Elas são **remontadas a cada grade nova**, e o gráfico de cada estrutura **abre com os preços reais da grade mais recente**. A montagem congelada de 02/10 deixa de ser a referência.
- Os textos editoriais e os POPs **não citam valores fixos**. Quando precisarem de um número, ele é inserido automaticamente a partir da montagem atual. A migração inclui reescrever esses trechos. O Claude rascunha e o dono revisa.
- **Fonte inicial:** a **planilha completa do opcoes.net.br de BBAS3**, com todas as séries, fornecida pelo dono. Outros papéis entram depois.
- Cada grade recebida fica **guardada no repositório por data**, formando o histórico para as jornadas com prêmios reais no futuro.
- O script de ingestão substitui o `atualizar_mercado.py` atual. Os strikes e vencimentos reais da grade alimentam as operações de manejo ("+N strikes", "próximo vencimento").

### 6.1 Decisões do Claude depois da revisão
- **Publicação:** o trabalho acontece num branch, e o Cloudflare Pages gera automaticamente uma prévia por branch, que o dono usa para aprovar. O **visual novo vai ao ar sozinho**, antes das outras etapas, e restiliza também as páginas antigas (laboratório, estratégias, calculadora) para o site nunca ficar com dois visuais. As etapas seguintes vão para a `main` uma de cada vez, depois de aprovadas.
- **Filtros do catálogo:** o Claude rascunha `visão`, `nível` e `objetivo` das 62 estruturas a partir do racional e do POP, e o dono revisa. Os 6 cards "em breve" de `/estrategias` correspondem a estruturas que já existem no Laboratório (compra de call, put de proteção, travas, collar, borboleta), então viram essas estruturas, e os placeholders são removidos.
- **Conteúdo inicial do manejo:** a etapa 4 entrega o motor, o modo livre e a calculadora migrada, além de **cenários e caminhos rascunhados pelo Claude** para 3 estruturas (venda coberta, venda de put coberta e um Booster). Esses rascunhos partem do parágrafo de manejo atual e servem para validar o vocabulário de operações. Eles **só vão ao ar depois que o dono revisar**.
- **Trajetórias da jornada:** cada papel usa só o próprio histórico de preços. Não se reaproveita a trajetória de outro papel.

## 7. Restrições

- O site deve continuar **estático** no Cloudflare Pages gratuito, sem servidor e sem banco de dados.
- **Todo push na `main` publica o site.** O trabalho deve acontecer em um branch e só ir para a `main` com aprovação do dono.
- Tudo em **português do Brasil**: B3, códigos de opção da B3, vencimentos e formatação de números `1.234,56`.
- Os **avisos legais** ("conteúdo educacional, não é recomendação") continuam em todas as páginas de estrutura e de simulação.
- **Desempenho:** as páginas devem continuar leves. A interatividade só carrega nas ilhas que precisam dela.
- **Acessibilidade:** os controles precisam funcionar pelo teclado. As cores de lucro e prejuízo nunca são a única pista: sinal +/− e rótulos acompanham as cores.

## 8. O que fica para quem for construir

- O formato exato dos arquivos de conteúdo, respeitando 5.7, e o script de migração de `estruturas.json` e `pops.json`.
- O desenho do vocabulário de operações de manejo (5.5).
- Como modelar estruturas de vários vencimentos na curva "hoje" e no eixo do tempo da simulação.
- Os detalhes de Black-Scholes: dias úteis ou corridos, taxa de juros (o site usa a Selic na calculadora prevista) e dividendos.
- A biblioteca de componentes visuais e os ajustes finos do tema.
- A estratégia de testes do motor de cálculo. É recomendável testar com valores conhecidos de Black-Scholes e com as 62 estruturas atuais como casos de regressão.
