/** @jsxImportSource preact */
// Ilha dos módulos de conceitos (spec 5.6). Toda a matemática vem de src/lib/conceitos/modulos.ts (testada).
import { useEffect, useMemo, useState } from 'preact/hooks';
import { faixa, anatomia, curvasPorPrazo, gregasAoLongo, deltaNoTempo, premioPorVol, quedaDeVol, densidade, probLucroPosicao, formatarNum, fraseQuedaDeVol, notaExtrinseco, notaTheta } from '../../lib/conceitos/modulos.ts';
import { diasUteis } from '../../lib/motor/calendario.ts';
import { DIAS_UTEIS_ANO } from '../../lib/motor/bs.ts';
import type { Opcao } from '../../lib/conceitos/jornada.ts';

export type Slug = 'anatomia-do-premio' | 'premio-e-prazo' | 'gregas-ao-longo-do-preco' | 'gregas-no-tempo' | 'volatilidade' | 'probabilidade';

const num = formatarNum;
const pct = (v: number, d = 0) => `${num(v * 100, d)}%`;
const W = 640, H = 230, L = 50, R = 12, T = 12, B = 28;

interface Serie { ys: number[]; classe: string; nome: string }
function Linhas({ xs, series, marcador, area, rotX, titulo }: { xs: number[]; series: Serie[]; marcador?: number; area?: number[]; rotX: (x: number) => string; titulo: string }) {
  const todos = [0, ...series.flatMap((s) => s.ys), ...(area ?? [])].filter(Number.isFinite);
  let lo = Math.min(...todos), hi = Math.max(...todos);
  if (hi - lo < 1e-9) { lo -= 1; hi += 1; }
  const f = (hi - lo) * 0.08; lo -= f; hi += f;
  const x0 = xs[0], x1 = xs[xs.length - 1];
  const X = (x: number) => L + ((x - x0) / (x1 - x0 || 1)) * (W - L - R);
  const Y = (y: number) => T + ((hi - y) / (hi - lo)) * (H - T - B);
  const path = (ys: number[]) => ys.map((y, i) => `${i ? 'L' : 'M'}${X(xs[i]).toFixed(1)},${Y(y).toFixed(1)}`).join(' ');
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => x0 + (x1 - x0) * t);
  return (
    <figure class="md-fig">
      <svg class="jp-svg" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={titulo}>
        {ticks.map((x) => <line class="g-grade" x1={X(x)} x2={X(x)} y1={T} y2={H - B} />)}
        {area && <path class="md-area" d={`${path(area)} L${X(x1).toFixed(1)},${Y(0).toFixed(1)} L${X(x0).toFixed(1)},${Y(0).toFixed(1)} Z`} />}
        <line class="g-zero" x1={L} x2={W - R} y1={Y(0)} y2={Y(0)} />
        {series.map((s) => <path class={s.classe} d={path(s.ys)} />)}
        {marcador !== undefined && <line class="g-spot" x1={X(marcador)} x2={X(marcador)} y1={T} y2={H - B} />}
        {ticks.map((x, i) => <text class="g-rot" x={X(x)} y={H - 10} text-anchor={i === 0 ? 'start' : i === 4 ? 'end' : 'middle'}>{rotX(x)}</text>)}
        {Math.abs(hi - f) > (hi - lo) * 0.1 && <text class="g-rot" x={L - 6} y={Y(hi - f) + 4} text-anchor="end">{num(hi - f)}</text>}
        {Math.abs(lo + f) > (hi - lo) * 0.1 && <text class="g-rot" x={L - 6} y={Y(lo + f) + 4} text-anchor="end">{num(lo + f)}</text>}
        {Math.abs(hi - f) > (hi - lo) * 0.1 && Math.abs(lo + f) > (hi - lo) * 0.1 && <text class="g-rot" x={L - 6} y={Y(0) + 4} text-anchor="end">0</text>}
      </svg>
      <figcaption class="ge-legenda">{series.map((s) => <span><i class={`md-k ${s.classe}`}></i>{s.nome}</span>)}{area && <span><i class="md-k md-area"></i>distribuição de preços (modelo)</span>}</figcaption>
    </figure>
  );
}


