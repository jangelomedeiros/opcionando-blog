// Mapa do que está planejado em cada seção.
// Quando um conteúdo for publicado, ele aparece com link automaticamente
// (desde que o "slug" aqui seja igual ao nome do arquivo .md).

export const TRILHA_PLANEJADA = [
  { modulo: 1, slug: 'o-que-e-uma-opcao', title: 'O que é uma opção' },
  { modulo: 2, slug: 'lendo-o-codigo-de-uma-opcao', title: 'Lendo o código de uma opção' },
  { modulo: 3, slug: 'valor-intrinseco-e-extrinseco', title: 'Valor intrínseco e valor extrínseco' },
  { modulo: 4, slug: 'itm-atm-otm', title: 'Dentro, no e fora do dinheiro (ITM, ATM, OTM)' },
  { modulo: 5, slug: 'delta', title: 'Delta: quanto a opção anda quando a ação anda' },
  { modulo: 6, slug: 'theta', title: 'Theta: o tempo come o prêmio' },
  { modulo: 7, slug: 'volatilidade-implicita-e-vega', title: 'Volatilidade implícita e vega' },
  { modulo: 8, slug: 'exercicio-e-vencimento', title: 'Exercício e vencimento na prática' },
  { modulo: 9, slug: 'gestao-de-risco', title: 'Gestão de risco e tamanho de posição' },
  { modulo: 10, slug: 'plano-operacional', title: 'Montando o seu plano operacional' },
];

export const ESTRATEGIAS_PLANEJADAS = [
  { slug: 'venda-coberta', title: 'Venda coberta de call' },
  { slug: 'venda-de-put-coberta', title: 'Venda de put coberta' },
  { slug: 'compra-de-call', title: 'Compra de call' },
  { slug: 'put-de-protecao', title: 'Put de proteção' },
  { slug: 'trava-de-alta-com-call', title: 'Trava de alta com call' },
  { slug: 'trava-de-baixa-com-put', title: 'Trava de baixa com put' },
  { slug: 'collar', title: 'Collar (financiamento com proteção)' },
  { slug: 'borboleta', title: 'Borboleta' },
];

export const ESTUDOS_PLANEJADOS = [
  {
    title: 'Venda de calls ITM: com que frequência elas viram pó?',
    resumo: 'Estudo com dados históricos de cadeias de opções de VALE3 e PETR4, em expansão para BBAS3, BBDC4 e ITUB4.',
  },
  {
    title: 'Volatilidade implícita x volatilidade realizada',
    resumo: 'Quando o prêmio está caro ou barato de verdade, medido com dados do mercado brasileiro.',
  },
];

export const FERRAMENTAS = [
  {
    slug: 'calculadora-de-payoff',
    title: 'Calculadora de payoff',
    resumo: 'Monte qualquer estrutura com até 4 pernas e veja o gráfico de lucro e prejuízo no vencimento, o ponto de equilíbrio e o risco máximo.',
    pronta: true,
  },
  {
    slug: 'black-scholes',
    title: 'Calculadora Black-Scholes e gregas',
    resumo: 'Preço teórico de calls e puts e as gregas (delta, gama, theta, vega) com a Selic como taxa livre de risco.',
    pronta: false,
  },
  {
    slug: 'simulador-de-cadeia',
    title: 'Simulador de cadeia de opções',
    resumo: 'Treine a leitura de uma grade de opções como a das plataformas de corretora, sem arriscar dinheiro.',
    pronta: false,
  },
];
