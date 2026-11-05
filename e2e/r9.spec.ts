/** Confere exclusão de dúvidas, cobertura, memória de cálculo e exportação. */
import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

function fixture(name: string) {
  const path=name==='hp'
    ? '../../docs/evidencias/R9/politicas/resultado-a9bc1398-ded9-49c9-92a4-8b385231fe7b.json'
    : `../../tcc-back/tests/fixtures/r9/${name}.json`;
  const data=JSON.parse(readFileSync(new URL(path,import.meta.url),'utf8'));
  return {...data,analysis_id:'r9-test',status:'completed',error:null,
    original_filename:'Exemplo R9',created_at:'2026-11-05T12:00:00Z',profile_id:'core-14-v1',supersedes_analysis_id:null};
}
async function open(page: Page,data: ReturnType<typeof fixture>) {
  await page.route('**/api/**',route=>route.fulfill({json:new URL(route.request().url()).pathname.endsWith('/users/me')
    ? {user:{id:'reviewer',name:'Revisor',email:'revisor@example.test',role:'EVALUATOR'},expires_at:new Date(Date.now()+3600000).toISOString()}
    : data}));
  await page.goto('/app/analyses/r9-test');
}
test('HP mantém 197 trechos e nota com evidências independentes',async({page})=>{
  const data=fixture('hp'); await open(page,data);
  await expect(page.getByLabel('Nota global da política')).toHaveText('2,57');
  await expect(page.getByLabel('Cobertura da nota')).toContainText('7 de 7 categorias; 14 de 14 perguntas');
  await expect(page.getByLabel('Cobertura da nota')).toContainText('2 passagem(ns)');
  await expect(page.getByLabel('Motivos da ausência de nota global')).toHaveCount(0);
  await page.getByText('Como as notas foram calculadas',{exact:true}).click();
  await expect(page.getByLabel('Memória de cálculo das notas')).toContainText('Coleta e uso: 3 / 3');
  await expect(page.getByText('Passagens com dúvida desconsideradas nesta pergunta',{exact:true})).toHaveCount(2);
});
test('categoria excluída redistribui peso e mantém zero nas demais',async({page})=>{
  const data=fixture('conflict'); await open(page,data);
  await expect(page.getByLabel('Nota global da política')).toHaveText('0,00');
  await expect(page.getByLabel('Cobertura da nota')).toContainText('6 de 7 categorias; 12 de 14 perguntas');
  await page.getByText('Como as notas foram calculadas',{exact:true}).click();
  const details=page.getByLabel('Memória de cálculo das notas');
  await expect(details).toContainText('Categoria fora da média.');
  await expect(details).toContainText('Peso na média: 16,67%');
  await page.setViewportSize({width:390,height:844});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.screenshot({path:'../docs/evidencias/R9/cobertura-mobile.png',fullPage:true});
  const pdf=await page.evaluate(async analysis=>{
    const path='/src/pages/AnalysisResult/exportPdf.ts';
    return JSON.stringify((await import(/* @vite-ignore */path)).analysisPdfDefinition(analysis));
  },data);
  expect(pdf).toContain('6 de 7 categorias; 12 de 14 perguntas');
  expect(pdf).toContain('Categoria fora da média.');
  expect(pdf).toContain('16,67%');
  const downloading=page.waitForEvent('download');
  await page.evaluate(async analysis=>{
    const path='/src/pages/AnalysisResult/exportPdf.ts';
    await (await import(/* @vite-ignore */path)).exportAnalysisPdf(analysis);
  },data);
  await (await downloading).saveAs('../docs/evidencias/R9/categoria-excluida.pdf');
});
test('sem nenhuma pergunta avaliável explica por que não há média',async({page})=>{
  await open(page,fixture('all-inconclusive'));
  await expect(page.getByLabel('Nota global da política')).toHaveText('Sem nota global');
  await expect(page.getByLabel('Cobertura da nota')).toContainText('0 de 7 categorias; 0 de 14 perguntas');
  await expect(page.getByLabel('Motivos da ausência de nota global')).toContainText('Nenhuma categoria possui uma base avaliável');
});
