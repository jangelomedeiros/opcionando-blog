# Etapa 4: simulador de manejo no gráfico (plano de implementação)

> **Para agentes:** SUB-SKILL OBRIGATÓRIA: use superpowers:subagent-driven-development (recomendado) ou superpowers:executing-plans para executar este plano tarefa por tarefa. Os passos usam checkbox (`- [ ]`).

**Objetivo:** o operador posiciona o cenário (preço, dias, vol) e aplica um ajuste. O ajuste pode ser um **caminho pronto** da aba Manejo ou uma operação **livre** sobre uma perna. O gráfico mostra a **estrutura nova**, com as áreas de lucro e de prejuízo já incluindo o resultado realizado, e a **original apagada** por trás. Um resumo mostra crédito ou débito, novo ganho máximo, nova perda máxima e novos equilíbrios. Os ajustes se encadeiam e dá para desfazer (spec 5.5).

**Arquitetura:**
- **Os dados de manejo** ficam em `src/data/laboratorio/manejo.json`, por estrutura. Cada estrutura tem cenários, sinais e caminhos, e cada caminho tem as operações do motor (`Operacao[]` de `manejo.ts`). Há uma marca `revisado`.
- **A lógica fica em TypeScript puro e testado:**
  - `gradeManejo.ts` monta a grade de strikes e vencimentos;
  - `simulacao.ts` guarda o estado do histórico (aplicar, desfazer, voltar ao início) sobre `aplicarAjuste` e `reconstruir`.
- **A ilha do gráfico** ganha o modo de manejo:
  - ela escuta o evento `opcionando:manejo`, disparado pelos botões "Simular no gráfico" da aba Manejo, que é HTML estático;
  - ela também tem um editor livre por perna.

**Stack:** Astro 7, Preact (ilha existente), motor `src/lib/motor/`, `node --test`.

**Spec:** `docs/superpowers/specs/2026-11-15-plataforma-estrategias-design.md` (5.5, 6.1)

**Branch:** `simulador-manejo`, a partir de `grade-e-textos`.

## Restrições globais

- **"Uma trilha, não um trilho":** nenhum caminho vem marcado como o certo. Cada caminho tem `o que ganha`, `o que perde` e `quando faz sentido`, e cada cenário tem `o que pesa na escolha`.
- **Os rascunhos do Claude aparecem com uma faixa visível:** "Rascunho em revisão pelo autor (os caminhos ainda podem mudar)", sempre que `revisado: false`. O dono revisa na prévia antes de qualquer merge na `main` (spec 6.1).
- **Os rascunhos partem do texto do próprio POP do dono** (`pops.json`: manejo e saída). São só 3 estruturas: `covered-call`, `cash-put` e `booster-call`.
- **Caminho sem operações** (por exemplo, "deixar exercer" ou "fazer nada") é só texto, sem botão de simular.
- **O ajuste é aplicado no cenário que está nos controles:** a data dos dias, o preço e o choque de vol.
- **A estrutura original aparece sempre apagada** (`.g-comp`). A nova usa as cores de lucro e de prejuízo. A curva "hoje" passa a ser a da estrutura nova.
- **Nada no texto diz que um caminho é bom ou ruim.** O resumo mostra só números.

## Foco de revisão

1. **Caminho que não cabe na grade** (por exemplo, rolar +2 strikes já no strike mais alto): mensagem amigável na ilha, e a posição fica intacta. Teste na Tarefa 3, pelo estado.
2. **Ajuste no dia do vencimento** (dias = 0): a perna vencida é encerrada pelo intrínseco, e o vencimento seguinte é escolhido na grade. Teste na Tarefa 2.
3. **Estrutura que caiu na referência** (exemplo de 02/10, sem grade real): a grade sintética contém os strikes das pernas e vencimentos futuros. Teste na Tarefa 2.
4. **Encadear 3 ajustes e desfazer 2:** os números voltam exatamente ao estado depois do 1º. Teste na Tarefa 3.
5. **Sem JavaScript:** a aba Manejo mostra todos os cenários e caminhos como texto. Os botões ficam escondidos. Teste na Tarefa 4.

---

### Task 1: Dados de manejo e rascunhos das 3 estruturas

**Arquivos:**
- Criar: `src/data/laboratorio/manejo.json`, `tests/manejo-dados.test.mjs`

**Interfaces:**
- **Formato do arquivo:**
  ```ts
  type ManejoArquivo = Record<string /* id da estrutura */, {
    revisado: boolean; fonte: string;
    cenarios: { nome: string; sinais: string; pesa: string;
      caminhos: { nome: string; descricao: string; ganha: string; perde: string; quando: string; ops?: Operacao[]; estrutura?: string }[] }[] }>
  ```
  - `ops` usa os ids das pernas da posição: `p1`, `p2`… na ordem de `pernas`.
  - `estrutura` é um link opcional para outra estrutura do catálogo.
