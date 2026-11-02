/** Confere detecção, ausência de nota e filtros com os estados reais da R4. */
import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { completedAnalysis } from './fixture';
import type { CategoryScore, CompletedAnalysis } from '../src/pages/AnalysisResult/dashboardData';
import { policyMean } from '../src/pages/AnalysisResult/policyMean';

async function show(page: Page, analysis: CompletedAnalysis) {
  await page.route('**/api/**', route => {
    if (new URL(route.request().url()).pathname.endsWith('/users/me')) return route.fulfill({ json: {
      user: { id: 'r4', name: 'Revisão R4', email: 'r4@example.test', role: 'EVALUATOR' },
      expires_at: new Date(Date.now() + 3600000).toISOString(),
    } });
    return route.fulfill({ json: analysis });
  });
  await page.goto('/app/analyses/' + analysis.analysis_id);
  await expect(page.getByRole('heading', { name: 'Categorias identificadas e notas' })).toBeVisible();
}

async function presentation(page: Page, analysis: CompletedAnalysis) {
  return page.evaluate(async data => {
    const dataPath = '/src/pages/AnalysisResult/dashboardData.ts';
    const pdfPath = '/src/pages/AnalysisResult/exportPdf.ts';
    const { dashboardData, categoryDetectionText, categoryScoreText } = await import(/* @vite-ignore */ dataPath);
    const before = JSON.stringify(data);
    const { categories, identified } = dashboardData(data);
    const pdf = JSON.stringify((await import(/* @vite-ignore */ pdfPath)).analysisPdfDefinition(data));
    return { identified, pdf, unchanged: JSON.stringify(data) === before,
      categories: (categories as CategoryScore[]).map(category => ({ ...category,
        detectionText: categoryDetectionText(category), scoreText: categoryScoreText(category),
      })),
    };
  }, analysis);
}

test('detecção independente da nota: zero, inconclusiva, fora do método e dado ausente', async ({ page }) => {
  const analysis = completedAnalysis();
  analysis.result.segments = [{ ...analysis.result.segments[0], labels: ['Other', 'Data Security'] }];
  const collection = analysis.result.evaluation.dimensions.find(d => d.id === 'collection')!;
  collection.score = 0;
  const sharing = analysis.result.evaluation.dimensions.find(d => d.id === 'sharing')!;
  sharing.score = null; sharing.status = 'unresolved';
  analysis.result.evaluation.dimensions = analysis.result.evaluation.dimensions.filter(d => d.id !== 'retention');
  const original = structuredClone(analysis);
  const mean = policyMean(analysis.result.evaluation);
  await show(page, analysis);
  const { categories, pdf, unchanged } = await presentation(page, analysis);
  const byLabel = (label: string) => categories.find(c => c.label === label)!;
  expect(byLabel('First Party Collection/Use').detectionText).toBe('Tema não identificado pelo classificador');
  expect(byLabel('First Party Collection/Use').scoreText).toBe('0 / 3');
  expect(byLabel('Third Party Sharing/Collection').scoreText).toBe('Avaliação inconclusiva');
  expect(byLabel('Data Retention').scoreText).toBe('Nota indisponível neste resultado');
  expect(byLabel('Other').detectionText).toBe('Tema identificado em 1 trecho');
  for (const label of ['Do Not Track', 'International and Specific Audiences', 'Other']) {
    expect(byLabel(label).scoreText).toBe('Fora da pontuação atual');
    expect(byLabel(label).score).toBeNull();
  }
  expect(categories.filter(c => c.scoreStatus === 'not_scored')).toHaveLength(3);
  expect(analysis).toEqual(original);
  expect(unchanged).toBe(true);
  expect(policyMean(analysis.result.evaluation)).toBe(mean);
  for (const text of ['Detecção do tema', '0 / 3', 'Avaliação inconclusiva', 'Fora da pontuação atual', 'Nota indisponível neste resultado']) expect(pdf).toContain(text);
});

test('filtros de ausência de nota respeitam a categoria escolhida em trechos com vários temas', async ({ page }) => {
  const analysis = completedAnalysis();
  const security = analysis.result.evaluation.dimensions.find(d => d.id === 'security')!;
  security.score = null; security.status = 'unresolved';
  analysis.result.segments = [{ ...analysis.result.segments[0], labels: ['Other', 'Data Security'] }];
  await show(page, analysis);
  const counts = await page.evaluate(async data => {
    const modulePath = '/src/pages/AnalysisResult/dashboardData.ts';
    const { dashboardData, filterSegments } = await import(/* @vite-ignore */ modulePath);
    const { rows } = dashboardData(data);
    return [['Other', 'not_scored'], ['Data Security', 'not_scored'], ['Other', 'inconclusive'],
      ['Data Security', 'inconclusive'], ['all', 'none']].map(([category, grade]) => filterSegments(rows, '', category, grade).length);
  }, analysis);
  expect(counts).toEqual([1, 0, 0, 1, 1]);
});

