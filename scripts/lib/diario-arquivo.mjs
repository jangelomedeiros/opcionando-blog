// Grava o registro do diário sem reescrever o passado: o diário vale pelo que foi recomendado no dia.
// Devolve 'novo', 'igual', 'preservado' (já havia outro registro para a data) ou 'regravado' (com regravar: true).
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

export function gravarRegistro(caminho, registro, { regravar = false } = {}) {
  const texto = JSON.stringify(registro, null, 1) + '\n';
  if (!existsSync(caminho)) {
    mkdirSync(dirname(caminho), { recursive: true });
    writeFileSync(caminho, texto);
    return 'novo';
  }
  if (readFileSync(caminho, 'utf8') === texto) return 'igual';
  if (!regravar) return 'preservado';
  writeFileSync(caminho, texto);
  return 'regravado';
}
