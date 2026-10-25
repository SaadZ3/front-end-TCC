import { expect, test, type Page } from '@playwright/test';
import { completedAnalysis } from './fixture';

// Dados simulados permitem validar a interface sem conta ou banco reais.
const session = { user: { id: 'ui-user', name: 'Ana Silva', email: 'ana@example.test', role: 'EVALUATOR' }, expires_at: new Date(Date.now() + 3600000).toISOString() };
const analysis = completedAnalysis();
async function mockApi(page: Page, authenticated = true, empty = false) {
  let loggedIn = authenticated;
  await page.route('**/api/**', async route => {
    const path = new URL(route.request().url()).pathname.replace('/api', '');
    if (path === '/users/me') return route.fulfill({ status: loggedIn ? 200 : 401, json: loggedIn ? session : { error: { message: 'Sessão ausente' } } });
    if (path === '/auth/login') { loggedIn = true; return route.fulfill({ json: session }); }
    if (path === '/auth/logout') { loggedIn = false; return route.fulfill({ status: 204 }); }
    if (path === '/analyses' && route.request().method() === 'POST') return route.fulfill({ json: analysis });
    if (path === '/analyses') return route.fulfill({ json: { page: 1, page_size: 10, total: empty ? 0 : 3, items: empty ? [] : [
      analysis,
      { ...analysis, analysis_id: 'pending', original_filename: 'politica-em-processamento.pdf', status: 'processing' },
      { ...analysis, analysis_id: 'failed', original_filename: 'documento-digitalizado.pdf', status: 'failed' },
    ] } });
    if (path === '/analyses/ui-analysis/file') return route.fulfill({ body: 'Documento de teste', contentType: 'text/plain' });
    if (path === '/analyses/ui-analysis') return route.fulfill({ json: analysis });
    return route.fulfill({ status: 404, json: { error: { message: 'Análise não encontrada.' } } });
  });
}
async function noOverflow(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
}
test('telas públicas em computador e celular, com acesso por teclado', async ({ page }) => {
  await mockApi(page, false);
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 960 });
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('política de privacidade');
    await noOverflow(page);
    await page.screenshot({ path: 'test-results/design-home-' + width + '.png', fullPage: true });
    await page.getByRole('button', { name: 'Analisar uma política' }).click();
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByLabel('E-mail', { exact: true })).toBeVisible();
    await noOverflow(page);
    await page.screenshot({ path: 'test-results/design-login-' + width + '.png', fullPage: true });
  }
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Pular para o conteúdo' })).toBeFocused();
});
test('histórico, envio e resultado se adaptam às larguras de tela', async ({ page }) => {
  await mockApi(page);
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  for (const width of [1440, 820, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const [path, name, heading] of [
      ['/app', 'history', 'Minhas análises'],
      ['/app/dashboard', 'dashboard-picker', 'Dashboard analítico'],
      ['/app/new', 'upload', 'Enviar política de privacidade'],
      ['/app/analyses/ui-analysis', 'result', 'Resultado da análise de políticas'],
    ]) {
      await page.goto(path);
      await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible();
      if (name === 'history') {
        await expect(page.getByText('Concluída', { exact: true })).toBeVisible();
        const filename = await page.getByRole('link', { name: 'politica-de-privacidade.txt', exact: true }).boundingBox();
        expect(filename?.width).toBeGreaterThan(150);
      }
      await noOverflow(page);
      await page.screenshot({ path: 'test-results/design-' + name + '-' + width + '.png', fullPage: true });
    }
  }
  expect(errors).toEqual([]);
});

