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
- **Sincronização automática com GitHub** — salvar no admin publica o site
- Interface interativa com efeitos visuais modernos
- Painel administrativo com autenticação básica

---

## ✦ Estrutura do Projeto

```
theuss-devs-links/
├── index.html              # Página pública
├── admin.html              # Painel administrativo
├── vercel.json             # Configuração de deploy estático
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

- **Página Pública (`index.html`)** — Exibe os links ativos com animações e efeitos visuais.
- **Painel Administrativo (`admin.html`)** — Interface protegida para gerenciamento dos links.

---

## ✦ Funcionalidades

### Interface Pública

- Renderização apenas de links ativos
- Efeitos visuais: Tilt 3D, Parallax, Partículas animadas em canvas
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
- **Sincronização automática com GitHub** ao salvar

---

## ✦ IDs de links disponíveis

```
instagram · tiktok · youtube · github · linkedin
behance · discord · whatsapp · portfolio · github_repo
```

| ID            | Label        | Ícone            | Descrição                          |
|---------------|--------------|------------------|------------------------------------|
| `instagram`   | Instagram    | Instagram        | Perfil do Instagram                |
| `tiktok`      | TikTok       | TikTok           | Perfil do TikTok                   |
| `youtube`     | YouTube      | YouTube          | Canal do YouTube                   |
| `github`      | GitHub       | GitHub (octocat) | Perfil do GitHub                   |
| `linkedin`    | LinkedIn     | LinkedIn         | Perfil do LinkedIn                 |
| `behance`     | Behance      | Behance          | Perfil do Behance                  |
| `discord`     | Discord      | Discord          | Servidor ou perfil do Discord      |
| `whatsapp`    | WhatsApp     | WhatsApp         | Link direto do WhatsApp            |
| `portfolio`   | Portfólio    | Globo            | Site de portfólio                  |
| `github_repo` | Repositório  | Pasta/branch     | Link direto para repositório GitHub|

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

---

## ✦ Persistência e Sincronização

O carregamento dos links segue uma **hierarquia de fallback**:

| Prioridade | Fonte             | Armazenamento   | Escopo                   |
|------------|-------------------|-----------------|--------------------------|
| 1ª         | Admin (painel)    | localStorage    | Dispositivo atual        |
| 2ª         | `data/links.json` | Arquivo estático| Qualquer dispositivo     |
| 3ª         | DEFAULT_DATA      | Embutido no JS  | Fallback absoluto        |

### Sync automático GitHub → Vercel

Ao clicar em **Salvar alterações** no painel admin (com token configurado):

1. Os dados são salvos no `localStorage` do navegador
2. Um commit é feito direto no `data/links.json` do repositório GitHub
3. O Vercel detecta o push e publica um novo deploy em ~30 segundos
4. O site atualiza para todos os dispositivos automaticamente

---

## ✦ Configuração

### Credenciais do painel

As credenciais padrão estão em `assets/js/admin.js`:

```js
const SETUP = { user: 'Theuss', pass: 'dev' };
```

Para trocar sem editar o código, abra o console em `admin.html` e rode:

```js
hashCredentials('novoUsuario', 'novaSenha').then(h => console.log(h))
```

### GitHub Token (sync automático)

No painel admin, seção **"Publicação automática — GitHub"**:

- **Token:** Personal Access Token com escopo `repo`
  - Gerar em: `github.com/settings/tokens`
- **Repositório:** `theussdevs/theuss-devs-links`

O token é salvo apenas no `localStorage` do seu navegador — nunca sai do dispositivo.

---

## ✦ Segurança

### Medidas implementadas

- Hash de senha com SHA-256 (Web Crypto API)
- Rate limiting de login (3 tentativas → bloqueio de 30s)
- Sessão com expiração automática (30 min)
- Sanitização de inputs (proteção contra XSS)
- Validação de URLs (`http` e `https` apenas)
- Content Security Policy (CSP) sem `unsafe-inline`
- `connect-src 'self' https://api.github.com` — apenas conexões necessárias
- Validação de JSON importado
- `X-Frame-Options: DENY` no painel admin
- `Referrer-Policy: no-referrer`

### Limitações

- O código-fonte é acessível ao usuário no navegador
- Autenticação pode ser contornada localmente via DevTools
- Não há sincronização automática entre dispositivos (sem o token GitHub configurado)

---

## ✦ Deploy

Compatível com GitHub Pages, Vercel e Netlify.

O `vercel.json` incluído configura o deploy como site estático sem build.

---

## ✦ Histórico de Alterações

### v1.2 — Repositório GitHub como link + Sync automático

**Arquivos alterados:**

| Arquivo                  | Alteração                                                                 |
|--------------------------|---------------------------------------------------------------------------|
| `assets/js/icons.js`     | Adicionado ícone `github_repo` (pasta com seta de download)               |
| `assets/js/public.js`    | Adicionado `github_repo` no `DEFAULT_DATA`                                |
| `assets/js/admin.js`     | Adicionado `github_repo` no `DEFAULT_LINKS` + função `syncToGitHub()`     |
| `data/links.json`        | Adicionado entry `github_repo` com URL do repositório                     |
| `admin.html`             | Adicionada seção "Publicação automática — GitHub" + CSP corrigida         |
| `README.md`              | Documentação atualizada com todas as mudanças                             |

**Detalhes das mudanças:**

- `github_repo` é um ID distinto de `github` — o primeiro aponta para um repositório específico, o segundo para um perfil de usuário
- O ícone `github_repo` usa pasta + seta (diferente do octocat do `github`)
- A CSP do `admin.html` foi corrigida de `connect-src 'none'` para `connect-src 'self' https://api.github.com`, permitindo o sync
- A função `syncToGitHub()` em `admin.js` faz um PUT direto na GitHub Contents API, atualizando `data/links.json` com commit automático

### v1.1 — Correções críticas de bugs

| # | Problema | Correção |
|---|----------|----------|
| 1 | Chave de `localStorage` diferente entre os arquivos | Unificado para `__tdevs_links` |
| 2 | Filtro por `l.enabled` em vez de `l.active` | Corrigido para `l.active` |
| 3 | Sem fallback para outros dispositivos | Adicionado fetch de `data/links.json` |
| 4 | CSP com `connect-src 'none'` bloqueava fetch | Alterado para `connect-src 'self'` |
| 5 | Ícone do Portfólio com chave `'globe'` | Corrigido para `'portfolio'` |
| 6 | CSS e JS embutidos no HTML | Separados em `assets/css/` e `assets/js/` |
| 7 | `unsafe-inline` no CSP | Removido — JS e CSS agora externos |

---

## ✦ Licença

© 2025 **@theuss.devs** — Todos os direitos reservados.

Uso estritamente pessoal. Proibido copiar, redistribuir ou usar comercialmente sem autorização.
