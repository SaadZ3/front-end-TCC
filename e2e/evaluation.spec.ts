import { expect, test, type Page } from '@playwright/test';
import { completedAnalysis } from './fixture';

async function mock(page: Page) {
  const analysis = completedAnalysis();
  await page.route('**/api/**', route => {
    const path = new URL(route.request().url()).pathname;
    if (path.endsWith('/users/me')) return route.fulfill({ json: {
      user: { id: 'test', name: 'Teste', email: 'test@example.test', role: 'EVALUATOR' },
      expires_at: new Date(Date.now() + 3600000).toISOString(),
    } });
    if (path === '/api/analyses' && route.request().method() === 'GET')
      return route.fulfill({ json: { items: [analysis], total: 1, page: 1, page_size: 10 } });
    return route.fulfill({ json: analysis });
  });
  return analysis;
}

test('envio usa o método definitivo sem seleção nem parâmetros técnicos', async ({ page }) => {
  await mock(page);
  await page.goto('/app/new');
  await expect(page.getByLabel('Método de avaliação')).toHaveCount(0);
  await expect(page.locator('body')).not.toContainText(/14 perguntas|sete dimensões|7 dimensões|v1|v2/);
  await page.getByLabel('Arquivo da política').setInputFiles({
    name: 'politica.txt', mimeType: 'text/plain', buffer: Buffer.from('Coletamos nome para prestar serviços.'),
  });
  await page.getByLabel('Conteúdo enviado').selectOption('full_document');
  const pending = page.waitForRequest(request => request.method() === 'POST' && request.url().endsWith('/api/analyses'));
  await page.getByRole('button', { name: 'Analisar política', exact: true }).click();
  const request = await pending;
  expect(request.postData()).toContain('full_document');
  expect(request.postData()).not.toMatch(/profile_id|method|version/);
  await expect(page).toHaveURL(/\/app\/analyses\/ui-analysis$/);
});

test('histórico e dashboard não expõem versões nem o relatório removido', async ({ page }) => {
  await mock(page);
  await page.goto('/app');
  await expect(page.getByText('Concluída', { exact: true })).toBeVisible();
  await expect(page.locator('body')).not.toContainText(/Método v\d/);
  await page.getByRole('link', { name: 'politica-de-privacidade.txt', exact: true }).click();
  await expect(page.getByRole('table')).toBeVisible();
  await expect(page.getByText('Evidências e detalhes da avaliação', { exact: true })).toHaveCount(0);
  await page.goto('/app/analyses/ui-analysis?details=1#question-explanation');
  await expect(page.locator('.evaluation-details, .full-report')).toHaveCount(0);
  await expect(page.locator('body')).not.toContainText(/14 perguntas|sete dimensões|7 dimensões|Avaliação v\d/);
  await page.getByRole('tab', { name: 'Documentos' }).click();
  await expect(page.getByRole('button', { name: 'Ver relatório detalhado' })).toHaveCount(0);
  await page.getByRole('link', { name: 'Reavaliar política' }).click();
  await page.getByLabel('Arquivo da política').setInputFiles({ name: 'revisada.txt', mimeType: 'text/plain', buffer: Buffer.from('Política revisada.') });
  await page.getByLabel('Conteúdo enviado').selectOption('excerpt');
  const pending = page.waitForRequest(request => request.method() === 'POST' && request.url().endsWith('/api/analyses'));
  await page.getByRole('button', { name: 'Analisar política', exact: true }).click();
  expect((await pending).postData()).toContain('name="supersedes_analysis_id"\r\n\r\nui-analysis');
});
