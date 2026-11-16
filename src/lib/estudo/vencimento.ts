// Estudo dos vencimentos: no 1º vencimento de cada montagem-base, as decisões do operador.
// 1) Como fica o encerramento: lucro ou prejuízo até aqui.
// 2) Pernas que vencem: exercer, ser exercido, zerar a mercado ou deixar virar pó.
// 3) Alternativas: encerrar tudo, deixar seguir o que não venceu, ou cada caminho de manejo,
//    todas nos preços de tela do dia. Para cada uma: risco (pior caso), probabilidade de lucro no fim,
//    valor esperado e se atende ao objetivo da estrutura.
// Funções puras: quem chama lê a grade do dia, o diário e o manejo.
import { volImplicita, DIAS_UTEIS_ANO } from '../motor/bs.ts';
import { diasUteis } from '../motor/calendario.ts';
import { resultado, gregasPosicao, type Cenario, type Perna, type Posicao } from '../motor/posicao.ts';
import { metricasVencimento } from '../motor/metricas.ts';
import { aplicarAjuste, type Operacao } from '../motor/manejo.ts';
import { gradeParaManejo, type GradeJson } from '../catalogo/gradeManejo.ts';
import { exposicaoVendida, avaliarPilares, primeiroMensal } from '../catalogo/protocolo.ts';
import { criarAvaliador, type Serie } from '../otimizacao/otimizar.ts';
import { posicaoDoRegistro, type EstruturaRegistro } from '../otimizacao/diario.ts';

export interface DiaMercado {
  data: string; spot: number;
  /** Séries vivas depois do dia (seriesDaGrade): preço e vol para marcar e abrir pernas. */
  series: Serie[];
  /** Último negócio do dia por `tipo|strike|venc`, inclusive das séries que vencem no próprio dia. */
  tela: Map<string, number>;
  grade: GradeJson;
}
export interface Caminho { nome: string; ops?: Operacao[] }
export interface Opcoes { sigma: number; custoPorPerna?: number }

export type Decisao = 'vira pó' | 'exercer' | 'vender a mercado' | 'ser exercido' | 'recomprar';
export interface PernaVencendo {
  perna: string; tipo: 'call' | 'put'; lado: 'comprada' | 'vendida'; q: number; strike: number;
  itm: boolean; intrinseco: number; tela: number | null; decisao: Decisao; texto: string;
}
export interface Alternativa {
  nome: string; tipo: 'encerrar' | 'seguir' | 'manejo'; aplicavel: boolean; erro?: string;
  resultadoAgora: number; ev: number; prob: number; piorCaso: number; perdaMax: number | null;
  delta: number; theta: number; exposicao: number; venc: string | null;
  risco: 'menor' | 'igual' | 'maior' | null; compensa: 'sim' | 'troca' | 'não' | null;
  objetivo: { atende: boolean; texto: string };
  novas: { tipo: string; strike: number; venc: string; q: number; entrada: number; tela: boolean }[];
}
export interface EstudoVencimento {
  id: string; data: string; venc: string; base: string;
  situacao: { resultado: number; lucro: boolean; evEsperado: number; probEsperada: number };
  exercicio: PernaVencendo[]; alternativas: Alternativa[]; sugestao: string; motivo: string;
}

const EPS = 1e-9, TOL_EV = 0.005, TOL_RISCO = 0.01;
const chave = (tipo: string, strike: number, venc: string) => `${tipo}|${Math.round(strike * 100) / 100}|${venc}`;
const rs = (v: number) => `${v < -0.0049 ? '−' : ''}R$ ${Math.abs(v).toFixed(2).replace('.', ',')}`;
const intrinseco = (p: Perna, S: number) => (p.tipo === 'call' ? Math.max(S - (p.strike ?? 0), 0) : p.tipo === 'put' ? Math.max((p.strike ?? 0) - S, 0) : 0);