- **Rascunhos** (todos com `revisado: false` e `fonte: "Rascunho do Claude a partir do POP"`). Cada cenário tem de 2 a 3 caminhos:
  - **covered-call** (p1 ação, p2 call vendida):
    - **subiu e passou do strike:** "rolar para cima e para frente" (`rolarStrike p2 +2`, `rolarVencimento p2 +1`), "deixar exercer" (sem ops), "encerrar tudo" (`encerrar p2`, `encerrar p1`);
    - **caiu forte:** "rolar para baixo" (`rolarStrike p2 −2`), "comprar PUT de proteção" (`adicionar put q 1, strikePassos −1`), "esperar" (sem ops);
    - **lateral perto do vencimento:** "relançar no próximo vencimento" (`rolarVencimento p2 +1`), "deixar virar pó" (sem ops).
  - **cash-put** (p1 put vendida):
    - **caiu abaixo do strike:** "rolar para baixo e para frente" (`rolarStrike p1 −2`, `rolarVencimento p1 +1`), "aceitar o exercício" (`encerrar p1`, `adicionar acao q 1`; texto: "passa a lançar CALL coberta"), "encerrar com prejuízo" (`encerrar p1`);
    - **subiu:** "recomprar e embolsar" (`encerrar p1`), "rolar para cima" (`rolarStrike p1 +2`).
  - **booster-call** (p1 ação, p2 call comprada, p3 2 calls vendidas):
    - **subiu além do strike vendido:** "realizar no miolo" (`encerrar p2`, `encerrar p3`), "rolar as vendidas para cima" (`rolarStrike p3 +2`);
    - **caiu:** "rolar a trava para baixo" (`rolarStrike p2 −2`, `rolarStrike p3 −2`), "manter como peça da carteira" (sem ops).

- [ ] **Passo 1: Criar o branch e escrever o teste que falha** em `tests/manejo-dados.test.mjs`:
  - `test('manejo.json válido')`: ids existem em `estruturas.json`; cada caminho tem `nome`, `descricao`, `ganha`, `perde` e `quando` não vazios; `ops`, quando há, só usa os `op` conhecidos; `estrutura`, quando há, existe;
  - `test('caminhos com ops aplicam no cenário inicial sem erro e sem criar valor')`: para cada caminho com ops, `aplicarAjuste(posicao, ops, cenario, grade)` com `cenarioInicial` e a grade da Tarefa 2 (use `gradeParaManejo` quando existir; até lá, uma grade com os strikes das pernas ±5 passos de 0,25 e os vencimentos da grade de 13/11) não lança erro, e `resultado` antes e depois é igual (1e-9);
  - `test('rascunhos marcados')`: as 3 estruturas têm `revisado === false`.

- [ ] **Passo 2: Rodar `npm test`.** Esperado: FALHA.

- [ ] **Passo 3: Escrever `manejo.json`** com textos curtos em português, no tom do POP, sem prescrever.

- [ ] **Passo 4: Rodar `npm test`.** Esperado: PASSA.

- [ ] **Passo 5: Commit.** Mensagem: `"Manejo: dados e rascunhos de cenários para 3 estruturas"`.

### Task 2: Grade de manejo (real ou sintética)

**Arquivos:**
- Criar: `src/lib/catalogo/gradeManejo.ts`, `tests/grade-manejo.test.mjs`

**Interfaces:**
- `gradeParaManejo(posicao: Posicao, cenario: Cenario, grade: { vencimentos: Record<string, number>; series: { strike: number; venc: string }[] } | null): GradeRef`
  - **Com grade real:** `strikes` é a união dos strikes da grade com os das pernas; `vencimentos` são os da grade e os das pernas, todos `> cenario.data`, ordenados e sem repetição.
  - **Sem grade (referência):** `strikes` vai de 0,6× a 1,4× do spot, com passo `max(0,25; arred(spot × 1%, 0,05))`, mais os strikes das pernas. `vencimentos` são os das pernas mais as terceiras sextas-feiras dos 6 meses seguintes a `cenario.data`, ajustadas para o dia útil anterior se cair em feriado (use `ehDiaUtil`).
  - A saída é sempre ordenada e sem repetição, e inclui o vencimento de cada perna, mesmo que já tenha passado (para `rolarVencimento` achar o índice).

- [ ] **Passo 1: Escrever o teste que falha** em `tests/grade-manejo.test.mjs`:
  - a grade real de 13/11 com a montagem de covered-call contém o strike da call e 17 vencimentos;
  - a grade sintética da referência de covered-call (02/10, spot 23,72) contém 25,04, os strikes vão de cerca de 14,2 a 33,2 e ela tem pelo menos 6 vencimentos posteriores a 02/10, todos dias úteis;
  - **ajuste no dia do vencimento:** com o cenário na data do 1º vencimento, `rolarVencimento p2 +1` dá uma perna com vencimento posterior, e `resultado` antes e depois é igual.

