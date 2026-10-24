import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

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

export const collections = { blog };
