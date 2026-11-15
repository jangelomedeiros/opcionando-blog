/** @jsxImportSource preact */
// Ilha interativa do gráfico de payoff: preço, dias até o 1º vencimento e choque de vol.
// Toda a matemática vem do motor (src/lib/motor) e da geometria testada (src/lib/catalogo/grafico.ts).
import { useMemo, useState } from 'preact/hooks';
import { curva, curvaVencimento, gregasPosicao, primeiroVencimento, resultado, type Cenario, type Posicao } from '../../lib/motor/posicao.ts';
import { metricasVencimento } from '../../lib/motor/metricas.ts';
import { diasUteis, somarDiasUteis } from '../../lib/motor/calendario.ts';
import { faixaPrecos, segmentosPorSinal, escalas, caminho, area, type Ponto } from '../../lib/catalogo/grafico.ts';

export interface DadosGrafico { posicao: Posicao; cenario: Cenario; comparacao?: Posicao | null; rotulo: string; rotuloComparacao?: string | null }

const CAIXA = { L: 52, R: 14, T: 14, B: 34, W: 640, H: 330 };
const num = (v: number, d = 2) => Math.abs(v).toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d });
const sinal = (v: number) => (v > 0.0005 ? '+' : v < -0.0005 ? '−' : '');
const reais = (v: number) => `${sinal(v)}R$ ${num(v)}`;
const dataBr = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(2, 4)}`;

export default function GraficoEstrutura({ dados }: { dados: DadosGrafico }) {
  const { posicao, cenario: c0, comparacao } = dados;
  const venc1 = primeiroVencimento(posicao);
  const duMax = venc1 ? diasUteis(c0.data, venc1) : 0;
  const [preco, setPreco] = useState(c0.spot);
  const [du, setDu] = useState(duMax);
  const [choque, setChoque] = useState(0);

  const base = useMemo(() => {
    const xs = faixaPrecos(posicao, c0.spot);
    const yv = curvaVencimento(posicao, xs);
    const yc = comparacao ? curvaVencimento(comparacao, xs) : null;
    return { xs, yv, yc, metricas: metricasVencimento(posicao) };
  }, [posicao, comparacao, c0.spot]);

  const data = du >= duMax ? c0.data : du <= 0 && venc1 ? venc1 : somarDiasUteis(c0.data, duMax - du);
  const cen: Cenario = { data, spot: preco, choqueVol: choque };
  const yh = useMemo(() => curva(posicao, { data, choqueVol: choque }, base.xs), [posicao, data, choque, base.xs]);
  const res = resultado(posicao, cen);
  const g = gregasPosicao(posicao, cen);
  const m = base.metricas;

  const { X, Y, yMin, yMax } = escalas(base.xs, [base.yv, yh, ...(base.yc ? [base.yc] : [])], CAIXA);
  const ticksY = [yMax * 0.85, yMin * 0.85].filter((y) => Math.abs(y) > (yMax - yMin) * 0.12);
  const classeRes = Math.abs(res) < 0.005 ? 'neutro' : res > 0 ? 'pos' : 'neg';
  const pts = (ys: number[]) => base.xs.map((x, i) => [x, ys[i]] as Ponto);
  const segs = segmentosPorSinal(base.xs, base.yv);
  const lo = base.xs[0], hi = base.xs[base.xs.length - 1];
  const precoMin = Math.max(0.01, +(c0.spot * 0.7).toFixed(2)), precoMax = +(c0.spot * 1.3).toFixed(2);
  const ticksX = Array.from({ length: 5 }, (_, i) => lo + ((hi - lo) * i) / 4);

  return (
    <div class="ge">
      <svg class="ge-svg" viewBox={`0 0 ${CAIXA.W} ${CAIXA.H}`} role="img" aria-label={`Gráfico de resultado de ${dados.rotulo}`}>
        {ticksX.map((x) => <line class="g-grade" x1={X(x)} x2={X(x)} y1={CAIXA.T} y2={CAIXA.H - CAIXA.B} />)}
        {segs.map((s) => <path class={s.sinal > 0 ? 'g-area-lucro' : 'g-area-prejuizo'} d={area(s.pontos, X, Y)} />)}
        <line class="g-zero" x1={CAIXA.L} x2={CAIXA.W - CAIXA.R} y1={Y(0)} y2={Y(0)} />
        {base.yc && <path class="g-comp" d={caminho(pts(base.yc), X, Y)} />}
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
        {base.yc && <span><i class="k-comp"></i>{dados.rotuloComparacao || 'posição original'}</span>}
      </p>

      <div class="ge-controles">
        <label>
          <span>Preço do ativo <b>R$ {num(preco)}</b></span>
          <input type="range" min={precoMin} max={precoMax} step="0.01" value={preco} onInput={(e) => setPreco(+(e.currentTarget as HTMLInputElement).value)} />
        </label>
        {duMax > 0 && (
          <label>
            <span>Dias úteis até o vencimento <b>{du}</b></span>
            <input type="range" min="0" max={duMax} step="1" value={du} onInput={(e) => setDu(+(e.currentTarget as HTMLInputElement).value)} />
          </label>
        )}
        <label>
          <span>Volatilidade <b>{choque > 0 ? '+' : choque < 0 ? '−' : ''}{Math.abs(choque)} p.p.</b></span>
          <input type="range" min="-20" max="20" step="1" value={choque} onInput={(e) => setChoque(+(e.currentTarget as HTMLInputElement).value)} />
        </label>
        <button type="button" class="ge-reset" onClick={() => { setPreco(c0.spot); setDu(duMax); setChoque(0); }}>Voltar ao início</button>
      </div>

      <div class="ge-painel">
        <div class={`ge-res ${classeRes}`} aria-live="polite">
          <span>Resultado neste cenário</span>
          <b>{reais(res)}</b>
          <small>por unidade · {reais(res * 100)} por lote de 100</small>
        </div>
        <dl class="ge-met">
          <div><dt>Ganho máximo</dt><dd class="pos">{m.ganhoMax === null ? 'ilimitado' : reais(m.ganhoMax)}</dd></div>
          <div><dt>Perda máxima</dt><dd class="neg">{m.perdaMax === null ? 'ilimitada' : reais(m.perdaMax)}</dd></div>
          <div><dt>Equilíbrio</dt><dd>{m.equilibrios.length ? m.equilibrios.map((x) => num(x)).join(' · ') : '—'}</dd></div>
        </dl>
        <dl class="ge-gregas">
          <div><dt>Delta</dt><dd>{sinal(g.delta)}{num(g.delta, 3)}</dd></div>
          <div><dt>Gama</dt><dd>{sinal(g.gama)}{num(g.gama, 3)}</dd></div>
          <div><dt>Theta <small>/dia útil</small></dt><dd>{sinal(g.theta)}{num(g.theta, 3)}</dd></div>
          <div><dt>Vega <small>/p.p.</small></dt><dd>{sinal(g.vega)}{num(g.vega, 3)}</dd></div>
        </dl>
      </div>
    </div>
  );
}
