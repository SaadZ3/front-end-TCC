import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { completedAnalysis } from './fixture';
import type { Grade } from '../src/services/analyses';
import type { CompletedAnalysis } from '../src/pages/AnalysisResult/dashboardData';
import { formatPolicyMean, policyMean } from '../src/pages/AnalysisResult/policyMean';

const categoryLabels = ['First Party Collection/Use', 'Third Party Sharing/Collection', 'User Choice/Control',
  'User Access, Edit and Deletion', 'Data Retention', 'Data Security', 'Policy Change', 'Do Not Track',
  'International and Specific Audiences', 'Other'];

function fixture(): CompletedAnalysis {
  const data = completedAnalysis();
  data.analysis_id = 'dashboard-test'; data.original_filename = 'Política de privacidade';
  data.result.evaluation.score = 2;
  data.result.evaluation.dimensions.forEach((criterion: {score: Grade}, index: number) => { criterion.score = ([3, 2, 1, 3, 0, 2, 1] as Grade[])[index % 7]; });
  const texts = [
    'Coletamos seu nome e endereço de e-mail para criar sua conta e prestar os serviços solicitados.',
    'Compartilhamos os dados necessários à entrega com nossos parceiros de logística, exclusivamente para o envio dos pedidos.',
    'Você pode gerenciar suas preferências de comunicação a qualquer momento nas configurações da sua conta.',
    'Você pode solicitar acesso, correção ou exclusão dos seus dados pelo e-mail privacidade@empresa.exemplo.',
    'Os dados são mantidos durante o período de uso dos serviços e eliminados ao término das finalidades informadas.',
    'Usamos criptografia para proteger a transmissão dos dados e restringimos o acesso às pessoas autorizadas.',
    'Quando alterarmos esta política, apresentaremos um resumo das mudanças, a data da atualização e uma cópia da versão anterior.',
    'As configurações de não rastreamento podem ser consultadas nas preferências do seu navegador.',
    'O tratamento de dados de públicos específicos observa as condições descritas nesta política.',
    'Entre em contato com nossa equipe para obter mais informações sobre esta política de privacidade.',
  ];
  data.result.segments = Array.from({ length: 20 }, (_, index) => ({ segment_id: `segment-${index}`, text: texts[index % 10],
    labels: [categoryLabels[index % 10]], probabilities: {}, truncated: false, page_start: null, page_end: null }));
  return data;
}

async function mock(page: Page, data = fixture()) {
  await page.route('**/api/**', route => {
    const pathname = new URL(route.request().url()).pathname;
    if (pathname.endsWith('/users/me')) return route.fulfill({ json: { user: { id: 'ui-user', name: 'Minha Empresa', email: 'teste@example.test', role: 'EVALUATOR' }, expires_at: new Date(Date.now() + 3600000).toISOString() } });
    if (pathname.endsWith('/file')) return route.fulfill({ body: 'Arquivo original de teste', contentType: 'text/plain' });
    return route.fulfill({ json: data });
  });
  await page.goto('/app/analyses/dashboard-test');
  await expect(page.getByRole('heading', { name: 'Resultado da análise de políticas', exact: true })).toBeVisible();
  return data;
}

test('layout da referência em desktop e celular, sem rolagem horizontal', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  const data = await mock(page);
  await expect(page.getByLabel('Nota global da política', { exact: true })).toHaveText(formatPolicyMean(policyMean(data.result.evaluation)!));
  for (const width of [1861, 1440, 820, 390, 320]) {
    await page.setViewportSize({ width, height: 956 });
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect(page.getByRole('img', { name: /Perfil da política — notas de 0 a 3/ })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `test-results/dashboard-${width}.png`, fullPage: true });
    if (width === 1861) await page.screenshot({ path: 'test-results/dashboard-reference-viewport.png' });
  }
  expect(errors).toEqual([]);
});

test('paginação, busca, categorias e notas funcionam em conjunto e reiniciam na primeira página', async ({ page }) => {
  await mock(page);
  const table = page.getByRole('table', { name: 'Trechos classificados e notas das categorias' });
  await expect(table.getByRole('row')).toHaveCount(6);
  await page.getByRole('button', { name: 'Próxima página de trechos' }).click();
  await expect(table).toContainText('Trecho 06');
  await expect(page.getByText('Página 2 de 4')).toBeVisible();
  await page.getByLabel('Buscar nos trechos', { exact: true }).fill('criptografia');
  await expect(table.getByRole('row')).toHaveCount(3);
  await expect(page.getByText('Página 1 de 1')).toBeVisible();
  await page.getByLabel('Filtrar nota da categoria').selectOption('0');
  await expect(table).toContainText('Nenhum trecho encontrado');
  await page.getByLabel('Filtrar nota da categoria').selectOption('2');
  await expect(table.getByRole('row')).toHaveCount(3);
  await page.getByLabel('Buscar nos trechos', { exact: true }).fill('');
  await page.getByLabel('Filtrar categoria dos trechos').selectOption('Third Party Sharing/Collection');
  await expect(table).toContainText('parceiros de logística');
  await expect(table).not.toContainText('criptografia');
});

