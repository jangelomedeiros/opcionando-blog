// Contraste WCAG 2.x entre cores hex e leitura dos tokens dos dois temas.

function canal(c) {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
}

export function luminancia(hex) {
  let h = String(hex).trim().replace('#', '');
  if (h.length === 3) h = [...h].map((x) => x + x).join('');
  if (!/^[0-9a-f]{6}$/i.test(h)) throw new Error(`cor hex inválida: ${hex}`);
  const [r, g, b] = [0, 2, 4].map((i) => canal(parseInt(h.slice(i, i + 2), 16)));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function razaoContraste(hexA, hexB) {
  const [a, b] = [luminancia(hexA), luminancia(hexB)].sort((x, y) => y - x);
  return (a + 0.05) / (b + 0.05);
}

// Extrai as variáveis hex de `:root { ... }` (tema escuro) e `:root[data-theme="light"] { ... }`.
export function lerTokens(css) {
  const bloco = (re) => {
    const m = css.match(re);
    const out = {};
    if (!m) return out;
    for (const [, nome, valor] of m[1].matchAll(/(--[\w-]+)\s*:\s*(#[0-9a-fA-F]{3,6})\s*;/g)) out[nome] = valor;
    return out;
  };
  return {
    dark: bloco(/:root\s*\{([^}]*)\}/),
    light: bloco(/:root\[data-theme="light"\]\s*\{([^}]*)\}/),
  };
}
