# Etapa 5b: módulos complementares de conceitos (plano de implementação)

> **Para agentes:** SUB-SKILL OBRIGATÓRIA: use superpowers:subagent-driven-development (recomendado) ou superpowers:executing-plans para executar este plano tarefa por tarefa. Os passos usam checkbox (`- [ ]`).

**Objetivo:** criar os seis módulos complementares da spec 5.6, cada um com a sua página em `/conceitos/<slug>/`:

| Slug | Módulo | O que mostra |
|---|---|---|
| `anatomia-do-premio` | Anatomia do prêmio | O preço do ativo move e o prêmio se divide em intrínseco e extrínseco |
| `premio-e-prazo` | O prêmio enquanto o preço anda e o tempo passa | Curvas do prêmio para 60, 30, 10 e 0 dias, com ▶ que anima o tempo |
| `gregas-ao-longo-do-preco` | As gregas ao longo do preço | Δ, Γ, Θ e Vega contra o preço, com controle de dias |
| `gregas-no-tempo` | As gregas no tempo | Delta de uma opção ITM, ATM e OTM até o vencimento |
| `volatilidade` | Volatilidade | O prêmio contra a vol e a queda da vol depois de um evento |
| `probabilidade` | Probabilidade | Distribuição de preços desenhada sobre o payoff, com a probabilidade de lucro |

Todos partem da **mesma opção real** usada na Jornada: CALL ou PUT ATM de 18/12/2026, da grade de 13/11.

**Arquitetura:**
- **Lógica pura e testada** em `src/lib/conceitos/modulos.ts`, sobre o motor.
- **Uma ilha Preact** `src/components/conceitos/Modulo.tsx` com a prop `modulo`, reaproveitando um gráfico de linhas em SVG (`LinhasSvg`).
- Páginas estáticas com `<noscript>` explicativo. O índice `/conceitos/` lista os sete módulos.

**Spec:** 5.6. **Branch:** `modulos-conceitos`, a partir de `jornada-premio`.

## Restrições globais

- Só o motor da etapa 2 (Black-Scholes, Selic de 15% a.a. e dias úteis/252). Nenhuma dependência nova.
- Tokens de tema.
- **Linguagem prática:** cada módulo tem uma frase "Na prática" curta, sem prescrever.
- **Gregas nas unidades do motor:** theta por dia útil e vega por 1 p.p.
- **A probabilidade usa a distribuição lognormal neutra ao risco** (a mesma do Black-Scholes). A página diz que é a probabilidade **do modelo**, e não uma previsão.

## Foco de revisão

1. **Dias = 0:** as curvas viram o payoff e nenhuma grega dá `NaN`.
2. **Vol mínima e máxima dos controles** (5% e 120%): sem `NaN` nem `Infinity`.
3. **Densidade:** integra cerca de 1 na faixa exibida. A probabilidade de lucro de uma CALL comprada bate com a forma fechada `N(d2)` calculada no ponto de equilíbrio.
4. **PUT:** os sinais de delta e de vega e a anatomia (intrínseco quando S < K) estão corretos.
5. **Sem JavaScript:** cada página explica o conceito em texto.

---

### Task 1: Lógica dos módulos

**Arquivos:** criar `src/lib/conceitos/modulos.ts` e `tests/modulos.test.mjs`.

**Interfaces** (`tipo: 'call' | 'put'`, T em anos):
```ts
faixa(spot: number, n = 121): number[]                                       // 0,6×spot a 1,4×spot
anatomia(tipo, K, xs, T, vol): { valor: number; intrinseco: number; extrinseco: number }[]
curvasPorPrazo(tipo, K, xs, prazosDu: number[], vol): number[][]            // uma curva por prazo (du)
gregasAoLongo(tipo, K, xs, T, vol): { delta: number; gama: number; theta: number; vega: number }[]
deltaNoTempo(tipo, K, spots: number[], duMax: number, vol): number[][]      // para cada spot, delta de duMax até 0 du
premioPorVol(tipo, S, K, T, vols: number[]): number[]
quedaDeVol(tipo, S, K, T, volAntes, volDepois): { antes: number; depois: number; perda: number }
densidade(S, xs, T, vol, r = SELIC_PADRAO): number[]                        // lognormal neutra ao risco
probLucro(xs: number[], ys: number[], dens: number[]): number               // ∫ dens onde ys > 0 (trapézios)
```

