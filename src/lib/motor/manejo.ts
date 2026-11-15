// Ajustes de manejo: operações relativas aplicadas num cenário.
// Pernas que saem são encerradas pelo valor do cenário (resultado vai para `realizado`);
// pernas que entram são abertas pelo mesmo valor. Assim o ajuste não cria nem destrói valor no instante.
import { valorPerna, type Cenario, type Perna, type Posicao } from './posicao.ts';

export interface GradeRef {
  strikes: number[];
  vencimentos: string[];
  /** Strikes que existem em cada vencimento (grade real). Sem isso, usa `strikes` para todos. */
  strikesPorVenc?: Record<string, number[]>;
}

export type Operacao =
  | { op: 'encerrar'; perna: string }
  | { op: 'rolarStrike'; perna: string; passos: number }
  | { op: 'rolarVencimento'; perna: string; passos: number }
  | { op: 'quantidade'; perna: string; q: number }
  | { op: 'adicionar'; tipo: 'acao' | 'call' | 'put'; q: number; strikePassos?: number; vencIndice?: number; vencDe?: string; vol?: number };

export interface Ajuste { nome: string; cenario: Cenario; ops: Operacao[] }
export interface Historico { inicial: Posicao; ajustes: Ajuste[] }

const IGUAL = 1e-9;
const idBase = (id: string) => id.split('~')[0];

/** Próximo número de ajuste, a partir dos ids já usados (`<id>~<n>` e `n<n>-<k>`). */
function proximoNumero(pos: Posicao): number {
  let max = 0;
  for (const p of pos.pernas) {
    const m = p.id.match(/~(\d+)$/) ?? p.id.match(/^n(\d+)-\d+$/);
    if (m) max = Math.max(max, Number(m[1]));
  }
  return max + 1;
}

const strikesDe = (grade: GradeRef, venc?: string) => (venc && grade.strikesPorVenc?.[venc]?.length ? grade.strikesPorVenc[venc] : grade.strikes);
const maisProximo = (lista: number[], k: number) => lista.reduce((m, x) => (Math.abs(x - k) < Math.abs(m - k) ? x : m));

function indiceStrike(lista: number[], k: number): number {
  const i = lista.findIndex((s) => Math.abs(s - k) < IGUAL);
  if (i < 0) throw new RangeError(`Rolagem fora da grade: strike ${k} não está na grade`);
  return i;
}

function strikeATM(lista: number[], spot: number): number {
  if (!lista.length) throw new RangeError('Rolagem fora da grade: grade sem strikes');
  return maisProximo(lista, spot);
}

/**
 * Aplica as operações em sequência sobre uma cópia da posição.
 * `numero` identifica o ajuste nos ids das pernas novas (`<id>~<numero>`); sem ele, usa o próximo livre.
 * Se qualquer operação falhar, lança o erro e nada é alterado.
 */
