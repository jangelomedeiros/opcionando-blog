// Calendário de pregões da B3.
// Convenção de dias úteis do opcoes.net.br (conferida nos 17 vencimentos da grade de 13/11/2026):
// conta os dias úteis entre as duas datas, sem incluir nenhuma delas.
// Antes de usar vencimentos de 2028, acrescente os feriados de 2028 abaixo.

export const FERIADOS_B3: ReadonlySet<string> = new Set([
  // 2026
  '2026-01-01', '2026-02-16', '2026-02-17', '2026-04-03', '2026-04-21', '2026-05-01', '2026-06-04',
  '2026-09-07', '2026-10-12', '2026-11-02', '2026-11-20', '2026-12-24', '2026-12-25', '2026-12-31',
  // 2027
  '2027-01-01', '2027-02-08', '2027-02-09', '2027-03-26', '2027-04-21', '2027-05-27',
  '2027-09-07', '2027-10-12', '2027-11-02', '2027-11-15', '2027-12-24', '2027-12-31',
]);

// Datas como string ISO; aritmética em UTC ao meio-dia para não sofrer efeito de fuso.
const paraData = (iso: string) => new Date(`${iso}T12:00:00Z`);
const paraIso = (d: Date) => d.toISOString().slice(0, 10);

export function ehDiaUtil(iso: string): boolean {
  const dia = paraData(iso).getUTCDay();
  return dia !== 0 && dia !== 6 && !FERIADOS_B3.has(iso);
}

const cache = new Map<string, number>();

/** Dias úteis entre `de` e `ate`, sem incluir nenhuma das duas. 0 se `ate <= de`. Resultado em cache. */
export function diasUteis(de: string, ate: string): number {
  if (ate <= de) return 0;
  const chave = de + '|' + ate;
  const salvo = cache.get(chave);
  if (salvo !== undefined) return salvo;
  const n = contarDiasUteis(de, ate);
  cache.set(chave, n);
  return n;
}

function contarDiasUteis(de: string, ate: string): number {
  const d = paraData(de);
  let n = 0;
  for (;;) {
    d.setUTCDate(d.getUTCDate() + 1);
    const iso = paraIso(d);
    if (iso >= ate) return n;
    if (ehDiaUtil(iso)) n++;
  }
}

/** O n-ésimo dia útil depois de `de` (n >= 1). Com n <= 0 devolve `de`. */
export function somarDiasUteis(de: string, n: number): string {
  const d = paraData(de);
  let restantes = n;
  while (restantes > 0) {
    d.setUTCDate(d.getUTCDate() + 1);
    if (ehDiaUtil(paraIso(d))) restantes--;
  }
  return paraIso(d);
}
