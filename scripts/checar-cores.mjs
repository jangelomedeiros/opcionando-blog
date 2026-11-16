#!/usr/bin/env node
// Verificador de cores fixas: toda cor do site deve vir de src/styles/tokens.css.
// Uso: node scripts/checar-cores.mjs [dir=src]  → lista ocorrências e sai com código 1 se houver.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const EXTENSOES = new Set(['.astro', '.css', '.ts', '.mdx', '.md']);
const EXCECOES = ['src/styles/tokens.css', 'src/lib/familias.ts'];
// #rgb, #rrggbb ou #rrggbbaa sem letra/dígito logo depois; rgb( e rgba(.
const COR = /#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3})(?![0-9a-zA-Z_-])|\brgba?\(/g;
// Âncoras e ids: href="#..." / id="#..." / url(#...)
const ANCORA = /(?:href|xlink:href)\s*=\s*["']#|url\(\s*#/;

const normalizar = (p) => p.replaceAll('\\', '/');

export function encontrarCoresFixas(arquivos) {
  const ocorrencias = [];
  for (const arquivo of arquivos) {
    const rel = normalizar(arquivo);
    if (EXCECOES.some((e) => rel.endsWith(e))) continue;
    if (!EXTENSOES.has(extname(arquivo))) continue;
    const linhas = readFileSync(arquivo, 'utf8').split(/\r?\n/);
    linhas.forEach((texto, i) => {
      if (texto.includes('name="theme-color"')) return;
      for (const m of texto.matchAll(COR)) {
        const antes = texto.slice(0, m.index);
        if (m[0].startsWith('#') && ANCORA.test(antes.slice(-20) + m[0])) continue;
        ocorrencias.push({ arquivo, linha: i + 1, trecho: texto.trim().slice(0, 140) });
        break; // uma ocorrência por linha basta
      }
    });
  }
  return ocorrencias;
}

export function listarArquivos(dir) {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? listarArquivos(p) : [p];
  });
}

if (resolve(process.argv[1] ?? '') === fileURLToPath(import.meta.url)) {
  const dir = process.argv[2] ?? 'src';
  const r = encontrarCoresFixas(listarArquivos(dir));
  for (const o of r) console.log(`${normalizar(o.arquivo)}:${o.linha}  ${o.trecho}`);
  if (r.length) {
    console.log(`\n${r.length} linha(s) com cor fixa. Use os tokens de src/styles/tokens.css.`);
    process.exit(1);
  }
}
