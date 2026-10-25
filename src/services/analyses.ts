import { api } from './api';

export type Scope = 'full_document' | 'excerpt' | 'unknown';
export type Grade = 0 | 1 | 2 | 3;
export interface Evidence { segment_id: string; quote: string; start: number; end: number; }
export interface Segment {
  segment_id: string; text: string; page_start: number | null; page_end: number | null;
  labels: string[]; probabilities: Record<string, number>; truncated: boolean;
}
export type QuestionStatus = 'supported' | 'partial' | 'not_detected' | 'inconclusive' | 'not_applicable';
export interface EvidenceGroup {
  id: string; evidence: Evidence[]; polarity: 'affirmed' | 'negated' | 'conditional' | 'uncertain';
  detection_source: 'model_and_rule' | 'rule_only'; rule_id: string; rule_version: string; rationale: string;
}
export interface SearchScope {
  searched_segment_ids: string[]; excluded_segment_ids: string[]; category_pass: boolean; fallback_pass: boolean; fallback_reason: string | null;
}
export interface Question {
  id: string; dimension_id: string; title: string; status: QuestionStatus; value: 0 | .5 | 1 | null;
  applicability: { state: 'applicable' | 'not_applicable' | 'unknown'; source: 'profile' | 'user'; source_id: string; reason: string; declared_at: string };
  rule_id: string; rule_version: string; rationale: string; found_elements: string[]; missing_elements: string[];
  supporting_groups: EvidenceGroup[]; contextual_groups: EvidenceGroup[]; search_scope: SearchScope;
  finding_ids: string[]; duplicate_occurrences_omitted: number;
}
export interface Dimension {
  id: string; title: string; weight: number; normalized_weight: number | null; status: 'resolved' | 'unresolved' | 'not_applicable';
  score: Grade | null; contribution: number | null; earned_points: number; applicable_questions: number;
  unknown_applicability_questions: number; resolved_questions: number; inconclusive_questions: number; excluded_questions: number; questions: Question[];
}
export interface Finding {
  id: string; dimension_id: string | null; question_id: string | null; rule_id: string; rule_version: string;
  kind: 'information_gap' | 'ambiguity' | 'contradiction' | 'practice_statement' | 'extraction_limitation';
  title: string; rationale: string; priority: 'high' | 'medium' | 'low'; priority_reason: string;
  evidence_groups: EvidenceGroup[]; search_scope: SearchScope | null; recommendation_ids: string[];
}
export interface RecommendationReference {
  id: string; source_type: 'project_rubric' | 'public_guidance'; title: string; edition: string | null;
  section: string | null; pdf_page: null; url: string | null; verified_by: string; verified_at: string;
  verification_scope: 'provided_workbook' | 'project_document'; source_file: string; source_sha256: string;
  source_locator: string; control_role: 'controller' | 'processor' | 'shared' | 'project'; summary: string;
}
export interface Recommendation {
  id: string; template_id: string; catalog_version: string; finding_ids: string[];
  target: 'policy_wording' | 'organizational_verification'; trigger_reason: string;
  what_to_do: string; how_to_do: string[]; completion_evidence: string[]; suggested_role: string | null;
  references: RecommendationReference[]; pending_fields: string[];
  priority: 'high' | 'medium' | 'low'; priority_reason: string; applicability_note: string;
}
export interface Result {
  document_scope: Scope;
  extraction: { status: 'ok' | 'partial'; warnings: string[]; page_count?: number | null };
  segments: Segment[];
  evaluation: {
    score_scale: 'ordinal_0_3'; score_conversion?: 'percentage_to_ordinal_v1';
    schema_version: 2; policy_id: string; language: 'pt'; index: 'documentary_information_quality';
    method_version: string; profile_id: 'core-14-v1'; profile_sha256: string; validation_status: 'not_human_validated';
    input_status: 'complete_input' | 'partial_input' | 'no_usable_segments'; score_status: 'available' | 'blocked';
    score: Grade | null; score_blockers: string[]; rules_version: string; rules_sha256: string; predictions_sha256: string;
    fallback_enabled: boolean; dimensions: Dimension[]; findings: Finding[]; recommendations: Recommendation[]; limitations: string[];
  };
}
export interface Versions { model: string; preprocessing: string; scoring: string; recommendations: string | null; }
export type Analysis = { schema_version: 2; analysis_id: string; original_filename: string; created_at: string;
  supersedes_analysis_id: string | null; profile_id: 'core-14-v1' } & (
  { status: 'processing'; result: null; versions: null; error: null } |
  { status: 'completed'; result: Result; versions: Versions; error: null } |
  { status: 'failed'; result: null; versions: Versions | null; error: { code: string; message: string } }
);
export interface History {
  items: { analysis_id: string; original_filename: string; created_at: string; status: Analysis['status']; schema_version: 2; supersedes_analysis_id: string | null }[];
  page: number; page_size: number; total: number;
}
export const labels: Record<string, string> = {
  'First Party Collection/Use': 'Coleta e uso de dados',
  'Third Party Sharing/Collection': 'Compartilhamento com terceiros',
  'User Choice/Control': 'Escolhas e controle',
  'User Access, Edit and Deletion': 'Acesso, correção e exclusão',
  'Data Retention': 'Retenção de dados', 'Data Security': 'Segurança dos dados',
  'Policy Change': 'Alterações da política', 'Do Not Track': 'Não rastreamento',
  'International and Specific Audiences': 'Públicos específicos e contexto internacional', Other: 'Outros temas',
};
export const statusNames = { processing: 'Em processamento', completed: 'Concluída', failed: 'Falha na análise' };
export const scopeNames = { full_document: 'Política inteira', excerpt: 'Trecho da política', unknown: 'Escopo desconhecido' };
export const number = (value: number) => value.toLocaleString('pt-BR', { maximumFractionDigits: 1 });
export const date = (value: string) => new Date(value).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
export const fetchAnalysis = (id: string, signal?: AbortSignal) => api<Analysis>('/analyses/' + encodeURIComponent(id), { signal });
