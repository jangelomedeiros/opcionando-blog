import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'blog'>;

/** Todos os posts publicados (rascunhos aparecem só no `npm run dev`), do mais novo ao mais antigo. */
export async function getPosts(): Promise<Post[]> {
  const posts = await getCollection('blog', ({ data }) => import.meta.env.DEV || !data.draft);
  return posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

export function formatarData(d: Date): string {
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'UTC' });
}

export function tempoLeitura(texto = ''): string {
  const palavras = texto.trim().split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.round(palavras / 200))} min de leitura`;
}

export function slugify(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
