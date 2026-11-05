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
  return evaluation.score_scale === 'continuous_0_3'
    ? 'Notas contínuas de 0 a 3. Cada categoria recebe 3 × pontos obtidos ÷ perguntas avaliadas. A média geral usa os pesos das categorias, sem arredondamento intermediário. Informação parcial vale 0,5 ponto; suficiente, 1; não detectada, 0. Contexto inconclusivo não recebe zero.'
    : 'Resultado histórico em faixas inteiras de 0 a 3. A média geral usa os critérios e seus pesos antes das faixas; não é a média das notas inteiras das categorias.';
}
