# evolux-platform-frontend

PWA **mobile-first** do Evolux: **React 19**, **Vite 5**, **TypeScript**, **Tailwind CSS**, **TanStack Query**, **React Router**, tema escuro (**next-themes**), componentes estilo shadcn/Radix e dados locais (localStorage) em transição para a **API** no repositório **evolux-platform-backend**.

---

## Pré-requisitos

| Ferramenta | Versão sugerida |
|------------|-----------------|
| Node.js    | **20+** (recomendado alinhar com backend 22+ se possível) |
| npm        | 10+ |
| Docker + Docker Compose | Opcional (imagem de produção ou Vite em container) |

---

## Início rápido (recomendado: Vite no host)

### 1. Instalar dependências

```bash
cd evolux-platform-frontend
npm install
```

### 2. Variáveis de ambiente

```bash
cp .env.example .env
```

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `VITE_API_URL` | Não* | Base da API REST, ex.: `http://localhost:3001`. Se vazia, recursos que dependem da API (ex.: card “Conta (API)” no Perfil) ficam desligados |
| `VITE_SUPABASE_URL` | Não* | URL do projeto Supabase |
| `VITE_SUPABASE_ANON_KEY` | Não* | Chave **anon** pública do Supabase |

\* **Obrigatórias juntas** para login Supabase + chamadas autenticadas à API: as três costumam ser usadas em conjunto no fluxo `/me`.

### 3. Subir o backend

Na pasta do repositório **evolux-platform-backend**, siga o README dele (Postgres + `npm run dev` ou `docker compose up`).

### 4. Rodar o front

```bash
npm run dev
```

Abra **http://localhost:8080** (host e porta definidos em `vite.config.ts`).

---

## Como saber se está tudo certo

1. **Página inicial** carrega sem erro no console do navegador.  
2. **Navegação inferior (mobile)** e layout desktop respondem.  
3. Com **`VITE_API_URL`** definido e **Supabase** configurado + usuário logado: em **Perfil**, o bloco **“Conta (API)”** deve mostrar `userId` e dados retornados de `GET /me` (ou mensagem clara se não houver sessão).  
4. **Build de produção:**

   ```bash
   npm run build
   npm run preview
   ```

   O build gera **PWA** (`dist/sw.js`, `manifest.webmanifest`, precache Workbox).

---

## Scripts npm

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Servidor de desenvolvimento Vite (HMR) |
| `npm run build` | Build otimizado + assets PWA |
| `npm run preview` | Servidor estático para testar o `dist/` |
| `npm run format` | Prettier em todo o projeto |

---

## Docker

### Imagem de produção (build estático + Nginx)

Na raiz do repositório:

```bash
docker build -t evolux-web:local \
  --build-arg VITE_API_URL=http://localhost:3001 \
  --build-arg VITE_SUPABASE_URL= \
  --build-arg VITE_SUPABASE_ANON_KEY= \
  .
docker run --rm -p 8080:8080 evolux-web:local
```

> **Importante:** variáveis `VITE_*` são embutidas no **build**. Troque os `--build-arg` para o ambiente alvo. Nginx escuta na porta **8080** dentro do container (`nginx.conf`).

### Compose opcional (Vite em dev dentro do container)

```bash
docker compose up --build
```

- Publica **http://localhost:8080**  
- Monta o código local em `/app`; volume anônimo preserva `node_modules` da imagem  
- `VITE_API_URL` padrão: `http://host.docker.internal:3001` (API no host; Linux usa `extra_hosts` no `compose.yaml`)

Se a API estiver só em Docker sem porta no host, ajuste `VITE_API_URL` para a URL alcançável de dentro da rede Docker.

---

## PWA (Progressive Web App)

- Plugin: **vite-plugin-pwa** (`vite.config.ts`)  
- Registro do service worker: `virtual:pwa-register` em `src/app/main.tsx`  
- Ícones: `public/pwa-192x192.png`, `public/pwa-512x512.png` (substitua por ícones finais da marca)  
- Em desenvolvimento, o SW pode ficar desligado (`devOptions.enabled: false`); após `npm run build` + `preview` ou deploy, teste instalação / atualização no Chrome DevTools → **Application**.

---

## Estrutura do projeto (resumo)

```
src/
  app/           # App.tsx, main.tsx, providers
  pages/         # Rotas / telas
  widgets/       # Layout, BottomNav, Sidebar
  entities/      # Domínio (ex.: workout)
  shared/
    api/         # Cliente HTTP, env, fetch /me
    lib/         # utils, storage (local), supabase.ts
    ui/ui/       # Componentes reutilizáveis
```

- **Dados locais:** `src/shared/lib/storage.ts` (localStorage + mocks). Comentário no arquivo indica caminho gradual para `@/shared/api` + Supabase.  
- **API remota:** `src/shared/api/` (`getApiBaseUrl`, `isApiConfigured`, `apiFetch`, `fetchMe`).  
- **Supabase:** `src/shared/lib/supabase.ts` (`getSupabase()`).

---

## Integração com o backend

Repositório irmão: **evolux-platform-backend**.

1. API em **http://localhost:3001** (padrão).  
2. No front: `VITE_API_URL=http://localhost:3001` no `.env`.  
3. O backend deve aceitar CORS para `http://localhost:8080` (`CORS_ORIGIN` no backend).  
4. Para **GET /me**, o backend precisa de `SUPABASE_JWT_SECRET` igual ao do projeto Supabase; o front envia o **Bearer** do `session.access_token`.

---

## Solução de problemas

### `npm install` falha (rede / `ENOTFOUND registry.npmjs.org`)

- Verifique internet, proxy corporativo e DNS.  
- Tente outra rede ou `npm config get registry` (deve ser `https://registry.npmjs.org/`).

### Página em branco ou erro de módulo

- Limpe cache do Vite: `rm -rf node_modules/.vite` e rode `npm run dev` de novo.  
- Confirme Node compatível com Vite 5 / plugin SWC.

### API / CORS

- Sintoma: no navegador, requisições bloqueadas com erro de CORS.  
- Ajuste `CORS_ORIGIN` no **backend** para incluir a origem exata do front (incluindo porta), ex.: `http://127.0.0.1:8080` se for o caso.

### Perfil: “Configure VITE_SUPABASE…” ou “Faça login no Supabase…”

- Preencha `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.  
- Implemente fluxo de login Supabase na UI quando for prioridade (hoje o card só tenta `getSession()` se Supabase estiver configurado).

### Perfil: erro ao chamar API (401 / 503)

- **503:** backend sem `SUPABASE_JWT_SECRET`.  
- **401:** token ausente/expirado ou secret incorreto. Faça login de novo no Supabase.

### Docker build do front: variáveis `VITE_*` erradas na imagem

- Rebuild com `--build-arg` corretos; valores são fixados no **build time**, não em runtime.

### PWA não atualiza após deploy

- Service worker em cache: no DevTools → Application → **Unregister** e hard reload; ou incremente versão/cache bust no deploy.

---

## Licença

Conforme o campo `license` no `package.json` / política do repositório (ex.: ISC).
