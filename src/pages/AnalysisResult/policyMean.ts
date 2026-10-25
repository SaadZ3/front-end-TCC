import type { CompletedAnalysis } from './dashboardData';

export function policyMean(evaluation: CompletedAnalysis['result']['evaluation']): number | null {
  if (evaluation.score === null || evaluation.score_status !== 'available') return null;
  const applicable = evaluation.dimensions.filter(dimension => dimension.status !== 'not_applicable');
  if (!applicable.length || applicable.some(dimension => dimension.status !== 'resolved'
    || dimension.contribution === null || !Number.isFinite(dimension.contribution) || dimension.contribution < 0
    || dimension.normalized_weight === null || !Number.isFinite(dimension.normalized_weight)
    || dimension.normalized_weight < 0 || dimension.contribution > 3 * dimension.normalized_weight + 1e-8)) return null;
  const totalWeight = applicable.reduce((sum, dimension) => sum + dimension.normalized_weight!, 0);
  if (Math.abs(totalWeight - 1) > 1e-8) return null;
  // As contribuições já incorporam os pesos e preservam o resultado antes das faixas inteiras.
  return Math.min(3, applicable.reduce((sum, dimension) => sum + dimension.contribution!, 0));
}

export function formatPolicyMean(mean: number): string {
  return mean.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

