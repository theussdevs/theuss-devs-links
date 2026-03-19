# theuss.devs — Link Page

> Página de links estática com painel administrativo autenticado, foco em autonomia, simplicidade e interface interativa avançada.

<br>

![Status](https://img.shields.io/badge/status-ativo-00f5c4?style=flat-square)
![Versão](https://img.shields.io/badge/versão-1.2-7b5cff?style=flat-square)
![Deploy](https://img.shields.io/badge/deploy-Vercel-black?style=flat-square&logo=vercel)
![Licença](https://img.shields.io/badge/licença-proprietária-ff4d6d?style=flat-square)

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

| ID            | Label       | Ícone            | Descrição                           |
|---------------|-------------|------------------|-------------------------------------|
| `instagram`   | Instagram   | Instagram        | Perfil do Instagram                 |
| `tiktok`      | TikTok      | TikTok           | Perfil do TikTok                    |
| `youtube`     | YouTube     | YouTube          | Canal do YouTube                    |
| `github`      | GitHub      | GitHub (octocat) | Perfil do GitHub                    |
| `linkedin`    | LinkedIn    | LinkedIn         | Perfil do LinkedIn                  |
| `behance`     | Behance     | Behance          | Perfil do Behance                   |
| `discord`     | Discord     | Discord          | Servidor ou perfil do Discord       |
| `whatsapp`    | WhatsApp    | WhatsApp         | Link direto do WhatsApp             |
| `portfolio`   | Portfólio   | Globo            | Site de portfólio                   |
| `github_repo` | Repositório | Pasta/branch     | Link direto para repositório GitHub |

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

O carregamento dos links segue uma **hierarquia de fallback**, garantindo que qualquer dispositivo veja os links corretamente:

| Prioridade | Fonte             | Armazenamento    | Escopo                   |
|------------|-------------------|------------------|--------------------------|
| 1ª         | Admin (painel)    | `localStorage`   | Dispositivo atual        |
| 2ª         | `data/links.json` | Arquivo estático | Qualquer dispositivo     |
| 3ª         | `DEFAULT_DATA`    | Embutido no JS   | Fallback absoluto        |

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

Para trocar sem editar o código-fonte, abra o console do navegador em `admin.html` e rode:

```js
hashCredentials('novoUsuario', 'novaSenha').then(h => console.log(h))
```

Substitua os valores de `SETUP` pelas novas credenciais ou armazene o hash manualmente.

### GitHub Token (sync automático)

No painel admin, seção **"Publicação automática — GitHub"**:

- **Token:** Personal Access Token com escopo `repo` — gerar em `github.com/settings/tokens`
- **Repositório:** `theussdevs/theuss-devs-links`

O token é armazenado apenas no `localStorage` do seu navegador. Ele nunca é transmitido para nenhum servidor além da API oficial do GitHub.

---

## ✦ Segurança

### Medidas implementadas

- Hash de senha com SHA-256 via Web Crypto API nativa
- Rate limiting de login — 3 tentativas → bloqueio automático de 30 segundos
- Sessão com expiração automática de 30 minutos via `sessionStorage`
- Sanitização de todos os inputs contra injeção de HTML (XSS)
- Validação de URLs — somente protocolos `http` e `https` são aceitos
- Content Security Policy (CSP) sem `unsafe-inline` em scripts e estilos
- `connect-src 'self' https://api.github.com` — apenas conexões necessárias permitidas
- Validação estrutural de arquivos JSON importados
- `X-Frame-Options: DENY` no painel admin — bloqueia clickjacking
- `Referrer-Policy: no-referrer` — sem vazamento de origem nas requisições

### Limitações conhecidas

Por ser um sistema 100% client-side, existem limitações inerentes ao modelo:

- O código-fonte é acessível ao usuário pelo navegador
- A autenticação pode ser contornada localmente via DevTools
- Não há sincronização automática entre dispositivos sem o token GitHub configurado
- Não suporta múltiplos usuários ou ambientes sensíveis

> Este projeto não foi projetado para ambientes corporativos, multiusuário ou com requisitos críticos de segurança.

---

## ✦ Deploy

Compatível com qualquer hospedagem estática:

- **GitHub Pages**
- **Vercel** ← recomendado (integração automática com GitHub)
- **Netlify**

O `vercel.json` incluído configura o deploy como site estático sem etapa de build. Todo `git push` para a branch `main` dispara um novo deploy automaticamente.

---

## ✦ Motivação

Este projeto foi desenvolvido como exercício de:

- Manipulação de DOM sem frameworks
- Interface interativa avançada (Canvas API + efeitos CSS)
- Gerenciamento de estado no client-side
- Práticas de segurança no navegador
- Integração com a API do GitHub para deploy contínuo

---

## ✦ Histórico de Alterações

### v1.2 — Link de repositório GitHub + Sync automático

| Arquivo              | Alteração                                                              |
|----------------------|------------------------------------------------------------------------|
| `assets/js/icons.js` | Adicionado ícone `github_repo` (pasta com seta)                        |
| `assets/js/public.js`| Adicionado `github_repo` no `DEFAULT_DATA`                             |
| `assets/js/admin.js` | Adicionado `github_repo` no `DEFAULT_LINKS` + função `syncToGitHub()`  |
| `data/links.json`    | Entry `github_repo` adicionado com URL do repositório                  |
| `admin.html`         | Seção "Publicação automática — GitHub" + CSP corrigida                 |
| `README.md`          | Documentação atualizada com changelog e licença completa               |

**Notas técnicas:**

- `github_repo` é um ID distinto de `github` — o primeiro aponta para um repositório específico, o segundo para um perfil de usuário
- O ícone `github_repo` usa pasta com seta, diferente do octocat usado em `github`
- A CSP foi corrigida de `connect-src 'none'` para `connect-src 'self' https://api.github.com`
- A função `syncToGitHub()` usa a GitHub Contents API (PUT) para fazer commit direto no repositório

### v1.1 — Correções críticas de bugs

| # | Problema                                             | Correção                                    |
|---|------------------------------------------------------|---------------------------------------------|
| 1 | Chave de `localStorage` diferente entre os arquivos  | Unificado para `__tdevs_links`              |
| 2 | Filtro por `l.enabled` em vez de `l.active`          | Corrigido para `l.active`                   |
| 3 | Sem fallback para outros dispositivos                | Adicionado fetch de `data/links.json`        |
| 4 | CSP com `connect-src 'none'` bloqueava fetch         | Alterado para `connect-src 'self'`           |
| 5 | Ícone do Portfólio com chave `'globe'`               | Corrigido para `'portfolio'`                |
| 6 | CSS e JS embutidos diretamente no HTML               | Separados em `assets/css/` e `assets/js/`   |
| 7 | `unsafe-inline` no CSP de script e style             | Removido — arquivos externos obrigatórios   |

### v1.0 — Versão inicial

- Estrutura base do projeto
- Página pública com efeitos visuais (Canvas, Tilt 3D, Parallax)
- Painel administrativo com autenticação SHA-256
- Persistência via `localStorage`

---

## ✦ Licença e Direitos Autorais

```
Copyright © 2025  @theuss.devs
Todos os direitos reservados.
```

Este projeto é de **uso estritamente pessoal** e **não constitui software de código aberto** (open source) sob nenhuma definição reconhecida, incluindo a OSI (Open Source Initiative) ou a FSF (Free Software Foundation).

### É expressamente proibido, sem autorização prévia e por escrito do autor:

- **Copiar** este código, integral ou parcialmente, em qualquer meio físico ou digital
- **Redistribuir** este código em qualquer forma, gratuita ou comercial
- **Modificar** e publicar versões derivadas, adaptadas ou traduzidas
- **Utilizar** este projeto ou qualquer parte dele para fins comerciais, diretos ou indiretos
- **Reutilizar** trechos, componentes, estilos ou lógica em projetos públicos ou privados de terceiros
- **Fazer engenharia reversa** com o objetivo de reproduzir a interface ou a lógica do sistema
- **Hospedar** cópias ou forks deste repositório sem autorização explícita

### É permitido:

- **Visualizar** o código-fonte para fins de estudo pessoal e não comercial
- **Referenciar** este projeto em artigos, portfólios ou discussões técnicas, com devida atribuição ao autor

### Isenção de garantia:

Este software é fornecido "como está" (*as is*), sem garantias de qualquer natureza, expressas ou implícitas, incluindo mas não se limitando a garantias de comercialização, adequação a um propósito específico ou não violação de direitos. Em nenhuma hipótese o autor será responsável por quaisquer danos diretos, indiretos, incidentais ou consequenciais decorrentes do uso deste software.

### Contato para autorizações:

Para solicitar permissão de uso, adaptação ou qualquer outra finalidade não coberta por esta licença, entre em contato com o autor diretamente através das redes sociais listadas na página pública do projeto.

---

<p align="center">
  Desenvolvido com autonomia por <strong>@theuss.devs</strong> · 2025
</p>
