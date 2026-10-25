import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import type { CompletedAnalysis } from '../src/pages/AnalysisResult/dashboardData';
import { recommendationData } from '../src/pages/AnalysisResult/recommendationData';

function fixture(name = 'local'): CompletedAnalysis {
  const source = JSON.parse(readFileSync(new URL(`../../tcc-back/tests/fixtures/segment-guidance/${name}.json`, import.meta.url), 'utf8'));
  return { ...source, analysis_id: 'guidance-test', status: 'completed', error: null,
    original_filename: 'Política de privacidade — exemplo de revisão', created_at: '2026-10-18T12:00:00Z',
    profile_id: 'core-14-v1', supersedes_analysis_id: null };
}

async function open(page: Page, data = fixture()) {
  await page.route('**/api/**', route => {
    if (new URL(route.request().url()).pathname.endsWith('/users/me')) return route.fulfill({ json: {
      user: { id: 'reviewer', name: 'Revisor', email: 'revisor@example.test', role: 'EVALUATOR' },
      expires_at: new Date(Date.now() + 3600000).toISOString(),
    } });
    return route.fulfill({ json: data });
  });
  await page.goto('/app/analyses/guidance-test');
  await expect(page.getByRole('table')).toBeVisible();
}

test('vínculos usam evidências, mantêm ausências gerais e não duplicam recomendações', () => {
  const data = fixture();
  data.result.segments.push({ ...data.result.segments[0], segment_id: 'same-category', text: 'Outro texto sobre o mesmo assunto.' });
  data.result.evaluation.recommendations.push(data.result.evaluation.recommendations[0]);
  const result = recommendationData(data.result);
  expect(result.bySegment.get('s0')!.items.map(i => i.recommendation.template_id)).toEqual(['retention.duration.policy_wording']);
  expect(result.bySegment.get('s1')!.items.map(i => i.recommendation.template_id)).toEqual([
    'sharing.conditions.policy_wording', 'sharing.recipients.policy_wording',
  ]);
  expect(result.bySegment.get('same-category')!.items).toEqual([]);
  expect(result.general.some(i => i.recommendation.template_id === 'retention.disposal.policy_wording')).toBe(true);
  expect(new Set(result.general.map(i => i.recommendation.id)).size).toBe(result.general.length);
  expect(result.bySegment.get('s0')!.items[0].observations.join(' ')).not.toContain('data_class');
});

test('evidência inexata, vínculo ausente e trecho truncado nunca recebem orientação local', () => {
  for (const variant of ['quote', 'offset', 'reciprocal', 'truncated']) {
    const data = fixture();
    if (variant === 'truncated') data.result.segments[0].truncated = true;
    const finding = data.result.evaluation.findings.find(f => f.question_id === 'retention.duration')!;
    if (variant === 'quote') finding.evidence_groups[0].evidence[0].quote = 'Texto inexistente';
    if (variant === 'offset') finding.evidence_groups[0].evidence[0].end += 1000;
    if (variant === 'reciprocal') finding.recommendation_ids = [];
    const result = recommendationData(data.result);
    expect(result.bySegment.get('s0')!.items).toEqual([]);
    expect(result.general.some(i => i.recommendation.template_id === 'retention.duration.policy_wording')).toBe(true);
  }
});

test('resposta sustentada e categorias sem achados não geram lacunas locais', () => {
  const data = fixture();
  const q = data.result.evaluation.dimensions.flatMap(d => d.questions).find(q => q.id === 'retention.duration')!;
  q.status = 'supported';
  const linked = recommendationData(data.result);
  expect(linked.bySegment.get('s0')!.items).toEqual([]);
  expect(linked.general.some(i => i.recommendation.template_id === 'retention.duration.policy_wording')).toBe(false);
  const complete = recommendationData(fixture('complete').result);
  expect([...complete.bySegment.values()].flatMap(g => g.items)).toEqual([]);
  expect(complete.general).toEqual([]);
});

test('catálogo antigo consolidado continua geral e não é reescrito', () => {
  const data = fixture();
  const rec = data.result.evaluation.recommendations.find(r => r.template_id === 'retention.duration.policy_wording')!;
  rec.template_id = 'retention.policy_wording';
  const before = structuredClone(data);
  const result = recommendationData(data.result);
  expect(result.bySegment.get('s0')!.items).toEqual([]);
  expect(result.general.some(i => i.recommendation.id === rec.id)).toBe(true);
  expect(data).toEqual(before);
});

