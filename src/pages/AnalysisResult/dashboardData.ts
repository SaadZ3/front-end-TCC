import { labels, type Analysis, type Grade, type Segment } from '../../services/analyses';

export type CompletedAnalysis = Extract<Analysis, { status: 'completed' }>;
export interface CategoryScore { id: string; label: string; title: string; score: Grade | null; }
export interface SegmentRow { segment: Segment; index: number; categories: CategoryScore[]; }

const dimensionLabels: Record<string, string> = {
  collection: 'First Party Collection/Use', sharing: 'Third Party Sharing/Collection',
  choice: 'User Choice/Control', access: 'User Access, Edit and Deletion',
  retention: 'Data Retention', security: 'Data Security', changes: 'Policy Change',
};
const shortTitles: Record<string, string> = {
  'First Party Collection/Use': 'Coleta e uso de dados',
  'Third Party Sharing/Collection': 'Compartilhamento',
  'User Choice/Control': 'Escolhas e controle',
  'User Access, Edit and Deletion': 'Direitos dos titulares',
  'Data Retention': 'Retenção de dados', 'Data Security': 'Segurança de dados',
  'Policy Change': 'Alterações da política', 'Do Not Track': 'Não rastreamento',
  'International and Specific Audiences': 'Públicos específicos', Other: 'Outros temas',
};

export const gradeDescriptions: Record<Grade, string> = {
  0: 'Faixa inicial', 1: 'Faixa básica', 2: 'Faixa intermediária', 3: 'Faixa superior',
};

export function dashboardData(analysis: CompletedAnalysis) {
  const categories: CategoryScore[] = Object.entries(labels).map(([label, title]) => {
      const dimension = analysis.result.evaluation.dimensions.find(item => dimensionLabels[item.id] === label);
      return { id: dimension?.id ?? label, label, title: shortTitles[label] || title, score: dimension?.score ?? null };

  });
  const rows: SegmentRow[] = analysis.result.segments.map((segment, index) => ({
    segment, index,
    // Uma categoria pode avaliar a política inteira; não atribuímos essa nota ao trecho.
    categories: segment.labels.map(label => categories.find(category => category.label === label) ?? {
      id: label, label, title: labels[label] ?? label, score: null,
    }),
  }));
  const identified = new Set(analysis.result.segments.flatMap(segment => segment.labels));
  return { categories, rows, identified: categories.filter(category => identified.has(category.label)).length,
    classified: analysis.result.segments.filter(segment => segment.labels.length > 0).length };
}

export function filterSegments(rows: SegmentRow[], query: string, category: string, grade: string) {
  const normalizedQuery = query.trim().replace(/\s+/gu, ' ').normalize('NFD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase('pt-BR');
  return rows.filter(row => {
    const text = `${row.segment.text} ${row.categories.map(item => labels[item.label] ?? item.title).join(' ')}`
      .replace(/\s+/gu, ' ').normalize('NFD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase('pt-BR');
    if (!text.includes(normalizedQuery)) return false;
    const selected = row.categories.filter(item => category === 'all' || item.label === category);
    if (category !== 'all' && !selected.length) return false;
    if (grade === 'all') return true;
    if (grade === 'none') return row.segment.truncated || !selected.length || selected.some(item => item.score === null);
    return !row.segment.truncated && selected.some(item => item.score === Number(grade));
  });
}
