# "Hoje no mercado" e pipeline de nova grade (design curto)

Data: 16/11/2026. O autor escolheu as melhorias 1 e 3 propostas depois da otimização das montagens (PR #6), no mesmo branch.

## Intenção

Levar a "visão de contexto" ao nível do site (hoje ela só existe dentro de cada estrutura) e reduzir a atualização a cada pregão a um comando.

## Parte 1 — Painel "Hoje no mercado" e vereditos no catálogo

- Página `/estrategias/hoje/` (`src/pages/estrategias/hoje.astro`), a partir de `validacao.json`:
  - cabeçalho do mercado: ativo, preço, data da grade, médias de 20/50/200 e tendência, vol realizada (com e sem gaps) × implícita ATM (mínima e máxima), conclusão (vende/compra vol), janela do efeito hole do 1º vencimento mensal;
  - as 62 agrupadas por veredito (montar → com ressalva → não montar), cada uma com montagem resumida, crédito/débito, VE, probabilidade, pior caso e avisos, com link para a página;
  - a mesma nota de método da caixa "Validação do operador".
- Catálogo (`/estrategias/`): selo do veredito em cada cartão (substitui o selo "com preços reais", que agora é sempre verdadeiro), filtro "Hoje" (todos / montar / com ressalva / não montar) combinado com os filtros existentes, e link para o painel.
- Caixa "Validação do operador" ganha o link para o painel.
- Frases do cabeçalho do mercado em `src/lib/otimizacao/validacao.ts` (puras, testadas).

## Parte 3 — Pipeline de nova grade

- `scripts/atualizar_candles.mjs OHLCV.json SAIDA.json`: converte o OHLCV diário do TradingView (formato de linhas `{t,o,h,l,c,v}` ou colunas) no formato dos candles do site (`{d,o,h,l,c,v em milhões, m20, m50, m200}`), últimos 123 pregões, médias simples do fechamento. Só biblioteca padrão.
- `scripts/nova_grade.mjs PLANILHA.xlsx OHLCV.json`: roda, nesta ordem, `importar_grade.py` → `atualizar_candles.mjs` → `otimizar_montagens.mjs` → `astro build` → `node --test`, e para no primeiro erro. A data vem da grade importada.
- A grade e o candles em uso pelo site passam a ser referenciados por um único arquivo `src/data/laboratorio/fontes.json` (`{ grade, candles }`), lido pela página, pelos testes e pelo pipeline, para que uma nova data não exija editar imports.
- Os candles de BBAS3 são atualizados até 13/11 (OHLCV baixado pelo conector TradingView e guardado em `dados-brutos/2026-11-13/ohlcv/BBAS3.json`).

## Não objetivos

Buscar a planilha da grade automaticamente (continua manual, do opcoes.net.br); book de ofertas.

## Testes

- Frases do cabeçalho (puras); página gerada tem os três grupos e a contagem bate com `validacao.json`; catálogo tem o selo e o filtro; `atualizar_candles` reproduz m20/m50/m200 do candles existente para datas em comum; `fontes.json` aponta para arquivos que existem e têm a mesma data.
