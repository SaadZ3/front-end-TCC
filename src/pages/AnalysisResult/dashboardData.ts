/** Prepara categorias e trechos da análise para os gráficos e filtros. */
import { labels, type Analysis, type Grade, type Segment } from '../../services/analyses';
import { formatGrade } from './scoreExplanation';

export type CompletedAnalysis = Extract<Analysis, { status: 'completed'; }>;
export type CategoryScoreStatus = 'scored' | 'not_scored' | 'inconclusive' | 'not_applicable' | 'unavailable';
export interface CategoryScore {
  id: string; label: string; title: string; score: Grade | null;
  segmentCount: number; scoreStatus: CategoryScoreStatus;
  scale?: 'ordinal_0_3' | 'continuous_0_3';
}
export interface SegmentRow { segment: Segment; index: number; categories: CategoryScore[]; }

const dimensionLabels: Record<string, string> = {
  collection: 'First Party Collection/Use',
  sharing: 'Third Party Sharing/Collection',
  choice: 'User Choice/Control',
  access: 'User Access, Edit and Deletion',
  retention: 'Data Retention',
  security: 'Data Security',
  changes: 'Policy Change',
  dnt: 'Do Not Track',
  audiences: 'International and Specific Audiences',
};
const shortTitles: Record<string, string> = {
  'First Party Collection/Use': 'Coleta e uso de dados',
  'Third Party Sharing/Collection': 'Compartilhamento',
  'User Choice/Control': 'Escolhas e controle',
  'User Access, Edit and Deletion': 'Direitos dos titulares',
  'Data Retention': 'Retenção de dados',
  'Data Security': 'Segurança de dados',
  'Policy Change': 'Alterações da política',
  'Do Not Track': 'Não rastreamento',
  'International and Specific Audiences': 'Públicos específicos e contexto internacional',
  Other: 'Outros temas',
};

/** Mantém a contagem do perfil salvo, inclusive quando uma categoria fica inconclusiva. */
export function categoryCoverageText(categories: CategoryScore[]): string {
  const scored = categories.filter(category => category.scoreStatus !== 'not_scored').length;
  const informational = categories.length - scored;
  return `O sistema identifica ${categories.length} categorias. O método atual pontua ${scored}; ${informational === 1
    ? 'a outra permite consultar os trechos' : `as outras ${informational} permitem consultar os trechos`}, sem participar da média.`;
}

/** Explica o alcance das novas notas sem atribuir esse método ao histórico. */
export function topicScopeExplanation(categories: CategoryScore[]): string | null {
  return categories.some(category => category.id === 'dnt' && category.scoreStatus !== 'not_scored')
    ? 'DNT avalia a explicação da resposta ao sinal de não rastrear; uma resposta negativa clara pode pontuar. Públicos específicos avalia duas perguntas sobre os grupos ou contextos encontrados, sem comprovar cobertura de todos os públicos.'
    : null;
}

export const gradeDescriptions: Record<Grade, string> = {
  0: 'Faixa inicial', 1: 'Faixa básica', 2: 'Faixa intermediária', 3: 'Faixa superior',
};

export function categoryDetectionText(category: CategoryScore): string {
  return category.segmentCount === 0 ? 'Tema não identificado pelo classificador'
    : `Tema identificado em ${category.segmentCount} ${category.segmentCount === 1 ? 'trecho' : 'trechos'}`;
}

export function categoryScoreText(category: CategoryScore): string {
  if (category.score !== null) return `${formatGrade(category.score)} / 3`;
  switch (category.scoreStatus) {
    case 'not_scored': return 'Fora da pontuação atual';
    case 'inconclusive': return 'Avaliação inconclusiva';
    case 'not_applicable': return 'Não se aplica neste perfil';
    default: return 'Nota indisponível neste resultado';
  }
}

/** Recebe uma análise concluída e retorna categorias, linhas e contagens do painel. */
export function dashboardData(analysis: CompletedAnalysis) {
  const expectedDimensions = analysis.result.evaluation.profile_id === 'documentary-18-v1'
    ? Object.keys(dimensionLabels) : Object.keys(dimensionLabels).slice(0, 7);
  const categories: CategoryScore[] = Object.entries(labels).map(([label, title]) => {
    const dimensionId = expectedDimensions.find(id => dimensionLabels[id] === label);
    const dimension = analysis.result.evaluation.dimensions.find(item => item.id === dimensionId);
    return {
      id: dimensionId ?? label,
      label,
      title: shortTitles[label] || title,
      score: dimension?.score ?? null,
      scale: analysis.result.evaluation.score_scale,
      segmentCount: analysis.result.segments.filter(segment => segment.labels.includes(label)).length,
      // A ausência de uma dimensão esperada não significa que ela está fora do método.
      scoreStatus: !dimensionId ? 'not_scored' : dimension?.score != null ? 'scored'
        : dimension?.status === 'not_applicable' ? 'not_applicable'
          : dimension?.status === 'unresolved' ? 'inconclusive' : 'unavailable',
    };

  });
  const rows: SegmentRow[] = analysis.result.segments.map((segment, index) => ({
    segment,
    index,
    // Uma categoria pode avaliar a política inteira; não atribuímos essa nota ao trecho.
    categories: segment.labels.map(label => categories.find(category => category.label === label) ?? {
      id: label, label, title: labels[label] ?? label, score: null, segmentCount: 0, scoreStatus: 'unavailable',
    }),
  }));
  return {
    categories,
    rows,
    identified: categories.filter(category => category.segmentCount > 0).length,
    classified: analysis.result.segments.filter(segment => segment.labels.length > 0).length
  };
}

/** Normaliza espaços, acentos e caixa, preservando espaços nas extremidades. */
function normalizeSearchText(text: string): string {
  return text.replace(/\s+/gu, ' ').normalize('NFD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase('pt-BR');
}

/** Recebe linhas e filtros; retorna os trechos correspondentes na ordem original. */
export function filterSegments(rows: SegmentRow[], query: string, category: string, grade: string) {
  const normalizedQuery = normalizeSearchText(query.trim());
  return rows.filter(row => {
    const text = normalizeSearchText(`${row.segment.text} ${row.categories.map(item => labels[item.label] ?? item.title).join(' ')}`);
    if (!text.includes(normalizedQuery)) return false;
    const selected = row.categories.filter(item => category === 'all' || item.label === category);
    if (category !== 'all' && !selected.length) return false;
    if (grade === 'all') return true;
    if (grade === 'none') return row.segment.truncated || !selected.length || selected.some(item => item.score === null);
    if (grade === 'not_scored' || grade === 'inconclusive') return selected.some(item => item.scoreStatus === grade);
    return !row.segment.truncated && selected.some(item => item.score === Number(grade));
  });
}