export default function Modulo({ modulo, dados }: { modulo: Slug; dados: { call: Opcao; put: Opcao } }) {
  const [tipo, setTipo] = useState<'call' | 'put'>('call');
  const op = tipo === 'call' ? dados.call : dados.put;
  const du0 = diasUteis(op.data, op.venc);
  const [preco, setPreco] = useState(op.spot);
  const [dias, setDias] = useState(du0);
  const [vol, setVol] = useState(Math.round(op.vol * 100) / 100);
  const [volDepois, setVolDepois] = useState(Math.max(0.05, Math.round(op.vol * 100 - 15) / 100));
  const [comprado, setComprado] = useState(true);
  const [tocando, setTocando] = useState(false);
  const xs = useMemo(() => faixa(op.spot), [op.spot]);
  const K = op.strike, Tano = dias / DIAS_UTEIS_ANO;

  useEffect(() => {
    if (!tocando) return;
    const id = setInterval(() => setDias((d) => (d <= 0 ? (setTocando(false), 0) : d - 1)), 250);
    return () => clearInterval(id);
  }, [tocando]);

  const faixaR = (x: number) => num(x);
  const slider = (rotulo: string, valorTxt: string, v: number, min: number, max: number, passo: number, set: (n: number) => void) => (
    <label><span>{rotulo} <b>{valorTxt}</b></span><input type="range" min={min} max={max} step={passo} value={v} onInput={(e) => set(+(e.currentTarget as HTMLInputElement).value)} /></label>
  );
  const ctlPreco = slider('Preço do ativo', `R$ ${num(preco)}`, preco, +(op.spot * 0.6).toFixed(2), +(op.spot * 1.4).toFixed(2), 0.01, setPreco);
  const ctlDias = slider('Dias úteis até o vencimento', String(dias), dias, 0, du0, 1, setDias);
  const ctlVol = slider('Volatilidade', pct(vol), vol, 0.05, 1.2, 0.01, setVol);

  let corpo: preact.JSX.Element, leitura: string;
  switch (modulo) {
    case 'anatomia-do-premio': {
      const a = anatomia(tipo, K, xs, Tano, vol);
      const p = anatomia(tipo, K, [preco], Tano, vol)[0];
      leitura = `Com o ativo a R$ ${num(preco)}: prêmio R$ ${num(p.valor)} = intrínseco R$ ${num(p.intrinseco)} ${p.extrinseco < -0.005 ? '−' : '+'} extrínseco R$ ${num(Math.abs(p.extrinseco))}. ${notaExtrinseco(a)}`.trim();
      corpo = <>
        <Linhas xs={xs} titulo="Prêmio, intrínseco e extrínseco contra o preço" marcador={preco} rotX={faixaR}
          series={[{ ys: a.map((x) => x.valor), classe: 'md-s1', nome: 'prêmio' }, { ys: a.map((x) => x.intrinseco), classe: 'md-s2', nome: 'intrínseco' }, { ys: a.map((x) => x.extrinseco), classe: 'md-s3', nome: 'extrínseco (tempo e vol)' }]} />
        <div class="ge-controles">{ctlPreco}{ctlDias}{ctlVol}</div>
      </>;
      break;
    }
    case 'premio-e-prazo': {
      const prazos = [...new Set([du0, Math.round(du0 / 2), 5, 0])].sort((a, b) => b - a);
      const curvas = curvasPorPrazo(tipo, K, xs, prazos, vol);
      const atual = curvasPorPrazo(tipo, K, xs, [dias], vol)[0];
      const noSpot = curvasPorPrazo(tipo, K, [op.spot], [dias], vol)[0][0];
      leitura = `Faltando ${dias} dias úteis, com o ativo a R$ ${num(op.spot)}, o prêmio vale R$ ${num(noSpot)}.`;
      corpo = <>
        <Linhas xs={xs} titulo="Prêmio contra o preço em vários prazos" marcador={op.spot} rotX={faixaR}
          series={[...curvas.map((ys, i) => ({ ys, classe: 'md-fundo', nome: `${prazos[i]} du` })), { ys: atual, classe: 'md-s1', nome: `agora: ${dias} du` }]} />
        <div class="ge-controles">
          <button type="button" class="ge-reset" onClick={() => { if (dias <= 0) setDias(du0); setTocando(!tocando); }}>{tocando ? '⏸ Pausar' : '▶ Fazer o tempo passar'}</button>
          {ctlDias}{ctlVol}
        </div>
      </>;
      break;
    }
    case 'gregas-ao-longo-do-preco': {
      const g = gregasAoLongo(tipo, K, xs, Tano, vol);
      const p = gregasAoLongo(tipo, K, [preco], Tano, vol)[0];
      leitura = `Com o ativo a R$ ${num(preco)} e ${dias === 0 ? 'no último pregão' : `${dias} du`}: delta ${num(p.delta, 3)}, gama ${num(p.gama, 3)}, theta ${num(p.theta, 3)} por dia útil, vega ${num(p.vega, 3)} por p.p. ${notaTheta(g)}`.trim();
      const graf = (k: 'delta' | 'gama' | 'theta' | 'vega', nome: string) =>
        <Linhas xs={xs} titulo={`${nome} contra o preço`} marcador={preco} rotX={faixaR} series={[{ ys: g.map((x) => x[k]), classe: 'md-s1', nome }]} />;
      corpo = <>
        <div class="md-grade">{graf('delta', 'Delta')}{graf('gama', 'Gama')}{graf('theta', 'Theta (por dia útil)')}{graf('vega', 'Vega (por p.p.)')}</div>
        <div class="ge-controles">{ctlPreco}{ctlDias}{ctlVol}</div>
      </>;
      break;
    }
    case 'gregas-no-tempo': {
      const spots = tipo === 'call' ? [K * 1.1, K, K * 0.9] : [K * 0.9, K, K * 1.1];
      const series = deltaNoTempo(tipo, K, spots, du0, vol);
      const eixo = Array.from({ length: du0 + 1 }, (_, i) => du0 - i);
      leitura = `Faltando ${du0} du: dentro do dinheiro ${num(series[0][0], 2)}, no dinheiro ${num(series[1][0], 2)}, fora ${num(series[2][0], 2)}. No último pregão: ${num(series[0][du0], 2)}, ${num(series[1][du0], 2)}, ${num(series[2][du0], 2)}.`;
      corpo = <>
        <Linhas xs={eixo.map((_, i) => i)} titulo="Delta até o vencimento" rotX={(i) => `${Math.round(du0 - i)} du`}
          series={[{ ys: series[0], classe: 'md-s2', nome: `dentro do dinheiro (R$ ${num(spots[0])})` }, { ys: series[1], classe: 'md-s1', nome: `no dinheiro (R$ ${num(spots[1])})` }, { ys: series[2], classe: 'md-s3', nome: `fora do dinheiro (R$ ${num(spots[2])})` }]} />
        <div class="ge-controles">{ctlVol}</div>
      </>;
      break;
    }
    case 'volatilidade': {
      const vols = Array.from({ length: 116 }, (_, i) => 0.05 + i * 0.01);
      const ps = premioPorVol(tipo, op.spot, K, du0 / DIAS_UTEIS_ANO, vols);
      const q = quedaDeVol(tipo, op.spot, K, du0 / DIAS_UTEIS_ANO, vol, volDepois);
      leitura = `Vol de ${pct(vol)} para ${pct(volDepois)}, com o mesmo preço e o mesmo prazo: o prêmio vai de R$ ${num(q.antes)} para R$ ${num(q.depois)} (${q.perda >= 0 ? 'cai' : 'sobe'} R$ ${num(Math.abs(q.perda))}). ${fraseQuedaDeVol(q)}`.trim();
      corpo = <>
        <Linhas xs={vols} titulo="Prêmio contra a volatilidade" marcador={vol} rotX={(v) => pct(v)} series={[{ ys: ps, classe: 'md-s1', nome: 'prêmio' }]} />
        <div class="ge-controles">
          {slider('Vol antes do evento', pct(vol), vol, 0.05, 1.2, 0.01, setVol)}
          {slider('Vol depois do evento', pct(volDepois), volDepois, 0.05, 1.2, 0.01, setVolDepois)}
        </div>
      </>;
      break;
    }
    case 'probabilidade': {
      const amplo = Array.from({ length: 401 }, (_, i) => op.spot * (0.5 + i / 400));
      const s = comprado ? 1 : -1;
      const ys = amplo.map((x) => s * ((tipo === 'call' ? Math.max(x - K, 0) : Math.max(K - x, 0)) - op.premio));
      const dens = densidade(op.spot, amplo, du0 / DIAS_UTEIS_ANO, vol);
      const p = probLucroPosicao(tipo, comprado, K, op.premio, op.spot, du0 / DIAS_UTEIS_ANO, vol);
      const escala = Math.max(...ys.map(Math.abs)) / (Math.max(...dens) || 1) * 0.6;
      const be = tipo === 'call' ? K + op.premio : K - op.premio;
      leitura = `${comprado ? 'Comprado' : 'Vendido'} na ${tipo.toUpperCase()} a R$ ${num(op.premio)}: equilíbrio em R$ ${num(be)}. Probabilidade de terminar no lucro, pelo modelo: ${pct(p, 0)}.`;
      corpo = <>
        <Linhas xs={amplo} titulo="Payoff no vencimento e distribuição de preços" marcador={op.spot} rotX={faixaR} area={dens.map((d) => d * escala)}
          series={[{ ys, classe: 'md-s1', nome: `resultado no vencimento (${comprado ? 'comprado' : 'vendido'})` }]} />
        <div class="ge-controles">
          <div class="jp-tipo" role="group" aria-label="Lado">
            <button type="button" aria-pressed={comprado} onClick={() => setComprado(true)}>Comprado</button>
            <button type="button" aria-pressed={!comprado} onClick={() => setComprado(false)}>Vendido</button>
          </div>
          {ctlVol}
        </div>
      </>;
      break;
    }
  }

  return (
    <div class="md">
      <div class="jp-topo">
        <div class="jp-tipo" role="group" aria-label="Tipo de opção">
          {(['call', 'put'] as const).map((t) => <button type="button" aria-pressed={tipo === t} onClick={() => { setTipo(t); setPreco(dados[t].spot); setVol(Math.round(dados[t].vol * 100) / 100); setVolDepois(Math.max(0.05, Math.round(dados[t].vol * 100 - 15) / 100)); setDias(diasUteis(dados[t].data, dados[t].venc)); setTocando(false); }}>{t.toUpperCase()}</button>)}
        </div>
        <p class="jp-op"><b>{op.ticker}</b> · strike R$ {num(op.strike)} · vence {op.venc.slice(8, 10)}/{op.venc.slice(5, 7)} · vol implícita {pct(op.vol)} (grade de {op.data.slice(8, 10)}/{op.data.slice(5, 7)})</p>
      </div>
      {corpo}
      <p class="jp-comentario" aria-live={tocando ? 'off' : 'polite'}>{leitura}</p>
    </div>
  );
}
