/** Relaciona orientações às evidências sem atribuir lacunas gerais a trechos específicos. */
import type { Evidence, Finding, Question, Recommendation, Result, Segment } from '../../services/analyses';

export interface Guidance {
  recommendation: Recommendation;
  findings: Finding[];
  evidence: Evidence[];
  title: string;
  observations: string[];
  generalReason?: string;
}
export interface Complement {
  question: string;
  segment: Segment;
  index: number;
}
export interface SegmentGuidance { items: Guidance[]; complements: Complement[]; }

const elementNames: Record<string, string> = {
  identified_dnt_signal: 'sinal DNT identificado',
  organization_dnt_response: 'resposta da organização ao sinal DNT',
  dnt_effect: 'efeito da resposta sobre o tratamento',
  dnt_scope: 'serviço, dados ou contexto alcançado',
  identified_audience: 'público ou contexto internacional identificado',
  audience_scope: 'quem é abrangido pela declaração',
  audience_practice: 'prática ou orientação ligada a esse público',
  collection_practice: 'como ocorre a coleta ou o uso',
  identifiable_data_type: 'quais dados são coletados ou usados',
  collected_data_type: 'quais dados são usados',
  specific_purpose: 'finalidade específica',
  sharing_practice: 'como ocorre o compartilhamento',
  identifiable_recipient: 'destinatário identificável',
  purpose_condition_or_prohibition: 'finalidade ou condição do compartilhamento',
  affected_processing: 'tratamento afetado pela escolha',
  locatable_procedure: 'procedimento localizável',
  choice: 'escolha disponível',
  locatable_channel: 'canal localizável',
  identified_request: 'tipo de solicitação',
  response_duration_and_unit: 'prazo de resposta',
  start_event: 'marco inicial da contagem',
  data_class: 'classe de dados',
  duration_or_event: 'prazo ou evento de encerramento',
  end_event: 'evento de encerramento',
  disposition: 'destino dos dados',
  specific_measure: 'medida de proteção específica',
  data_or_protection_context: 'dados ou contexto protegido',
  specific_access_control: 'restrição de acesso',
  actor: 'pessoas ou papéis autorizados',
  resource: 'dados ou recursos protegidos',
  policy_change: 'alteração da política',
  identified_notice_channel: 'canal de aviso',
  policy_change_notice: 'aviso da alteração',
  timing_and_event: 'momento e evento do aviso',
};

/** Usa a mesma explicação dos elementos faltantes na tela e na exportação. */
export function findingObservation(finding: Finding, question?: Question): string {
  if (finding.kind !== 'information_gap' || !question) return finding.rationale;
  if (question.status === 'not_detected') return `Não foi localizada informação suficiente para avaliar: ${question.title.toLocaleLowerCase('pt-BR')}.`;
  const missing = question.missing_elements.map(key => elementNames[key]).filter(Boolean);
  return missing.length ? `Informação parcial. Falta esclarecer: ${missing.join('; ')}.`
    : 'Informação parcial: confira o contexto e os elementos necessários para responder à pergunta.';
}