export function aplicarAjuste(pos: Posicao, ops: Operacao[], c: Cenario, grade: GradeRef, numero = proximoNumero(pos)): { posicao: Posicao; fluxo: number } {
  const pernas: Perna[] = pos.pernas.map((p) => ({ ...p }));
  let realizado = pos.realizado;
  let fluxo = 0;
  let novas = 0;

  // Procura pelo id exato; se a perna foi rolada (neste ou em outro ajuste), segue a descendente (`<id>~<n>`).
  const achar = (id: string) => {
    let i = pernas.findIndex((p) => p.id === id);
    if (i < 0) i = pernas.findIndex((p) => idBase(p.id) === idBase(id));
    if (i < 0) throw new Error(`Perna inexistente: ${id} (essa perna já foi encerrada ou não existe)`);
    return i;
  };
  const encerrar = (i: number) => {
    const p = pernas[i];
    const v = valorPerna(p, c);
    realizado += p.q * (v - p.entrada);
    fluxo += p.q * v;
    pernas.splice(i, 1);
  };
  const abrir = (p: Omit<Perna, 'entrada'>) => {
    const v = valorPerna({ ...p, entrada: 0 }, c);
    fluxo -= p.q * v;
    pernas.push({ ...p, entrada: v });
  };
  const exigirOpcao = (p: Perna, op: string) => {
    if (p.tipo === 'acao') throw new Error(`Operação ${op} não se aplica a ação (perna ${p.id})`);
  };

  for (const o of ops) {
    switch (o.op) {
      case 'encerrar':
        encerrar(achar(o.perna));
        break;
      case 'rolarStrike': {
        const i = achar(o.perna);
        const p = pernas[i];
        exigirOpcao(p, 'rolarStrike');
        const lista = strikesDe(grade, p.venc);
        const destino = indiceStrike(lista, p.strike ?? NaN) + o.passos;
        if (destino < 0 || destino >= lista.length) {
          throw new RangeError(`Rolagem fora da grade: ${o.passos} passos a partir do strike ${p.strike}`);
        }
        encerrar(i);
        abrir({ ...p, id: `${idBase(p.id)}~${numero}`, strike: lista[destino] });
        break;
      }
      case 'rolarVencimento': {
        const i = achar(o.perna);
        const p = pernas[i];
        exigirOpcao(p, 'rolarVencimento');
        const atual = grade.vencimentos.indexOf(p.venc ?? '');
        if (atual < 0) throw new RangeError(`Rolagem fora da grade: vencimento ${p.venc} não está na grade`);
        const destino = atual + o.passos;
        if (destino < 0 || destino >= grade.vencimentos.length) {
          throw new RangeError(`Rolagem fora da grade: ${o.passos} vencimentos a partir de ${p.venc}`);
        }
        const novoVenc = grade.vencimentos[destino];
        // Se o strike não existe no novo vencimento, usa o mais próximo que existe.
        const lista = strikesDe(grade, novoVenc);
        const k = lista.some((s) => Math.abs(s - (p.strike ?? NaN)) < IGUAL) ? p.strike : maisProximo(lista, p.strike ?? 0);
        encerrar(i);
        abrir({ ...p, id: `${idBase(p.id)}~${numero}`, venc: novoVenc, strike: k });
        break;
      }
      case 'quantidade': {
        const i = achar(o.perna);
        const p = pernas[i];
        if (o.q === 0) { encerrar(i); break; }
        if (Math.sign(o.q) !== Math.sign(p.q)) throw new Error(`Quantidade ${o.q} troca o lado da perna ${p.id}; encerre e adicione outra`);
        const v = valorPerna(p, c);
        if (Math.abs(o.q) < Math.abs(p.q)) {
          const sai = p.q - o.q;
          realizado += sai * (v - p.entrada);
          fluxo += sai * v;
          pernas[i] = { ...p, q: o.q };
        } else {
          const entra = o.q - p.q;
          fluxo -= entra * v;
          pernas[i] = { ...p, q: o.q, entrada: (p.q * p.entrada + entra * v) / o.q };
        }
        break;
      }
      case 'adicionar': {
        novas++;
        const id = `n${numero}-${novas}`;
        if (o.tipo === 'acao') { abrir({ id, tipo: 'acao', q: o.q }); break; }
        const futuros = grade.vencimentos.filter((v) => v > c.data);
        // vencDe: mesmo vencimento de outra perna (ex.: PUT de proteção junto com a CALL vendida).
        const venc = o.vencDe ? pernas[achar(o.vencDe)].venc : futuros[o.vencIndice ?? 0];
        if (!venc) throw new RangeError(`Rolagem fora da grade: não há vencimento de índice ${o.vencIndice ?? 0} depois de ${c.data}`);
        const lista = strikesDe(grade, venc);
        const atm = indiceStrike(lista, strikeATM(lista, c.spot));
        const k = atm + (o.strikePassos ?? 0);
        if (k < 0 || k >= lista.length) throw new RangeError(`Rolagem fora da grade: ${o.strikePassos} passos a partir do ATM`);
        const vol = o.vol ?? pos.pernas.find((p) => p.tipo !== 'acao' && p.vol)?.vol;
        if (vol === undefined) throw new Error('Informe a vol da perna adicionada');
        abrir({ id, tipo: o.tipo, q: o.q, strike: lista[k], venc, vol });
        break;
      }
    }
  }
  return { posicao: { pernas, realizado }, fluxo };
}

/** Reaplica os ajustes em ordem. Desfazer = reconstruir sem o último ajuste. */
export function reconstruir(h: Historico, grade: GradeRef): { posicao: Posicao; fluxos: number[] } {
  let posicao = h.inicial;
  const fluxos: number[] = [];
  h.ajustes.forEach((a, i) => {
    const r = aplicarAjuste(posicao, a.ops, a.cenario, grade, i + 1);
    posicao = r.posicao;
    fluxos.push(r.fluxo);
  });
  return { posicao, fluxos };
}
