// Caminhos passados na linha de comando valem a partir da pasta atual; absolutos (inclusive C:\...) ficam como estão.
import { isAbsolute, resolve, win32 } from 'node:path';

export function resolverArg(p, base = process.cwd()) {
  if (isAbsolute(p) || win32.isAbsolute(p)) return p;
  return /^[a-z]:\\/i.test(base) ? win32.resolve(base, p) : resolve(base, p);
}
