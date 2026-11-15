/** @jsxImportSource preact */
// Ilha da Jornada do prêmio: uma opção, os dois lados da mesa, o mercado andando dia a dia.
// A matemática vem de src/lib/conceitos/jornada.ts (testada).
import { useEffect, useMemo, useState } from 'preact/hooks';
import { jornada, comentario, type Opcao } from '../../lib/conceitos/jornada.ts';

export interface Trajetoria { id: string; nome: string; grupo: 'real' | 'cenario'; precos: number[] }
export interface DadosJornada { call: Opcao; put: Opcao; trajetorias: Trajetoria[] }

const num = (v: number, d = 2) => Math.abs(v).toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d });
const sinal = (v: number) => (v > 0.0005 ? '+' : v < -0.0005 ? '−' : '');
const reais = (v: number) => `${sinal(v)}R$ ${num(v)}`;
const classe = (v: number) => (Math.abs(v) < 0.005 ? 'neutro' : v > 0 ? 'pos' : 'neg');
const dataBr = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`;
const W = 640, H = 190, L = 48, R = 12, T = 12, B = 26;

function escala(n: number, ys: number[]) {
  const lo = Math.min(...ys), hi = Math.max(...ys), folga = (hi - lo || 1) * 0.08;
  return {
    X: (i: number) => L + (i / Math.max(n, 1)) * (W - L - R),
    Y: (y: number) => T + ((hi + folga - y) / (hi - lo + 2 * folga || 1)) * (H - T - B),
    lo: lo - folga, hi: hi + folga,
  };
}
const linha = (pts: [number, number][]) => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');

export default function Jornada({ dados }: { dados: DadosJornada }) {
  const [tipo, setTipo] = useState<'call' | 'put'>('call');
  const [trajId, setTrajId] = useState(dados.trajetorias[0].id);
  const [choque, setChoque] = useState(0);
  const [n, setN] = useState(0);
  const [tocando, setTocando] = useState(false);
  const op = tipo === 'call' ? dados.call : dados.put;
  const traj = dados.trajetorias.find((t) => t.id === trajId) ?? dados.trajetorias[0];
  const dias = useMemo(() => jornada(op, traj.precos, choque), [op, traj, choque]);
  const ultimo = dias.length - 1;
  const d = dias[Math.min(n, ultimo)];

  useEffect(() => {
    if (!tocando) return;
    const id = setInterval(() => setN((x) => { if (x >= ultimo) { setTocando(false); return x; } return x + 1; }), 400);
    return () => clearInterval(id);
  }, [tocando, ultimo]);

  const ep = escala(ultimo, [...traj.precos, op.strike]);
  const precoPts = traj.precos.map((p, i) => [ep.X(i), ep.Y(p)] as [number, number]);
  const ev = escala(ultimo, [0, op.premio, ...dias.map((x) => x.valor)]);
  const ate = dias.slice(0, d.n + 1);
  const areaInt = ate.length ? `${linha(ate.map((x) => [ev.X(x.n), ev.Y(x.intrinseco)]))} L${ev.X(d.n).toFixed(1)},${ev.Y(0).toFixed(1)} L${ev.X(0).toFixed(1)},${ev.Y(0).toFixed(1)} Z` : '';
  const areaExt = ate.length ? `${linha(ate.map((x) => [ev.X(x.n), ev.Y(x.valor)]))} ${linha([...ate].reverse().map((x) => [ev.X(x.n), ev.Y(x.intrinseco)])).replace(/^M/, 'L')} Z` : '';
  const lado = (titulo: string, papel: string, sinalLado: 1 | -1, cls: string) => {
    const r = d.comprador * sinalLado, c = d.contrib;
    return (
      <div class={`jp-lado ${cls}`}>
        <b>{titulo}</b>
        <small>{papel}</small>
        <span class={`jp-res ${classe(r)}`}>{reais(r)}</span>
        <small>por opção · {reais(r * 100)} por lote de 100</small>
        <ul>
          <li><span>Preço</span><span class={classe(c.preco * sinalLado)}>{reais(c.preco * sinalLado)}</span></li>
          <li><span>Tempo</span><span class={classe(c.tempo * sinalLado)}>{reais(c.tempo * sinalLado)}</span></li>
          <li><span>Vol</span><span class={classe(c.vol * sinalLado)}>{reais(c.vol * sinalLado)}</span></li>
        </ul>
      </div>
    );
  };
  const direito = tipo === 'call' ? 'comprar' : 'vender';

  return (
    <div class="jp">
      <div class="jp-topo">
        <div class="jp-tipo" role="group" aria-label="Tipo de opção">
          {(['call', 'put'] as const).map((t) => <button type="button" aria-pressed={tipo === t} onClick={() => { setTipo(t); setN(0); }}>{t.toUpperCase()}</button>)}
        </div>
        <p class="jp-op"><b>{op.ticker}</b> · {op.tipo.toUpperCase()} strike R$ {num(op.strike)} · vence {dataBr(op.venc)} · prêmio de entrada <b>R$ {num(op.premio)}</b> (BBAS3 a R$ {num(op.spot)} em {dataBr(op.data)})</p>
      </div>

      <div class="jp-bloco">
        <label class="jp-traj">Trajetória do preço
          <select onChange={(e) => { setTrajId((e.currentTarget as HTMLSelectElement).value); setN(0); setTocando(false); }}>
            <optgroup label="Trechos reais de BBAS3">{dados.trajetorias.filter((t) => t.grupo === 'real').map((t) => <option value={t.id} selected={t.id === trajId}>{t.nome}</option>)}</optgroup>
            <optgroup label="Cenários">{dados.trajetorias.filter((t) => t.grupo === 'cenario').map((t) => <option value={t.id} selected={t.id === trajId}>{t.nome}</option>)}</optgroup>
          </select>
        </label>
        <svg class="jp-svg" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Preço da ação ao longo dos dias">
          <line class="jp-strike" x1={L} x2={W - R} y1={ep.Y(op.strike)} y2={ep.Y(op.strike)} />
          <text class="g-rot" x={W - R} y={ep.Y(op.strike) - 4} text-anchor="end">strike {num(op.strike)}</text>
          <path class="jp-futuro" d={linha(precoPts)} />
          <path class="jp-preco" d={linha(precoPts.slice(0, d.n + 1))} />
          <line class="g-spot" x1={ep.X(d.n)} x2={ep.X(d.n)} y1={T} y2={H - B} />
          <circle class="g-ponto" cx={ep.X(d.n)} cy={ep.Y(d.spot)} r="4.5" />
          <text class="g-rot" x={L - 6} y={ep.Y(ep.hi) + 10} text-anchor="end">{num(ep.hi)}</text>
          <text class="g-rot" x={L - 6} y={ep.Y(ep.lo)} text-anchor="end">{num(ep.lo)}</text>
        </svg>
        <div class="jp-tempo">
          <button type="button" class="ge-reset" aria-label={tocando ? 'Pausar' : 'Fazer o tempo correr'} onClick={() => { if (d.n >= ultimo) setN(0); setTocando(!tocando); }}>{tocando ? '⏸' : '▶'}</button>
          <label>
            <span>{dataBr(d.data)} · dia {d.n} de {ultimo} · ação a <b>R$ {num(d.spot)}</b></span>
            <input type="range" min="0" max={ultimo} step="1" value={d.n} onInput={(e) => { setTocando(false); setN(+(e.currentTarget as HTMLInputElement).value); }} />
          </label>
          <label>
            <span>Vol implícita <b>{num(op.vol * 100 + choque, 0)}%</b> ({choque > 0 ? '+' : choque < 0 ? '−' : ''}{Math.abs(choque)} p.p.)</span>
            <input type="range" min="-15" max="15" step="1" value={choque} onInput={(e) => setChoque(+(e.currentTarget as HTMLInputElement).value)} />
          </label>
        </div>
      </div>

      <div class="jp-lados">
        {lado('Comprador', `Pagou R$ ${num(op.premio)} · direito de ${direito} a R$ ${num(op.strike)}`, 1, 'jp-comprador')}
        {lado('Vendedor', `Recebeu R$ ${num(op.premio)} · obrigação de ${tipo === 'call' ? 'vender' : 'comprar'} a R$ ${num(op.strike)}`, -1, 'jp-vendedor')}
      </div>

      <div class="jp-bloco">
        <p class="jp-titulo">Valor da opção: <span class="k-int">intrínseco</span> + <span class="k-ext">extrínseco (tempo e vol)</span> · hoje R$ {num(d.valor)} = {num(d.intrinseco)} + {num(Math.max(d.extrinseco, 0))}</p>
        <svg class="jp-svg" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Valor da opção ao longo dos dias">
          <path class="jp-futuro" d={linha(dias.map((x) => [ev.X(x.n), ev.Y(x.valor)]))} />
          <path class="jp-ext" d={areaExt} />
          <path class="jp-int" d={areaInt} />
          <line class="jp-premio" x1={L} x2={W - R} y1={ev.Y(op.premio)} y2={ev.Y(op.premio)} />
          <text class="g-rot" x={W - R} y={ev.Y(op.premio) - 4} text-anchor="end">prêmio de entrada {num(op.premio)}</text>
          <line class="g-zero" x1={L} x2={W - R} y1={ev.Y(0)} y2={ev.Y(0)} />
          <text class="g-rot" x={L - 6} y={ev.Y(0) + 4} text-anchor="end">0</text>
        </svg>
      </div>

      <p class="jp-comentario" aria-live="polite">💬 {comentario(op, d)}</p>
    </div>
  );
}
