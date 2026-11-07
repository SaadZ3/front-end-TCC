/** Confere seleção no envio e coerência de média, histórico e exportação. */
import {test,expect,type Page} from '@playwright/test';
import {readFileSync} from 'node:fs';
const artifacts=process.env.E2E_ARTIFACT_DIR || '../docs/evidencias/R11';
function fixture(name='two',phase='r11') {
  const source=JSON.parse(readFileSync(new URL(`../../tcc-back/tests/fixtures/${phase}/${name}.json`,import.meta.url),'utf8'));
  return {...source,status:'completed',error:null,analysis_id:'r11-test',created_at:'2026-11-06T12:00:00Z',
    original_filename:'Exemplo R11',profile_id:source.result.evaluation.profile_id,assessment_scope:source.result.evaluation.assessment_scope,supersedes_analysis_id:null};
}
async function routes(page:Page,data=fixture(),onPost?:(body:string)=>void) {
  await page.route('**/api/**',route=>{
    const url=new URL(route.request().url());
    if(url.pathname.endsWith('/users/me'))return route.fulfill({json:{user:{id:'reviewer',name:'Revisor',email:'revisor@example.test',role:'EVALUATOR'},expires_at:new Date(Date.now()+3600000).toISOString()}});
    if(route.request().method()==='POST')onPost?.(route.request().postData() || '');
    if(url.pathname.endsWith('/analyses') && route.request().method()==='GET')return route.fulfill({json:{items:[data],page:1,page_size:10,total:1}});
    return route.fulfill({json:data});
  });
}
test('envio exige ao menos uma categoria e transmite o conjunto escolhido',async({page})=>{
  let posted='';await routes(page,fixture(),body=>{posted=body;});await page.goto('/app/new');
  await page.getByLabel('Arquivo da política').setInputFiles({name:'exemplo.txt',mimeType:'text/plain',buffer:Buffer.from('Guardamos dados pessoais.')});
  await page.getByLabel('Conteúdo enviado').selectOption('full_document');
  await page.getByRole('combobox',{name:'Categorias a avaliar',exact:true}).selectOption('selected_categories');
  await expect(page.getByRole('checkbox',{checked:true})).toHaveCount(9);
  await page.getByRole('button',{name:'Limpar seleção'}).click();
  await page.getByRole('button',{name:'Analisar política',exact:true}).click();
  await expect(page.getByRole('alert')).toContainText('pelo menos uma categoria');expect(posted).toBe('');
  await page.getByRole('checkbox',{name:'Retenção de dados',exact:true}).check();
  await page.getByRole('checkbox',{name:'Segurança',exact:true}).focus();await page.keyboard.press('Space');
  await expect(page.getByRole('checkbox',{checked:true})).toHaveCount(2);
  await expect(page.getByRole('alert')).toHaveCount(0);
  await page.setViewportSize({width:320,height:844});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.screenshot({path:`${artifacts}/envio-mobile.png`,fullPage:true});
  await page.getByRole('button',{name:'Analisar política',exact:true}).click();
  await expect(page).toHaveURL(/analyses\/r11-test/);
  expect(posted).toContain('assessment_scope');expect(posted).toContain('"category_ids":["retention","security"]');
  await expect(page.getByLabel('Média das categorias selecionadas').last()).toHaveText('1,88');
});
for(const [name,mean,count] of [['one','3,00',1],['two','1,88',2],['three','1,25',3]] as const)test(`${count} categoria(s): cálculo, barras e radar`,async({page})=>{
  await routes(page,fixture(name));await page.goto('/app/analyses/r11-test');
  await expect(page.getByLabel('Média das categorias selecionadas').last()).toHaveText(mean);
  await expect(page.getByRole('button',{name:/^Filtrar /})).toHaveCount(count);
  await expect(page.getByRole('img',{name:'Perfil da política — notas de 0 a 3'})).toHaveCount(count>=3?1:0);
  await expect(page.getByLabel('Cobertura da nota')).toContainText(`${count} de 9 categorias selecionadas`);
  await page.getByText('Temas fora desta avaliação',{exact:true}).click();
  await expect(page.getByLabel('Categorias escolhidas')).toContainText('Coleta e uso de dados: Não selecionada');
  await page.screenshot({path:`${artifacts}/${name}-desktop.png`,fullPage:true});
});
test('dúvidas e entrada incompleta não recuperam categorias desmarcadas',async({page})=>{
  await routes(page,fixture('excluded'));await page.goto('/app/analyses/r11-test');
  await expect(page.getByLabel('Média das categorias selecionadas').last()).toHaveText('3,00');
  await expect(page.getByLabel('Cobertura da nota')).toContainText('1 de 2 categorias; 2 de 4 perguntas');
  await page.unrouteAll();await routes(page,fixture('all-inconclusive'));await page.reload();
  await expect(page.getByLabel('Média das categorias selecionadas').last()).toHaveText('Sem nota global');
  for(const name of ['excerpt','unknown']) {
    await page.unrouteAll();await routes(page,fixture(name));await page.reload();
    await expect(page.getByLabel('Média das categorias selecionadas').last()).toHaveText('Sem nota global');
    await expect(page.getByRole('button',{name:/Filtrar Segurança.*3 de 3/})).toBeVisible();
  }
});
test('PDF e JSON preservam a seleção e o relatório não calcula outros temas',async({page})=>{
  const data=fixture();await routes(page,data);await page.goto('/app/analyses/r11-test');
  const definition=await page.evaluate(async analysis=>{
    const path='/src/pages/AnalysisResult/exportPdf.ts';return JSON.stringify((await import(/* @vite-ignore */path)).analysisPdfDefinition(analysis));
  },data);
  expect(definition).toContain('Média das categorias selecionadas');expect(definition).toContain('1,88 / 3');
  expect(definition).toContain('2 de 9 categorias selecionadas');
  expect(definition).toContain('Não selecionada para esta análise');
  expect(definition).not.toContain('Tipos de dados coletados ou usados:');
  const jsonDownload=page.waitForEvent('download');await page.getByRole('button',{name:'Exportar JSON',exact:true}).click();
  const jsonFile=await jsonDownload;await jsonFile.saveAs(`${artifacts}/selecao.json`);
  expect(JSON.parse(readFileSync(await jsonFile.path() as string,'utf8')).assessment_scope).toEqual(data.assessment_scope);
  const download=page.waitForEvent('download');await page.getByRole('button',{name:'Exportar PDF',exact:true}).click();
  await (await download).saveAs(`${artifacts}/selecao.pdf`);
});
test('histórico, falha e reanálise mantêm a seleção salva',async({page})=>{
  const data=fixture();await routes(page,data);await page.goto('/app');
  await expect(page.getByText(/Categorias selecionadas \(2 de 9\)/)).toBeVisible();
  await page.goto('/app/new?supersedes=r11-test');
  await expect(page.getByRole('combobox',{name:'Categorias a avaliar',exact:true})).toHaveValue('selected_categories');
  await expect(page.getByRole('checkbox',{checked:true})).toHaveCount(2);
  await page.unrouteAll();await routes(page,{...data,status:'failed',result:null,versions:null,error:{code:'INFERENCE_UNAVAILABLE',message:'Serviço indisponível.'}});
  await page.goto('/app/analyses/r11-test');await expect(page.getByText(/Categorias selecionadas \(2 de 9\)/)).toBeVisible();
});
test('reanálise histórica de sete categorias não inclui os dois temas novos silenciosamente',async({page})=>{
  await routes(page,fixture('complete','r9'));await page.goto('/app/new?supersedes=r11-test');
  await expect(page.getByRole('checkbox',{checked:true})).toHaveCount(7);
  await expect(page.getByRole('checkbox',{name:'Não rastreamento — DNT'})).not.toBeChecked();
});
