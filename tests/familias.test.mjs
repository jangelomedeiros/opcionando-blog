import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { FAM_COR, FAM_ORDEM } from '../src/lib/familias.ts';
import { razaoContraste, lerTokens } from '../scripts/lib/contraste.mjs';

const temas = lerTokens(readFileSync(new URL('../src/styles/tokens.css', import.meta.url), 'utf8'));

test('12 famílias na ordem atual', () => {
  assert.deepEqual(FAM_ORDEM, [
    'Base', 'Direcionais', 'Proteção patrimonial', 'Volatilidade', 'Tempo / rolagem', 'Asas / proteção',
    'Booster', 'Módulos', 'Híbridas / hedge', 'Gradiente linear', 'Hedge · ajustes', 'Mônadas',
  ]);
  assert.deepEqual(Object.keys(FAM_COR), FAM_ORDEM);
});

test('cada cor tem contraste ≥ 3 contra --superficie nos dois temas', () => {
  const falhas = [];
  for (const [fam, cor] of Object.entries(FAM_COR)) {
    for (const [tema, t] of Object.entries(temas)) {
      const r = razaoContraste(cor, t['--superficie']);
      if (r < 3) falhas.push(`${fam} ${cor} em ${tema}: ${r.toFixed(2)}`);
    }
  }
  assert.deepEqual(falhas, []);
});
