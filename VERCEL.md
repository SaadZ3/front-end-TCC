# Publicar o frontend na Vercel

O frontend é React/Vite. O `vercel.json` envia `/api/*` para `https://back-end-tcc-production.up.railway.app/api/*` e entrega `index.html` nas rotas da interface. A Vercel mantém as chamadas de API no endereço do frontend visto pelo navegador; isso preserva o uso do cookie de sessão atual, com `SameSite=Lax`.

## 1. Enviar as alterações ao GitHub

Faça commit e push dos arquivos deste repositório, incluindo `vercel.json`. Não envie `.env`, `node_modules` ou `dist`.

## 2. Importar o repositório pelo site

1. Acesse a Vercel e clique em **Add New → Project**.
2. Conecte o GitHub, se necessário, e clique em **Import** no repositório do frontend.
3. Em **Root Directory**, mantenha o padrão se `package.json` estiver na raiz. Se o repositório contiver a pasta `tcc-front`, escolha essa pasta.
4. Confira **Framework Preset: Vite**.
5. Use **Build Command: npm run build**, **Output Directory: dist**, **Install Command: npm ci**. Esses valores já estão no `vercel.json`.
6. Use Node **22.x**, conforme `package.json`. Se o campo não aparecer na importação, ajuste em **Settings → Build and Deployment** e publique novamente.
7. Em **Environment Variables**, configure `VITE_API_BASE_URL` com o valor `/api`.
8. Clique em **Deploy** e aguarde a construção terminar.

Não coloque a URL do Railway em `VITE_API_BASE_URL`: a configuração usa o encaminhamento de `/api` para evitar cookies entre sites diferentes. Não cadastre `DATABASE_URL`, `TOKEN_SECRET` ou segredos do Supabase na Vercel. Variáveis com prefixo `VITE_` ficam acessíveis no navegador.

## 3. Autorizar o endereço no backend

Copie o domínio estável de produção da Vercel, por exemplo `https://meu-tcc.vercel.app`. Evite usar o endereço temporário de uma publicação específica.

No Railway, abra **serviço backend → Variables** e defina:

```env
APP_ORIGINS=https://meu-tcc.vercel.app
```

Substitua pelo endereço real, sem barra no final e sem `/login` ou outro caminho. Se já existem origens que você precisa manter, inclua a nova separada por vírgula. O backend aceita uma lista explícita, não um padrão `*.vercel.app`.

Mantenha `NODE_ENV=production`, aplique as alterações e aguarde a atualização do backend. Esta variável fica no Node, não no Python. Não troque `TOKEN_SECRET` nem `DATABASE_URL` durante essa etapa.

## 4. Verificar a publicação

1. Abra `https://SEU-FRONT.vercel.app/api/health`. Deve responder `{"status":"ok","service":"tcc-back"}`. Isso verifica o caminho Vercel → Railway, mas não o Python.
2. Abra `/login` diretamente e recarregue. A página deve continuar acessível.
3. Entre com uma conta da aplicação. Recarregue `/app` e confira se continua autenticado.
4. Envie um TXT pequeno, consulte o resultado e faça o download do original pelo histórico.
5. Saia da conta e confira que uma rota privada pede login novamente.

O Python deve estar saudável e `INFERENCE_URL` deve apontar para o domínio privado dele no backend. Uma conta do painel Supabase não substitui a conta da aplicação.

## Tempo de análise

A Vercel limita requisições encaminhadas a um servidor externo a **120 segundos**. A configuração atual da análise é síncrona: o navegador aguarda a resposta do backend. `INFERENCE_TIMEOUT_MS=160000` não aumenta o limite da Vercel.

Valide documentos representativos no servidor. Se uma análise ultrapassar o limite do proxy, consulte o histórico antes de reenviar: o backend pode ter continuado o processamento. Para suportar análises mais longas de forma confiável, será necessário retornar um identificador de tarefa e consultar o andamento, ou revisar a arquitetura de acesso à API. Essa mudança não faz parte desta configuração do frontend.

## Diagnóstico

- **Problema:** 403 ao entrar ou cadastrar. **Causa provável:** origem do frontend ausente em `APP_ORIGINS`. **Correção:** cadastrar o domínio exato e atualizar o backend.
- **Problema:** login não persiste. **Causa provável:** `VITE_API_BASE_URL` aponta diretamente para outro domínio. **Correção:** usar `/api` e publicar novamente na Vercel, pois a variável é incorporada durante a construção.
- **Problema:** `/api/health` retorna HTML. **Causa provável:** regra de API ausente ou substituída pelo encaminhamento da interface. **Correção:** conferir que o `vercel.json` está na raiz escolhida e que a regra `/api/:path*` vem primeiro.
- **Problema:** `/api/health` retorna erro do proxy. **Causa provável:** backend indisponível ou endereço incorreto. **Correção:** conferir o endereço público do Railway e os logs do backend.
- **Problema:** análise falha depois de cerca de dois minutos. **Causa possível:** limite de 120 segundos do encaminhamento. **Correção:** conferir histórico e logs antes de reenviar; revisar processamento assíncrono se recorrente.

Referências: [Vite na Vercel](https://vercel.com/docs/frameworks/frontend/vite), [encaminhamento de requisições](https://vercel.com/docs/routing/rewrites), [timeout do destino externo](https://vercel.com/docs/errors/router_external_target_error).