test('menu unificado dá acesso à conta e ao dashboard de um documento', async ({ page }) => {
  await mockApi(page);
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of ['/app', '/app/new', '/app/dashboard', '/app/analyses/ui-analysis']) {
      await page.goto(path);
      if (width === 390) await page.getByRole('button', { name: 'Menu de navegação' }).click();
      const nav = page.getByRole('navigation', { name: 'Área de análises' });
      for (const name of ['Nova análise', 'Minhas análises', 'Dashboard analítico']) await expect(nav.getByRole('link', { name, exact: true })).toBeVisible();
      await expect(nav.locator('[aria-current="page"]')).toHaveCount(1);
      await nav.getByRole('button', { name: 'Configurações da conta' }).click();
      await expect(page.getByRole('dialog')).toContainText('ana@example.test');
      await page.keyboard.press('Escape');
      await expect(page.getByRole('dialog')).not.toBeVisible();
      await noOverflow(page);
    }
    await page.goto('/app');
    if (width === 390) await page.getByRole('button', { name: 'Menu de navegação' }).click();
    await page.getByRole('link', { name: 'Dashboard analítico', exact: true }).click();
    await expect(page).toHaveURL(/\/app\/dashboard$/);
    await page.getByRole('link', { name: 'Selecionar uma análise', exact: true }).click();
    await expect(page).toHaveURL(/\/app$/);
    await page.getByRole('link', { name: 'politica-de-privacidade.txt', exact: true }).click();
    await expect(page).toHaveURL(/\/app\/analyses\/ui-analysis$/);
    await expect(page.getByRole('heading', { name: 'Resultado da análise de políticas' })).toBeVisible();
  }
});
test('envio, evidência, download, histórico e logout permanecem utilizáveis', async ({ page }) => {
  await mockApi(page);
  await page.goto('/app/new');
  await expect(page.getByRole('link', { name: 'Nova análise', exact: true })).toHaveAttribute('aria-current', 'page');
  await page.getByLabel('Arquivo da política').setInputFiles({ name: 'politica.txt', mimeType: 'text/plain', buffer: Buffer.from('Coletamos nome e e-mail.') });
  await page.getByLabel('Conteúdo enviado').selectOption('full_document');
  await page.getByRole('button', { name: 'Analisar política', exact: true }).click();
  await expect(page).toHaveURL(/ui-analysis/);
  await expect(page.getByRole('table', {name: 'Trechos classificados e notas das categorias'})).toBeVisible();
  await page.getByRole('tab', { name: 'Documentos' }).click();
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Baixar arquivo original' }).click();
  expect((await download).suggestedFilename()).toBe('politica-de-privacidade.txt');
  await page.getByRole('navigation', { name: 'Área de análises' }).getByRole('link', { name: 'Minhas análises', exact: true }).click();
  await expect(page.getByRole('link', { name: 'Minhas análises', exact: true })).toHaveAttribute('aria-current', 'page');
  await page.getByLabel('Menu da conta', { exact: true }).click();
  await page.getByRole('button', { name: 'Sair da conta' }).click();
  await expect(page.getByRole('heading', { name: 'Entre na sua conta' })).toBeVisible();
});
test('histórico vazio orienta o primeiro envio e arquivo inválido não é enviado', async ({ page }) => {
  await mockApi(page, true, true);
  await page.goto('/app');
  await page.getByRole('link', { name: 'Enviar uma política', exact: true }).click();
  await page.getByLabel('Arquivo da política').setInputFiles({ name: 'politica.docx', mimeType: 'text/plain', buffer: Buffer.from('Texto') });
  await page.getByLabel('Conteúdo enviado').selectOption('excerpt');
  await page.getByRole('button', { name: 'Analisar política', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('PDF com texto');
});

test('dashboard sem seleção tem entrada própria e não carrega nem repete o histórico', async ({ page }) => {
  await mockApi(page);
  const historyRequests: string[] = [];
  page.on('request', request => {
    if (new URL(request.url()).pathname === '/api/analyses') historyRequests.push(request.url());
  });
  await page.goto('/app/dashboard');
  await expect(page.getByText('Nenhuma análise selecionada', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Histórico de análises' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Atualizar histórico' })).toHaveCount(0);
  await expect(page.getByText('politica-de-privacidade.txt', { exact: true })).toHaveCount(0);
  expect(historyRequests).toEqual([]);
  await page.getByRole('link', { name: 'Enviar nova política', exact: true }).click();
  await expect(page.getByLabel('Arquivo da política')).toBeVisible();
  await page.goto('/app/dashboard');
  await page.getByRole('link', { name: 'Selecionar uma análise', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Histórico de análises' })).toBeVisible();
});

test('estrutura visual é compartilhada pelo envio, histórico e dashboard', async ({ page }) => {
  await mockApi(page);
  await page.setViewportSize({ width: 1440, height: 960 });
  const appearances: unknown[] = [];
  for (const path of ['/app', '/app/new', '/app/dashboard', '/app/analyses/ui-analysis']) {
    await page.goto(path);
    await expect(page.locator('main h1')).toBeVisible();
    appearances.push(await page.evaluate(() => {
      const sidebar = document.querySelector('.result-sidebar')!;
      const main = document.querySelector('main')!;
      const title = document.querySelector('main h1')!;
      const topbar = document.querySelector('.result-topbar')!;
      return { sidebarWidth: sidebar.getBoundingClientRect().width, mainWidth: main.getBoundingClientRect().width,
        mainLeft: main.getBoundingClientRect().left, headerHeight: topbar.getBoundingClientRect().height,
        font: getComputedStyle(title).fontSize, color: getComputedStyle(title).color };
    }));
    await expect(page.getByRole('link', { name: 'LGPD Sys. — início' })).toBeVisible();
  }
  for (const appearance of appearances) expect(appearance).toEqual(appearances[0]);
});
test('nota zero, análise parcial, falha e página inexistente mantêm mensagens claras', async ({ page }) => {
  await mockApi(page);
  const partial = structuredClone(analysis);
  if (partial.status !== 'completed') throw new Error('Fixture inválida');
  partial.result.evaluation.score = null;
  partial.result.evaluation.input_status = 'partial_input';
  partial.result.document_scope = 'excerpt';
  await page.route('**/api/analyses/ui-analysis', route => route.fulfill({ json: partial }));
  await page.goto('/app/analyses/ui-analysis');
  await expect(page.getByText('Sem nota global', { exact: true })).toBeVisible();
  await expect(page.getByRole('meter')).toHaveCount(0);
  partial.result.evaluation.score = 0;
  partial.result.evaluation.score_status = 'available';
  partial.result.evaluation.dimensions.forEach(dimension => { dimension.contribution = 0; });
  await page.reload();
  await expect(page.getByLabel('Nota global da política', { exact: true })).toHaveText('0,00');
  await page.route('**/api/analyses/ui-analysis', route => route.fulfill({ json: { ...analysis, status: 'failed', result: null, error: { code: 'OCR', message: 'Este documento precisa de OCR.' } } }));
  await page.reload();
  await expect(page.getByRole('alert')).toContainText('OCR');
  await expect(page.getByText('Nenhuma nota foi gerada', { exact: false })).toBeVisible();
  await page.goto('/app/analyses/missing');
  await expect(page.getByRole('heading', { name: 'Análise não encontrada' })).toBeVisible();
  await page.goto('/pagina-inexistente');
  await expect(page.getByRole('heading', { name: 'Página não encontrada' })).toBeVisible();
});
test('falha de sessão permite tentar novamente', async ({ page }) => {
  await mockApi(page, false);
  await page.route('**/api/users/me', route => route.abort());
  await page.goto('/app');
  await expect(page.getByRole('alert')).toContainText('conectar ao servidor');
  await page.unroute('**/api/users/me');
  await page.getByRole('button', { name: 'Tentar novamente' }).click();
  await expect(page.getByRole('heading', { name: 'Entre na sua conta' })).toBeVisible();
});

