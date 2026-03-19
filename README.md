# theuss.devs — Link Page

> Página de links estática com painel administrativo autenticado, foco em autonomia, simplicidade e interface interativa avançada.

---

## ✦ Sobre o Projeto

Projeto pessoal desenvolvido para centralizar links em uma página única, com gerenciamento local e interface visual diferenciada.

A proposta é simples:

- Nenhum framework ou biblioteca externa
- Nenhum backend
- Controle total no navegador

Funciona como uma alternativa leve a ferramentas como Linktree, priorizando **independência, estética e controle técnico**.

---

## ✦ Características Principais

- 100% client-side (HTML, CSS, JavaScript puro)
- Sem build, sem dependências, sem API
- CSS e JS totalmente separados do HTML — estrutura profissional
- Persistência local via navegador com fallback para `data/links.json`
- Links visíveis em qualquer dispositivo mesmo sem acesso ao painel admin
- Interface interativa com efeitos visuais modernos
- Painel administrativo com autenticação básica

---

## ✦ Estrutura do Projeto

```
theuss-devs-links/
├── index.html              # Página pública
├── admin.html              # Painel administrativo
├── data/
│   └── links.json          # Configuração padrão dos links (fallback)
├── assets/
│   ├── css/
│   │   ├── public.css      # Estilos da página pública
│   │   └── admin.css       # Estilos do painel administrativo
│   └── js/
│       ├── icons.js        # Mapa de ícones SVG (compartilhado)
│       ├── public.js       # Lógica da página pública
│       └── admin.js        # Lógica do painel administrativo
├── .gitignore
└── README.md
```

---

## ✦ Visão Geral

O sistema é dividido em duas interfaces independentes:

- **Página Pública (`index.html`)**
  Exibe os links ativos com animações e efeitos visuais.

- **Painel Administrativo (`admin.html`)**
  Interface protegida para gerenciamento dos links.

---

## ✦ Funcionalidades

### Interface Pública

- Renderização apenas de links ativos
- Efeitos visuais:
  - Tilt 3D baseado no cursor
  - Parallax de elementos
  - Partículas animadas em canvas
- Avatar animado com anel de gradiente
- Layout responsivo

### Painel Administrativo

- Autenticação com SHA-256 (Web Crypto API)
- Limitação de tentativas de login (rate limiting)
- Sessão com expiração automática (30 minutos)
- Editor de links: ativar / desativar e definir URL
- Validação e sanitização de URLs
- Importação e exportação de configuração (JSON)
- Log de segurança por sessão

---

## ✦ Modelo de Dados

```json
{
  "profile": {
    "name": "string",
    "handle": "string",
    "bio": "string"
  },
  "links": [
    {
      "id": "string",
      "label": "string",
      "url": "string",
      "icon": "string",
      "active": "boolean"
    }
  ]
}
```

### IDs disponíveis

```
instagram · tiktok · youtube · github · linkedin
behance · discord · whatsapp · portfolio
```

---

## ✦ Persistência de Dados

O carregamento dos links segue uma **hierarquia de fallback**, garantindo que qualquer dispositivo veja os links:

| Prioridade | Fonte                 | Armazenamento   | Escopo                        |
|------------|-----------------------|-----------------|-------------------------------|
| 1ª         | Admin (painel)        | localStorage    | Dispositivo atual             |
| 2ª         | `data/links.json`     | Arquivo estático| Qualquer dispositivo          |
| 3ª         | DEFAULT_DATA          | Embutido no JS  | Fallback absoluto             |

> **Como funciona em outros dispositivos:** Quando um visitante acessa a página em um celular que nunca abriu o painel admin, o JavaScript tenta buscar `data/links.json` do servidor. Por isso é importante manter esse arquivo atualizado via exportação no painel.

- Sessão do admin: `sessionStorage` (expira ao fechar o navegador)
- Log de segurança: `sessionStorage`

---

## ✦ Configuração

### Credenciais

As credenciais padrão estão em `assets/js/admin.js`:

```js
const SETUP = { user: 'Theuss', pass: 'dev' };
```

Para trocar sem editar o código-fonte, abra o console do navegador na página `admin.html` e rode:

