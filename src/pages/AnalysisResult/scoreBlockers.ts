/** Traduz os impedimentos reais, sem substituir ausência de nota por zero. */
import type { CompletedAnalysis } from './dashboardData';
import { policyMean } from './policyMean';

export function scoreBlockerMessages(result: CompletedAnalysis['result']): string[] {
  if (policyMean(result.evaluation) !== null) return [];
  const messages = result.evaluation.score_blockers.flatMap(code => {
    switch (code) {
      case 'document_scope_incomplete':
        return ['O envio foi declarado como trecho ou documento de integridade desconhecida. Para uma nota geral, envie a política inteira e selecione essa opção.'];
      case 'extraction_partial':
        return ['A leitura do arquivo apresentou uma limitação. Confira o PDF e os avisos de extração; depois envie uma cópia legível e completa.'];
      case 'truncated_segments':
        return ['Há trechos cortados e excluídos do cálculo. Reanalise uma cópia completa; se o problema continuar, solicite revisão do processamento.'];
      case 'no_usable_segments':
        return ['Nenhum trecho utilizável chegou à avaliação. Envie um PDF com texto selecionável ou um TXT em UTF-8.'];
      case 'inconclusive_questions': {
        const questions = result.evaluation.dimensions.flatMap(d => d.questions
          .filter(q => q.status === 'inconclusive')
          .map(q => `${d.title} — ${q.title}`));
        return [`O sistema não conseguiu resolver possíveis conflitos ou referências em: ${questions.join('; ') || 'critérios da avaliação'}. Confira as passagens indicadas; isso não significa que a política esteja necessariamente errada.`];
      }
      case 'unknown_applicability':
        return ['A aplicabilidade de critérios está pendente. Resolva essa informação antes de emitir uma nota geral.'];
      case 'no_applicable_questions':
        return ['Não há critérios aplicáveis para calcular uma nota geral neste resultado.'];
      case 'no_evaluable_questions':
        return ['Todas as perguntas ficaram inconclusivas. Nenhuma categoria possui uma base avaliável para calcular a média. As passagens foram preservadas para revisão.'];
      default:
        return ['Há um impedimento que esta interface não reconhece. Exporte o JSON para revisão do resultado.'];
    }
  });
  return messages.length ? [...new Set(messages)] : [
    'Os dados da avaliação não permitem conferir a média, mesmo sem um motivo de bloqueio registrado. Exporte o JSON e solicite revisão do cálculo.',
  ];
}
