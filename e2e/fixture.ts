import { readFileSync } from 'node:fs';
import type { Analysis } from '../src/services/analyses';

export function completedAnalysis(): Extract<Analysis, {status: 'completed'}> {
  const result = JSON.parse(readFileSync(new URL('../../tcc-back/tests/fixtures/e4/complete.json', import.meta.url), 'utf8'));
  return { ...result, status: 'completed', error: null, analysis_id: 'ui-analysis',
    original_filename: 'politica-de-privacidade.txt', created_at: '2026-10-12T12:00:00Z',
    supersedes_analysis_id: null, profile_id: 'core-14-v1' };
}
