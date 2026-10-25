import { formatPolicyMean, policyMean } from './policyMean';
import type { Content, TDocumentDefinitions, TableCell } from 'pdfmake/interfaces';
import { date, labels, scopeNames, type Grade } from '../../services/analyses';
import { dashboardData, gradeDescriptions, type CompletedAnalysis } from './dashboardData';

const grade = (score: Grade | null) => score === null ? 'Sem nota' : `${score} / 3`;
const heading = (text: string): Content => ({ text, headlineLevel: 1, style: 'heading', margin: [0, 18, 0, 8] });
function table(headers: string[], rows: TableCell[][], widths: Array<string | number>): Content {
  return {
    table: { headerRows: 1, widths, body: [headers.map(text => ({ text, bold: true, fillColor: '#eaf2ed' })), ...rows] },
    layout: 'lightHorizontalLines', margin: [0, 4, 0, 10],
  };
}

export function analysisPdfDefinition(analysis: CompletedAnalysis): TDocumentDefinitions {
  const { categories, rows, classified, identified } = dashboardData(analysis);
  const { evaluation, extraction } = analysis.result;
  const mean = policyMean(evaluation);
  const content: Content[] = [
    { text: 'POLÍTICAS TCC', color: '#236751', bold: true, fontSize: 11, margin: [0, 0, 0, 14] },
    { text: 'Resultado da análise de políticas', style: 'title' },
    { text: analysis.original_filename || 'Política de privacidade', fontSize: 12, margin: [0, 8, 0, 12] },
    { text: `Análise: ${analysis.analysis_id}\nEnviada em: ${date(analysis.created_at)}\nConteúdo: ${scopeNames[analysis.result.document_scope]}`, style: 'muted' },
    { text: 'Análise automática, ainda não validada por uma pessoa. A nota avalia a informação documentada e não representa um percentual de conformidade legal.', margin: [0, 14, 0, 8], color: '#43594c' },
    heading('Indicadores'),
    table(['Nota média da política', 'Trechos classificados', 'Categorias identificadas'], [[
      mean === null ? 'Sem nota global' : `${formatPolicyMean(mean)} / 3`, String(classified), `${identified} / ${categories.length}`,
    ]], ['*', '*', '*']),
    { text: 'A nota média usa os critérios e seus pesos antes da classificação em faixas. As notas das categorias permanecem nas faixas de 0 a 3.', style: 'muted' },
    { text: 'Um trecho pode receber mais de uma categoria. A exportação inclui todos os trechos, independentemente dos filtros do dashboard.', style: 'muted' },
    heading('Notas por categoria'),
    table(['Categoria', 'Nota da categoria na política'], categories.map(category => [labels[category.label] ?? category.title, grade(category.score)]), ['*', 150]),
    { text: ([0, 1, 2, 3] as Grade[]).map(score => `${score}: ${gradeDescriptions[score]}`).join('  |  '), style: 'muted' },
  ];
  const limitations = [...extraction.warnings, ...evaluation.limitations];
  if (evaluation.score === null) limitations.unshift('O conteúdo disponível não permite concluir a avaliação global.');
  if (evaluation.score_blockers.length) limitations.push('Impedimentos registrados: ' + evaluation.score_blockers.join(', '));
  if (limitations.length) content.push(heading('Limitações e avisos'), { ul: [...new Set(limitations)] });
  content.push(heading(`Trechos analisados (${rows.length})`),
    { text: 'As notas abaixo são das categorias na política inteira, não notas individuais dos trechos. Trechos truncados são apresentados sem nota.', style: 'muted', margin: [0, 0, 0, 12] });
  if (!rows.length) content.push({ text: 'Nenhum trecho disponível.' });
  for (const { segment, index, categories: segmentCategories } of rows) {
    const pages = segment.page_start === null ? '' : ` | Página ${segment.page_start}${segment.page_end !== null && segment.page_end !== segment.page_start ? '-' + segment.page_end : ''}`;
    content.push({ unbreakable: segment.text.length < 1600, stack: [
      { text: `Trecho ${String(index + 1).padStart(2, '0')}${pages}`, bold: true, color: '#236751', margin: [0, 10, 0, 4] },
      { text: segmentCategories.length ? segmentCategories.map(category => `${labels[category.label] ?? category.title}: ${segment.truncated ? 'Sem nota (trecho truncado)' : grade(category.score)}`).join(' | ') : 'Sem categoria identificada', style: 'muted', margin: [0, 0, 0, 4] },
      { text: segment.text || '(Trecho sem texto)', margin: [0, 0, 0, 8] },
    ] });
  }
  if (evaluation.findings.length) {
    content.push(heading('Achados da avaliação'));
    for (const finding of evaluation.findings) content.push({ text: finding.title, bold: true, margin: [0, 8, 0, 4] }, { text: finding.rationale });
  }
  if (evaluation.recommendations.length) {
    content.push(heading('Recomendações'));
    for (const recommendation of evaluation.recommendations) {
      content.push({ text: recommendation.what_to_do, bold: true, margin: [0, 8, 0, 4] }, { text: recommendation.trigger_reason });
      if (recommendation.how_to_do.length) content.push({ ul: recommendation.how_to_do, margin: [0, 4, 0, 6] });
      if (recommendation.applicability_note) content.push({ text: recommendation.applicability_note, style: 'muted' });
    }
  }
  content.push(heading('Método e rastreabilidade'), { text: `Método: ${evaluation.method_version}\nPerfil: ${analysis.profile_id}\nModelo: ${analysis.versions.model}\nRegras: ${evaluation.rules_version}\nEscala: 0 a 3`, style: 'muted' });
  return {
    pageSize: 'A4', pageMargins: [42, 42, 42, 48],
    info: { title: `Análise - ${analysis.original_filename}`, author: 'Políticas TCC', subject: 'Qualidade da informação documentada' },
    defaultStyle: { font: 'Roboto', fontSize: 10, lineHeight: 1.25, color: '#24352f' },
    styles: { title: { fontSize: 23, bold: true }, heading: { fontSize: 14, bold: true, color: '#236751' }, muted: { fontSize: 9, color: '#5d6d65' } },
    footer: (page, pages) => ({ text: `Políticas TCC  |  Página ${page} de ${pages}`, alignment: 'center', fontSize: 8, color: '#5d6d65', margin: [42, 16, 42, 0] }),
    pageBreakBefore: (node, container) => node.headlineLevel === 1 && container.getFollowingNodesOnPage().length === 0,
    content,
  };
}

export async function exportAnalysisPdf(analysis: CompletedAnalysis): Promise<void> {
  const [{ default: pdfMake }, { default: fonts }] = await Promise.all([
    import('pdfmake/build/pdfmake'), import('pdfmake/build/vfs_fonts'),
  ]);
  pdfMake.addVirtualFileSystem(fonts);
  await pdfMake.createPdf(analysisPdfDefinition(analysis)).download(`resultado-${analysis.analysis_id}.pdf`);
}
