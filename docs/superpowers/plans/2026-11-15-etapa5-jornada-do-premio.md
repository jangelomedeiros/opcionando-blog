# Etapa 5: laboratório de conceitos, a Jornada do prêmio (plano de implementação)

> **Para agentes:** SUB-SKILL OBRIGATÓRIA: use superpowers:subagent-driven-development (recomendado) ou superpowers:executing-plans para executar este plano tarefa por tarefa. Os passos usam checkbox (`- [ ]`).

**Objetivo:** criar `/conceitos/` e o módulo central `/conceitos/jornada-do-premio/` (spec 5.6). Ele mostra uma opção real de BBAS3 (grade de 13/11) **pelos dois lados**:
- o comprador pagou o prêmio e tem um direito;
- o vendedor recebeu o prêmio e tem uma obrigação.

O tempo corre dia a dia, com ▶ ou arrastando a barra, sobre trajetórias **reais** (trechos do histórico do próprio papel) ou **cenários prontos**. A página mostra:
- o resultado de cada lado, espelhado;
- "de onde veio o resultado" (preço, tempo e vol);
- o valor da opção dividido em intrínseco e extrínseco, contra o prêmio de entrada;
- uma frase simples comentando o momento.

**Arquitetura:**
- **Lógica pura em `src/lib/conceitos/jornada.ts`:** trajetórias, cálculo da jornada com a decomposição exata, escolha da opção na grade e comentário. Testada com `node --test`.
- **Página Astro** com uma ilha Preact `Jornada.tsx` (`client:only`) e, sem JavaScript, um resumo estático.

**Spec:** `docs/superpowers/specs/2026-11-15-plataforma-estrategias-design.md` (5.6, 6 etapa 5)

**Branch:** `jornada-premio`, a partir de `simulador-manejo`.

## Restrições globais

- **A entrada usa preço real da grade de 13/11.** A opção é a CALL ou a PUT **ATM** do vencimento cujos dias úteis ficam mais perto de 23, ou seja, 18/12/2026. O prêmio é o último negócio de 13/11 ou, sem negócio, Black-Scholes com a vol da série. A vol de entrada é a implícita do motor sobre esse prêmio.
- **A evolução é calculada** por Black-Scholes, com o motor, sobre a trajetória. A vol de entrada fica constante, mais o choque escolhido pelo usuário.
- **Trajetórias reais vêm só do histórico de BBAS3** (`src/data/candles/bbas3-2026-11-12.json`), reescalado para começar no spot de 13/11. São escolhidas pelos dados, com o mesmo número de pregões da opção:
  - **maior alta**;
  - **maior queda**;
  - **mais lateral** (menor amplitude máxima/mínima);
  - **mais recente**.
- **Cenários prontos**, determinísticos e com o mesmo número de dias:
  - **alta lenta:** +8% linear;
  - **queda brusca:** −10% em 2 dias no 1º terço, depois estável;
  - **lateral:** oscilação de ±2% em torno do spot;
  - **gap depois do balanço:** estável e −9% de uma vez no meio do prazo.
- **A decomposição é exata e sequencial:** para cada dia, Δpreço com tempo e vol do dia anterior, depois Δtempo, depois Δvol. A soma das partes é igual à variação do valor da opção.
- **O resultado do vendedor é sempre o negativo do resultado do comprador.**
- **Linguagem simples, sem prescrever.** O comentário descreve o que aconteceu, por exemplo: "a ação subiu 4%, mas o tempo comeu R$ 0,19 do comprador".
- **A página `/conceitos/`** lista a Jornada e diz que os módulos complementares (gregas ao longo do preço, volatilidade, probabilidade) vêm depois. O menu ganha o item "Conceitos". Nenhum item atual sai.

## Foco de revisão

1. **Último dia (vencimento):** valor = intrínseco, extrínseco = 0, e a decomposição continua fechando. Teste na Tarefa 1.
2. **Trajetória histórica com menos pregões que a opção:** a escolha de trechos não lança erro e devolve só os trechos possíveis. Teste na Tarefa 1.
3. **PUT e CALL:** os sinais da contribuição do preço se invertem corretamente (quando o preço sobe, a PUT perde). Teste na Tarefa 1.
4. **Choque de vol na entrada:** com choque diferente de zero no dia 0, o resultado inicial é a contribuição da vol, e não zero. Ele é mostrado assim. Teste na Tarefa 1.
5. **Sem JavaScript:** a página mostra a opção escolhida, o prêmio e a explicação estática. Teste na Tarefa 2.

---

### Task 1: Lógica da jornada

**Arquivos:**
- Criar: `src/lib/conceitos/jornada.ts`, `tests/jornada.test.mjs`

**Interfaces:**
```ts
type TipoCenario = 'alta-lenta' | 'queda-brusca' | 'lateral' | 'gap-balanco';
interface Opcao { tipo: 'call' | 'put'; strike: number; venc: string; ticker: string; premio: number; vol: number; data: string; spot: number }
interface Dia { n: number; data: string; spot: number; du: number; valor: number; intrinseco: number; extrinseco: number;
  comprador: number; vendedor: number; contrib: { preco: number; tempo: number; vol: number } /* acumuladas, do ponto de vista do comprador */ }
interface Trecho { id: string; nome: string; precos: number[] }

opcaoDaGrade(grade: GradeJson, tipo: 'call' | 'put', alvoDu = 23): Opcao
trajetoriaCenario(tipo: TipoCenario, spot: number, dias: number): number[]      // dias + 1 preços; o primeiro = spot
trechosHistoricos(candles: { d: string; c: number }[], dias: number, spot: number): Trecho[]   // até 4: maior alta, maior queda, mais lateral, mais recente (sem repetir trecho); reescalados para começar em spot
jornada(op: Opcao, precos: number[], choqueVol = 0): Dia[]    // dia n usa a data somarDiasUteis(op.data, n); o último dia é o vencimento
comentario(op: Opcao, d: Dia): string
```