/** Compara uma alternativa com a referência: risco pelo pior caso, "compensa" pelo valor esperado. */
export function classificar(ref: { ev: number; piorCaso: number }, alt: { ev: number; piorCaso: number }) {
  const risco = alt.piorCaso > ref.piorCaso + TOL_RISCO ? 'menor' : alt.piorCaso < ref.piorCaso - TOL_RISCO ? 'maior' : 'igual';
  const melhor = alt.ev > ref.ev + TOL_EV;
  const compensa = !melhor ? 'não' : risco === 'maior' ? 'troca' : 'sim';
  return { risco, compensa } as const;
}

/** Exercer/ser exercido contra zerar a mercado, pelo preço de tela e um custo por perna. */
export function decidirExercicio(x: { lado: 'comprada' | 'vendida'; intrinseco: number; tela: number | null; custo: number }): Decisao {
  if (x.intrinseco < 0.005) return 'vira pó';
  if (x.lado === 'comprada') return x.tela !== null && x.tela - x.custo > x.intrinseco + EPS ? 'vender a mercado' : 'exercer';
  return x.tela !== null && x.tela + x.custo < x.intrinseco - EPS ? 'recomprar' : 'ser exercido';
}

function textoExercicio(p: Perna, d: Decisao, S: number, intr: number, tela: number | null): string {
  const K = p.strike ?? 0, tipo = p.tipo.toUpperCase();
  const pin = Math.abs(S - K) / K < 0.005 ? ' Atenção: está no dinheiro; o exercício fica incerto até o fechamento, e zerar antes evita surpresa.' : '';
  const acao = p.tipo === 'call' ? (p.q < 0 ? 'entrega (vende) as ações' : 'recebe (compra) as ações') : (p.q < 0 ? 'recebe (compra) as ações' : 'entrega (vende) as ações');
  switch (d) {
    case 'vira pó': return `${tipo} ${rs(K).replace('R$ ', '')} fora do dinheiro: vira pó; ${p.q < 0 ? 'o prêmio recebido fica todo' : 'o prêmio pago se perde'}.${pin}`;
    case 'exercer': return `${tipo} comprada ${intr.toFixed(2).replace('.', ',')} dentro do dinheiro: exercer (${acao} a ${rs(K)})${tela === null ? '; sem negócio na tela para comparar' : `; vender a ${rs(tela)} não paga o custo`}.${pin}`;
    case 'vender a mercado': return `${tipo} comprada: vender a ${rs(tela ?? 0)} rende mais que o intrínseco de ${rs(intr)} depois do custo.${pin}`;
    case 'ser exercido': return `${tipo} vendida dentro do dinheiro: deixar ser exercido (${acao} a ${rs(K)}) custa o intrínseco de ${rs(intr)}${tela === null ? '' : `; recomprar custaria ${rs(tela)} mais o custo`}.${pin}`;
    case 'recomprar': return `${tipo} vendida: recomprar a ${rs(tela ?? 0)} sai mais barato que ser exercido (${rs(intr)}).${pin}`;
  }
}

/** Reancora a vol das pernas vivas no preço do dia (a posição passa a valer o que a tela diz), sem mudar a entrada. */
function marcar(pos: Posicao, dia: DiaMercado): Posicao {
  return { ...pos, pernas: pos.pernas.map((p) => {
    if (p.tipo === 'acao' || !p.venc || p.venc <= dia.data) return p;
    const s = dia.series.find((x) => x.tipo === p.tipo && Math.abs(x.strike - (p.strike ?? 0)) < EPS && x.venc === p.venc);
    if (!s) return p;
    const vol = volImplicita(p.tipo, dia.spot, p.strike ?? 0, Math.max(diasUteis(dia.data, p.venc), 0.5) / DIAS_UTEIS_ANO, s.preco);
    return vol ? { ...p, vol } : p;
  }) };
}

/**
 * Pernas que vencem no dia (ou antes) liquidam como na B3: fora do dinheiro viram pó; dentro, o exercício é físico
 * (CALL comprada recebe ações ao strike, CALL vendida entrega; PUT ao contrário). Se as ações se anulam
 * (ex.: venda coberta exercida), a posição em ações é zerada ao preço do dia e tudo vai para o realizado.
 */
