import { expect, test } from '@playwright/test';
import { completedAnalysis } from './fixture';

const session = { user: { id: 'user-test', name: 'Pessoa de Teste', email: 'teste@example.test', role: 'EVALUATOR' }, expires_at: new Date(Date.now() + 3600000).toISOString() };

test('cadastro valida confirmação, trata e-mail repetido e restaura sessão após recarga', async ({ page }) => {
  let loggedIn = false;
  let attempts = 0;
  await page.route('**/api/**', route => {
    const path = new URL(route.request().url()).pathname;
    if (path.endsWith('/users/me')) return route.fulfill({ status: loggedIn ? 200 : 401, json: loggedIn ? session : {} });
    if (path.endsWith('/auth/register')) {
      attempts++;
      expect(route.request().postDataJSON()).toEqual({ name: 'Pessoa de Teste', email: 'teste@example.test', password: 'Senha-teste-123' });
      if (attempts === 1) return route.fulfill({ status: 409, json: { error: { message: 'Já existe uma conta com este e-mail.' } } });
      loggedIn = true; return route.fulfill({ status: 201, json: session });
    }
    return route.fulfill({ json: { items: [], page: 1, page_size: 10, total: 0 } });
  });
  await page.goto('/login');
  await page.getByRole('link', { name: 'Criar conta' }).click();
  await page.getByLabel('Nome', { exact: true }).fill('Pessoa de Teste');
  await page.getByLabel('E-mail', { exact: true }).fill('teste@example.test');
  await page.getByLabel('Senha', { exact: true }).fill('Senha-teste-123');
  await page.getByLabel('Confirmar senha', { exact: true }).fill('Senha-diferente');
  await page.getByRole('button', { name: 'Criar conta', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('não coincidem'); expect(attempts).toBe(0);
  await page.getByLabel('Confirmar senha', { exact: true }).fill('Senha-teste-123');
  await page.getByRole('button', { name: 'Mostrar senhas' }).click();
  await expect(page.getByLabel('Senha', { exact: true })).toHaveAttribute('type', 'text');
  await page.getByRole('button', { name: 'Criar conta', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Já existe');
  await page.getByRole('button', { name: 'Criar conta', exact: true }).click();
  await expect(page).toHaveURL(/\/app$/);
  await page.reload(); await expect(page.getByRole('heading', { name: 'Minhas análises' })).toBeVisible();
});

test('cadastro móvel, senha em bytes e erro de conexão preservam o formulário', async ({ page }) => {
  await page.route('**/api/users/me', route => route.fulfill({ status: 401, json: {} }));
  await page.route('**/api/auth/register', route => route.abort());
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto('/register');
  await page.getByLabel('Nome', { exact: true }).fill('Pessoa de Teste');
  await page.getByLabel('E-mail', { exact: true }).fill('teste@example.test');
  await page.getByLabel('Senha', { exact: true }).fill('é'.repeat(37));
  await page.getByLabel('Confirmar senha', { exact: true }).fill('é'.repeat(37));
  await page.getByRole('button', { name: 'Criar conta', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('72 bytes');
  await page.getByLabel('Senha', { exact: true }).fill('Senha-teste-123');
  await page.getByLabel('Confirmar senha', { exact: true }).fill('Senha-teste-123');
  await page.getByRole('button', { name: 'Criar conta', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('conectar ao servidor');
  await expect(page.getByLabel('Nome', { exact: true })).toHaveValue('Pessoa de Teste');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: 'test-results/register-mobile.png', fullPage: true });
});

test('exclusão pede confirmação, mantém item após falha e volta da última página vazia', async ({ page }) => {
  const analysis = completedAnalysis();
  let deleted = false;
  let requests = 0;
  await page.route('**/api/**', route => {
    const url = new URL(route.request().url());
    if (url.pathname.endsWith('/users/me')) return route.fulfill({ json: session });
    if (route.request().method() === 'DELETE') {
      requests++;
      if (requests === 1) return route.fulfill({ status: 500, json: { error: { message: 'Não foi possível excluir.' } } });
      deleted = true; return route.fulfill({ status: 204 });
    }
    const pageNumber = Number(url.searchParams.get('page'));
    return route.fulfill({ json: { items: pageNumber === 2 ? (deleted ? [] : [analysis]) : [{ ...analysis, analysis_id: 'processing', status: 'processing', original_filename: 'em-processamento.txt' }], page: pageNumber, page_size: 10, total: deleted ? 10 : 11 } });
  });
  await page.goto('/app?page=2');
  await page.getByRole('button', { name: 'Excluir análise politica-de-privacidade.txt' }).click();
  await expect(page.getByRole('dialog')).toContainText('não pode ser desfeita');
  await page.getByRole('button', { name: 'Cancelar', exact: true }).click(); expect(requests).toBe(0);
  await page.getByRole('button', { name: 'Excluir análise politica-de-privacidade.txt' }).click();
  await page.getByRole('button', { name: 'Excluir análise', exact: true }).click();
  await expect(page.getByRole('dialog').getByRole('alert')).toContainText('Não foi possível excluir');
  await expect(page.getByRole('link', { name: 'politica-de-privacidade.txt' })).toBeVisible();
  await page.getByRole('button', { name: 'Excluir análise', exact: true }).click();
  await expect(page).toHaveURL(/page=1/);
  await expect(page.getByRole('status').filter({ hasText: 'Análise excluída' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Excluir análise em-processamento.txt' })).toBeDisabled();
});

