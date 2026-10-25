import { expect, test } from '@playwright/test';
import { randomUUID } from 'node:crypto';

const email = process.env.E2E_USER_EMAIL;
const password = process.env.E2E_USER_PASSWORD;
if (!email || !password) throw new Error('Defina E2E_USER_EMAIL e E2E_USER_PASSWORD para uma conta de teste.');

test('login real, recarga, isolamento do token e logout', async ({ page, context }) => {
  await page.goto('/app');
  await expect(page).toHaveURL(/\/login/);
  await page.getByLabel('E-mail', { exact: true }).fill(email);
  await page.getByLabel('Senha', { exact: true }).fill('senha-incorreta');
  await page.getByRole('button', { name: 'Entrar', exact: true }).last().click();
  await expect(page.getByRole('alert')).toContainText('E-mail ou senha incorretos');

  await page.getByLabel('Senha', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Entrar', exact: true }).last().click();
  await expect(page).toHaveURL(/\/app$/);
  await expect(page.getByRole('heading', { name: 'Minhas análises' })).toBeVisible();
  const sessionCookie = (await context.cookies()).find(cookie => cookie.name === 'tcc_session');
  expect(sessionCookie?.httpOnly).toBe(true);
  expect(await page.evaluate(() => localStorage.length)).toBe(0);
  expect(await page.evaluate(() => document.cookie)).not.toContain('tcc_session');
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Minhas análises' })).toBeVisible();
  await page.screenshot({ path: 'test-results/area-privada.png', fullPage: true });

  await page.getByLabel('Menu da conta', { exact: true }).click();
  await page.getByRole('button', { name: 'Sair da conta' }).click();
  await expect(page).toHaveURL(/\/login/);
  await page.goto('/app');
  await expect(page).toHaveURL(/\/login/);
  expect((await context.cookies()).some(cookie => cookie.name === 'tcc_session')).toBe(false);
});

test('login em tela móvel e acesso direto após perder a sessão', async ({ page, context }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/login');
  await expect(page.getByRole('heading', { name: 'Entre na sua conta' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: 'test-results/login-mobile.png', fullPage: true });
  await page.getByLabel('E-mail', { exact: true }).fill(email);
  await page.getByLabel('Senha', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Entrar', exact: true }).last().click();
  await expect(page.getByRole('heading', { name: 'Minhas análises' })).toBeVisible();
  await context.clearCookies();
  await page.reload();
  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByRole('heading', { name: 'Minhas análises' })).toHaveCount(0);
});

test('indisponibilidade na restauração oferece nova tentativa', async ({ page }) => {
  await page.route('**/api/users/me', route => route.abort());
  await page.goto('/app');
  await expect(page.getByRole('heading', { name: 'Não foi possível verificar seu acesso' })).toBeVisible();
  await expect(page.getByRole('alert')).toContainText('conectar ao servidor');
  await page.unroute('**/api/users/me');
  await page.getByRole('button', { name: 'Tentar novamente' }).click();
  await expect(page).toHaveURL(/\/login/);
});

test('cadastro real inicia sessão, mantém recarga e permite login após logout', async ({ page, context }) => {
  const address = `browser-${randomUUID()}@example.test`;
  await page.goto('/register');
  await page.getByLabel('Nome', { exact: true }).fill('Cadastro pelo Navegador');
  await page.getByLabel('E-mail', { exact: true }).fill(address);
  await page.getByLabel('Senha', { exact: true }).fill(password);
  await page.getByLabel('Confirmar senha', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Criar conta', exact: true }).click();
  await expect(page).toHaveURL(/\/app$/);
  expect((await context.cookies()).find(cookie => cookie.name === 'tcc_session')?.httpOnly).toBe(true);
  await page.reload();
  await expect(page.getByText('Olá, Cadastro pelo Navegador.', { exact: false })).toBeVisible();
  await page.getByLabel('Menu da conta', { exact: true }).click();
  await page.getByRole('button', { name: 'Sair da conta' }).click();
  await page.getByLabel('E-mail', { exact: true }).fill(address.toUpperCase());
  await page.getByLabel('Senha', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Entrar', exact: true }).last().click();
  await expect(page).toHaveURL(/\/app$/);
});

