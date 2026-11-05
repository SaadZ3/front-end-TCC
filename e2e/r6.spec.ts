/** Verifica notas contínuas, explicações, orientações e exportação na R6. */
import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import type { CompletedAnalysis } from '../src/pages/AnalysisResult/dashboardData';
const artifacts = process.env.E2E_ARTIFACT_DIR || '../docs/evidencias/R6';

function fixture(name = 'partial-credit'): CompletedAnalysis {
  const source = JSON.parse(readFileSync(new URL(`../../tcc-back/tests/fixtures/r6/${name}.json`, import.meta.url), 'utf8'));
  return { ...source, analysis_id: 'r6-test', status: 'completed', error: null,
    original_filename: 'Política de exemplo R6', created_at: '2026-11-05T12:00:00Z',
    profile_id: 'core-14-v1', supersedes_analysis_id: null };
}

async function open(page: Page, data: CompletedAnalysis) {
  await page.route('**/api/**', route => {
    if (new URL(route.request().url()).pathname.endsWith('/users/me')) return route.fulfill({ json: {
      user: { id: 'reviewer', name: 'Revisor', email: 'revisor@example.test', role: 'EVALUATOR' },
      expires_at: new Date(Date.now() + 3600000).toISOString(),
    } });
    return route.fulfill({ json: data });
  });
  await page.goto('/app/analyses/r6-test');
  await expect(page.getByRole('table')).toBeVisible();
}

test('categoria fracionária, média e memória de cálculo usam a mesma escala', async ({ page }) => {
  await open(page, fixture());
  await expect(page.getByLabel('Nota global da política')).toHaveText('0,11');
  await expect(page.getByRole('button', { name: /Filtrar Direitos dos titulares: 0,75 de 3/ })).toBeVisible();
  await expect(page.getByLabel('Filtrar nota da categoria').locator('option[value="0.75"]')).toHaveText('Nota 0,75');
  await page.getByText('Como as notas foram calculadas', { exact: true }).click();
  const details = page.getByLabel('Memória de cálculo das notas');
  await expect(details).toContainText('Canal de solicitação de direitos: Informação parcial (0,5 de 1 ponto)');
  await expect(details).toContainText('Prazo de resposta e marco inicial: Informação não detectada (0 de 1 ponto)');
  await expect(page.getByLabel('Escala de avaliação', { exact: true })).toHaveCount(0);
  await page.screenshot({ path: `${artifacts}/tela-calculo-desktop.png`, fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: `${artifacts}/tela-calculo-mobile.png`, fullPage: true });
});

test('recomendações, passos e referências continuam disponíveis', async ({ page }) => {
  await open(page, fixture('local'));
  const row = page.getByRole('table').getByRole('row').nth(1);
  await row.getByRole('button', { name: /ponto de atenção/ }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toContainText('Informação parcial');
  await expect(dialog).toContainText('Como melhorar');
  await expect(dialog.locator('ol li').first()).toBeVisible();
  await expect(dialog).toContainText('ISO 27701');
});

test('exportação preserva cálculo, ações, referências e dados originais', async ({ page }) => {
  const data = fixture();
  await open(page, data);
  const { pdf, unchanged } = await page.evaluate(async analysis => {
    const path = '/src/pages/AnalysisResult/exportPdf.ts';
    const before = JSON.stringify(analysis);
    const pdf = JSON.stringify((await import(/* @vite-ignore */ path)).analysisPdfDefinition(analysis));
    return { pdf, unchanged: before === JSON.stringify(analysis) };
  }, data);
  expect(pdf).toContain('0,75 / 3');
  expect(pdf).toContain('Informação parcial');
  expect(pdf).toContain('continuous_0_3');
  expect(pdf).toContain('Como conferir:');
  expect(pdf).toContain('Referência ISO');
  expect(pdf).not.toContain('locatable_channel');
  expect(pdf).toContain('canal localizável');
  for (const rec of data.result.evaluation.recommendations) {
    for (const step of rec.how_to_do) expect(pdf).toContain(step);
    for (const ref of rec.references) if (ref.url) expect(pdf).toContain(ref.url);
  }
  expect(unchanged).toBe(true);
  const downloaded = page.waitForEvent('download');
  await page.evaluate(async analysis => {
    const path = '/src/pages/AnalysisResult/exportPdf.ts';
    await (await import(/* @vite-ignore */ path)).exportAnalysisPdf(analysis);
  }, data);
  await (await downloaded).saveAs(`${artifacts}/relatorio-exemplo.pdf`);
});

test('filtro fracionário não arredonda para uma faixa', async ({ page }) => {
  const data = fixture();
  const segment = data.result.segments[0];
  segment.labels = ['User Access, Edit and Deletion'];
  await open(page, data);
  const lengths = await page.evaluate(async analysis => {
    const path = '/src/pages/AnalysisResult/dashboardData.ts';
    const { dashboardData, filterSegments } = await import(/* @vite-ignore */ path);
    const { rows } = dashboardData(analysis);
    return [filterSegments(rows, '', 'all', '.75').length, filterSegments(rows, '', 'all', '0').length];
  }, data);
  expect(lengths).toEqual([1, 0]);
});

test('entrada parcial mantém total bloqueado e explicação', async ({ page }) => {
  await open(page, fixture('partial'));
  await expect(page.getByLabel('Nota global da política')).toHaveText('Sem nota global');
  await expect(page.getByLabel('Motivos da ausência de nota global')).toBeVisible();
});
