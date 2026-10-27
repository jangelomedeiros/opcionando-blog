import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Artigos (versão escrita dos vídeos, textos avulsos)
const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    // Pilar de conteúdo do canal (ex.: "Fundamentos", "Estratégias", "Decisão de Venda")
    pilar: z.string().optional(),
    tags: z.array(z.string()).default([]),
    // ID do vídeo do YouTube (a parte depois de v=) para embutir no topo do post
    youtube: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

// Trilha "Comece Aqui": módulos em ordem
const trilha = defineCollection({
  loader: glob({ base: './src/content/trilha', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    modulo: z.number(), // número do módulo na trilha (1, 2, 3...)
    objetivos: z.array(z.string()).default([]), // "Ao final deste módulo você vai..."
    youtube: z.string().optional(),
    updatedDate: z.coerce.date().optional(),
    draft: z.boolean().default(false),
  }),
});

// Seção "Ações": a base que sustenta as opções (fundamentos, preço justo, ciclos)
const acoes = defineCollection({
  loader: glob({ base: './src/content/acoes', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    ordem: z.number(), // posição na sequência da seção (1, 2, 3...)
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    youtube: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

// Fichas de estratégia: estrutura padronizada
const estrategias = defineCollection({
  loader: glob({ base: './src/content/estrategias', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    visao: z.enum(['Alta', 'Baixa', 'Lateral', 'Lateral para alta', 'Lateral para baixa', 'Volatilidade']),
    nivel: z.enum(['Iniciante', 'Intermediário', 'Avançado']),
    objetivo: z.string(), // ex.: "Renda", "Proteção", "Especulação"
    ganhoMaximo: z.string(),
    perdaMaxima: z.string(),
    breakeven: z.string(),
    montagem: z.array(z.string()), // pernas da estrutura
    preset: z.string().optional(), // id do preset na calculadora de payoff
    youtube: z.string().optional(),
    updatedDate: z.coerce.date().optional(),
    draft: z.boolean().default(false),
  }),
});

// Análises técnicas de ativos com a estrutura de opções que melhor se encaixa no cenário
const perna = z.object({
  tipo: z.enum(['call', 'put', 'acao']),
  op: z.enum(['compra', 'venda']),
  strike: z.number(), // strike da opção, ou preço da ação
  premio: z.number().default(0), // prêmio de referência (0 para ação)
  qtd: z.number().default(100),
  codigo: z.string().optional(), // ex.: VALEK620
});

const analises = defineCollection({
  loader: glob({ base: './src/content/analises', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    ticker: z.string(), // ex.: VALE3
    empresa: z.string(),
    title: z.string(),
    description: z.string(),
    data: z.coerce.date(), // data da análise
    precoReferencia: z.number(), // fechamento usado na análise
    cenario: z.enum(['Alta', 'Baixa', 'Lateral', 'Lateral para alta', 'Lateral para baixa', 'Indefinido']),
    timeframe: z.string().default('Diário'),
    suportes: z.array(z.number()).default([]),
    resistencias: z.array(z.number()).default([]),
    volatilidade: z.string().optional(), // ex.: 'IV 32% (percentil 70 em 1 ano)'
    grafico: z.string().optional(), // nome do arquivo em src/data/candles/ (sem .json)
    perfil: z.string().optional(), // nome do arquivo em src/data/perfil/ (Volume Profile, sem .json)
    // Range de negociação estabelecido (desenhado no gráfico e no perfil)
    range: z.object({ inferior: z.number(), superior: z.number(), rotulo: z.string().optional() }).optional(),
    // Painel de indicadores: leitura diária e semanal
    indicadores: z.array(z.object({
      nome: z.string(),
      diario: z.string(),
      semanal: z.string().optional(),
      sinal: z.enum(['alta', 'baixa', 'neutro']).default('neutro'),
      leitura: z.string(),
    })).default([]),
    // Relação preço × volume: pregões-chave
    eventos: z.array(z.object({
      data: z.string(),
      evento: z.string(),
      leitura: z.string(),
    })).default([]),
    // Mapa de níveis com confluências (do mais alto para o mais baixo)
    mapa: z.array(z.object({
      preco: z.string(),
      tipo: z.enum(['resistencia', 'suporte', 'pivo', 'vazio', 'preco']),
      confluencia: z.string(),
    })).default([]),
    // ---- Blocos do estudo completo (opcionais). Strings aceitam **negrito**.
    // Cartões de veredito no topo: preço-teto, zona de acumulação, range de 6 meses, viés
    veredito: z.array(z.object({
      rotulo: z.string(),
      valor: z.string(),
      texto: z.string(),
      destaque: z.boolean().default(false),
      tom: z.enum(['alta', 'baixa', 'neutro']).optional(),
    })).default([]),
    indicadoresNota: z.string().optional(), // parágrafo de leitura abaixo da tabela de indicadores
    fluxo: z.array(z.string()).default([]), // leitura de fluxo (preço × volume) em tópicos
    perfilFaixas: z.array(z.object({ faixa: z.string(), pct: z.number() })).default([]), // % do volume por faixa
    perfilNotas: z.array(z.string()).default([]), // leitura do Volume Profile em tópicos
    macro: z.object({
      titulo: z.string(),
      fonte: z.string().optional(),
      tabela: z.array(z.object({
        ativo: z.string(), ultimo: z.string(), dia: z.string().optional(),
        m1: z.string(), m3: z.string(), m6: z.string(), ano: z.string(),
        efeito: z.string(), destaque: z.boolean().default(false),
        inverte: z.boolean().default(false), // juros/câmbio: alta é ruim (cores invertidas)
      })),
      pontos: z.array(z.string()).default([]),
    }).optional(),
    micro: z.object({
      titulo: z.string(),
      fundamentos: z.array(z.object({ nome: z.string(), valor: z.string() })),
      sustentacao: z.array(z.string()).default([]),
      pressao: z.array(z.string()).default([]),
      evento: z.string().optional(),
    }).optional(),
    plano: z.object({
      titulo: z.string(),
      texto: z.string(),
      tranches: z.array(z.object({
        nome: z.string(), nota: z.string().optional(), entrada: z.string(), gatilho: z.string(),
        stop: z.string(), alvos: z.string(), rr: z.string(),
      })),
      nota: z.string().optional(),
    }).optional(),
    cenarios: z.object({
      titulo: z.string(),
      linhas: z.array(z.object({
        cenario: z.enum(['Baixista', 'Base', 'Altista']), prob: z.string(), faixa: z.string(), premissas: z.string(),
      })),
      nota: z.string().optional(),
    }).optional(),
    gatilhos: z.object({ melhora: z.array(z.string()), piora: z.array(z.string()) }).optional(),
    fontes: z.string().optional(), // nota de dados e ressalvas no rodapé
    estrutura: z.object({
      nome: z.string(),
      racional: z.string(), // por que essa estrutura combina com o cenário
      vencimento: z.string().optional(),
      pernas: z.array(perna),
    }),
    invalidacao: z.string(), // o que faz o cenário deixar de valer
    validade: z.coerce.date(), // até quando o estudo é acompanhado
    status: z.enum(['Em acompanhamento', 'Encerrada', 'Invalidada']).default('Em acompanhamento'),
    resultado: z.string().optional(), // preencher ao encerrar
    youtube: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog, trilha, acoes, estrategias, analises };