```js
hashCredentials('novoUsuario', 'novaSenha').then(h => console.log(h))
```

Substitua o valor de `SETUP` pelo novo par de credenciais, ou armazene o hash resultante diretamente.

### Atualizar links.json para outros dispositivos

Após configurar os links no painel admin:

1. Clique em **Exportar links.json**
2. Substitua o arquivo `data/links.json` no servidor pelo exportado
3. Faça deploy novamente

---

## ✦ Segurança

### Medidas implementadas

- Hash de senha com SHA-256 (Web Crypto API)
- Rate limiting de login (3 tentativas → bloqueio de 30s)
- Token de sessão com expiração automática (30 min)
- Sanitização de inputs (proteção contra XSS)
- Validação de URLs (`http` e `https` apenas)
- Content Security Policy (CSP) sem `unsafe-inline`
- Validação de JSON importado
- `X-Frame-Options: DENY` no painel admin
- `Referrer-Policy: no-referrer`

### Limitações (inerentes ao modelo client-side)

- O código-fonte é acessível ao usuário no navegador
- Autenticação pode ser contornada localmente via DevTools
- Não há sincronização automática entre dispositivos

> Este projeto não foi projetado para ambientes sensíveis ou multiusuário.

---

## ✦ Customização

### Tema (CSS)

Edite as variáveis em `assets/css/public.css`:

```css
:root {
  --neon:    #00f5c4;
  --neon2:   #7b5cff;
  --bg:      #080b0f;
  --surface: #0d1117;
}
```

### Conteúdo (HTML)

- Nome, bio e handle: editáveis pelo painel ou diretamente no `data/links.json`
- Estrutura visual: `index.html`

### Links

Gerenciados via painel (`admin.html`) ou editando `data/links.json` diretamente.

---

## ✦ Deploy

Compatível com qualquer hospedagem estática:

- **GitHub Pages**
- **Vercel**
- **Netlify**

Requisito: servir arquivos HTML/CSS/JS estáticos com suporte a fetch do mesmo domínio.

> **Atenção:** Para que `data/links.json` seja acessível via `fetch()`, o servidor precisa servir arquivos estáticos normalmente. GitHub Pages, Vercel e Netlify fazem isso automaticamente.

---

## ✦ Correções Aplicadas (v1.1)

As seguintes correções foram aplicadas em relação à versão inicial:

| # | Problema | Impacto | Correção |
|---|----------|---------|----------|
| 1 | Chave de `localStorage` diferente entre `index.html` (`tdevs_links_v1`) e `admin.html` (`__tdevs_links`) | Links salvos pelo admin nunca apareciam | Unificado para `__tdevs_links` |
| 2 | `index.html` filtrava por `l.enabled`, mas admin salva `l.active` | Nenhum link passava no filtro | Corrigido para `l.active` |
| 3 | Sem fallback para outros dispositivos | Links não apareciam em celulares sem acesso ao admin | Adicionado fetch de `data/links.json` como segunda fonte |
| 4 | CSP com `connect-src 'none'` bloqueava `fetch()` | Fallback via `links.json` impossível | Alterado para `connect-src 'self'` |
| 5 | Ícone do Portfólio com chave `'globe'` no admin | Ícone do portfólio ficava em branco | Corrigido para `'portfolio'` |
| 6 | CSS e JS embutidos no HTML | Difícil manutenção | Separados em `assets/css/` e `assets/js/` |
| 7 | `unsafe-inline` no CSP de script e style | Segurança reduzida | Removido — JS e CSS agora externos |

---

## ✦ Status do Projeto

> Projeto pessoal ativo, estável para uso próprio.

---

## ✦ Licença

© 2025 **@theuss.devs**

Todos os direitos reservados.

Este projeto é de uso estritamente pessoal e não é software de código aberto.

É proibido, sem autorização prévia e por escrito do autor:

- Copiar ou redistribuir este código, integral ou parcialmente
- Modificar e publicar versões derivadas
- Utilizar este projeto para fins comerciais
- Reutilizar partes do código em outros projetos públicos ou privados

O uso para fins de estudo pessoal é permitido, desde que não haja redistribuição.
