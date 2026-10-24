# Blog Opcionando

Blog estático feito em [Astro](https://astro.build), hospedado de graça no Cloudflare Pages.
Custo fixo: só o domínio (cerca de R$ 40/ano no Registro.br).

---

## 1. Rodar no seu computador (opcional, mas recomendado)

Pré-requisito: [Node.js 22](https://nodejs.org) instalado.

```bash
npm install      # só na primeira vez
npm run dev      # abre em http://localhost:4321 e atualiza ao salvar
```

Para ver exatamente o que vai ao ar: `npm run build` e depois `npm run preview`.

---

## 2. Publicar: GitHub → Cloudflare Pages (uma vez só)

### 2.1 Subir o código para o GitHub
1. Crie uma conta em <https://github.com> (se ainda não tiver).
2. Clique em **New repository**, nome `opcionando-blog`, deixe **Public** ou **Private** (os dois funcionam), **sem** README.
3. Na pasta do projeto, rode:
   ```bash
   git init
   git add .
   git commit -m "Primeira versão do blog"
   git branch -M main
   git remote add origin https://github.com/SEU-USUARIO/opcionando-blog.git
   git push -u origin main
   ```
   Sem familiaridade com terminal? Use o **GitHub Desktop** (<https://desktop.github.com>): *File → Add local repository*, depois *Publish repository*.

### 2.2 Conectar no Cloudflare
1. Crie uma conta gratuita em <https://dash.cloudflare.com>.
2. Menu **Workers & Pages → Create → Pages → Connect to Git**.
3. Autorize o GitHub e escolha o repositório `opcionando-blog`.
4. Configuração do build:
   - **Framework preset:** Astro
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
5. **Save and Deploy.** Em 1 a 2 minutos o blog está no ar em `opcionando-blog.pages.dev`.

A partir daí, **todo `git push` publica automaticamente.**

---

## 3. Domínio próprio (opcionando.com.br)

1. Registre o domínio em <https://registro.br> (precisa de CPF).
2. No Cloudflare: **Add a domain** → digite `opcionando.com.br` → plano **Free**.
3. O Cloudflare mostra **dois nameservers** (algo como `xxx.ns.cloudflare.com`).
4. No Registro.br: domínio → **DNS → Alterar servidores DNS** → cole os dois nameservers.
5. De volta ao projeto no Cloudflare Pages: **Custom domains → Set up a custom domain** → `opcionando.com.br` (e repita para `www.opcionando.com.br`).
6. A propagação leva de minutos a algumas horas. O HTTPS é automático e gratuito.

> Se o endereço final for outro, troque `site:` em `astro.config.mjs` e a linha `Sitemap:` em `public/robots.txt`.

---

## 4. Escrever um novo artigo

1. Copie `MODELO-DE-POST.md` para `src/content/blog/` e renomeie (ex.: `theta-explicado.md`).
2. Preencha o cabeçalho (título, descrição, data, pilar, tags, vídeo).
3. Escreva em Markdown. Deixe `draft: true` enquanto estiver rascunhando.
4. Ao terminar, mude para `draft: false`, faça commit e push. Pronto, publicado.

Dá para fazer tudo **pelo navegador**: no GitHub, abra a pasta `src/content/blog`, clique em **Add file → Create new file**, cole o conteúdo e clique em **Commit**. O Cloudflare publica sozinho.

---

## 5. Onde mexer na identidade visual

| O quê | Arquivo |
|-------|---------|
| Cores (Petróleo, Coral, Giz, Creme, Grafite) e fontes | `src/styles/global.css` (topo do arquivo) |
| Nome, descrição, link do YouTube/Instagram, aviso legal | `src/consts.ts` |
| Logo (provisório, alavanca sobre fulcro) | `src/components/Logo.astro` e `public/favicon.svg` |
| Texto da página Sobre | `src/pages/sobre.astro` |

---

## 6. Extras gratuitos recomendados

- **Estatísticas de visita:** Cloudflare → *Web Analytics* → ative no projeto (sem cookies, grátis).
- **Google Search Console:** cadastre o domínio e envie `https://opcionando.com.br/sitemap-index.xml`.
- **Newsletter:** Buttondown ou Beehiiv (planos grátis) e cole o formulário na página Sobre.

## Estrutura

```
src/
  content/blog/      ← seus artigos (.md)
  components/        ← cabeçalho, rodapé, logo, cartões
  layouts/Base.astro ← esqueleto das páginas
  pages/             ← home, post, pilares, tags, sobre, RSS, 404
  styles/global.css  ← identidade visual
public/              ← favicon, imagens, robots.txt
```
