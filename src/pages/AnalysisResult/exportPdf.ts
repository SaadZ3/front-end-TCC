/** Monta o relatório PDF da análise e carrega a biblioteca apenas ao exportar. */
import { formatPolicyMean, policyMean } from './policyMean';
import { scoreBlockerMessages } from './scoreBlockers';
import type { Content, TDocumentDefinitions, TableCell } from 'pdfmake/interfaces';
import { date, labels, scopeNames, type Grade } from '../../services/analyses';
import { categoryDetectionText, categoryScoreText, dashboardData, gradeDescriptions, type SegmentRow, type CompletedAnalysis } from './dashboardData';
import { formatGrade, questionPoints, scaleExplanation, coverageExplanation } from './scoreExplanation';
import { findingObservation } from './recommendationData';

const heading = (text: string): Content => ({ text, headlineLevel: 1, style: 'heading', margin: [0, 18, 0, 8] });
/** Recebe cabeçalhos, células e larguras e retorna uma tabela do relatório. */
function table(headers: string[], rows: TableCell[][], widths: Array<string | number>): Content {
  return {
    table: {
      headerRows: 1,
      widths,
      body: [headers.map(text => ({ text, bold: true, fillColor: '#eaf2ed' })), ...rows]
    },
    layout: 'lightHorizontalLines',
    margin: [0, 4, 0, 10],
  };
}

/** Acrescenta os trechos recebidos ao conte?do do PDF, preservando a ordem. */
function appendSegments(content: Content[], rows: SegmentRow[]): void {
  for (const { segment, index, categories: segmentCategories } of rows) {
    const pages = segment.page_start === null ? '' : ` | Página ${segment.page_start}${segment.page_end !== null && segment.page_end !== segment.page_start ? '-' + segment.page_end : ''}`;
    content.push({
      unbreakable: segment.text.length < 1600,
      stack: [
        {
          text: `Trecho ${String(index + 1).padStart(2, '0')}${pages}`,
          bold: true,
          color: '#236751',
          margin: [0, 10, 0, 4]
        },
        {
          text: segmentCategories.length ? segmentCategories.map(category => `${labels[category.label] ?? category.title}: ${segment.truncated ? 'Sem nota (trecho truncado)' : categoryScoreText(category)}`).join(' | ') : 'Sem categoria identificada',
          style: 'muted',
          margin: [0, 0, 0, 4]
        },
        { text: segment.text || '(Trecho sem texto)', margin: [0, 0, 0, 8] },
      ]
    });
  }
}

/** Monta as recomendações da avaliação, mantendo títulos, listas e espaçamento. */
function appendRecommendations(content: Content[], evaluation: CompletedAnalysis['result']['evaluation']): void {
  const questions = new Map(evaluation.dimensions.flatMap(d => d.questions).map(q => [q.id, q]));
  if (evaluation.recommendations.length) {
    content.push(heading('Recomendações'));
    for (const recommendation of evaluation.recommendations) {
      const linked = evaluation.findings.filter(finding => recommendation.finding_ids.includes(finding.id));
      const block: Content[] = [{ text: recommendation.what_to_do, bold: true, margin: [0, 8, 0, 4] },
        { text: linked.length ? linked.map(f => findingObservation(f, questions.get(f.question_id ?? ''))).join('\n') : recommendation.trigger_reason }];
      // O pdfmake transforma itens de lista durante a renderização; não pode receber o estado da tela por referência.
      if (recommendation.how_to_do.length) block.push({ ul: [...recommendation.how_to_do], margin: [0, 4, 0, 6] });
      block.push({ text: `Como conferir: ${recommendation.completion_evidence.join('; ')}`, style: 'muted' });
      for (const reference of recommendation.references) block.push({
        text: `${reference.source_type === 'public_guidance' ? 'Referência ISO — guia público' : 'Orientação do projeto'}: ${reference.title}${reference.section ? ` · ${reference.section}` : ''}${reference.edition ? ` · ${reference.edition}` : ''}${reference.url ? `\n${reference.url}` : ''}`,
        ...(reference.url ? { link: reference.url } : {}), style: 'muted',
      });
      if (recommendation.applicability_note) block.push({ text: recommendation.applicability_note, style: 'muted' });
      content.push({ stack: block, unbreakable: true });
    }
  }
}

