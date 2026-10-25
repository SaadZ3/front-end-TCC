import { expect, test } from '@playwright/test';

test('demonstração troca evidências por teclado e perguntas abrem em todas as larguras', async ({ page }) => {
  await page.route('**/api/users/me', route => route.fulfill({ status: 401, json: {} }));
  for (const width of [1440, 820, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/');
    const demo = page.getByRole('region', { name: 'Demonstração interativa de leitura' });
    const sharing = demo.getByRole('button', { name: 'Compartilhamento', exact: true });
    await sharing.focus();
    await page.keyboard.press('Enter');
    await expect(sharing).toHaveAttribute('aria-pressed', 'true');
    await expect(demo.locator('mark')).toHaveText('Compartilhamos seu endereço com a transportadora responsável pela entrega do pedido.');
    await expect(demo.getByRole('heading', { name: 'Com quem os dados são compartilhados?' })).toBeVisible();
    await demo.getByRole('button', { name: 'Seus direitos' }).click();
    await expect(demo.locator('mark')).toContainText('solicitar a exclusão');
    await expect(demo.locator('button[aria-pressed="true"]')).toHaveCount(1);
    await page.getByText('Que tipo de documento posso analisar?', { exact: true }).click();
    await expect(page.getByText(/Uma política de privacidade em português, em PDF/)).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await demo.getByRole('button', { name: 'Coleta de dados' }).click();
    await page.screenshot({ path: `test-results/landing-redesign-${width}.png`, fullPage: true });
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: `test-results/landing-opening-${width}.png` });
  }
});
