/** Confere resultados reais congelados da R7 na tela e na definição do PDF. */
import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';

for (const [id, expected] of [
  ['bd379be1-38cb-484d-be06-dd6cee2b5b9a', '1,50'],
  ['a9bc1398-ded9-49c9-92a4-8b385231fe7b', 'Sem nota global'],
]) {
  test(`resultado real ${id}: nota, cálculo e exportação`, async ({ page }) => {
    const fixture = JSON.parse(readFileSync(new URL(`../../docs/evidencias/R7/politicas/resultado-${id}.json`, import.meta.url), 'utf8'));
    const data = { ...fixture, analysis_id: id, status: 'completed', error: null,
      original_filename: fixture.result.source.filename, created_at: '2026-11-05T12:00:00Z',
      profile_id: 'core-14-v1', supersedes_analysis_id: null };
    await page.route('**/api/**', route => route.fulfill({ json:
      new URL(route.request().url()).pathname.endsWith('/users/me') ? {
        user: { id: 'reviewer', name: 'Revisor', email: 'revisor@example.test', role: 'EVALUATOR' },
        expires_at: new Date(Date.now()+3600000).toISOString(),
      } : data,
    }));
    await page.goto(`/app/analyses/${id}`);
    await expect(page.getByLabel('Nota global da política')).toHaveText(expected);
    await page.getByText('Como as notas foram calculadas', { exact: true }).click();
    await expect(page.getByLabel('Memória de cálculo das notas')).toBeVisible();
    if (data.result.evaluation.score === null) {
      await expect(page.getByLabel('Motivos da ausência de nota global')).toBeVisible();
      await expect(page.getByLabel('Memória de cálculo das notas')).toContainText('Contexto inconclusivo (sem valor)');
    }
    const pdf = await page.evaluate(async analysis => {
      const path = '/src/pages/AnalysisResult/exportPdf.ts';
      return JSON.stringify((await import(/* @vite-ignore */ path)).analysisPdfDefinition(analysis));
    }, data);
    expect(pdf).toContain('continuous_0_3');
    expect(pdf).toContain('governance-rules-v3-dev2');
    for (const rec of data.result.evaluation.recommendations) {
      for (const step of rec.how_to_do) expect(pdf).toContain(step);
      for (const ref of rec.references) if (ref.url) expect(pdf).toContain(ref.url);
    }
  });
}
