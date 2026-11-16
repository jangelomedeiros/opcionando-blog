// Executa um programa sem passar pelo shell (caminhos com espaço ficam intactos, como C:\Program Files\nodejs\node.exe).
// No Windows, só os .cmd/.bat (ex.: npm.cmd) precisam de shell; nesse caso os argumentos vão entre aspas.
import { spawnSync } from 'node:child_process';

const precisaShell = (exe) => process.platform === 'win32' && /\.(cmd|bat)$/i.test(exe);
const aspas = (a) => (/[\s"]/.test(a) ? `"${a.replace(/"/g, '\\"')}"` : a);

/** Devolve { status, stdout, stderr, causa }. `causa` explica a falha quando o programa nem chegou a rodar. */
export function executar(exe, args, { cwd, capturar = false } = {}) {
  const shell = precisaShell(exe);
  const r = shell
    ? spawnSync([exe, ...args].map(aspas).join(' '), { cwd, shell: true, stdio: capturar ? 'pipe' : 'inherit', encoding: 'utf8' })
    : spawnSync(exe, args, { cwd, stdio: capturar ? 'pipe' : 'inherit', encoding: 'utf8' });
  const causa = r.error ? `${exe}: ${r.error.code === 'ENOENT' ? 'programa não encontrado' : r.error.message}` : r.status !== 0 ? `${exe} saiu com status ${r.status}` : null;
  return { status: r.status ?? 1, stdout: r.stdout ?? '', stderr: r.stderr ?? '', causa };
}