- [ ] **Passo 1: Escrever o teste que falha** em `tests/modulos.test.mjs`:
  - **anatomia:** `valor = intrínseco + extrínseco` (1e-12). O extrínseco tem o máximo perto do strike (distância ≤ 1 passo da faixa). Na PUT, o intrínseco é > 0 só para S < K;
  - **curvasPorPrazo:** a curva de 0 du é igual ao intrínseco, e as curvas são ordenadas (60 ≥ 30 ≥ 10 ≥ 0) ponto a ponto, para a CALL;
  - **gregasAoLongo:** delta da CALL em [0, 1] e da PUT em [−1, 0]; gama ≥ 0, com o pico a até 2 passos do strike; o pico do gama com 3 du é maior que com 30 du; vega ≥ 0; com T = 0, tudo é finito;
  - **deltaNoTempo:** a ITM tende a 1, a OTM tende a 0 e a ATM fica perto de 0,5 longe do vencimento ([0,45; 0,65] com 60 du);
  - **premioPorVol:** cresce com a vol; com 5% e 120%, finito;
  - **quedaDeVol:** de 60% para 35%, `perda > 0` e `antes > depois`;
  - **densidade:** a integral por trapézio numa faixa de 0,3× a 2× o spot fica em [0,98; 1,0001];
  - **probLucro:** para uma CALL comprada (payoff no vencimento menos o prêmio), fica a menos de 0,01 de `N(d2)` com `K' = K + prêmio`. Para uma CALL vendida, é igual a `1 − p` (± 0,01).

- [ ] **Passo 2: Rodar.** Esperado: FALHA. **Passo 3: Implementar.** **Passo 4: Rodar.** Esperado: PASSA. **Passo 5: Commit.**

### Task 2: Ilha, páginas e índice

**Arquivos:**
- Criar: `src/components/conceitos/Modulo.tsx`, `src/pages/conceitos/[modulo].astro`, `tests/modulos-html.test.mjs`
- Modificar: `src/pages/conceitos/index.astro`, `src/styles/conceitos.css`

**Interfaces:**
- `[modulo].astro` usa `getStaticPaths` com os seis slugs da tabela. Para cada um: título, introdução, "Na prática", `<Modulo client:only="preact" modulo={slug} dados={{ call, put }}>` e `<noscript>` com a explicação.
- **A ilha tem:**
  - um seletor CALL/PUT;
  - **controles por módulo:**
    - preço: anatomia e gregas;
    - dias: gregas ao longo do preço, de 0 ao prazo da opção;
    - vol: de 5% a 120%;
    - ▶: anima o tempo em `premio-e-prazo`;
    - vol antes e depois: volatilidade;
    - posição comprada ou vendida: probabilidade;
  - **um ou mais gráficos de linhas**, com legenda e rótulos;
  - **números do ponto escolhido** em `aria-live`.
- O índice `/conceitos/` mostra a Jornada mais os seis módulos (some o card "Em breve").

- [ ] **Passo 1: Escrever o teste que falha** em `tests/modulos-html.test.mjs`:
  - as 6 páginas existem, cada uma com `astro-island` e `<noscript>`;
  - o índice tem 7 links `/conceitos/…/` e não tem mais "Em breve".

- [ ] **Passo 2: Rodar.** Esperado: FALHA. **Passo 3: Implementar. Passo 4: Rodar.** Esperado: PASSA.

- [ ] **Passo 5: Verificar com Chrome headless:** cada módulo renderiza sem `NaN`, e os controles mudam os números. Probabilidade: comprada + vendida = 100%. Nada rola na horizontal a 360 px.

- [ ] **Passo 6: Commit.**
