# Protocolo de manejo do Prof. Su: simulador, página e cenários (plano de implementação)

> **Para agentes:** SUB-SKILL OBRIGATÓRIA: use superpowers:executing-plans. Os passos usam checkbox (`- [ ]`).

**Objetivo:** levar ao site a metodologia de manejo do Prof. Su (Teoria da Binarização e Maximização das Estruturas Híbridas), passada pelo dono:
- os **3 pilares** (delta, theta, exposição e margem);
- as **regras de disciplina:** redução de 10%, regra dos R$ 0,20, condensação em 2 strikes e nada de hedge colateral;
- o **calendário do efeito hole:** mais de 22 du, de 22 a 12, de 12 a 6 e menos de 6;
- os **POPs das Mônadas** (Mannerheim, Quatermine V1/V2, Hexabox, Básica, Anakha), dos **Módulos B1, B2 e B3**, da **THL** e do **Straddle com PUT longa**.

**Decisões** (recomendações do Claude; o dono não respondeu e pode corrigir):
1. **A metodologia prevalece sobre os rascunhos do Claude.** Saem os caminhos de hedge colateral (PUT comprada no mesmo vencimento). Os textos dos POPs do dono **não são alterados**; os conflitos vão para o relatório.
2. **A fonte desses cenários é "Metodologia do Prof. Su".**

**Branch:** `protocolo-prof-su`, a partir de `acabamento`.

## Restrições globais

- O texto não prescreve: os pilares e as regras aparecem como critérios de verificação.
- O veredito dos pilares só compara números do motor:
  - **delta:** o módulo do delta diminui;
  - **theta:** o theta aumenta (mais decaimento a favor);
  - **exposição:** a soma de |q| das opções vendidas diminui.
- Todo caminho simulável tem de aplicar com a grade que a página usa. O teste permanente já existe.

## Foco de revisão

1. **Hedge colateral:** nenhum caminho adiciona PUT comprada com `vencDe`, ou seja, no mesmo vencimento de uma perna.
2. **B1:** nenhum caminho rola ("Não rolar o Módulo B1!").
3. **Regra dos R$ 0,20:** só vale para opções **vendidas**, com valor > 0 e ≤ 0,20 no cenário.
4. **Calendário:** os limites são 22, 12 e 6 du. Valores exatos caem na janela de cima (22 = "de 22 a 12").

---

### Task 1: Lógica do protocolo e "PUT mais longa"

**Arquivos:**
- Criar: `src/lib/catalogo/protocolo.ts`, `tests/protocolo.test.mjs`
- Modificar: `src/lib/motor/manejo.ts` (`vencIndice` negativo conta a partir do fim: −1 é o mais longo)

**Interfaces:**
```ts
avaliarPilares(antes: Posicao, depois: Posicao, c: Cenario): { delta: Comp; theta: Comp; exposicao: Comp; atende: boolean }   // Comp = { antes: number; depois: number; melhorou: boolean }
exposicaoVendida(p: Posicao): number                  // Σ |q| das opções vendidas
pernasRegra020(p: Posicao, c: Cenario): string[]      // ids das opções vendidas com 0 < valor ≤ 0,20
janelaHole(du: number): { id: 'montagem' | 'manutencao' | 'travas' | 'final'; nome: string; texto: string }
```

- [ ] **Testes:**
  - os pilares de uma redução de 10% da perna vendida mostram que a exposição melhorou;
  - encerrar uma CALL vendida que está no dinheiro melhora o delta;
  - um ajuste neutro (aumentar uma perna comprada longe) dá `atende === false` quando nenhum dos três melhora;
  - a regra dos R$ 0,20 aponta só as vendidas baratas;
  - `janelaHole` com 30, 22, 15, 12, 8, 6 e 3 dá a janela certa;
  - `adicionar` com `vencIndice: -1` usa o último vencimento da grade.
- [ ] RED → implementar → GREEN → commit.

### Task 2: Simulador e página do protocolo

**Arquivos:**
- Modificar: `src/components/catalogo/GraficoEstrutura.tsx`, `src/pages/estrategias/[id].astro`, `src/styles/catalogo.css`
- Criar: `src/pages/estrategias/protocolo-de-manejo.astro`, `tests/protocolo-html.test.mjs`

**Na ilha:**
- depois de cada ajuste, um bloco **"Pilares do manejo"** mostra delta, theta e lotes vendidos antes e depois, com ✓ ou ✗ e o veredito ("atende ao pilar…" ou "não melhora nenhum pilar");
- um alerta **"Regra dos R$ 0,20"**, com botão para recomprar as pernas apontadas;
- uma linha **"Calendário"** com a janela do efeito hole dos du que faltam.

**Página `/estrategias/protocolo-de-manejo/`:** pilares, regras, calendário e créditos ao Prof. Su. A aba Manejo de toda estrutura leva para ela.

- [ ] **Testes (HTML):**
  - a página existe e cita o Prof. Su, os 3 pilares e as 4 janelas;
  - a aba Manejo de `covered-call` tem o link para ela.
- [ ] **Verificação no navegador:**
  - aplicar um caminho mostra os pilares;
  - aparece o alerta dos R$ 0,20;
  - aparece a janela do calendário.
- [ ] Commit.

### Task 3: Cenários das estruturas da metodologia e ajuste dos rascunhos

**Arquivos:**
- Modificar: `src/data/laboratorio/manejo.json` e `docs/revisao/2026-11-15-textos-e-rotulos.md` (seção 3: conflitos POP × metodologia)
- Criar: `tests/manejo-metodologia.test.mjs`

**Cenários novos**, com `fonte: "Metodologia do Prof. Su"` e `revisado: false`:
- mannerheim, quatermine-v1, quatermine-v2, hexabox, monada-basica-call, monada-basica-put e anakha;
- b1, b2, b3-2x3 e b3-3x4;
- thl-call, thl-put, thl-perene e clade;
- straddle-long-put e straddle-perene.

**Ajustes nos rascunhos:**
- **covered-call:** sai "Comprar PUT de proteção";
- **straddle-venda:** a PUT de proteção passa a ser longa (`vencIndice: -1`);
- **b2 e straddle-long-put:** ganham o caminho "Rolar com redução de 10%".

- [ ] **Testes:**
  - as 17 estruturas têm fonte "Prof. Su";
  - nenhum caminho de b1 rola;
  - nenhum caminho adiciona PUT comprada com `vencDe`;
  - b2 tem um caminho com `quantidade` (redução de 10%) seguido de rolagem;
  - o teste permanente (todo caminho aplica com a grade da página) continua passando.
- [ ] RED → implementar → GREEN → commit → push.
