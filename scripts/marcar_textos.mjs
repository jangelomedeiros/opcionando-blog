#!/usr/bin/env node
// Migração repetível: troca os números dos textos de estruturas.json por marcadores (src/lib/catalogo/textos.ts)
// e grava a seção 1 do relatório de revisão. Rode a partir do texto original:
//   node scripts/marcar_textos.mjs tests/fixtures/estruturas-antes-dos-marcadores.json
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { formatar, valoresDaReferencia } from '../src/lib/catalogo/textos.ts';

const ORIGEM = process.argv[2] ?? 'tests/fixtures/estruturas-antes-dos-marcadores.json';
const DESTINO = 'src/data/laboratorio/estruturas.json';
const RELATORIO = 'docs/revisao/2026-11-15-textos-e-rotulos.md';

function candidatos(v) {
  const c = [];
  v.pernas.forEach((p, i) => { if (p.k !== null) c.push([`p${i + 1}.k`, p.k]); });
  c.push(['spot', v.spot]);
  v.be.forEach((b, i) => c.push([`be${i + 1}`, b]));
  v.pernas.forEach((p, i) => c.push([`p${i + 1}.px`, p.px]));
  v.comparacao.forEach((p, i) => { if (p.k !== null) c.push([`c${i + 1}.k`, p.k]); c.push([`c${i + 1}.px`, p.px]); });
  v.pernas.forEach((a, i) => v.pernas.forEach((b, j) => {
    if (i < j && a.k !== null && b.k !== null) c.push([`p${j + 1}.k-p${i + 1}.k`, Math.abs(b.k - a.k)]);
  }));
  v.pernas.forEach((p, i) => {
    if (p.k !== null) { c.push([`p${i + 1}.k+p${i + 1}.px`, p.k + p.px]); c.push([`p${i + 1}.k-p${i + 1}.px`, p.k - p.px]); }
  });
  return c;
}

const estruturas = JSON.parse(readFileSync(ORIGEM, 'utf8'));
// Preserva campos acrescentados depois da migração (ex.: rótulos nivel/objetivo).
const atuais = existsSync(DESTINO) ? Object.fromEntries(JSON.parse(readFileSync(DESTINO, 'utf8')).map((e) => [e.id, e])) : {};
const linhas = [];
for (const e of estruturas) {
  for (const campo of ['nivel', 'objetivo']) if (atuais[e.id]?.[campo]) e[campo] = atuais[e.id][campo];
  let ambiguos = 0;
  const cand = candidatos(valoresDaReferencia(e));
  const marcar = (texto) => texto.replace(/\d+,\d{2}/g, (n) => {
    const servem = [...new Set(cand.filter(([, x]) => formatar(x) === n).map(([m]) => m))];
    if (!servem.length) { linhas.push(`| ${e.id} | ${n} | — | sem correspondência: continua fixo |`); return n; }
    if (servem.length > 1) ambiguos++;
    linhas.push(`| ${e.id} | ${n} | \`{${servem[0]}}\` | ${servem.length > 1 ? `conferir (também serviria: ${servem.slice(1).map((s) => `\`{${s}}\``).join(', ')})` : 'ok'} |`);
    return `{${servem[0]}}`;
  });
  e.racional = marcar(e.racional);
  e.esperado = marcar(e.esperado);
  e.notas = e.notas.map(marcar);
  e.marcadores_ambiguos = ambiguos;
}
writeFileSync(DESTINO, JSON.stringify(estruturas, null, 1) + '\n');

if (!existsSync('docs/revisao')) mkdirSync('docs/revisao', { recursive: true });
const secao1 = `## 1. Números dos textos que viraram marcadores

Os textos das estruturas (racional, "o que esperar" e notas) citavam os números do exemplo de 02/10/2026.
Agora cada número vira um marcador que a página preenche com a montagem atual (grade mais recente).
**Nenhuma palavra mudou**: com os valores de 02/10, os marcadores reproduzem o texto original.

**Quando a página usa os números atuais:** só se a remontagem preservou o desenho da estrutura e o texto não tem
nenhum número, percentual, data ou mês fixo nem marcador "conferir". Nos outros casos, o texto e a tabela da aba Visão
mostram o exemplo de 02/10 (com a nota "Exemplo calibrado") e só o gráfico usa a grade mais recente. Para uma estrutura
passar a usar os números atuais, reescreva os trechos fixos dela (veja as linhas "sem correspondência" e "conferir").

- **ok**: só um valor da montagem servia.
- **conferir**: mais de um valor servia; foi usado o primeiro. Confira se o sentido é esse.
- **sem correspondência**: o número não vem direto da montagem; continua fixo e pode ficar desatualizado. Reescreva à mão se precisar.

| Estrutura | Número | Marcador | Situação |
|---|---|---|---|
${linhas.join('\n')}
`;
const atual = existsSync(RELATORIO) ? readFileSync(RELATORIO, 'utf8') : '';
const secao2 = atual.includes('## 2.') ? atual.slice(atual.indexOf('## 2.')) : '';
writeFileSync(RELATORIO, `# Revisão: textos e rótulos do catálogo (rascunho do Claude)\n\n${secao1}\n${secao2}`);
const contar = (s) => linhas.filter((l) => l.includes(s)).length;
console.log(`${linhas.length} números: ${contar('| ok |')} ok, ${contar('conferir')} conferir, ${contar('sem correspondência')} sem correspondência`);
