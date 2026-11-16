#!/usr/bin/env node
// Gera o arquivo de candles do site a partir do OHLCV diário baixado do TradingView.
// Uso: node scripts/atualizar_candles.mjs dados-brutos/AAAA-MM-DD/ohlcv/BBAS3.json src/data/candles/bbas3-AAAA-MM-DD.json
import { readFileSync, writeFileSync } from 'node:fs';
import { candlesDeOhlcv } from './lib/candles.mjs';

const [entrada, saida] = process.argv.slice(2);
if (!entrada || !saida) {
  console.error('Uso: node scripts/atualizar_candles.mjs OHLCV.json SAIDA.json');
  process.exit(1);
}
const bruto = JSON.parse(readFileSync(entrada, 'utf8'));
const candles = candlesDeOhlcv(bruto.bars ?? bruto, 123);
writeFileSync(saida, JSON.stringify(candles) + '\n');
console.log(`${candles.length} pregões · ${candles[0].d} a ${candles[candles.length - 1].d} · fechamento ${candles[candles.length - 1].c}`);
