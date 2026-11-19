/** Reconhece títulos, sumários e menus para tirá-los da lista principal; não altera a nota. */

export type StructuralReason = 'título' | 'sumário' | 'data';

const connectives = new Set('a o as os de da do das dos e ou em na no nas nos que para com por pelo pela ao à se como sobre entre sua seu suas seus'.split(' '));
const months = 'janeiro|fevereiro|março|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro';
const dateText = new RegExp(`(?:última atualização|atualizad[oa] em|vigente desde|em vigor (?:desde|em))\\s*:?\\s*(?:\\d{1,2}\\s+de\\s+)?(?:${months})\\s+de\\s+\\d{4}|(?:\\d{1,2}\\s+de\\s+)?(?:${months})\\s+de\\s+\\d{4}`, 'giu');
const sentenceEnd = /[\p{L}\p{N})\]”"][.!?…;,]['"”’)]*$/u;
const sectionNumber = /(?:^|\s)\d+(?:\.\d+)*\.?\s+\p{Lu}/gu;
const fullStop = /[\p{Ll})][.!?](?:\s|$)/gu;
const startsLikeHeading = /^[+\d\p{Lu}©]/u;

/**
 * Recebe o texto de um trecho e diz se ele é só estrutura do documento.
 * Ex.: "+ Dados Pessoais Que a Apple Coleta de Você" → 'título';
 *      "Coletamos seu nome para criar a conta." → null.
 */
export function structuralReason(text: string): StructuralReason | null {
  const compact = text.replace(/\s+/gu, ' ').trim();
  const lower = compact.toLocaleLowerCase('pt-BR');
  if (lower.startsWith('sumário') || lower.startsWith('índice')
    || ((compact.match(sectionNumber)?.length ?? 0) >= 6 && (compact.match(fullStop)?.length ?? 0) <= 1)) return 'sumário';
  // PDFs de sites deixam um " ." solto no fim de cabeçalhos.
  const withoutDate = compact.replace(dateText, '').replace(/\s+\.$/u, '').trim();
  const words = withoutDate.split(' ').filter(Boolean);
  if (!words.length) return 'data';
  if (!startsLikeHeading.test(withoutDate) || sentenceEnd.test(withoutDate) || withoutDate.includes(':')) return null;
  // Terminar em "de", "e", "para"... indica frase cortada por quebra de linha, não título.
  if (connectives.has(words[words.length - 1].replace(/[^\p{L}\p{N}]+$/u, '').toLocaleLowerCase('pt-BR'))) return null;
  if (words.length <= 6) return 'título';
  if (words.length > 12) return null;
  const longWords = words.filter(word => word.length > 3);
  const capitalized = longWords.filter(word => startsLikeHeading.test(word)).length;
  const repeatsOpening = words.slice(2).join(' ').toLocaleLowerCase('pt-BR').includes(words.slice(0, 2).join(' ').toLocaleLowerCase('pt-BR'));
  return capitalized >= 0.6 * longWords.length || repeatsOpening || /^[+\d]/u.test(withoutDate) ? 'título' : null;
}
