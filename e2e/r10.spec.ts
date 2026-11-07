/** Verifica nove notas, compatibilidade do histórico, cobertura e relatório. */
import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
const artifacts = process.env.E2E_ARTIFACT_DIR || '../docs/evidencias/R10';
function fixture(name: string, phase='r10') {
  const source=JSON.parse(readFileSync(new URL(`../../tcc-back/tests/fixtures/${phase}/${name}.json`,import.meta.url),'utf8'));
  return {...source,status:'completed',error:null,analysis_id:'r10-test',created_at:'2026-11-06T12:00:00Z',
    original_filename:'Exemplo R10',profile_id:source.result.evaluation.profile_id,supersedes_analysis_id:null};
}
async function open(page: Page,data: ReturnType<typeof fixture>) {
  await page.route('**/api/**',route=>route.fulfill({json:new URL(route.request().url()).pathname.endsWith('/users/me')
    ? {user:{id:'reviewer',name:'Revisor',email:'revisor@example.test',role:'EVALUATOR'},expires_at:new Date(Date.now()+3600000).toISOString()}:data}));
  await page.goto('/app/analyses/r10-test');
}
test('nove notas e 18 perguntas aparecem na tela e no PDF',async({page})=>{
  const data=fixture('nine-supported');await open(page,data);
  await expect(page.getByLabel('Cobertura da nota')).toContainText('9 de 9 categorias; 18 de 18 perguntas');
  await expect(page.getByText(/O sistema identifica 10 categorias. O método atual pontua 9/)).toBeVisible();
  await expect(page.getByRole('button',{name:/Filtrar Não rastreamento: 3 de 3/})).toBeVisible();
  await expect(page.getByRole('button',{name:/Filtrar Públicos específicos.*3 de 3/})).toBeVisible();
  await expect(page.getByRole('button',{name:/Filtrar Outros temas: Fora da pontuação atual/})).toBeVisible();
  await page.screenshot({path:`${artifacts}/nove-categorias-desktop.png`,fullPage:true});
  for(const width of [390,320]) {
    await page.setViewportSize({width,height:844});
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  }
  await page.screenshot({path:`${artifacts}/nove-categorias-mobile.png`,fullPage:true});
  const definition=await page.evaluate(async analysis=>{
    const path='/src/pages/AnalysisResult/exportPdf.ts';
    return JSON.stringify((await import(/* @vite-ignore */path)).analysisPdfDefinition(analysis));
  },data);
  expect(definition).toContain('pontua 9');
  expect(definition).toContain('9 de 9 categorias; 18 de 18 perguntas');
  expect(definition).toContain('Resposta da organização ao sinal DNT');
  expect(definition).toContain('sem comprovar cobertura de todos os públicos');
  const download=page.waitForEvent('download');
  await page.evaluate(async analysis=>{
    const path='/src/pages/AnalysisResult/exportPdf.ts';
    await (await import(/* @vite-ignore */path)).exportAnalysisPdf(analysis);
  },data);
  await (await download).saveAs(`${artifacts}/nove-categorias.pdf`);
});
test('dúvida em DNT exclui a categoria sem bloquear as outras oito',async({page})=>{
  await open(page,fixture('dnt-conflict'));
  await expect(page.getByLabel('Nota global da política')).toHaveText('0,00');
  await expect(page.getByLabel('Cobertura da nota')).toContainText('8 de 9 categorias; 16 de 18 perguntas');
  await page.getByText('Como as notas foram calculadas',{exact:true}).click();
  await expect(page.getByLabel('Memória de cálculo das notas')).toContainText('Peso na média: 12,5%');
});
test('histórico mantém sete notas e 14 perguntas',async({page})=>{
  await open(page,fixture('complete','r9'));
  await expect(page.getByText(/O sistema identifica 10 categorias. O método atual pontua 7/)).toBeVisible();
  await expect(page.getByLabel('Cobertura da nota')).toContainText('7 de 7 categorias; 14 de 14 perguntas');
  await expect(page.getByRole('button',{name:/Filtrar Não rastreamento: Fora da pontuação atual/})).toBeVisible();
});
test('resposta negativa recebe nota documental e recomendação de revisão',async({page})=>{
  const data=fixture('negative-dnt');await open(page,data);
  await expect(page.getByRole('button',{name:/Filtrar Não rastreamento: 2,25 de 3/})).toBeVisible();
  await page.getByText('Como as notas foram calculadas',{exact:true}).click();
  await expect(page.getByLabel('Memória de cálculo das notas')).toContainText('Nosso site não responde ao sinal Do Not Track.');
  const definition=await page.evaluate(async analysis=>{
    const path='/src/pages/AnalysisResult/exportPdf.ts';
    return JSON.stringify((await import(/* @vite-ignore */path)).analysisPdfDefinition(analysis));
  },data);
  expect(definition).toContain('Conferir a resposta real ao sinal DNT');
  expect(definition).toContain('Rubrica documental do projeto — R10');
});