- [ ] **Passo 1: Criar o branch e escrever o teste que falha** em `tests/jornada.test.mjs`:
  - **opção da grade:** `opcaoDaGrade(grade, 'call')` tem `venc === '2026-12-18'`, strike ATM (o mais perto de 15,10 entre as calls desse vencimento) e `premio > 0`; `jornada(op, [spot])[0].valor ≈ premio` (1e-6);
  - **trajetórias de cenário:** cada uma tem `dias + 1` pontos e começa no spot. Alta lenta termina em +8% (±0,1%). Queda brusca tem mínimo ≤ −9%. Lateral fica dentro de ±2,5%. O gap tem um salto diário ≤ −8%;
  - **trechos históricos:** com os candles reais e 23 dias, há 4 trechos distintos, cada um com 24 preços começando em 15,10. O "maior alta" termina acima do "maior queda". Com 500 dias, devolve `[]`, sem erro (Foco 2);
  - **decomposição exata:** para toda trajetória de cenário, CALL e PUT, em todo dia, `contrib.preco + contrib.tempo + contrib.vol ≈ valor − premio` (1e-9) e `vendedor === −comprador`;
  - **vencimento:** no último dia, `extrinseco ≈ 0` e `valor ≈ intrínseco` (1e-9) (Foco 1);
  - **sinais:** em alta lenta, `contrib.preco` da CALL é > 0 e o da PUT é < 0; em lateral, `contrib.tempo` do comprador é < 0 nos dois casos (Foco 3);
  - **choque de vol no dia 0:** com `choqueVol = 5`, `dia[0].comprador ≈ dia[0].contrib.vol > 0` (Foco 4);
  - **comentário:** é uma string não vazia, sem `NaN`, que cita "tempo" quando `|contrib.tempo|` é a maior das três partes.

- [ ] **Passo 2: Rodar `npm test`.** Esperado: FALHA. **Passo 3: Implementar.** **Passo 4: Rodar `npm test`.** Esperado: PASSA. **Passo 5: Commit.**

### Task 2: Páginas /conceitos e Jornada, ilha e menu

**Arquivos:**
- Criar: `src/pages/conceitos/index.astro`, `src/pages/conceitos/jornada-do-premio.astro`, `src/components/conceitos/Jornada.tsx`, `src/styles/conceitos.css`, `tests/jornada-html.test.mjs`
- Modificar: `src/components/Header.astro` (item "Conceitos", depois de "Estratégias")

**Interfaces:**
- **A página monta no build:** a CALL e a PUT de `opcaoDaGrade`, as trajetórias de cenário e os trechos históricos (com os dias úteis da opção). Ela passa tudo para `<Jornada client:only="preact" dados={...}>`.
- **A ilha tem:**
  - um seletor CALL/PUT;
  - um seletor de trajetória (grupo "Trechos reais de BBAS3" e grupo "Cenários");
  - a barra de dias com o botão ▶/⏸ (avança um dia a cada 400 ms, para no vencimento);
  - o controle de vol de −15 a +15 p.p.;
  - um SVG do preço do ativo com a linha do strike e o marcador do dia;
  - dois cartões, "Comprador" e "Vendedor", cada um com o prêmio pago ou recebido, o resultado com sinal e cor e as três contribuições (preço, tempo, vol), com os sinais trocados;
  - um SVG do valor da opção ao longo dos dias, com as áreas de intrínseco e extrínseco e a linha tracejada do prêmio de entrada;
  - o comentário do dia em `aria-live`.
- **Sem JavaScript:** um `<noscript>` com a opção, o prêmio, o vencimento e um parágrafo explicando os dois lados.
- **`/conceitos/`:** cartões com a Jornada e uma nota sobre os próximos módulos.

- [ ] **Passo 1: Escrever o teste que falha** em `tests/jornada-html.test.mjs` (lê `dist`):
  - `dist/conceitos/index.html` tem link para `/conceitos/jornada-do-premio/`;
  - a página da Jornada tem `astro-island` e um `<noscript>` com o ticker da CALL de `opcaoDaGrade` e "Comprador" e "Vendedor";
  - o cabeçalho de `dist/index.html` tem `href="/conceitos"` e continua com os 10 itens anteriores.

- [ ] **Passo 2: Rodar.** Esperado: FALHA. **Passo 3: Implementar. Passo 4: Rodar.** Esperado: PASSA.

- [ ] **Passo 5: Verificar com Chrome headless:**
  - trocar de trajetória e mover a barra até o vencimento: os cartões mudam, comprador = −vendedor e não há `NaN`;
  - ▶ avança os dias;
  - não há rolagem horizontal a 360 px;
  - os temas claro e escuro ficam legíveis (captura de tela).

- [ ] **Passo 6: Commit.**
