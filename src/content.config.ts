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

export const collections = { blog, trilha, estrategias };
