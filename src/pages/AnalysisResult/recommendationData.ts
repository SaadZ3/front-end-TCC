import type { Evidence, Finding, Recommendation, Result, Segment } from '../../services/analyses';

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
  collection_practice: 'como ocorre a coleta', identifiable_data_type: 'quais dados são coletados',
  collected_data_type: 'quais dados são usados', specific_purpose: 'finalidade específica',
  sharing_practice: 'como ocorre o compartilhamento', identifiable_recipient: 'destinatário identificável',
  purpose_condition_or_prohibition: 'finalidade ou condição do compartilhamento',
  affected_processing: 'tratamento afetado pela escolha', locatable_procedure: 'procedimento localizável',
  choice: 'escolha disponível', locatable_channel: 'canal localizável', identified_request: 'tipo de solicitação',
  response_duration_and_unit: 'prazo de resposta', start_event: 'marco inicial da contagem',
  data_class: 'classe de dados', duration_or_event: 'prazo ou evento de encerramento',
  end_event: 'evento de encerramento', disposition: 'destino dos dados', specific_measure: 'medida de proteção específica',
  data_or_protection_context: 'dados ou contexto protegido', specific_access_control: 'restrição de acesso',
  actor: 'pessoas ou papéis autorizados', resource: 'dados ou recursos protegidos', policy_change: 'alteração da política',
  identified_notice_channel: 'canal de aviso', policy_change_notice: 'aviso da alteração', timing_and_event: 'momento e evento do aviso',
};

export function recommendationData(result: Result) {
  const segments = new Map(result.segments.map((segment, index) => [segment.segment_id, { segment, index }]));
  const questions = new Map(result.evaluation.dimensions.flatMap(d => d.questions).map(q => [q.id, q]));
  const findings = new Map(result.evaluation.findings.map(f => [f.id, f]));
  const bySegment = new Map<string, SegmentGuidance>(result.segments.map(s => [s.segment_id, { items: [], complements: [] }]));
  const general: Guidance[] = [];
  const validEvidence = (ref: Evidence) => {
    const segment = segments.get(ref.segment_id)?.segment;
    return !!segment && !segment.truncated && Number.isInteger(ref.start) && Number.isInteger(ref.end) &&
      ref.start >= 0 && ref.end > ref.start && ref.end <= Array.from(segment.text).length && !!ref.quote &&
      Array.from(segment.text).slice(ref.start, ref.end).join('') === ref.quote;
  };
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
    const specific = !!question && (rec.template_id.startsWith(question.id + '.') ||
      rec.template_id === `review.clarify.${question.id}`);
    // Catálogos antigos podem reunir perguntas diferentes em uma orientação. Não os dividimos por suposição.
    const local = specific && linked.length === rec.finding_ids.length && linked.length > 0 &&
      linked.every(f => f.recommendation_ids.includes(rec.id) && f.kind !== 'extraction_limitation' &&
        f.evidence_groups.length > 0 && f.evidence_groups.every(g => g.evidence.length > 0 && g.evidence.every(validEvidence)) &&
        (f.kind !== 'information_gap' || question.status === 'partial'));
    const observations = [...new Set(linked.map(f => {
      const q = questions.get(f.question_id ?? '');
      if (f.kind !== 'information_gap' || !q) return f.rationale;
      if (q.status === 'not_detected') return `Não foi localizada informação suficiente para avaliar: ${q.title.toLocaleLowerCase('pt-BR')}.`;
      const missing = q.missing_elements.map(key => elementNames[key]).filter(Boolean);
      return missing.length ? `Informação parcial. Falta esclarecer: ${missing.join('; ')}.` : 'Informação parcial: confira o contexto e os elementos necessários para responder à pergunta.';
    }))];
    const item: Guidance = { recommendation: rec, findings: linked, evidence: uniqueEvidence, observations,
      title: question?.title ?? rec.what_to_do };
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
