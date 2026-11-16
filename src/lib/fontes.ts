// Grade de opções e candles em uso pelo site, apontados por src/data/laboratorio/fontes.json.
// import.meta.glob deixa o bundler resolver os arquivos: uma nova data não exige editar imports.
import FONTES from '../data/laboratorio/fontes.json';

const grades = import.meta.glob('../data/grades/*.json', { eager: true, import: 'default' }) as Record<string, any>;
const candles = import.meta.glob('../data/candles/*.json', { eager: true, import: 'default' }) as Record<string, any>;
// "src/data/grades/x.json" (a partir da raiz) → "../data/grades/x.json" (a partir deste arquivo).
const chave = (p: string) => `../${p.replace(/^src\//, '')}`;
function achar(mapa: Record<string, any>, p: string) {
  const v = mapa[chave(p)];
  if (!v) throw new Error(`fontes.json aponta para ${p}, que não existe`);
  return v;
}

export { FONTES };
export const GRADE: any = achar(grades, FONTES.grade);
export const CANDLES: any[] = achar(candles, FONTES.candles);
