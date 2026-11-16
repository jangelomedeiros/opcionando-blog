// Confere o HTML gerado por `npm run build` (rode o build antes de `npm test`).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const PAGINAS = ['../dist/index.html', '../dist/glossario/index.html'].map((p) => new URL(p, import.meta.url));

for (const url of PAGINAS) {
  const nome = url.pathname.split('/dist/')[1];
  const html = () => {
    assert.ok(existsSync(url), `${nome} não existe: rode npm run build antes`);
    return readFileSync(url, 'utf8');
  };

  test(`${nome}: script de tema vem antes de qualquer <link rel="stylesheet"> e <style>`, () => {
    const h = html();
    const tema = h.indexOf('opcionando-tema');
    assert.ok(tema > -1, 'script de tema ausente');
    const css = [h.indexOf('rel="stylesheet"'), h.indexOf('<style')].filter((i) => i > -1);
    for (const i of css) assert.ok(tema < i, `script de tema (${tema}) depois de CSS (${i})`);
  });

  test(`${nome}: script de tema trata localStorage indisponível`, () => {
    const h = html();
    const ini = h.lastIndexOf('<script', h.indexOf('opcionando-tema'));
    const trecho = h.slice(ini, h.indexOf('</script>', ini));
    assert.match(trecho, /try/);
    assert.match(trecho, /catch/);
  });

  test(`${nome}: botão de tema presente`, () => {
    const h = html();
    assert.match(h, /data-tema-toggle/);
    assert.match(h, /data-tema-toggle[^>]*aria-label=|aria-label=[^>]*data-tema-toggle/);
  });

  test(`${nome}: meta theme-color presente`, () => {
    assert.match(html(), /name="theme-color"/);
  });
}
