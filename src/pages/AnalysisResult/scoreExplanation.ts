/** Explica o cálculo sem alterar notas nem resultados históricos. */
import type { Question } from '../../services/analyses';
import type { CompletedAnalysis } from './dashboardData';

export function formatGrade(value: number): string {
  return value.toLocaleString('pt-BR', { maximumFractionDigits: 2 });
}

export const questionStatusText: Record<string, string> = {
  supported: 'Informação suficiente', partial: 'Informação parcial',
  not_detected: 'Informação não detectada', inconclusive: 'Contexto inconclusivo',
  not_applicable: 'Não se aplica',
};

export function questionPoints(question: Question): string {
  return `${question.title}: ${questionStatusText[question.status]} (${question.value === null ? 'sem valor' : `${formatGrade(question.value)} de 1 ponto`})`;
}

export function scaleExplanation(evaluation: CompletedAnalysis['result']['evaluation']): string {
  if (evaluation.uncertainty_policy === 'exclude_inconclusive_evidence_v1') return 'Notas contínuas de 0 a 3. Passagens duvidosas não pontuam. Cada categoria recebe 3 × pontos obtidos ÷ perguntas com conclusão; perguntas inconclusivas ficam fora desse cálculo. Categorias sem perguntas avaliáveis ficam fora da média, e os pesos são redistribuídos entre as restantes. Informação suficiente vale 1; parcial, 0,5; não detectada, 0. Nota zero continua na média. Uma nota com cobertura menor não equivale a uma avaliação completa.';
  return evaluation.score_scale === 'continuous_0_3'
    ? 'Notas contínuas de 0 a 3. Cada categoria recebe 3 × pontos obtidos ÷ perguntas avaliadas. A média geral usa os pesos das categorias, sem arredondamento intermediário. Informação parcial vale 0,5 ponto; suficiente, 1; não detectada, 0. Contexto inconclusivo não recebe zero.'
    : 'Resultado histórico em faixas inteiras de 0 a 3. A média geral usa os critérios e seus pesos antes das faixas; não é a média das notas inteiras das categorias.';
}

export function coverageExplanation(evaluation: CompletedAnalysis['result']['evaluation']): string | null {
  if (evaluation.uncertainty_policy !== 'exclude_inconclusive_evidence_v1') return null;
  const dimensions = evaluation.dimensions;
  const questions = dimensions.flatMap(d => d.questions);
  const excluded = new Set(questions.flatMap(q => q.contextual_groups.flatMap(g => g.evidence
    .map(e => `${e.segment_id}:${e.start}:${e.end}`)))).size;
  return `${evaluation.score === null ? 'Base local avaliável' : 'Base da nota'}: ${dimensions.filter(d => d.score !== null).length} de ${dimensions.length} categorias; ${questions.filter(q => q.value !== null).length} de ${questions.length} perguntas com conclusão. ${excluded} passagem(ns) com dúvida desconsiderada(s) nas perguntas afetadas; os avisos continuam disponíveis.`;
}
