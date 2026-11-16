// Painel "Hoje no mercado" e vereditos no catálogo (HTML gerado por `npm run build`).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const ler = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const V = JSON.parse(ler('src/data/laboratorio/validacao.json'));
const semTags = (h) => h.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
const cont = (v) => V.estruturas.filter((x) => x.veredito === v).length;

test('/estrategias/hoje/ tem o resumo do mercado e os três grupos com as contagens certas', () => {
  const h = ler('dist/estrategias/hoje/index.html'), t = semTags(h);
  assert.match(t, /Hoje no mercado/);
  assert.match(t, /tendência de baixa|tendência de alta|mercado lateral/i);
  assert.match(t, /Vol implícita ATM entre/);
  for (const [v, rotulo] of [['montar', 'Montar'], ['montar-com-ressalva', 'Montar com ressalva'], ['nao-montar', 'Não montar agora']]) {
    const n = cont(v);
    assert.ok(t.includes(`${rotulo} (${n})`), `${rotulo} (${n})`);
  }
  const links = [...h.matchAll(/href="\/estrategias\/([a-z0-9-]+)\/"/g)].map((m) => m[1]);
  for (const v of V.estruturas) assert.ok(links.includes(v.id), `${v.id} sem link`);
  assert.match(t, /conferir no book/i);
});

test('catálogo mostra o selo do veredito em cada cartão, o filtro "Hoje" e o link para o painel', () => {
  const h = ler('dist/estrategias/index.html');
  assert.match(h, /href="\/estrategias\/hoje\/"/);
  assert.doesNotMatch(h, /class="selo coral">com preços reais/);
  for (const v of V.estruturas) {
    const i = h.indexOf(`href="/estrategias/${v.id}/"`);
    assert.ok(i >= 0, v.id);
    const card = h.slice(i, h.indexOf('</a>', i));
    assert.match(card, new RegExp(`data-veredito="${v.veredito}"`), `${v.id} sem data-veredito`);
  }
  for (const r of ['Montar', 'Com ressalva', 'Não montar']) assert.match(h, new RegExp(`data-veredito=".*"[^>]*>${r}<|>${r}<`), r);
  assert.match(h, /data-veredito=""[^>]*>Todos</);
});

test('caixa "Validação do operador" linka para o painel', () => {
  assert.match(ler('dist/estrategias/covered-call/index.html'), /href="\/estrategias\/hoje\/"/);
});
