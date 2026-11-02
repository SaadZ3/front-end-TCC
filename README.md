# Frontend do protótipo

Publicação na Vercel: siga [VERCEL.md](VERCEL.md). O `vercel.json` encaminha `/api` ao backend do Railway e permite abrir ou recarregar as rotas do React diretamente.

O projeto usa um único método de avaliação da qualidade da informação documentada, com notas de **0 a 3**. Consulte [a atualização do método](../docs/AVALIACAO_UNIFICADA.md).

React/TypeScript/Vite. Cadastro, login, envio de PDF/TXT, histórico com exclusão, resultado com evidências e exportação PDF/JSON estão disponíveis.

Execute npm ci e npm run dev; abra http://127.0.0.1:5173. O proxy /api encaminha para o Node em 3001. Para analisar arquivos, inicie também o serviço Python em 8000.

Rotas: /register, /login, /app, /app/new e /app/analyses/:id. O backend e o banco precisam estar ativos, com migrations aplicadas. Crie sua conta em /register. O [README da raiz](../README.md) contém os comandos de execução. O cadastro inicia a sessão automaticamente; login e cadastro preservam o destino privado solicitado antes da autenticação.

Verificação: npm run build e npm run lint. Testes no navegador: npm run test:e2e para autenticação e npm run test:e2e:analyses para análises. Use somente conta/banco de teste; configuração e resultados em [docs/P6.md](../docs/P6.md).

## Interface

A tela de resultado segue a referência visual enviada: menu lateral, busca, três indicadores, barras por categoria, gráfico de radar e tabela de trechos com filtros e cinco linhas por página. A aba **Documentos** reúne o download do original e a reanálise. **Exportar PDF** baixa um relatório A4 com indicadores, notas por categoria, todos os trechos, limitações, achados, recomendações e identificação do método. Os filtros e a paginação da tela não limitam o relatório. **Exportar JSON** preserva os dados completos, incluindo evidências e memória de cálculo. A biblioteca e as fontes do PDF são carregadas somente ao exportar, sem serviços externos.

Em **Minhas análises**, **Excluir** abre uma confirmação. A exclusão atualiza o histórico e retorna à página anterior quando necessário. Análises em processamento não podem ser excluídas. Reanálises são preservadas.

Os indicadores usam os dados reais da API: a nota global é da política e as notas da tabela são das categorias associadas aos trechos. O serviço atual não emite uma nota individual por trecho. Categorias sem nota aparecem com um traço e não recebem zero no radar.

Com o Vite ativo, execute `npm run test:e2e:dashboard` para validar o novo painel em larguras de 320 a 1861 px, filtros combinados, paginação, teclado, exportação, download e notas ausentes. As capturas ficam em `test-results/dashboard-*.png`.

A direção visual está em [DESIGN.md](DESIGN.md). O layout usa superfícies claras, verde discreto, fontes locais e navegação lateral adaptada ao celular. Os trechos citados recebem um tratamento próprio para distinguir evidências dos controles.

Com o Vite ativo, execute `npm run test:e2e:design` para validar a interface no Edge. São seis testes com API simulada, sem conta real ou alteração no banco: telas públicas e privadas entre 320 e 1440 px, envio, evidências, download, logout, histórico vazio, análise parcial, nota zero e erros. Capturas ficam em `test-results/design-*.png`. Essa verificação não substitui os testes de integração com backend e inferência reais.

Execute `npm run test:e2e:ui` para verificar cadastro, exclusão, envio, reanálise, histórico, dashboard e geração de PDF com respostas controladas, sem banco. `npm run test:e2e` inclui cadastro e login reais em banco de teste. Para isolar os serviços, use `API_PROXY_TARGET` no Vite e `E2E_BASE_URL` no Playwright.

## Instalar e executar

```powershell
npm ci
npm run dev
```

Use Node 22.17 ou compatível com `package.json`. `VITE_API_BASE_URL` mantém `/api`; `API_PROXY_TARGET`, se definido no ambiente do Vite, troca apenas o destino local do proxy. Não é necessário criar `.env` para usar os padrões.

## Estrutura para leitura

```text
src/main.tsx       Inicialização do React
src/App.tsx        Rotas públicas e privadas
src/auth/          Sessão e proteção de páginas
src/services/      Contrato e chamadas ao backend
src/pages/         Telas, histórico e resultado
src/components/    Navegação e elementos compartilhados
src/styles/        Tema e estilos
e2e/               Testes com navegador
dist/              Build gerado; não editar
```

Em `pages/AnalysisResult`, `dashboardData.ts` prepara os filtros, `recommendationData.ts` liga orientações às evidências, `policyMean.ts` calcula a média e `exportPdf.ts` monta o PDF. Esses arquivos não chamam o modelo: a classificação vem do backend.

```powershell
npm run typecheck
npm run lint
npm run build
npm run test:e2e:ui
npx --no-install playwright test landing.spec.ts policy-mean.spec.ts segment-guidance.spec.ts
```

Deixe o Vite ativo ao rodar testes de interface. `test:e2e:ui` usa respostas controladas e não exige banco. Os testes reais usam `E2E_USER_EMAIL`, `E2E_USER_PASSWORD` e, para análise, `E2E_POLICY_FILE`, `E2E_OCR_FILE` e `E2E_RESULT_FIXTURE`. Use somente conta e arquivos de teste. O navegador padrão é Edge; `PLAYWRIGHT_CHANNEL` permite selecionar outro canal instalado.

`package.json` define comandos; `package-lock.json` fixa as dependências. Os `tsconfig*.json` configuram os tipos; `vercel.json` configura o encaminhamento da hospedagem. JSON não recebe comentários, por isso sua finalidade fica neste guia.
