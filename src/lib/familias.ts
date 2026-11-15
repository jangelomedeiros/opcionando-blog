// Paleta das 12 famílias do Laboratório.
// Tons médios: contraste ≥ 3 contra a superfície do tema escuro (#10313a) e do claro (#ffffff).
// Conferido por tests/familias.test.mjs. O nome da família sempre acompanha a cor.
export const FAM_COR: Record<string, string> = {
  'Base': '#5d8a8e',
  'Direcionais': '#3d7ab6',
  'Proteção patrimonial': '#3fa66b',
  'Volatilidade': '#9362b8',
  'Tempo / rolagem': '#7c7767',
  'Asas / proteção': '#c5871a',
  'Booster': '#e8553f',
  'Módulos': '#1e8c93',
  'Híbridas / hedge': '#b85776',
  'Gradiente linear': '#5f8130',
  'Hedge · ajustes': '#6575ac',
  'Mônadas': '#948636',
};
export const FAM_ORDEM = Object.keys(FAM_COR);