function liquidarVencidas(pos: Posicao, dia: DiaMercado): Posicao {
  let realizado = pos.realizado;
  const pernas: Perna[] = [];
  for (const p of pos.pernas) {
    if (p.tipo === 'acao' || !p.venc || p.venc > dia.data) { pernas.push(p); continue; }
    realizado -= p.q * p.entrada; // prêmio pago (q > 0) ou recebido (q < 0)
    if (intrinseco(p, dia.spot) < 0.005) continue; // pó
    const qAcoes = p.tipo === 'call' ? p.q : -p.q;
    pernas.push({ id: `${p.id}-exercicio`, tipo: 'acao', q: qAcoes, entrada: p.strike ?? 0 });
  }
  const acoes = pernas.filter((p) => p.tipo === 'acao');
  if (acoes.length > 1 && Math.abs(acoes.reduce((s, p) => s + p.q, 0)) < EPS) {
    for (const a of acoes) realizado += a.q * (dia.spot - a.entrada);
    return { realizado, pernas: pernas.filter((p) => p.tipo !== 'acao') };
  }
  return { realizado, pernas };
}

function objetivo(obj: string, pos: Posicao, c: Cenario, base: { delta: number; vega: number }, ref: Posicao | null, perdaMax: number | null) {
  const g = gregasPosicao(pos, c);
  const n = (v: number, d = 3) => (v < 0 ? '−' : '+') + Math.abs(v).toFixed(d).replace('.', ',');
  switch (obj) {
    case 'Renda': return { atende: g.theta > EPS, texto: g.theta > EPS ? `segue ganhando com o tempo (Θ ${n(g.theta)} por du)` : `deixa de ganhar com o tempo (Θ ${n(g.theta)} por du)` };
    case 'Direcional': {
      const ok = Math.sign(g.delta) === Math.sign(base.delta) && Math.abs(g.delta) > 0.05;
      return { atende: ok, texto: ok ? `mantém a direção da montagem (Δ ${n(g.delta, 2)})` : `perde a direção da montagem (Δ ${n(g.delta, 2)})` };
    }
    case 'Proteção': return { atende: perdaMax !== null, texto: perdaMax !== null ? `perda máxima limitada (${rs(perdaMax)})` : 'perda deixa de ser limitada' };
    case 'Volatilidade': {
      const ok = Math.sign(g.vega) === Math.sign(base.vega);
      return { atende: ok, texto: ok ? `mantém a aposta na vol (vega ${n(g.vega, 2)})` : `inverte a aposta na vol (vega ${n(g.vega, 2)})` };
    }
    default: {
      if (!ref) return { atende: true, texto: 'sem posição de referência para comparar os pilares' };
      const p = avaliarPilares(ref, pos, c);
      return { atende: p.atende, texto: p.atende ? 'atende a pelo menos um dos 3 pilares (delta, theta ou exposição)' : 'não melhora nenhum dos 3 pilares' };
    }
  }
}

