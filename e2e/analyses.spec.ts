import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { normalizeStoredResult } from '../../tcc-back/src/utils/scoreScale';
const email = process.env.E2E_USER_EMAIL!;
const password = process.env.E2E_USER_PASSWORD!;
const pdf = process.env.E2E_POLICY_FILE!;
const ocr = process.env.E2E_OCR_FILE!;
if (!email || !password || !pdf || !ocr || !process.env.E2E_RESULT_FIXTURE)
  throw new Error('Configure E2E_USER_EMAIL, E2E_USER_PASSWORD, E2E_POLICY_FILE, E2E_OCR_FILE e E2E_RESULT_FIXTURE; veja docs/P6.md.');
const fixture = JSON.parse(readFileSync(process.env.E2E_RESULT_FIXTURE, 'utf8'));
fixture.result = normalizeStoredResult(fixture.result);
test.beforeEach(async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('E-mail', { exact: true }).fill(email);
  await page.getByLabel('Senha', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Entrar', exact: true }).last().click();
  await expect(page).toHaveURL(/\/app$/);
});
async function form(page: Page) {
  await page.goto('/app/new');
  await page.getByLabel('Conteúdo enviado').selectOption('full_document');
}

test('PDF real: envio, evidências, recarga, histórico, download e tela móvel', async ({ page }) => {
  test.setTimeout(150000);
  await form(page);
  await page.getByLabel('Arquivo da política').setInputFiles(pdf);
  await page.getByRole('button', { name: 'Analisar política', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Analisando…', exact: true })).toBeDisabled();
  await expect(page).toHaveURL(/\/app\/analyses\//, { timeout: 120000 });
  await expect(page.getByRole('heading', { name: 'Resultado da análise de políticas', exact: true })).toBeVisible();
  await expect(page.locator('.document-name')).toHaveText(path.basename(pdf));
  const savedUrl = page.url();
  await page.reload();
  await expect(page.getByRole('table', {name: 'Trechos classificados e notas das categorias'})).toBeVisible();
  await page.getByRole('tab', { name: 'Documentos' }).click();
  const downloaded = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Baixar arquivo original' }).click();
  const download = await downloaded;
  expect(readFileSync((await download.path())!)).toEqual(readFileSync(pdf));
  await page.screenshot({ path: 'test-results/p6-resultado.jpg', type: 'jpeg', quality: 75 });
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: 'test-results/p6-resultado-mobile.png' });
  await page.getByRole('button', { name: 'Menu de navegação', exact: true }).click();
  await page.getByRole('navigation', { name: 'Área de análises' }).getByRole('link', { name: 'Minhas análises', exact: true }).click();
  await page.reload();
  await page.getByRole('link', { name: path.basename(pdf), exact: true }).click();
  await expect(page).toHaveURL(savedUrl.split('?')[0]);
});

test('TXT real declarado como trecho mostra nota global indisponível', async ({ page }) => {
  await form(page);
  await page.getByLabel('Arquivo da política').setInputFiles({ name: 'trecho.txt', mimeType: 'text/plain',
    buffer: Buffer.from('Coletamos nome e e-mail para prestar serviços. Você pode solicitar a exclusão de seus dados.') });
  await page.getByLabel('Conteúdo enviado').selectOption('excerpt');
  await page.getByRole('button', { name: 'Analisar política', exact: true }).click();
  await expect(page).toHaveURL(/\/app\/analyses\//);
  await expect(page.getByText('Sem nota global', { exact: true })).toBeVisible();
});

test('rejeita arquivo inválido/grande antes do upload; OCR real salva falha legível', async ({ page }) => {
  await form(page);
  let posts = 0;
  page.on('request', request => { if (request.method() === 'POST' && request.url().endsWith('/analyses')) posts++; });
  for (const [name, buffer, message] of [
    ['politica.docx', Buffer.from('texto'), /PDF com texto/],
    ['vazia.txt', Buffer.alloc(0), /vazio/],
    ['grande.txt', Buffer.alloc(10 * 1024 * 1024 + 1, 120), /10 MiB/],
  ] as const) {
    await page.getByLabel('Arquivo da política').setInputFiles({ name, mimeType: 'text/plain', buffer });
    await page.getByRole('button', { name: 'Analisar política', exact: true }).click();
    await expect(page.getByRole('alert')).toContainText(message);
  }
  expect(posts).toBe(0);
  await page.getByLabel('Arquivo da política').setInputFiles(ocr);
  await page.getByRole('button', { name: 'Analisar política', exact: true }).click();
  await expect(page).toHaveURL(/\/app\/analyses\//);
  await expect(page.getByRole('heading', { name: 'Não foi possível concluir a análise' })).toBeVisible();
  await expect(page.getByRole('alert')).toContainText('OCR');
  await expect(page.getByText('Nenhuma nota foi gerada', { exact: false })).toBeVisible();
});

test('envio duplicado bloqueado e indisponibilidade permite nova tentativa', async ({ page }) => {
  await form(page);
  await page.getByLabel('Arquivo da política').setInputFiles({ name: 'teste.txt', mimeType: 'text/plain', buffer: Buffer.from('Texto de teste.') });
  let posts = 0;
  await page.route('**/api/analyses', async route => {
    posts++;
    await new Promise(resolve => setTimeout(resolve, 400));
    await route.fulfill({ status: 503, json: { error: { code: 'INFERENCE_UNAVAILABLE', message: 'Serviço ocupado. Tente novamente.' } } });
  });
  const button = page.getByRole('button', { name: 'Analisar política', exact: true });
  await button.click();
  await expect(page.getByRole('button', { name: 'Analisando…', exact: true })).toBeDisabled();
  await page.locator('form').evaluate(form => form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));
  await expect(page.getByRole('alert')).toContainText('Serviço ocupado');
  expect(posts).toBe(1);
  await expect(button).toBeEnabled();
});

test('falha de rede orienta consultar histórico sem reenviar automaticamente', async ({ page }) => {
  await form(page);
  await page.getByLabel('Arquivo da política').setInputFiles({ name: 'teste.txt', mimeType: 'text/plain', buffer: Buffer.from('Texto de teste.') });
  await page.route('**/api/analyses', route => route.abort());
  await page.getByRole('button', { name: 'Analisar política', exact: true }).click();
  await expect(page.getByRole('link', { name: 'Consulte o histórico', exact: true })).toBeVisible();
});

test('consulta de outro usuário não revela resultado e sessão vencida pede login', async ({ page }) => {
  await page.route('**/api/analyses/00000000-0000-4000-8000-000000000001', route =>
    route.fulfill({ status: 404, json: { error: { code: 'NOT_FOUND', message: 'Análise não encontrada.' } } }));
  await page.goto('/app/analyses/00000000-0000-4000-8000-000000000001');
  await expect(page.getByRole('heading', { name: 'Análise não encontrada' })).toBeVisible();
  await page.route('**/api/analyses?page=*', route =>
    route.fulfill({ status: 401, json: { error: { code: 'UNAUTHORIZED', message: 'Sua sessão terminou.' } } }));
  await page.getByRole('link', { name: 'Voltar ao histórico' }).click();
  await expect(page).toHaveURL(/\/login\?expired=1/);
});

test('estado processing atualiza para resultado e nota zero continua visível', async ({ page }) => {
  let ready = false;
  const complete = { ...structuredClone(fixture), original_filename: 'zero.txt' };
  complete.result.evaluation.score = 0;
  await page.route('**/api/analyses/' + fixture.analysis_id, route =>
    route.fulfill({ json: !ready ? { ...complete, status: 'processing', result: null, error: null, versions: null } : complete }));
  await page.goto('/app/analyses/' + fixture.analysis_id);
  await expect(page.getByRole('status')).toContainText('em processamento');
  ready = true;
  await expect(page.getByLabel('Nota global da política', { exact: true })).toHaveText('0', { timeout: 8000 });
  await expect(page.getByText('Sem nota global', { exact: true })).toHaveCount(0);
});

test('histórico mostra falha de conexão e permite atualizar', async ({ page }) => {
  await page.route('**/api/analyses?page=*', route => route.abort());
  await page.reload();
  await expect(page.getByRole('alert')).toContainText('conectar ao servidor');
  await page.unroute('**/api/analyses?page=*');
  await page.getByRole('button', { name: 'Atualizar histórico' }).click();
  await expect(page.getByRole('alert')).toHaveCount(0);
});

test('timeout salvo é apresentado sem nota e extração parcial mantém avisos', async ({ page }) => {
  const failed = { ...structuredClone(fixture), status: 'failed', result: null, versions: null,
    error: { code: 'ANALYSIS_TIMEOUT', message: 'O serviço de análise excedeu o tempo limite.' } };
  await page.route('**/api/analyses/' + fixture.analysis_id, route => route.fulfill({ json: failed }));
  await page.goto('/app/analyses/' + fixture.analysis_id);
  await expect(page.getByRole('alert')).toContainText('tempo limite');
  await expect(page.getByText('Nenhuma nota foi gerada', { exact: false })).toBeVisible();
  await page.unroute('**/api/analyses/' + fixture.analysis_id);
  const partial = structuredClone(fixture);
  partial.result.extraction.status = 'partial';
  partial.result.extraction.warnings = ['PAGE_WITHOUT_TEXT: página 2 sem texto extraível.'];
  partial.result.evaluation.input_status = 'no_usable_segments';
  partial.result.segments = [];
  partial.result.evaluation.score = null;
  partial.result.evaluation.dimensions.forEach((dimension: { score: number | null }) => { dimension.score = null; });
  await page.route('**/api/analyses/' + fixture.analysis_id, route => route.fulfill({ json: partial }));
  await page.reload();
  await expect(page.getByText('Sem nota global', { exact: true })).toBeVisible();
  await expect(page.getByRole('table')).toContainText('Nenhum trecho encontrado');
  await page.getByRole('tab', { name: 'Documentos' }).click();
  await expect(page.getByText('PAGE_WITHOUT_TEXT: página 2 sem texto extraível.', { exact: true })).toBeVisible();
});

