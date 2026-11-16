/** @jsxImportSource preact */
// "Dinâmica do lucro no tempo": resultado dia a dia até o 1º vencimento, com o preço parado, a +1σ e a −1σ.
// Renderizada no build (aparece sem JavaScript) e, hidratada, acompanha o simulador de manejo:
// depois de um ajuste, recomeça do cenário do ajuste e mostra tracejada a linha "sem o ajuste".
import { useEffect, useMemo, useState } from 'preact/hooks';
import { trajetoria, fraseTrajetoria, pontoDePartida, paradoEm, rs } from '../../lib/catalogo/trajetoria.ts';
import { segmentosPorSinal, escalas, caminho, area, type Ponto } from '../../lib/catalogo/grafico.ts';
import type { Cenario, Posicao } from '../../lib/motor/posicao.ts';

interface Props { posicao: Posicao; cenario: Cenario; sigma: number }
interface Simulacao { posicao: Posicao; ajustes: { nome: string; cenario: Cenario }[] }

const CAIXA = { L: 64, R: 140, T: 12, B: 26, W: 560, H: 220 };
// Mesmo formato (e o mesmo limiar de sinal) da frase: sem o "R$ " nos rótulos do gráfico.
const br = (v: number) => rs(v).replace('R$ ', '');
const dm = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`;
const pts = (ys: number[]): Ponto[] => ys.map((y, i) => [i, y]);

export default function TrajetoriaIlha({ posicao, cenario, sigma }: Props) {
  const [sim, setSim] = useState<Simulacao>({ posicao, ajustes: [] });
  useEffect(() => {
    const ouvir = (ev: Event) => setSim((ev as CustomEvent<Simulacao>).detail);
    window.addEventListener('opcionando:simulacao', ouvir);
    return () => window.removeEventListener('opcionando:simulacao', ouvir);
  }, []);

  const nAj = sim.ajustes.length;
  const partida = pontoDePartida(sim.ajustes, cenario);
  const t = useMemo(() => trajetoria(sim.posicao, partida, sigma), [sim, sigma]);
  const semAjuste = useMemo(() => (nAj ? paradoEm(posicao, partida, t.datas) : null), [sim, t]);
  const n = t.datas.length - 1;
  const titulo = <h3 class="mini">Dinâmica do lucro no tempo{nAj > 0 && <span class="validacao-data">depois de {nAj} {nAj === 1 ? 'ajuste' : 'ajustes'}</span>}</h3>;

  if (n < 2) {
    if (!nAj) return null;
    return (
      <div class="traj">
        {titulo}
        <p>A posição simulada não tem mais dias a percorrer até um vencimento: o resultado fica em <b>R$ {br(t.parado[n])}</b> por unidade.</p>
      </div>
    );
  }

  const xs = t.datas.map((_, i) => i);
  const { X, Y, yMin, yMax } = escalas(xs, [t.parado, t.alta, t.baixa, ...(semAjuste ? [semAjuste] : [])], CAIXA);
  const segs = segmentosPorSinal(xs, t.parado);
  const marcas = [...new Set([0, Math.round(n / 2), n])];
  // Rótulos no fim das linhas, afastados para não se sobreporem.
  const fins = [
    { k: 'parado', nome: 'parado', y: t.parado[n] }, { k: 'alta', nome: '+1σ', y: t.alta[n] }, { k: 'baixa', nome: '−1σ', y: t.baixa[n] },
    ...(semAjuste ? [{ k: 'antes', nome: 'antes', y: semAjuste[n] }] : []),
  ].map((f) => ({ ...f, py: Y(f.y) })).sort((a, b) => a.py - b.py);
  for (let i = 1; i < fins.length; i++) if (fins[i].py - fins[i - 1].py < 13) fins[i].py = fins[i - 1].py + 13;
  const frase = fraseTrajetoria(t);

  return (
    <div class="traj">
      {titulo}
      {nAj > 0 && <p class="nota">A partir de {dm(partida.data)}, com o preço a R$ {br(partida.spot)}, onde o último ajuste foi simulado. O resultado inclui o que já foi realizado.</p>}
      <svg class="traj-svg" viewBox={`0 0 ${CAIXA.W} ${CAIXA.H}`} role="img" aria-label={`Resultado por unidade, dia a dia até o primeiro vencimento, com o preço parado, subindo 1 desvio e caindo 1 desvio. ${frase}`}>
        <line class="g-zero" x1={CAIXA.L} x2={CAIXA.W - CAIXA.R} y1={Y(0)} y2={Y(0)} />
        {[yMax, yMin].filter((v) => Math.abs(v) > 0.005).map((v) => <text class="g-rot" x={CAIXA.L - 6} y={Y(v * 0.92) + 4} text-anchor="end">{br(v * 0.92)}</text>)}
        <text class="g-rot" x={CAIXA.L - 6} y={Y(0) + 4} text-anchor="end">0</text>
        {marcas.map((i) => (
          <text class="g-rot" x={X(i)} y={CAIXA.H - 8} text-anchor={i === 0 ? 'start' : i === n ? 'end' : 'middle'}>
            {i === 0 ? `${nAj ? 'ajuste' : 'hoje'} ${dm(t.datas[0])}` : i === n ? `venc. ${dm(t.datas[n])}` : `${Math.max(n - i - 1, 0)} du`}
          </text>
        ))}
        {segs.map((s) => <path class={s.sinal > 0 ? 'g-area-lucro' : 'g-area-prejuizo'} d={area(s.pontos, X, Y)} />)}
        {semAjuste && <path class="traj-antes" d={caminho(pts(semAjuste), X, Y)} />}
        <path class="traj-alta" d={caminho(pts(t.alta), X, Y)} />
        <path class="traj-baixa" d={caminho(pts(t.baixa), X, Y)} />
        {segs.map((s) => <path class={`traj-parado ${s.sinal > 0 ? 'g-lucro' : 'g-prejuizo'}`} d={caminho(s.pontos, X, Y)} />)}
        {fins.map((f) => <text class={`g-rot traj-rot-${f.k}`} x={CAIXA.W - CAIXA.R + 6} y={f.py + 4}>{f.nome} {br(f.y)}</text>)}
      </svg>
      <p class="traj-legenda">
        <span><i class="k-parado"></i>preço parado (o tempo sozinho)</span><span><i class="k-alta"></i>preço subindo 1σ</span><span><i class="k-baixa"></i>preço caindo 1σ</span>
        {semAjuste && <span><i class="k-antes"></i>antes: sem o ajuste, preço parado</span>}
      </p>
      <p>{frase}{semAjuste && ` Sem o ajuste, com o preço parado, a posição original terminaria esse período em R$ ${br(semAjuste[n])}.`}</p>
      <p class="nota">Resultado por unidade a cada dia útil, com a vol das opções congelada na de entrada. Os caminhos de ±1σ abrem com a raiz do tempo, na vol realizada de {Math.round(sigma * 100)}%: cerca de dois terços dos pregões terminam entre eles. Simule um ajuste na aba Manejo e este gráfico passa a mostrar a posição ajustada.</p>
    </div>
  );
}
