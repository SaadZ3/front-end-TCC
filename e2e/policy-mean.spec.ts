import { expect, test } from '@playwright/test';
import { completedAnalysis } from './fixture';
import { formatPolicyMean, policyMean } from '../src/pages/AnalysisResult/policyMean';

test('média usa contribuições ponderadas antes das faixas, sem alterar a análise', () => {
  const data = completedAnalysis();
  const evaluation = data.result.evaluation;
  evaluation.score = 2;
  evaluation.score_status = 'available';
  evaluation.dimensions = evaluation.dimensions.slice(0, 2).map((dimension, index) => ({
    ...dimension, status: 'resolved', score: index === 0 ? 3 : 0,
    normalized_weight: index === 0 ? 0.8 : 0.2, contribution: index === 0 ? 2.4 : 0,
  }));
  const before = structuredClone(data);
  expect(policyMean(evaluation)).toBeCloseTo(2.4);
  expect(formatPolicyMean(policyMean(evaluation)!)).toBe('2,40');
  expect(data).toEqual(before);
});

test('zero, máximo, arredondamento e bloqueio continuam distintos', () => {
  const evaluation = completedAnalysis().result.evaluation;
  evaluation.score = 0;
  evaluation.score_status = 'available';
  evaluation.dimensions = [{ ...evaluation.dimensions[0], status: 'resolved', normalized_weight: 1, contribution: 0 }];
  expect(formatPolicyMean(policyMean(evaluation)!)).toBe('0,00');
  evaluation.dimensions[0].contribution = 3;
  expect(formatPolicyMean(policyMean(evaluation)!)).toBe('3,00');
  evaluation.dimensions[0].contribution = 2.456;
  expect(formatPolicyMean(policyMean(evaluation)!)).toBe('2,46');
  evaluation.score = null;
  expect(policyMean(evaluation)).toBeNull();
  evaluation.score = 2;
  evaluation.score_status = 'blocked';
  expect(policyMean(evaluation)).toBeNull();
});

test('memória incompleta não vira média e critérios não aplicáveis são excluídos', () => {
  const evaluation = completedAnalysis().result.evaluation;
  evaluation.score_status = 'available';
  evaluation.score = 2;
  evaluation.dimensions = [{ ...evaluation.dimensions[0], status: 'resolved', normalized_weight: 1, contribution: 2 }];
  evaluation.dimensions.push({ ...evaluation.dimensions[0], status: 'not_applicable', normalized_weight: null, contribution: null });
  expect(policyMean(evaluation)).toBe(2);
  evaluation.dimensions[0].contribution = null;
  expect(policyMean(evaluation)).toBeNull();
  evaluation.dimensions[0].contribution = 1;
  evaluation.dimensions[0].normalized_weight = 0.5;
  expect(policyMean(evaluation)).toBeNull();
});