/** Recebe uma análise concluída e retorna a definição completa do relatório A4. */
export function analysisPdfDefinition(analysis: CompletedAnalysis): TDocumentDefinitions {
  const { categories, rows, classified, identified } = dashboardData(analysis);
  const { evaluation, extraction } = analysis.result;
  const mean = policyMean(evaluation);
  const content: Content[] = [
    { text: 'POLÍTICAS TCC', color: '#236751', bold: true, fontSize: 11, margin: [0, 0, 0, 14] },
    { text: 'Resultado da análise de políticas', style: 'title' },
    {
      text: analysis.original_filename || 'Política de privacidade',
      fontSize: 12,
      margin: [0, 8, 0, 12]
    },
    {
      text: `Análise: ${analysis.analysis_id}\nEnviada em: ${date(analysis.created_at)}\nConteúdo: ${scopeNames[analysis.result.document_scope]}`,
      style: 'muted'
    },
    {
      text: 'Análise automática, ainda não validada por uma pessoa. A nota avalia a informação documentada e não representa um percentual de conformidade legal.',
      margin: [0, 14, 0, 8],
      color: '#43594c'
    },
    heading('Indicadores'),
    table(['Nota média da política', 'Trechos classificados', 'Categorias identificadas'], [[
      mean === null ? 'Sem nota global' : `${formatPolicyMean(mean)} / 3`, String(classified), `${identified} / ${categories.length}`,
    ]], ['*', '*', '*']),
    {
      text: scaleExplanation(evaluation),
      style: 'muted'
    },
    {
      text: 'Um trecho pode receber mais de uma categoria. A exportação inclui todos os trechos, independentemente dos filtros do dashboard.',
      style: 'muted'
    },
    heading('Categorias identificadas e notas'),
    {
      text: 'O sistema identifica 10 categorias. O método atual pontua 7; as outras 3 permitem consultar os trechos, sem participar da média. Tema não identificado não prova ausência: a avaliação também procura evidências em outros trechos.',
      style: 'muted', margin: [0, 0, 0, 8],
    },
    table(['Categoria', 'Detecção do tema', 'Nota ou motivo'], categories.map(category => [
      labels[category.label] ?? category.title, categoryDetectionText(category), categoryScoreText(category),
    ]), ['*', '*', '*']),
    {
      text: evaluation.score_scale === 'ordinal_0_3'
        ? ([0, 1, 2, 3] as Grade[]).map(score => `${score}: ${gradeDescriptions[score]}`).join('  |  ')
        : 'A nota expressa atendimento aos critérios documentais. Os pontos de atenção sobre práticas declaradas continuam válidos mesmo com nota alta.',
      style: 'muted'
    },
  ];
  const excludesUncertain = evaluation.uncertainty_policy === 'exclude_inconclusive_evidence_v1';
  const coverage = coverageExplanation(evaluation);
  if (coverage) content.push(heading('Cobertura da nota'), { text: coverage });
  content.push(heading('Memória de cálculo'));
  for (const dimension of evaluation.dimensions) content.push(
    { text: `${dimension.title}: ${dimension.score === null ? 'Sem nota' : `${formatGrade(dimension.score)} / 3`}`, bold: true, margin: [0, 6, 0, 3] },
    { text: `${formatGrade(dimension.earned_points)} de ${excludesUncertain ? dimension.resolved_questions : dimension.applicable_questions} pontos; peso ${formatGrade(100 * (dimension.normalized_weight ?? 0))}%.${dimension.inconclusive_questions ? (excludesUncertain ? ` ${dimension.excluded_questions} pergunta(s) inconclusiva(s) fora do cálculo.${dimension.score === null ? ' Categoria fora da média.' : ''}` : ' Há pergunta inconclusiva; não é uma nota completa.') : ''}` },
    { ul: dimension.questions.map(questionPoints) },
  );
  const limitations = [...extraction.warnings, ...evaluation.limitations];
  limitations.unshift(...scoreBlockerMessages(analysis.result));
  if (limitations.length) content.push(heading('Limitações e avisos'), { ul: [...new Set(limitations)] });
  content.push(heading(`Trechos analisados (${rows.length})`),
    {
      text: 'As notas abaixo são das categorias na política inteira, não notas individuais dos trechos. Trechos truncados são apresentados sem nota.',
      style: 'muted',
      margin: [0, 0, 0, 12]
    });
  if (!rows.length) content.push({ text: 'Nenhum trecho disponível.' });
  appendSegments(content, rows);
  if (evaluation.findings.length) {
    content.push(heading('Achados da avaliação'));
    const questions = new Map(evaluation.dimensions.flatMap(d => d.questions).map(q => [q.id, q]));
    for (const finding of evaluation.findings) content.push({ unbreakable: true, stack: [
      { text: finding.title, bold: true, margin: [0, 8, 0, 4] },
      { text: findingObservation(finding, questions.get(finding.question_id ?? '')) },
    ] });
  }
  appendRecommendations(content, evaluation);
  content.push(heading('Método e rastreabilidade'), {
    text: `Método: ${evaluation.method_version}\nPerfil: ${analysis.profile_id}\nModelo: ${analysis.versions.model}\nRegras: ${evaluation.rules_version}\nEscala: ${evaluation.score_scale}`,
    style: 'muted'
  });
  return {
    pageSize: 'A4',
    pageMargins: [42, 42, 42, 48],
    info: {
      title: `Análise - ${analysis.original_filename}`,
      author: 'Políticas TCC',
      subject: 'Qualidade da informação documentada'
    },
    defaultStyle: { font: 'Roboto', fontSize: 10, lineHeight: 1.25, color: '#24352f' },
    styles: {
      title: { fontSize: 23, bold: true },
      heading: { fontSize: 14, bold: true, color: '#236751' },
      muted: { fontSize: 9, color: '#5d6d65' }
    },
    footer: (page, pages) => ({
      text: `Políticas TCC  |  Página ${page} de ${pages}`,
      alignment: 'center',
      fontSize: 8,
      color: '#5d6d65',
      margin: [42, 16, 42, 0]
    }),
    pageBreakBefore: (node, container) => node.headlineLevel === 1 && container.getFollowingNodesOnPage().length === 0,
    content,
  };
}

/** Recebe a análise concluída e conclui o download do PDF com suas fontes locais. */
export async function exportAnalysisPdf(analysis: CompletedAnalysis): Promise<void> {
  const [{ default: pdfMake }, { default: fonts }] = await Promise.all([
    import('pdfmake/build/pdfmake'), import('pdfmake/build/vfs_fonts'),
  ]);
  pdfMake.addVirtualFileSystem(fonts);
  await pdfMake.createPdf(analysisPdfDefinition(analysis)).download(`resultado-${analysis.analysis_id}.pdf`);
}
