/** @jsxImportSource preact */
// Ilha interativa do gráfico de payoff: preço, dias e choque de vol + simulador de manejo.
// Toda a matemática vem do motor (src/lib/motor), da geometria testada (grafico.ts) e do estado testado (simulacao.ts).
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { curva, curvaVencimento, gregasPosicao, primeiroVencimento, resultado, type Cenario, type Posicao } from '../../lib/motor/posicao.ts';
import { metricasVencimento } from '../../lib/motor/metricas.ts';
import { diasUteis, somarDiasUteis } from '../../lib/motor/calendario.ts';
import type { GradeRef, Operacao } from '../../lib/motor/manejo.ts';
import { faixaPrecos, segmentosPorSinal, escalas, caminho, area, type Ponto } from '../../lib/catalogo/grafico.ts';
import { iniciar, aplicar, desfazer, recomecar } from '../../lib/catalogo/simulacao.ts';
import { avaliarPilares, pernasRegra020, janelaHole } from '../../lib/catalogo/protocolo.ts';

export interface DadosGrafico {
  posicao: Posicao; cenario: Cenario; comparacao?: Posicao | null; rotulo: string; rotuloComparacao?: string | null; grade: GradeRef;
}

const CAIXA = { L: 52, R: 14, T: 14, B: 34, W: 640, H: 330 };
const num = (v: number, d = 2) => Math.abs(v).toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d });
const sinal = (v: number) => (v > 0.0005 ? '+' : v < -0.0005 ? '−' : '');
const reais = (v: number) => `${sinal(v)}R$ ${num(v)}`;
const dataBr = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(2, 4)}`;
const qtd = (q: number) => String(Math.abs(q)).replace('.', ',');
const rotuloPerna = (p: Posicao['pernas'][number]) =>
  p.tipo === 'acao'
    ? `Ação ×${qtd(p.q)} · ${p.q > 0 ? 'comprada' : 'vendida'}`
    : `${p.tipo.toUpperCase()} ${num(p.strike ?? 0)} · ${dataBr(p.venc ?? '')} · ${p.q > 0 ? 'comprada' : 'vendida'} ×${qtd(p.q)}`;
const ilimitado = (v: number | null, txt: string) => (v === null ? txt : reais(v));

export default function GraficoEstrutura({ dados }: { dados: DadosGrafico }) {
  const { posicao: original, cenario: c0, comparacao, grade } = dados;
  const [sim, setSim] = useState(() => iniciar(original));
  const atual = sim.posicao;
  const ajustado = sim.ajustes.length > 0;

  // Dias contados como "decorridos desde a montagem": a data não salta quando um ajuste muda o 1º vencimento.
  const venc1 = primeiroVencimento(atual);
  const duMax = venc1 ? Math.max(diasUteis(c0.data, venc1), 0) : 0;
  const [preco, setPreco] = useState(c0.spot);
  const [decorridos, setDecorridos] = useState(0);
  const [choque, setChoque] = useState(0);
  const dec = Math.min(decorridos, duMax);
  const data = dec <= 0 ? c0.data : dec >= duMax && venc1 ? venc1 : somarDiasUteis(c0.data, dec);
  const cen: Cenario = { data, spot: preco, choqueVol: choque };
  const cenRef = useRef(cen);
  cenRef.current = cen;

  // Caminhos prontos da aba Manejo chegam por evento e são aplicados no cenário dos controles.
  useEffect(() => {
    const ouvir = (ev: Event) => {
      const d = (ev as CustomEvent<{ nome: string; ops: Operacao[] }>).detail;
      setSim((s) => aplicar(s, d.nome, d.ops, cenRef.current, grade));
    };
    window.addEventListener('opcionando:manejo', ouvir);
    return () => window.removeEventListener('opcionando:manejo', ouvir);
  }, [grade]);

  const xs = useMemo(() => faixaPrecos({ realizado: 0, pernas: [...original.pernas, ...atual.pernas] }, c0.spot), [original, atual, c0.spot]);
  const yv = useMemo(() => curvaVencimento(atual, xs), [atual, xs]);
  const yFundo = useMemo(() => (ajustado ? curvaVencimento(original, xs) : comparacao ? curvaVencimento(comparacao, xs) : null), [ajustado, original, comparacao, xs]);
  const m = useMemo(() => metricasVencimento(atual), [atual]);
  const m0 = useMemo(() => metricasVencimento(original), [original]);
  const yh = useMemo(() => curva(atual, { data, choqueVol: choque }, xs), [atual, data, choque, xs]);
  const res = resultado(atual, cen);
  const g = gregasPosicao(atual, cen);

  const { X, Y, yMin, yMax } = escalas(xs, [yv, yh, ...(yFundo ? [yFundo] : [])], CAIXA);
  const ticksY = [yMax * 0.85, yMin * 0.85].filter((y) => Math.abs(y) > (yMax - yMin) * 0.12);
  const classeRes = Math.abs(res) < 0.005 ? 'neutro' : res > 0 ? 'pos' : 'neg';
  const pts = (ys: number[]) => xs.map((x, i) => [x, ys[i]] as Ponto);
  const segs = segmentosPorSinal(xs, yv);
  const lo = xs[0], hi = xs[xs.length - 1];
  const precoMin = Math.max(0.01, +(c0.spot * 0.7).toFixed(2)), precoMax = +(c0.spot * 1.3).toFixed(2);
  const ticksX = Array.from({ length: 5 }, (_, i) => lo + ((hi - lo) * i) / 4);

  const ajustar = (nome: string, ops: Operacao[]) => setSim((s) => aplicar(s, nome, ops, cen, grade));
  // Protocolo (Prof. Su): pilares do último ajuste, regra dos R$ 0,20 e janela do calendário.
  const pilares = useMemo(() => {
    if (!ajustado) return null;
    const ultimo = sim.ajustes[sim.ajustes.length - 1];
    return avaliarPilares(desfazer(sim, grade).posicao, atual, ultimo.cenario);
  }, [sim, grade, ajustado, atual]);
  const baratas = pernasRegra020(atual, cen);
  const janela = venc1 ? janelaHole(duMax - dec) : null;
  const [novo, setNovo] = useState({ tipo: 'put' as 'call' | 'put' | 'acao', lado: 1, passos: 0, venc: 0 });

  return (
    <div class="ge">
      <svg class="ge-svg" viewBox={`0 0 ${CAIXA.W} ${CAIXA.H}`} role="img" aria-label={`Gráfico de resultado de ${dados.rotulo}${ajustado ? ' depois dos ajustes' : ''}`}>
        {ticksX.map((x) => <line class="g-grade" x1={X(x)} x2={X(x)} y1={CAIXA.T} y2={CAIXA.H - CAIXA.B} />)}
        {segs.map((s) => <path class={s.sinal > 0 ? 'g-area-lucro' : 'g-area-prejuizo'} d={area(s.pontos, X, Y)} />)}
        <line class="g-zero" x1={CAIXA.L} x2={CAIXA.W - CAIXA.R} y1={Y(0)} y2={Y(0)} />
        {yFundo && <path class="g-comp" d={caminho(pts(yFundo), X, Y)} />}
        {segs.map((s) => <path class={s.sinal > 0 ? 'g-lucro' : 'g-prejuizo'} d={caminho(s.pontos, X, Y)} />)}
        <path class="g-hoje" d={caminho(pts(yh), X, Y)} />
        <line class="g-spot" x1={X(preco)} x2={X(preco)} y1={CAIXA.T} y2={CAIXA.H - CAIXA.B} />
        <circle class="g-ponto" cx={X(preco)} cy={Y(res)} r="4.5" />
        {ticksX.map((x, i) => <text class="g-rot" x={X(x)} y={CAIXA.H - 12} text-anchor={i === 0 ? 'start' : i === ticksX.length - 1 ? 'end' : 'middle'}>{num(x)}</text>)}
        {ticksY.map((y) => <text class="g-rot" x={CAIXA.L - 6} y={Y(y) + 4} text-anchor="end">{sinal(y)}{num(y)}</text>)}
        <text class="g-rot" x={CAIXA.L - 6} y={Y(0) + 4} text-anchor="end">0</text>
      </svg>
      <p class="ge-legenda">
        <span><i class="k-venc"></i>{venc1 ? `no vencimento (${dataBr(venc1)})` : 'resultado'}</span>
        <span><i class="k-hoje"></i>em {dataBr(data)}</span>
        {yFundo && <span><i class="k-comp"></i>{ajustado ? 'antes dos ajustes' : dados.rotuloComparacao || 'posição original'}</span>}
      </p>

      <p class="ge-dica">Mova os controles para simular outros cenários. Na aba Manejo, aplique um caminho neste cenário.</p>
      <div class="ge-controles">
        <label>
          <span>Preço do ativo <b>R$ {num(preco)}</b></span>
          <input type="range" min={precoMin} max={precoMax} step="0.01" value={preco} onInput={(e) => setPreco(+(e.currentTarget as HTMLInputElement).value)} />
        </label>
        {duMax > 0 && (
          <label>
            <span>Dias úteis até o vencimento <b>{duMax - dec}</b></span>
            <input type="range" min="0" max={duMax} step="1" value={duMax - dec} onInput={(e) => setDecorridos(duMax - +(e.currentTarget as HTMLInputElement).value)} />
          </label>
        )}
        <label>
          <span>Volatilidade <b>{choque > 0 ? '+' : choque < 0 ? '−' : ''}{Math.abs(choque)} p.p.</b></span>
          <input type="range" min="-20" max="20" step="1" value={choque} onInput={(e) => setChoque(+(e.currentTarget as HTMLInputElement).value)} />
        </label>
        <button type="button" class="ge-reset" onClick={() => { setPreco(c0.spot); setDecorridos(0); setChoque(0); }}>Voltar ao início</button>
      </div>

      {janela && <p class="ge-janela"><b>Calendário:</b> {janela.nome}. {janela.texto} <a href="/estrategias/protocolo-de-manejo/">Protocolo</a></p>}
      {baratas.length > 0 && (
        <p class="ge-020" role="note"><b>Regra dos R$ 0,20:</b> {baratas.map((id) => rotuloPerna(atual.pernas.find((p) => p.id === id)!)).join('; ')} vale R$ 0,20 ou menos neste cenário.{' '}
          <button type="button" class="ge-reset" onClick={() => ajustar('Regra dos R$ 0,20: recomprar', baratas.map((id) => ({ op: 'encerrar', perna: id }) as Operacao))}>Recomprar</button></p>
      )}
      {sim.erro && <p class="ge-erro" role="alert">Não deu para aplicar: {sim.erro}</p>}

      {ajustado && (
        <div class="ge-ajustes">
          <b>Ajustes</b>
          <ol>
            {sim.ajustes.map((a, i) => (
              <li>{a.nome} em {dataBr(a.cenario.data)}, ativo a R$ {num(a.cenario.spot)}: <span class={sim.fluxos[i] >= 0 ? 'pos' : 'neg'}>{sim.fluxos[i] >= 0 ? 'crédito' : 'débito'} de R$ {num(sim.fluxos[i])}</span></li>
            ))}
          </ol>
          {pilares && (
            <div class={`ge-pilares ${pilares.atende ? 'ok' : 'nao'}`}>
              <b>Pilares do último ajuste</b>
              <ul>
                <li>{pilares.delta.melhorou ? '✓' : '✗'} Delta {num(pilares.delta.antes, 3)} → {num(pilares.delta.depois, 3)}</li>
                <li>{pilares.theta.melhorou ? '✓' : '✗'} Theta {num(pilares.theta.antes, 3)} → {num(pilares.theta.depois, 3)} por dia útil</li>
                <li>{pilares.exposicao.melhorou ? '✓' : '✗'} Lotes vendidos {qtd(pilares.exposicao.antes)} → {qtd(pilares.exposicao.depois)}</li>
              </ul>
              <span>{pilares.atende ? 'Atende ao protocolo: melhora ao menos um pilar.' : 'Não melhora nenhum pilar: pelo protocolo, este ajuste não se justifica.'}</span>
            </div>
          )}
          <p class="ge-antes">Antes: ganho máx. {ilimitado(m0.ganhoMax, 'ilimitado')} · perda máx. {ilimitado(m0.perdaMax, 'ilimitada')} · equilíbrio {m0.equilibrios.map((x) => num(x)).join(' · ') || '—'}. Já realizado: {reais(atual.realizado)}.</p>
          <div class="ge-botoes">
            <button type="button" class="ge-reset" onClick={() => setSim((s) => desfazer(s, grade))}>Desfazer último</button>
            <button type="button" class="ge-reset" onClick={() => setSim((s) => recomecar(s))}>Recomeçar</button>
          </div>
        </div>
      )}

      <div class="ge-painel">
        <div class={`ge-res ${classeRes}`} aria-live="polite">
          <span>Resultado neste cenário{ajustado ? ' (com os ajustes)' : ''}</span>
          <b>{reais(res)}</b>
          <small>por unidade · {reais(res * 100)} por lote de 100</small>
        </div>
        <dl class="ge-met">
          <div><dt>Ganho máximo</dt><dd class="pos">{ilimitado(m.ganhoMax, 'ilimitado')}</dd></div>
          <div><dt>Perda máxima</dt><dd class="neg">{ilimitado(m.perdaMax, 'ilimitada')}</dd></div>
          <div><dt>Equilíbrio</dt><dd>{m.equilibrios.length ? m.equilibrios.map((x) => num(x)).join(' · ') : '—'}</dd></div>
        </dl>
        <dl class="ge-gregas">
          <div><dt>Delta</dt><dd>{sinal(g.delta)}{num(g.delta, 3)}</dd></div>
          <div><dt>Gama</dt><dd>{sinal(g.gama)}{num(g.gama, 3)}</dd></div>
          <div><dt>Theta <small>/dia útil</small></dt><dd>{sinal(g.theta)}{num(g.theta, 3)}</dd></div>
          <div><dt>Vega <small>/p.p.</small></dt><dd>{sinal(g.vega)}{num(g.vega, 3)}</dd></div>
        </dl>
      </div>

      <details class="ge-livre">
        <summary>Ajuste livre (monte o seu)</summary>
        <ul class="ge-pernas">
          {atual.pernas.map((p) => (
            <li>
              <span>{rotuloPerna(p)}</span>
              <span class="ge-acoes">
                <button type="button" aria-label={`Encerrar ${rotuloPerna(p)}`} onClick={() => ajustar(`Encerrar ${rotuloPerna(p)}`, [{ op: 'encerrar', perna: p.id }])}>Encerrar</button>
                {p.tipo !== 'acao' && <>
                  <button type="button" aria-label={`Strike um passo abaixo: ${rotuloPerna(p)}`} onClick={() => ajustar('Strike −1', [{ op: 'rolarStrike', perna: p.id, passos: -1 }])}>Strike −</button>
                  <button type="button" aria-label={`Strike um passo acima: ${rotuloPerna(p)}`} onClick={() => ajustar('Strike +1', [{ op: 'rolarStrike', perna: p.id, passos: 1 }])}>Strike +</button>
                  <button type="button" aria-label={`Próximo vencimento: ${rotuloPerna(p)}`} onClick={() => ajustar('Próximo vencimento', [{ op: 'rolarVencimento', perna: p.id, passos: 1 }])}>Venc. +</button>
                </>}
                <button type="button" aria-label={`Dobrar quantidade: ${rotuloPerna(p)}`} onClick={() => ajustar('Dobrar quantidade', [{ op: 'quantidade', perna: p.id, q: p.q * 2 }])}>×2</button>
                <button type="button" aria-label={`Reduzir à metade: ${rotuloPerna(p)}`} onClick={() => ajustar('Reduzir à metade', [{ op: 'quantidade', perna: p.id, q: p.q / 2 }])}>÷2</button>
              </span>
            </li>
          ))}
        </ul>
        <div class="ge-novo">
          <select aria-label="Lado" onChange={(e) => setNovo({ ...novo, lado: +(e.currentTarget as HTMLSelectElement).value })}>
            <option value="1">Comprar</option><option value="-1">Vender</option>
          </select>
          <select aria-label="Tipo" onChange={(e) => setNovo({ ...novo, tipo: (e.currentTarget as HTMLSelectElement).value as 'call' | 'put' | 'acao' })}>
            <option value="put">PUT</option><option value="call">CALL</option><option value="acao">Ação</option>
          </select>
          {novo.tipo !== 'acao' && <>
            <select aria-label="Strike em passos a partir do preço atual" onChange={(e) => setNovo({ ...novo, passos: +(e.currentTarget as HTMLSelectElement).value })}>
              {[-4, -3, -2, -1, 0, 1, 2, 3, 4].map((n) => <option value={n} selected={n === novo.passos}>{n === 0 ? 'strike no dinheiro' : `${n > 0 ? '+' : ''}${n} strike${Math.abs(n) > 1 ? 's' : ''}`}</option>)}
            </select>
            <select aria-label="Vencimento" onChange={(e) => setNovo({ ...novo, venc: +(e.currentTarget as HTMLSelectElement).value })}>
              {[0, 1, 2, 3].map((n) => <option value={n} selected={n === novo.venc}>{n === 0 ? 'próximo venc.' : `${n + 1}º venc.`}</option>)}
            </select>
          </>}
          <button type="button" class="ge-reset" onClick={() => ajustar(`${novo.lado > 0 ? 'Comprar' : 'Vender'} ${novo.tipo === 'acao' ? 'ação' : novo.tipo.toUpperCase()}`,
            [novo.tipo === 'acao' ? { op: 'adicionar', tipo: 'acao', q: novo.lado } : { op: 'adicionar', tipo: novo.tipo, q: novo.lado, strikePassos: novo.passos, vencIndice: novo.venc }])}>Adicionar perna</button>
        </div>
      </details>
    </div>
  );
}
