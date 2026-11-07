/** Usa IDs estáveis no envio; nomes podem mudar sem alterar a seleção salva. */
export const assessmentCategories = [
  ['collection','Coleta e uso de dados'], ['sharing','Compartilhamento'], ['choice','Escolhas e controle'],
  ['access','Direitos dos titulares'], ['retention','Retenção de dados'], ['security','Segurança'],
  ['changes','Alterações da política'], ['dnt','Não rastreamento — DNT'],
  ['audiences','Públicos específicos e contexto internacional'],
] as const;
export type CategoryId = typeof assessmentCategories[number][0];
export interface AssessmentScope { mode: 'all_categories' | 'selected_categories'; category_ids: CategoryId[]; }
export const allCategoryIds = assessmentCategories.map(([id]) => id);
export function selectionDescription(scope?: AssessmentScope, profile?: string): string {
  if (!scope) return `Todas as categorias do perfil histórico (${profile === 'documentary-18-v1' ? 9 : 7}).`;
  return `${scope.mode === 'all_categories' ? 'Todas as categorias' : 'Categorias selecionadas'} (${scope.category_ids.length} de 9): `
    + assessmentCategories.filter(([id]) => scope.category_ids.includes(id)).map(([,title]) => title).join('; ') + '.';
}
export function meanTitle(scope?: AssessmentScope): string {
  return scope?.mode === 'selected_categories' ? 'Média das categorias selecionadas' : 'Nota média da política';
}
