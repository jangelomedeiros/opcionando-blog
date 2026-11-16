// Regressões da revisão final da etapa 4.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { lerMercadoCsv, cenarioInicial } from '../src/lib/catalogo/converter.ts';
import { gradeParaManejo } from '../src/lib/catalogo/gradeManejo.ts';
import { iniciar, aplicar } from '../src/lib/catalogo/simulacao.ts';
import { aplicarAjuste } from '../src/lib/motor/manejo.ts';

const ler = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const ESTRUTURAS = JSON.parse(ler('src/data/laboratorio/estruturas.json'));
const GRADE = JSON.parse(ler('src/data/grades/bbas3-2026-11-13.json'));
const MANEJO = JSON.parse(ler('src/data/laboratorio/manejo.json'));
const m = lerMercadoCsv(ler('src/data/laboratorio/mercado.csv'));
const montar = (id) => {
  const { posicao, cenario } = cenarioInicial(ESTRUTURAS.find((e) => e.id === id), m);
  return { posicao, cenario, grade: gradeParaManejo(posicao, cenario, GRADE) };
};
const caminho = (id, nome) => MANEJO[id].cenarios.flatMap((c) => c.caminhos).find((p) => p.nome === nome);
const existe = new Set(GRADE.series.map((s) => `${s.venc}|${s.strike.toFixed(2)}`));

test('dois caminhos seguidos na mesma perna funcionam', () => {
  const { posicao, cenario, grade } = montar('covered-call');
  let e = aplicar(iniciar(posicao), 'a', caminho('covered-call', 'Rolar para cima e para frente').ops, cenario, grade);
  e = aplicar(e, 'b', caminho('covered-call', 'Encerrar tudo').ops, cenario, grade);
  assert.equal(e.erro, null);
  assert.equal(e.posicao.pernas.length, 0);
  const encerrada = aplicar(e, 'c', [{ op: 'encerrar', perna: 'p2' }], cenario, grade);
  assert.match(encerrada.erro, /já foi encerrada/);
});

test('rolagens de strike caem em contratos que existem no vencimento', () => {
  for (const [id, nome] of [['covered-call', 'Rolar para cima e para frente'], ['booster-call', 'Rolar as vendidas para cima'], ['booster-call', 'Rolar a trava para baixo'], ['cash-put', 'Rolar para cima']]) {
    const { posicao, cenario, grade } = montar(id);
    const { posicao: nova } = aplicarAjuste(posicao, caminho(id, nome).ops, cenario, grade);
    for (const p of nova.pernas.filter((x) => x.tipo !== 'acao')) {
      assert.ok(existe.has(`${p.venc}|${p.strike.toFixed(2)}`), `${id} ${nome}: ${p.strike} em ${p.venc}`);
    }
  }
  const { posicao, cenario, grade } = montar('booster-call');
  const { posicao: nova } = aplicarAjuste(posicao, caminho('booster-call', 'Rolar a trava para baixo').ops, cenario, grade);
  const [k2, k3] = ['p2', 'p3'].map((b) => nova.pernas.find((p) => p.id.startsWith(b)).strike);
  assert.ok(Math.abs((k3 - k2) - 0.5) < 0.011, `largura ${k3 - k2}`);
});

// 'PUT de proteção' da venda coberta saiu: hedge colateral é rejeitado pela metodologia (ver manejo-metodologia.test.mjs).

test('textos corrigidos', () => {
  assert.match(caminho('booster-call', 'Rolar a trava para baixo').descricao, /^Vende a CALL comprada/);
  assert.match(caminho('cash-put', 'Aceitar o exercício').descricao, /no vencimento/i);
});

test('todo caminho simulável aplica com a grade que a página usa', () => {
  const falhas = [];
  for (const [id, d] of Object.entries(MANEJO)) {
    const i = cenarioInicial(ESTRUTURAS.find((e) => e.id === id), m);
    const g = gradeParaManejo(i.posicao, i.cenario, i.fonte === 'mercado' ? GRADE : null);
    for (const c of d.cenarios) for (const p of c.caminhos.filter((x) => x.ops)) {
      const e = aplicar(iniciar(i.posicao), p.nome, p.ops, i.cenario, g);
      if (e.erro) falhas.push(`${id} / ${p.nome}: ${e.erro}`);
    }
  }
  assert.deepEqual(falhas, []);
});