export function avaliarVencimento(
  est: { id: string; objetivo?: string }, reg: EstruturaRegistro, base: { data: string; spot: number },
  dia: DiaMercado, caminhos: Caminho[], o: Opcoes,
): EstudoVencimento {
  const custo = o.custoPorPerna ?? 0.01;
  const c: Cenario = { data: dia.data, spot: dia.spot };
  const pos0 = posicaoDoRegistro(base, reg);
  const g0 = gregasPosicao(pos0, base);
  const pos = marcar(pos0, dia);
  const agora = resultado(pos, c);

  // Pernas que vencem: exercício.
  const exercicio: PernaVencendo[] = pos.pernas.filter((p) => p.tipo !== 'acao' && p.venc === reg.venc1).map((p) => {
    const intr = intrinseco(p, dia.spot), tela = dia.tela.get(chave(p.tipo, p.strike ?? 0, p.venc ?? '')) ?? null;
    const lado = p.q > 0 ? 'comprada' : 'vendida';
    const decisao = decidirExercicio({ lado, intrinseco: intr, tela, custo });
    return { perna: p.id, tipo: p.tipo as 'call' | 'put', lado, q: p.q, strike: p.strike ?? 0, itm: intr >= 0.005, intrinseco: intr, tela, decisao, texto: textoExercicio(p, decisao, dia.spot, intr, tela) };
  });

  const avaliar = criarAvaliador(dia.data, dia.spot, o.sigma);
  const obj = est.objetivo ?? 'Ajuste';
  const vazia = { ev: agora, prob: agora > 0 ? 1 : 0, piorCaso: agora, perdaMax: agora, delta: 0, theta: 0, exposicao: 0, venc: null };
  // Horizonte para quem fica só com ações: o próximo vencimento mensal, o mesmo das alternativas que relançam.
  const horizonte = primeiroMensal(Object.keys(dia.grade.vencimentos).filter((v) => v > dia.data)) ?? undefined;
  const medir = (p: Posicao) => {
    const temOpcao = p.pernas.some((x) => x.tipo !== 'acao');
    if (!p.pernas.length || (!temOpcao && !horizonte)) return null;
    const venc = temOpcao ? p.pernas.filter((x) => x.tipo !== 'acao').map((x) => x.venc as string).sort()[0] : (horizonte as string);
    const av = avaliar(p, venc), g = gregasPosicao(p, c);
    const perdaMax = temOpcao ? metricasVencimento(p).perdaMax : (p.pernas.reduce((s, x) => s + x.q, 0) > 0 ? p.realizado - p.pernas.reduce((s, x) => s + x.q * x.entrada, 0) : null);
    return { ev: av.ev, prob: av.prob, piorCaso: av.piso, perdaMax, delta: g.delta, theta: g.theta, exposicao: exposicaoVendida(p), venc };
  };

  const alternativas: Alternativa[] = [];
  alternativas.push({ nome: 'Encerrar tudo agora', tipo: 'encerrar', aplicavel: true, resultadoAgora: agora, ...vazia, risco: null, compensa: null,
    objetivo: { atende: agora > 0, texto: agora > 0 ? `realiza o lucro de ${rs(agora)}` : `realiza o prejuízo de ${rs(agora)}` }, novas: [] });

  const seguirPos = liquidarVencidas(pos, dia);
  const ms = medir(seguirPos);
  const soAcoes = seguirPos.pernas.length > 0 && seguirPos.pernas.every((p) => p.tipo === 'acao');
  const seguir: Alternativa = ms
    ? { nome: soAcoes ? 'Ficar com as ações' : 'Deixar seguir', tipo: 'seguir', aplicavel: true, resultadoAgora: agora, ...ms, risco: null, compensa: null, objetivo: objetivo(obj, seguirPos, c, g0, null, ms.perdaMax), novas: [] }
    : { nome: 'Deixar seguir', tipo: 'seguir', aplicavel: false, erro: 'nada fica aberto depois do vencimento (pó ou exercício): a estrutura terminou', resultadoAgora: agora, ...vazia, risco: null, compensa: null, objetivo: { atende: false, texto: 'não há o que seguir' }, novas: [] };
  alternativas.push(seguir);
  const ref = seguir.aplicavel ? seguir : alternativas[0];
  if (seguir.aplicavel) Object.assign(seguir, classificar(alternativas[0], seguir));

  for (const cam of caminhos) {
    if (!cam.ops?.length || cam.ops.every((x) => x.op === 'encerrar')) continue; // encerrar tudo já está acima
    try {
      // Perna que vence hoje não tem strike para rolar: primeiro vai para o próximo vencimento, depois anda o strike.
      const venceHoje = new Set(pos.pernas.filter((p) => p.venc && p.venc <= dia.data).map((p) => p.id));
      // Rolar só o strike de uma perna que vence hoje = vender a próxima série no strike novo.
      const comVenc = cam.ops.flatMap((o) => (o.op === 'rolarStrike' && venceHoje.has(o.perna) && !cam.ops!.some((x) => x.op === 'rolarVencimento' && x.perna === o.perna)
        ? [{ op: 'rolarVencimento', perna: o.perna, passos: 1 } as Operacao, o] : [o]));
      const ops = [...comVenc].sort((a, b) => {
        const pa = 'perna' in a && venceHoje.has(a.perna), pb = 'perna' in b && venceHoje.has(b.perna);
        return pa && pb ? (a.op === 'rolarVencimento' ? -1 : 0) - (b.op === 'rolarVencimento' ? -1 : 0) : 0;
      });
      const { posicao } = aplicarAjuste(pos, ops, c, gradeParaManejo(pos, c, dia.grade));
      const ids = new Set(pos.pernas.map((p) => p.id));
      const novas: Alternativa['novas'] = [];
      const precificada: Posicao = { ...posicao, pernas: posicao.pernas.map((p) => {
        if (ids.has(p.id) || p.tipo === 'acao') return p;
        const s = dia.series.find((x) => x.tipo === p.tipo && Math.abs(x.strike - (p.strike ?? 0)) < EPS && x.venc === p.venc);
        novas.push({ tipo: p.tipo, strike: p.strike ?? 0, venc: p.venc ?? '', q: p.q, entrada: s ? s.preco : p.entrada, tela: !!s });
        if (!s) return p;
        const vol = volImplicita(p.tipo, dia.spot, p.strike ?? 0, Math.max(diasUteis(dia.data, p.venc ?? dia.data), 0.5) / DIAS_UTEIS_ANO, s.preco) ?? p.vol;
        // Abrir pela tela: o resultado da perna nova é zero no instante; o caixa do ajuste não muda o resultado.
        return { ...p, entrada: s.preco, vol };
      }) };
      const depois = liquidarVencidas(precificada, dia);
      const m = medir(depois);
      if (!m) throw new Error('equivale a encerrar tudo (o caminho zera todas as posições)');
      const alt = { ev: m.ev, piorCaso: m.piorCaso };
      alternativas.push({ nome: cam.nome, tipo: 'manejo', aplicavel: true, resultadoAgora: resultado(precificada, c), ...m, ...classificar(ref, alt),
        objetivo: objetivo(obj, depois, c, g0, seguir.aplicavel ? seguirPos : null, m.perdaMax), novas });
    } catch (err) {
      alternativas.push({ nome: cam.nome, tipo: 'manejo', aplicavel: false, erro: err instanceof Error ? err.message : String(err), resultadoAgora: agora, ...vazia, risco: null, compensa: null, objetivo: { atende: false, texto: 'não aplicável na grade do dia' }, novas: [] });
    }
  }

  // Sugestão (trilha, não trilho): o maior valor esperado sem aumentar o pior caso em relação à referência;
  // se nada supera encerrar, encerrar.
  const candidatas = alternativas.filter((a) => a.aplicavel && (a.tipo === 'encerrar' || a.risco !== 'maior'));
  const melhor = candidatas.reduce((a, b) => (b.ev > a.ev + TOL_EV ? b : a), alternativas[0]);
  const motivo = melhor.tipo === 'encerrar'
    ? `nenhuma alternativa tem valor esperado acima do resultado de hoje (${rs(agora)}) sem aumentar o pior caso`
    : `maior valor esperado (${rs(melhor.ev)} contra ${rs(agora)} de encerrar hoje), com probabilidade de lucro de ${Math.round(melhor.prob * 100)}% e pior caso ${melhor.risco === 'menor' ? 'menor' : 'igual ou menor'} que o de ${ref.nome.toLowerCase()}${ref.tipo === 'seguir' && melhor.piorCaso < agora - 0.01 ? ` (mais arriscado que encerrar hoje, que trava ${rs(agora)})` : ''}`;

  return {
    id: est.id, data: dia.data, venc: reg.venc1, base: base.data,
    situacao: { resultado: agora, lucro: agora > 0, evEsperado: reg.ev, probEsperada: reg.prob },
    exercicio, alternativas, sugestao: melhor.nome, motivo,
  };
}