/** Recebe o resultado e retorna orientações por trecho e orientações gerais. */
export function recommendationData(result: Result) {
  const segments = new Map(result.segments.map((segment, index) => [segment.segment_id, { segment, index }]));
  const questions = new Map(result.evaluation.dimensions.flatMap(d => d.questions).map(q => [q.id, q]));
  const findings = new Map(result.evaluation.findings.map(f => [f.id, f]));
  const bySegment = new Map<string, SegmentGuidance>(result.segments.map(s => [s.segment_id, { items: [], complements: [] }]));
  const general: Guidance[] = [];
  /** Confere posições em caracteres Unicode, como o Python que produziu a evidência. */
  function validEvidence(ref: Evidence): boolean {
    const segment = segments.get(ref.segment_id)?.segment;
    if (!segment || segment.truncated || !Number.isInteger(ref.start) || !Number.isInteger(ref.end)
      || ref.start < 0 || ref.end <= ref.start) return false;
    const characters = Array.from(segment.text);
    return ref.end <= characters.length && !!ref.quote
      && characters.slice(ref.start, ref.end).join('') === ref.quote;
  }

  /** Só associa ao trecho uma orientação específica e sustentada por todos os vínculos. */
  function canAttachToSegment(rec: Recommendation, linked: Finding[], question: Question | undefined): boolean {
    const specific = !!question && (rec.template_id.startsWith(question.id + '.') ||
      rec.template_id === `review.clarify.${question.id}`);
    // Catálogos antigos podem reunir perguntas diferentes. Não os dividimos por suposição.
    return specific && linked.length === rec.finding_ids.length && linked.length > 0 &&
      linked.every(f => f.recommendation_ids.includes(rec.id) && f.kind !== 'extraction_limitation' &&
        f.evidence_groups.length > 0 && f.evidence_groups.every(g => g.evidence.length > 0 && g.evidence.every(validEvidence)) &&
        (f.kind !== 'information_gap' || question.status === 'partial'));
  }

  /** Devolve as observações dos achados, sem duplicar textos nem inventar elementos ausentes. */
  function observationsFor(linked: Finding[]): string[] {
    return [...new Set(linked.map(f => findingObservation(f, questions.get(f.question_id ?? ''))))];
  }

  const seen = new Set<string>();
  for (const rec of result.evaluation.recommendations) {
    if (seen.has(rec.id)) continue;
    seen.add(rec.id);
    const linked = rec.finding_ids.map(id => findings.get(id)).filter((f): f is Finding => !!f);
    if (linked.length && linked.length === rec.finding_ids.length && linked.every(f =>
      f.kind === 'information_gap' && questions.get(f.question_id ?? '')?.status === 'supported')) continue;
    const questionIds = new Set(linked.map(f => f.question_id));
    const question = questionIds.size === 1 ? questions.get(linked[0]?.question_id ?? '') : undefined;
    const evidence = linked.flatMap(f => f.evidence_groups.flatMap(g => g.evidence));
    const uniqueEvidence = [...new Map(evidence.filter(validEvidence).map(ref =>
      [`${ref.segment_id}:${ref.start}:${ref.end}`, ref])).values()];
    const local = canAttachToSegment(rec, linked, question);
    const observations = observationsFor(linked);
    const item: Guidance = {
      recommendation: rec,
      findings: linked,
      evidence: uniqueEvidence,
      observations,
      title: question?.title ?? rec.what_to_do
    };
    if (local) {
      for (const id of new Set(uniqueEvidence.map(ref => ref.segment_id))) bySegment.get(id)!.items.push(item);
    } else {
      item.generalReason = linked.some(f => f.kind === 'extraction_limitation')
        ? 'Confira a leitura do documento antes de concluir a avaliação.'
        : !uniqueEvidence.length
          ? 'Não há evidência utilizável para atribuir esta orientação a um trecho específico. Ausência de informação não comprova ausência da prática.'
          : 'Orientação consolidada da análise, sem vínculo local suficientemente específico.';
      general.push(item);
    }
  }
  // Só mostramos complemento quando a própria evidência da resposta reúne as passagens.
  for (const question of questions.values()) {
    if (question.status !== 'supported') continue;
    for (const group of question.supporting_groups) {
      if (!group.evidence.length || !group.evidence.every(validEvidence)) continue;
      const ids = [...new Set(group.evidence.map(ref => ref.segment_id))];
      for (const id of ids) for (const otherId of ids.filter(other => other !== id)) {
        const items = bySegment.get(id)!.complements;
        if (!items.some(item => item.question === question.title && item.segment.segment_id === otherId))
          items.push({ question: question.title, ...segments.get(otherId)! });
      }
    }
  }
  return { bySegment, general };
}