- [ ] **Passo 2: Rodar.** Esperado: FALHA. **Passo 3: Implementar. Passo 4: Rodar.** Esperado: PASSA. **Passo 5: Commit.**

### Task 3: Estado da simulação e ilha com modo de manejo

**Arquivos:**
- Criar: `src/lib/catalogo/simulacao.ts`, `tests/simulacao.test.mjs`
- Modificar: `src/components/catalogo/GraficoEstrutura.tsx`, `src/styles/catalogo.css`, `src/pages/estrategias/[id].astro` (passa a grade e o manejo para a ilha)

**Interfaces:**
- `simulacao.ts`:
  ```ts
  interface Estado { inicial: Posicao; ajustes: Ajuste[]; posicao: Posicao; fluxos: number[]; erro: string | null }
  iniciar(p: Posicao): Estado
  aplicar(e: Estado, nome: string, ops: Operacao[], c: Cenario, g: GradeRef): Estado   // em erro: devolve e com `erro` preenchido e posição intacta
  desfazer(e: Estado, g: GradeRef): Estado   // reconstruir sem o último
  recomecar(e: Estado): Estado
  ```
- **Ilha:**
  - `dados` ganha `grade: GradeRef` e `rotulosPernas: string[]` (por exemplo, "CALL 15,95 · 18/12 · vendida").
  - Ela escuta `window.addEventListener('opcionando:manejo', ev => aplicar(ev.detail.nome, ev.detail.ops))`.
  - **Quando há ajustes:**
    - a estrutura original aparece apagada em `.g-comp`;
    - a nova vem colorida, com a curva "hoje" da nova;
    - o painel mostra "Ajustes: 1. <nome> (crédito/débito R$ x)…", com os botões "Desfazer último" e "Recomeçar".
  - **Modo livre:** uma lista das pernas atuais com os botões "Encerrar", "Strike −/+", "Vencimento +" e "Quantidade ×2 / ÷2", mais "Adicionar perna" (tipo, comprar ou vender, passos de strike).
  - Os erros aparecem em `role="alert"`.

- [ ] **Passo 1: Escrever o teste que falha** em `tests/simulacao.test.mjs`:
  - aplicar 3 ajustes e desfazer 2 dá `deepEqual` com o estado depois do 1º;
  - um ajuste fora da grade devolve `erro` e mantém a posição;
  - `recomecar` volta ao inicial.

- [ ] **Passo 2: Rodar.** Esperado: FALHA. **Passo 3: Implementar `simulacao.ts` e, depois, a ilha. Passo 4: Rodar.** Esperado: PASSA. **Passo 5: Commit.**

### Task 4: Aba Manejo com cenários e verificação no navegador

**Arquivos:**
- Modificar: `src/pages/estrategias/[id].astro` (aba Manejo), `src/styles/catalogo.css`
- Criar: `tests/manejo-html.test.mjs`

**Interfaces:**
- **Aba Manejo:**
  - se a estrutura tem dados em `manejo.json`: a faixa de rascunho (quando `revisado: false`) e, para cada cenário, `<h3>` + sinais + "O que pesa na escolha" + os caminhos;
  - **cada caminho** mostra nome, descrição, "Ganha", "Perde" e "Quando faz sentido", o link para a estrutura quando houver, e, se houver `ops`, o botão `<button class="simular" data-nome data-ops='JSON' hidden>Simular no gráfico</button>`. Um script pequeno tira o `hidden` e despacha o evento;
  - **depois dos cenários**, o texto atual do POP (manejo, saída e risco) continua aparecendo;
  - sem dados de manejo, a aba fica como hoje.

- [ ] **Passo 1: Escrever o teste que falha** em `tests/manejo-html.test.mjs`:
  - em `covered-call`: a faixa de rascunho, os 3 cenários, botões `class="simular"` com `data-ops` JSON válido e com `hidden` no HTML;
  - em `thl-call`: nenhum `class="simular"`.

- [ ] **Passo 2: Rodar.** Esperado: FALHA. **Passo 3: Implementar. Passo 4: Rodar.** Esperado: PASSA.

- [ ] **Passo 5: Verificar no navegador** com Chrome headless e um script:
  - em `covered-call`, mover o preço +10%, clicar "Simular no gráfico" do 1º caminho e conferir que o resumo aparece, a curva muda e o `.g-comp` existe;
  - clicar "Desfazer" e conferir que tudo volta;
  - aplicar uma operação livre;
  - conferir que nada rola na horizontal a 360 px.

- [ ] **Passo 6: Commit.**
