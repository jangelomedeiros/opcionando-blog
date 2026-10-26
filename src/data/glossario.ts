// Glossário do Opcionando.
// Para adicionar um termo: copie um bloco { ... } e edite. A ordem alfabética é automática.
// "link" é opcional: aponta para o conteúdo completo sobre o termo.

export interface Termo {
  termo: string;
  definicao: string;
  exemplo?: string;
  sinonimos?: string[];
  link?: string;
}

export const GLOSSARIO: Termo[] = [
  {
    termo: 'Ativo-objeto',
    definicao: 'O ativo ao qual a opção dá direito de comprar ou vender. Nas opções de ações, é a própria ação.',
    exemplo: 'Numa opção de PETR4, o ativo-objeto é a ação PETR4.',
    sinonimos: ['ação-objeto', 'subjacente'],
  },
  {
    termo: 'ATM (no dinheiro)',
    definicao: 'Opção cujo strike está igual ou muito próximo do preço atual da ação.',
    exemplo: 'Ação a R$ 40,00 e strike de R$ 40,00: a opção está ATM.',
    sinonimos: ['at the money'],
  },
  {
    termo: 'Call',
    definicao: 'Opção de compra. Dá ao titular o direito de comprar a ação pelo strike até o vencimento; o lançador assume a obrigação de vender, se for exercido.',
    link: '/trilha/o-que-e-uma-opcao/',
    sinonimos: ['opção de compra'],
  },
  {
    termo: 'Código da opção',
    definicao: 'Identificação da opção na bolsa: as 4 letras da ação + uma letra que indica tipo e mês de vencimento + um número da série. As letras A a L são calls (janeiro a dezembro) e M a X são puts (janeiro a dezembro).',
    exemplo: 'Uma opção de VALE3 com a letra K é uma call com vencimento em novembro; com a letra W, uma put de novembro.',
  },
  {
    termo: 'Delta',
    definicao: 'Quanto o prêmio da opção tende a variar quando a ação sobe R$ 1,00. Vai de 0 a 1 nas calls e de 0 a −1 nas puts.',
    exemplo: 'Call com delta 0,50: se a ação sobe R$ 1,00, o prêmio tende a subir cerca de R$ 0,50.',
  },
  {
    termo: 'Exercício',
    definicao: 'Quando o titular usa o direito da opção: compra a ação pelo strike (call) ou vende a ação pelo strike (put).',
  },
  {
    termo: 'Gama',
    definicao: 'Quanto o delta muda quando a ação anda R$ 1,00. É a "aceleração" da opção, maior nas opções no dinheiro e perto do vencimento.',
  },
  {
    termo: 'Gregas',
    definicao: 'Medidas de sensibilidade do prêmio: delta (preço da ação), gama (variação do delta), theta (passagem do tempo), vega (volatilidade) e rô (juros).',
  },
  {
    termo: 'ITM (dentro do dinheiro)',
    definicao: 'Opção que já tem valor intrínseco: call com strike abaixo do preço da ação, ou put com strike acima.',
    exemplo: 'Ação a R$ 40,00: a call de strike R$ 37,00 está ITM.',
    sinonimos: ['in the money'],
  },
  {
    termo: 'Lançador',
    definicao: 'Quem vende a opção. Recebe o prêmio e assume a obrigação de vender (call) ou comprar (put) a ação pelo strike, se for exercido.',
    sinonimos: ['vendedor'],
    link: '/trilha/o-que-e-uma-opcao/',
  },
  {
    termo: 'Lançamento coberto',
    definicao: 'Venda de call por quem já tem as ações em carteira. Se for exercido, entrega as próprias ações.',
    link: '/estrategias/venda-coberta/',
    sinonimos: ['venda coberta', 'covered call'],
  },
  {
    termo: 'Lançamento descoberto',
    definicao: 'Venda de call sem ter as ações. O risco é muito alto: se a ação disparar, a perda cresce sem limite definido. Exige margem de garantia.',
  },
  {
    termo: 'Lote',
    definicao: 'Quantidade padrão de negociação. No mercado de opções de ações, o lote padrão é de 100 opções.',
  },
  {
    termo: 'Margem',
    definicao: 'Garantia exigida pela bolsa de quem assume obrigações, como o lançador descoberto. Pode ser em dinheiro, ações ou títulos.',
    sinonimos: ['garantia'],
  },
  {
    termo: 'Opção americana',
    definicao: 'Opção que pode ser exercida a qualquer momento até o vencimento. No Brasil, a maioria das calls de ações é americana.',
  },
  {
    termo: 'Opção europeia',
    definicao: 'Opção que só pode ser exercida na data de vencimento. No Brasil, a maioria das puts de ações é europeia.',
  },
  {
    termo: 'OTM (fora do dinheiro)',
    definicao: 'Opção sem valor intrínseco: call com strike acima do preço da ação, ou put com strike abaixo. O prêmio é todo valor extrínseco.',
    exemplo: 'Ação a R$ 40,00: a call de strike R$ 43,00 está OTM.',
    sinonimos: ['out of the money'],
  },
  {
    termo: 'Payoff',
    definicao: 'O resultado de uma operação em cada preço possível da ação no vencimento, geralmente mostrado em gráfico.',
    link: '/ferramentas/calculadora-de-payoff',
  },
  {
    termo: 'Ponto de equilíbrio',
    definicao: 'Preço da ação no vencimento em que a operação não ganha nem perde.',
    exemplo: 'Call comprada com strike R$ 40,00 e prêmio R$ 0,80: o ponto de equilíbrio é R$ 40,80.',
    sinonimos: ['breakeven'],
  },
  {
    termo: 'Prêmio',
    definicao: 'O preço da opção. É pago pelo titular e recebido pelo lançador. Soma o valor intrínseco e o valor extrínseco.',
  },
  {
    termo: 'Put',
    definicao: 'Opção de venda. Dá ao titular o direito de vender a ação pelo strike; o lançador assume a obrigação de comprar, se for exercido.',
    link: '/trilha/o-que-e-uma-opcao/',
    sinonimos: ['opção de venda'],
  },
  {
    termo: 'Rolagem',
    definicao: 'Encerrar uma posição em opções e abrir outra parecida, com outro strike ou outro vencimento, para estender ou ajustar a operação.',
  },
  {
    termo: 'Strike',
    definicao: 'O preço combinado pelo qual a ação pode ser comprada (call) ou vendida (put) no exercício.',
    sinonimos: ['preço de exercício'],
  },
  {
    termo: 'Theta',
    definicao: 'Quanto o prêmio perde por dia só pela passagem do tempo, com tudo o mais constante. Joga contra o titular e a favor do lançador.',
  },
  {
    termo: 'Titular',
    definicao: 'Quem compra a opção. Paga o prêmio e ganha um direito, sem obrigação. A perda máxima é o prêmio pago.',
    sinonimos: ['comprador'],
    link: '/trilha/o-que-e-uma-opcao/',
  },
  {
    termo: 'Trava',
    definicao: 'Estrutura que combina compra e venda de opções do mesmo tipo, com strikes diferentes, para limitar ganho e perda.',
  },
  {
    termo: 'Valor extrínseco',
    definicao: 'A parte do prêmio que não é valor intrínseco. Representa tempo e incerteza, e chega a zero no vencimento.',
    sinonimos: ['valor tempo'],
  },
  {
    termo: 'Valor intrínseco',
    definicao: 'Quanto a opção valeria se fosse exercida agora. Call: ação menos strike. Put: strike menos ação. Nunca é negativo.',
    exemplo: 'Ação a R$ 42,00 e call de strike R$ 40,00: valor intrínseco de R$ 2,00.',
  },
  {
    termo: 'Vega',
    definicao: 'Quanto o prêmio varia quando a volatilidade implícita sobe 1 ponto percentual.',
  },
  {
    termo: 'Vencimento',
    definicao: 'Data em que a opção deixa de existir. Na B3, as opções de ações vencem na terceira sexta-feira do mês de vencimento.',
  },
  {
    termo: 'Virar pó',
    definicao: 'Gíria para a opção que vence fora do dinheiro e passa a valer zero. Bom para o lançador, ruim para o titular.',
  },
  {
    termo: 'Volatilidade histórica',
    definicao: 'Quanto a ação de fato oscilou no passado, calculado a partir das cotações.',
  },
  {
    termo: 'Volatilidade implícita',
    definicao: 'A volatilidade que o mercado está "embutindo" no prêmio. Prêmio caro = volatilidade implícita alta.',
  },
];