test('painel abre por teclado, destaca Unicode e devolve foco ao fechar', async ({ page }) => {
  await open(page);
  const row = page.getByRole('table').getByRole('row').nth(1);
  const trigger = row.getByRole('button', { name: /ponto de atenção/ });
  await expect(row.locator('.segment-text mark')).toHaveText('🔒 Guardamos dados pelo tempo necessário.');
  await trigger.focus();
  await page.keyboard.press('Enter');
  const panel = page.getByRole('dialog', { name: 'Recomendações para o trecho' });
  await expect(panel).toBeVisible();
  await expect(panel).toContainText('Trecho 01');
  await expect(panel).toContainText('Especificar o prazo ou critério de retenção');
  await expect(panel).toContainText('A.1.4.8');
  await expect(panel).not.toContainText('A.1.4.9');
  await expect(panel).not.toContainText('data_class');
  await expect(panel.locator('input, select, textarea')).toHaveCount(0);
  await panel.locator('.guidance-sources summary').click();
  await expect(panel.getByRole('link', { name: 'Consultar fonte' })).toHaveAttribute('href', /^https:\/\/www.isms.online\//);
  await page.screenshot({ path: 'test-results/guidance-desktop.png' });
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(await panel.evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true);
    await page.screenshot({ path: `test-results/guidance-${width}.png` });
  }
  await page.keyboard.press('Escape');
  await expect(panel).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await trigger.click();
  await panel.getByRole('button', { name: 'Fechar recomendações' }).click();
  await expect(trigger).toBeFocused();
  await page.screenshot({ path: 'test-results/guidance-collapsed-mobile.png', fullPage: true });
  await page.setViewportSize({ width: 1440, height: 956 });
  await page.screenshot({ path: 'test-results/guidance-collapsed-desktop.png', fullPage: true });
});

test('filtros preservam vínculo e pontos gerais explicam seu escopo', async ({ page }) => {
  await open(page);
  await page.getByLabel('Buscar nos trechos', { exact: true }).fill('compartilhamos');
  const table = page.getByRole('table');
  await expect(table).toContainText('2 pontos de atenção');
  await table.getByRole('button', { name: /pontos de atenção/ }).click();
  const panel = page.getByRole('dialog');
  await expect(panel).toContainText('Esclarecer quem recebe');
  await expect(panel).not.toContainText('Especificar o prazo ou critério');
  await page.keyboard.press('Escape');
  const general = page.getByRole('region', { name: /Pontos gerais da política/ });
  await expect(general).toContainText('Esta lista não muda com os filtros');
  await general.locator('summary').filter({ hasText: 'Explicar o destino dos dados após a retenção.' }).click();
  await expect(general).toContainText('Ausência de informação não comprova ausência da prática');
});

test('complemento mostra a passagem usada em conjunto sem inventar uma lacuna', async ({ page }) => {
  const data = fixture('complement');
  const result = recommendationData(data.result);
  expect(result.bySegment.get('s0')!.complements.length).toBeGreaterThan(0);
  expect(result.bySegment.get('s0')!.items.some(i => i.recommendation.template_id === 'access.channel.policy_wording')).toBe(false);
  await open(page, data);
  const row = page.getByRole('table').getByRole('row').nth(1);
  await row.getByText('Informação complementada em outros trechos', { exact: true }).click();
  await expect(row.locator('.guidance-complements')).toContainText('Trecho 02');
  await expect(row.locator('.guidance-complements')).toContainText('privacidade@exemplo.com');
});

test('extração parcial mantém orientação cautelosa e nota bloqueada', async ({ page }) => {
  const data = fixture();
  data.result.extraction.status = 'partial';
  data.result.evaluation.score = null;
  await open(page, data);
  await page.getByRole('table').getByRole('row').nth(1).getByRole('button', { name: /ponto de atenção/ }).click();
  await expect(page.getByRole('dialog')).toContainText('Leitura parcial: confira as evidências no original');
  await page.keyboard.press('Escape');
  await expect(page.getByText('Sem nota global', { exact: true })).toBeVisible();
});

test('quebras do PDF fluem na tela e na busca sem deslocar a evidência Unicode', async ({ page }) => {
  const original = fixture();
  const quote = '🔒 Guardamos dados pelo tempo necessário.';
  const multiline = '🔒 Guardamos\ndados pelo\ntempo necessário.';
  const data = JSON.parse(JSON.stringify(original).replaceAll(quote, JSON.stringify(multiline).slice(1, -1))) as CompletedAnalysis;
  await open(page, data);
  const text = page.locator('.segment-text').first();
  await expect(text).toHaveCSS('white-space', 'normal');
  await expect(text.locator('mark')).toHaveText(multiline);
  expect(await text.innerText()).not.toContain('\n');
  await page.getByLabel('Buscar nos trechos', { exact: true }).fill('Guardamos dados pelo tempo');
  await expect(page.getByRole('table').getByRole('row')).toHaveCount(2);
  await page.getByRole('button', { name: /ponto de atenção/ }).click();
  const quoteInPanel = page.getByRole('dialog').locator('blockquote').first();
  expect(await quoteInPanel.innerText()).not.toContain('\n');
  expect(data.result.segments[0].text).toContain('\n');
});
