// Converte os dados atuais do Laboratório (estruturas.json e mercado.csv) para o formato do motor.
// Funções puras: quem chama lê os arquivos (build com import, testes com fs).
import { diasUteis } from '../motor/calendario.ts';
import { volImplicita, DIAS_UTEIS_ANO } from '../motor/bs.ts';
import type { Cenario, Perna, Posicao } from '../motor/posicao.ts';

export interface PernaJson { t: 'S' | 'C' | 'P'; q: number; k: number | null; d: number; px: number; iv?: number | null; exp?: string | null }
export interface EstruturaJson { id: string; pernas: PernaJson[]; comparacao?: PernaJson[] | null; ref: { data: string; spot: number } }

export interface LinhaMercado {
  estrutura: string; grupo: 'principal' | 'comparacao'; tipo: 'acao' | 'call' | 'put'; q: number; ticker: string;
  strike: number | null; venc: string | null; preco: number; vol: number | null; negocios: number | null; origem: string;
}
export interface Mercado { data: string; spot: number; ativo: string; linhas: LinhaMercado[] }
export interface Inicial { posicao: Posicao; cenario: Cenario; fonte: 'mercado' | 'referencia' }

const num = (s: string | undefined): number | null => {
  const t = (s ?? '').trim();
  if (t === '') return null;
  // "17,38" e "1.234,56" usam vírgula decimal; "-1.6" (quantidades) usa ponto decimal.
  return Number(t.includes(',') ? t.replace(/\./g, '').replace(',', '.') : t);
};
const TIPO = { AÇÃO: 'acao', CALL: 'call', PUT: 'put' } as const;

export function lerMercadoCsv(texto: string): Mercado {
  const meta: Record<string, string> = {};
  const linhas: LinhaMercado[] = [];
  let cabecalho = true;
  for (const bruta of texto.replace(/^﻿/, '').split(/\r?\n/)) {
    const l = bruta.trim();
    if (!l) continue;
    if (l.startsWith('#')) {
      const m = l.match(/^#\s*(\w+)=(.*)$/);
      if (m) meta[m[1]] = m[2].trim();
      continue;
    }
    if (cabecalho) { cabecalho = false; continue; }
    const c = l.split(';');
    linhas.push({
      estrutura: c[0], grupo: c[1] as LinhaMercado['grupo'], tipo: TIPO[c[2] as keyof typeof TIPO], q: num(c[3]) ?? 0,
      ticker: c[4], strike: num(c[5]), venc: c[6] || null, preco: num(c[7]) ?? 0, vol: num(c[8]), negocios: num(c[9]), origem: c[10] ?? '',
    });
  }
  return { data: meta.data ?? '', spot: num(meta.spot) ?? 0, ativo: meta.ativo ?? '', linhas };
}

/**
 * Vol da perna ancorada no próprio preço de entrada, pelo motor (juros e dias úteis do motor):
 * assim o resultado no cenário de entrada é zero. Se não houver solução, usa a vol gravada.
 */
function volAncorada(tipo: 'call' | 'put', spot: number, K: number, data: string, venc: string, preco: number, gravada: number | null | undefined): number | undefined {
  const T = Math.max(diasUteis(data, venc), 0.5) / DIAS_UTEIS_ANO;
  return volImplicita(tipo, spot, K, T, preco) ?? gravada ?? undefined;
}

function pernasDeJson(legs: PernaJson[], data: string, spot: number): Perna[] {
  return legs.map((l, i) => {
    const id = `p${i + 1}`;
    if (l.t === 'S') return { id, tipo: 'acao', q: l.q, entrada: spot };
    const tipo = l.t === 'C' ? 'call' : 'put';
    const venc = l.exp ?? '';
    return { id, tipo, q: l.q, strike: l.k ?? 0, venc, entrada: l.px, vol: volAncorada(tipo, spot, l.k ?? 0, data, venc, l.px, l.iv) };
  });
}

export function posicaoReferencia(est: EstruturaJson): { posicao: Posicao; cenario: Cenario } {
  const cenario = { data: est.ref.data, spot: est.ref.spot };
  return { posicao: { realizado: 0, pernas: pernasDeJson(est.pernas, cenario.data, cenario.spot) }, cenario };
}

function pernasDoMercado(est: EstruturaJson, m: Mercado, grupo: LinhaMercado['grupo']): Perna[] {
  return m.linhas
    .filter((l) => l.estrutura === est.id && l.grupo === grupo)
    .map((l, i) => {
      const id = `p${i + 1}`;
      if (l.tipo === 'acao') return { id, tipo: 'acao', q: l.q, entrada: l.preco };
      const venc = l.venc ?? '';
      return { id, tipo: l.tipo, q: l.q, strike: l.strike ?? 0, venc, entrada: l.preco, vol: volAncorada(l.tipo, m.spot, l.strike ?? 0, m.data, venc, l.preco, l.vol) };
    });
}

export function posicaoHoje(est: EstruturaJson, m: Mercado): { posicao: Posicao; cenario: Cenario } | null {
  const pernas = pernasDoMercado(est, m, 'principal');
  return pernas.length ? { posicao: { realizado: 0, pernas }, cenario: { data: m.data, spot: m.spot } } : null;
}

export function comparacaoHoje(est: EstruturaJson, m: Mercado): Posicao | null {
  const pernas = pernasDoMercado(est, m, 'comparacao');
  return pernas.length ? { realizado: 0, pernas } : null;
}

const sinal = (x: number) => (Math.abs(x) < 1e-9 ? 0 : Math.sign(x));

/**
 * A remontagem preserva o desenho da referência? Para todo par de pernas de opção, a ordem (ou igualdade)
 * dos strikes e dos vencimentos tem de ser a mesma. Grades com poucos strikes podem desmanchar o desenho
 * (ex.: borboleta virando trava, THL sem o mesmo strike); nesse caso a página usa a referência.
 */
export function remontagemCoerente(est: EstruturaJson, atual: Posicao): boolean {
  const ref = est.pernas;
  if (ref.length !== atual.pernas.length) return false;
  for (let i = 0; i < ref.length; i++) {
    for (let j = i + 1; j < ref.length; j++) {
      const [a, b, x, y] = [ref[i], ref[j], atual.pernas[i], atual.pernas[j]];
      if (a.t === 'S' || b.t === 'S') continue;
      if (sinal((a.k ?? 0) - (b.k ?? 0)) !== sinal((x.strike ?? 0) - (y.strike ?? 0))) return false;
      const vr = (a.exp ?? '').localeCompare(b.exp ?? ''), va = (x.venc ?? '').localeCompare(y.venc ?? '');
      if (Math.sign(vr) !== Math.sign(va)) return false;
    }
  }
  return true;
}

export function cenarioInicial(est: EstruturaJson, m: Mercado): Inicial {
  const hoje = posicaoHoje(est, m);
  if (hoje && remontagemCoerente(est, hoje.posicao)) return { ...hoje, fonte: 'mercado' };
  return { ...posicaoReferencia(est), fonte: 'referencia' };
}
