#!/usr/bin/env node
// Nova grade em um comando: importa a planilha do opcoes.net.br, gera os candles do OHLCV do TradingView,
// aponta src/data/laboratorio/fontes.json para os dois, otimiza as montagens, builda e testa. Para no primeiro erro.
//
// Uso: node scripts/nova_grade.mjs PLANILHA.xlsx OHLCV.json [--plano]
//   --plano  só imprime os passos, sem executar.
import { readFileSync, writeFileSync, copyFileSync, rmSync, mkdtempSync } from 'node:fs';
import { executar } from './lib/executar.mjs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const args = process.argv.slice(2);
const plano = args.includes('--plano');
const [planilha, ohlcv] = args.filter((a) => !a.startsWith('--'));
if (!planilha || !ohlcv) {
  console.error('Uso: node scripts/nova_grade.mjs PLANILHA.xlsx OHLCV.json [--plano]');
  process.exit(1);
}
const RAIZ = new URL('../', import.meta.url);
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';

const passos = [
  { nome: `python -I scripts/importar_grade.py ${planilha} src/data/grades/bbas3-<data>.json`, cmd: ['python', ['-I', 'scripts/importar_grade.py', planilha, '<tmp>']] },
  { nome: `node scripts/atualizar_candles.mjs ${ohlcv} src/data/candles/bbas3-<data>.json`, cmd: [process.execPath, ['scripts/atualizar_candles.mjs', ohlcv, '<candles>']] },
  { nome: 'escrever src/data/laboratorio/fontes.json', cmd: null },
  { nome: 'node scripts/otimizar_montagens.mjs (grade e candles de fontes.json)', cmd: [process.execPath, ['scripts/otimizar_montagens.mjs']] },
  { nome: 'npm run build', cmd: [npm, ['run', 'build']] },
  { nome: 'npm test', cmd: [npm, ['test']] },
];
if (plano) { for (const p of passos) console.log(p.nome); process.exit(0); }

const rodar = (nome, [exe, argv]) => {
  console.log(`\n▶ ${nome}`);
  const r = executar(exe, argv, { cwd: RAIZ });
  if (r.status !== 0) { console.error(`✖ falhou: ${nome} (${r.causa})`); process.exit(r.status || 1); }
};

// 1. Grade para um arquivo temporário; a data vem do próprio JSON importado.
const tmp = join(mkdtempSync(join(tmpdir(), 'grade-')), 'grade.json');
rodar(passos[0].nome, [passos[0].cmd[0], passos[0].cmd[1].map((a) => (a === '<tmp>' ? tmp : a))]);
const grade = JSON.parse(readFileSync(tmp, 'utf8'));
const data = grade.data, ativo = String(grade.ativo).toLowerCase();
const gradePath = `src/data/grades/${ativo}-${data}.json`, candlesPath = `src/data/candles/${ativo}-${data}.json`;
// Cópia + remoção: rename falha entre discos diferentes (ex.: TEMP em C: e repositório em D:).
copyFileSync(tmp, new URL(gradePath, RAIZ)); rmSync(tmp, { force: true });
console.log(`grade ${data} · ${grade.series.length} séries → ${gradePath}`);

// 2. Candles do OHLCV.
rodar(passos[1].nome, [passos[1].cmd[0], passos[1].cmd[1].map((a) => (a === '<candles>' ? candlesPath : a))]);
const candles = JSON.parse(readFileSync(new URL(candlesPath, RAIZ), 'utf8'));
if (candles[candles.length - 1].d !== data) { console.error(`✖ último candle (${candles[candles.length - 1].d}) não é a data da grade (${data})`); process.exit(1); }

// 3. fontes.json.
writeFileSync(new URL('src/data/laboratorio/fontes.json', RAIZ), JSON.stringify({ grade: gradePath, candles: candlesPath }, null, 2) + '\n');
console.log(`\n▶ ${passos[2].nome}`);

// 4–6. Otimização, build e testes.
for (const p of passos.slice(3)) rodar(p.nome, p.cmd);
console.log(`\n✔ grade de ${data} publicada nos dados do site. Confira docs/revisao/${data}-validacao-estruturas.md e commite.`);