test('LinkedIn real: dez categorias, três sem pontuação, filtros, JSON e PDF preservados', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  const source = new URL('../../docs/evidencias/R1/originais/resultado-51bd9a7b-0c04-4fa9-a472-b890678da866.json', import.meta.url);
  const analysis: CompletedAnalysis = JSON.parse(readFileSync(source, 'utf8'));
  const original = structuredClone(analysis);
  await show(page, analysis);
  const { categories, identified, unchanged } = await presentation(page, analysis);
  expect(unchanged).toBe(true);
  expect(identified).toBe(10);
  for (const [label, count] of [['Do Not Track', 1], ['International and Specific Audiences', 5], ['Other', 6]] as const) {
    expect(categories.find(c => c.label === label)?.segmentCount).toBe(count);
  }
  await expect(page.locator('.category-bar')).toHaveCount(10);
  await expect(page.locator('.bar-status').filter({ hasText: 'Fora da pontuação atual' })).toHaveCount(3);
  await expect(page.getByRole('button', { name: /Filtrar Não rastreamento:/ })).toContainText('Tema identificado em 1 trecho');
  await expect(page.getByRole('button', { name: /Filtrar Públicos específicos e contexto internacional:/ })).toContainText('Tema identificado em 5 trechos');
  await expect(page.getByRole('button', { name: /Filtrar Outros temas:/ })).toContainText('Tema identificado em 6 trechos');
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 960 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `test-results/r4-linkedin-${width}.png`, fullPage: true });
  }
  await page.getByLabel('Filtrar nota da categoria').selectOption('1');
  await page.getByRole('button', { name: /Filtrar Não rastreamento:/ }).click();
  await expect(page.getByLabel('Filtrar nota da categoria')).toHaveValue('all');
  await expect(page.getByRole('table')).toContainText('Fora da pontuação atual');
  await page.getByRole('button', { name: 'Ler trecho completo', exact: true }).click();
  await expect(page.getByRole('table')).toContainText('sinais de não rastrear');
  await expect(page.getByRole('table').getByRole('row')).toHaveCount(2);
  await page.getByRole('button', { name: /Filtrar Públicos específicos e contexto internacional:/ }).click();
  await expect(page.getByRole('table').getByRole('row')).toHaveCount(6);
  await page.getByRole('button', { name: /Filtrar Outros temas:/ }).click();
  await expect(page.getByText('1–5 de 6 trechos')).toBeVisible();
  const jsonDownload = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Exportar JSON' }).click();
  expect(JSON.parse(readFileSync((await (await jsonDownload).path())!, 'utf8'))).toEqual(original);
  const pdfDownload = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Exportar PDF' }).click();
  await (await pdfDownload).saveAs('test-results/r4-linkedin.pdf');
  await expect(page.getByRole('button', { name: 'Exportar PDF' })).toBeEnabled();
  await expect(page.getByRole('table')).toBeVisible();
  const jsonAfterPdf = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Exportar JSON' }).click();
  expect(JSON.parse(readFileSync((await (await jsonAfterPdf).path())!, 'utf8'))).toEqual(original);
  expect(errors).toEqual([]);
  expect(analysis).toEqual(original);
});

test('tela diferencia tema não detectado, zero e avaliação inconclusiva', async ({ page }) => {
  const analysis = completedAnalysis();
  analysis.result.segments = [{ ...analysis.result.segments[0], labels: ['Other'] }];
  const collection = analysis.result.evaluation.dimensions.find(d => d.id === 'collection')!;
  collection.score = 0;
  const sharing = analysis.result.evaluation.dimensions.find(d => d.id === 'sharing')!;
  sharing.score = null; sharing.status = 'unresolved';
  await show(page, analysis);
  const dnt = page.getByRole('button', { name: /Filtrar Não rastreamento:/ });
  await expect(dnt).toContainText('Tema não identificado pelo classificador');
  await expect(dnt).toContainText('Fora da pontuação atual');
  await expect(dnt.locator('.bar-track')).toHaveCount(0);
  const zero = page.getByRole('button', { name: /Filtrar Coleta e uso de dados: 0 de 3/ });
  await expect(zero).toContainText('Tema não identificado pelo classificador');
  await expect(zero.locator('.bar-value')).toHaveText('0');
  await expect(page.getByRole('button', { name: /Filtrar Compartilhamento:/ })).toContainText('Avaliação inconclusiva');
});