test('barra filtra os trechos e busca superior pode ser usada por teclado', async ({ page }) => {
  await mock(page);
  await page.getByRole('button', { name: 'Filtrar Retenção de dados: 0 de 3' }).click();
  await expect(page.getByLabel('Filtrar categoria dos trechos')).toHaveValue('Data Retention');
  await expect(page.getByRole('table')).toContainText('0 / 3');
  await page.getByLabel('Filtrar categoria dos trechos').selectOption('all');
  await page.keyboard.press('Control+k');
  await expect(page.getByRole('textbox', { name: 'Pesquisar nesta análise' })).toBeFocused();
  await page.getByRole('textbox', { name: 'Pesquisar nesta análise' }).fill('exclusao');
  await page.keyboard.press('Enter');
  await expect(page.getByLabel('Buscar nos trechos', { exact: true })).toHaveValue('exclusao');
  await expect(page.getByRole('table')).toContainText('privacidade@empresa.exemplo');
});

test('aba documentos, download, exportação JSON e conta usam os dados reais recebidos', async ({ page }) => {
  const data = await mock(page);
  const exporting = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Exportar JSON' }).click();
  const exported = await exporting;
  expect(exported.suggestedFilename()).toBe('resultado-dashboard-test.json');
  expect(JSON.parse(readFileSync((await exported.path())!, 'utf8'))).toEqual(data);
  await page.getByRole('tab', { name: 'Visão geral e indicadores' }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('tab', { name: 'Documentos' })).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('link', { name: 'Reavaliar política' })).toHaveAttribute('href', '/app/new?supersedes=dashboard-test');
  const downloading = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Baixar arquivo original' }).click();
  expect((await downloading).suggestedFilename()).toBe('Política de privacidade.txt');
  await page.getByRole('button', { name: 'Configurações da conta', exact: true }).click();
  await expect(page.getByRole('dialog')).toContainText('teste@example.test');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
});

test('exporta PDF paginado com todos os trechos, mesmo com filtros ativos', async ({ page }) => {
  const data = await mock(page);
  const pdfDefinition = await page.evaluate(async analysis => {
    const modulePath = '/src/pages/AnalysisResult/exportPdf.ts';
    const { analysisPdfDefinition } = await import(/* @vite-ignore */ modulePath);
    return JSON.stringify(analysisPdfDefinition(analysis));
  }, data);
  expect(pdfDefinition).toContain('Nota média da política');
  expect(pdfDefinition).toContain(`${formatPolicyMean(policyMean(data.result.evaluation)!)} / 3`);
  await page.getByLabel('Buscar nos trechos', { exact: true }).fill('criptografia');
  const downloading = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Exportar PDF' }).click();
  const download = await downloading;
  expect(download.suggestedFilename()).toBe('resultado-dashboard-test.pdf');
  await download.saveAs('test-results/resultado-dashboard.pdf');
  const pdf = readFileSync((await download.path())!);
  expect(pdf.subarray(0, 5).toString()).toBe('%PDF-');
  expect(pdf.length).toBeGreaterThan(10000);
  await expect(page.getByRole('button', { name: 'Exportar PDF' })).toBeEnabled();
});

test('PDF mantém análise parcial, nota zero, avisos e trechos longos', async ({ page }) => {
  const data = fixture();
  data.result.evaluation.score = null;
  data.result.document_scope = 'excerpt';
  data.result.extraction.warnings = ['O texto extraído está incompleto.'];
  data.result.segments[0].truncated = true;
  data.result.segments[0].text = 'Informação longa com acentuação, proteção e exclusão de dados. '.repeat(140);
  await mock(page, data);
  const downloading = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Exportar PDF' }).click();
  await (await downloading).saveAs('test-results/resultado-parcial.pdf');
  await expect(page.getByRole('button', { name: 'Exportar PDF' })).toBeEnabled();
});

test('nota zero, nota ausente e trecho truncado são distintos', async ({ page }) => {
  const data = fixture();
  data.result.evaluation.score = null;
  data.result.document_scope = 'excerpt';
  data.result.segments[0].truncated = true;
  await mock(page, data);
  await expect(page.getByText('Sem nota global', { exact: true })).toBeVisible();
  const table = page.getByRole('table');
  await expect(table.getByRole('row').nth(1)).toContainText('Sem nota');
  await expect(table.getByRole('row').nth(5)).toContainText('0 / 3');
  await expect(page.getByRole('button', { name: 'Filtrar Outros temas: sem nota' })).toBeVisible();
  await expect(page.getByRole('img')).not.toHaveAccessibleDescription(/Outros temas: 0/);
});

test('filtro de nota respeita a mesma categoria em trechos com vários rótulos', async ({ page }) => {
  const data = fixture();
  data.result.segments = [{ ...data.result.segments[0], labels: ['First Party Collection/Use', 'Data Retention'] }];
  await mock(page, data);
  await page.getByLabel('Filtrar categoria dos trechos').selectOption('Data Retention');
  await page.getByLabel('Filtrar nota da categoria').selectOption('3');
  await expect(page.getByRole('table')).toContainText('Nenhum trecho encontrado');
  await page.getByLabel('Filtrar nota da categoria').selectOption('0');
  await expect(page.getByRole('table').getByRole('row')).toHaveCount(2);
});
