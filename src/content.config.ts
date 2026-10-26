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

export const collections = { blog, trilha, estrategias, analises };
