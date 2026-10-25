import { useId, useRef } from 'react';
import type { Evidence } from '../../services/analyses';
import type { Guidance, SegmentGuidance } from './recommendationData';

export function HighlightedText({ text, evidence, limit }: { text: string; evidence: Evidence[]; limit?: number }) {
  const chars = Array.from(text);
  const end = Math.min(limit ?? chars.length, chars.length);
  const ranges = evidence.filter(ref => ref.start < end).map(ref => [ref.start, Math.min(ref.end, end)])
    .sort((a, b) => a[0] - b[0]);
  const merged: number[][] = [];
  for (const range of ranges) {
    const last = merged.at(-1);
    if (last && range[0] <= last[1]) last[1] = Math.max(last[1], range[1]);
    else merged.push([...range]);
  }
  let offset = 0;
  const parts = merged.map(([start, stop]) => {
    const before = chars.slice(offset, start).join(''); offset = stop;
    return <span key={`${start}:${stop}`}>{before}<mark>{chars.slice(start, stop).join('')}</mark></span>;
  });
  return <>{parts}{chars.slice(offset, end).join('')}{end < chars.length ? '…' : ''}</>;
}

function GuidanceCard({ item, segmentId }: { item: Guidance; segmentId?: string }) {
  const rec = item.recommendation;
  const evidence = item.evidence.filter(ref => !segmentId || ref.segment_id === segmentId);
  return <article className="guidance-card">
    <h3>{item.title}</h3>
    {item.generalReason && <p className="guidance-context">{item.generalReason}</p>}
    <div className="guidance-observation"><strong>O que foi encontrado</strong>
      {item.observations.map(reason => <p key={reason}>{reason}</p>)}
      {!item.findings.length && <p>{rec.trigger_reason}</p>}
      {evidence.map(ref => <blockquote key={`${ref.segment_id}:${ref.start}:${ref.end}`}>“{ref.quote}”</blockquote>)}
    </div>
    <strong>{rec.target === 'organizational_verification' ? 'O que verificar' : 'Como melhorar'}</strong>
    <p>{rec.what_to_do}</p>
    <ol className="guidance-steps">{rec.how_to_do.map((step, i) => <li key={i}>{step}</li>)}</ol>
    <p className="guidance-check"><strong>Como conferir:</strong> {rec.completion_evidence.join('; ')}.</p>
    <p className="guidance-reference-label">{rec.references.some(ref => ref.source_type === 'public_guidance')
      ? `ISO 27701 · ${rec.references.filter(ref => ref.source_type === 'public_guidance').map(ref => ref.section).join(' · ')}`
      : 'Orientação de revisão do projeto'}</p>
    <details className="guidance-sources"><summary>Referências e contexto{rec.references.some(ref => ref.source_type === 'public_guidance') ? ' ISO 27701' : ' da revisão'}</summary>
      <p>{rec.applicability_note}</p>
      {rec.references.map(ref => <div key={ref.id} className="guidance-source">
        <strong>{ref.source_type === 'public_guidance' ? `${ref.edition} · ${ref.section}` : 'Critério de revisão do projeto'}</strong>
        <p>{ref.summary}</p>
        <small>{ref.source_type === 'public_guidance' ? 'Guia público conferido na planilha; não é verificação do texto integral da norma.' : 'Esta orientação não corresponde a um controle ISO.'}</small>
        <small>Fonte: {ref.source_locator}</small>
        {ref.url?.startsWith('https://') && <a href={ref.url} target="_blank" rel="noreferrer">Consultar fonte</a>}
      </div>)}
    </details>
  </article>;
}

export default function SegmentRecommendations({ guidance, segmentId, segmentNumber, partial }: {
  guidance?: SegmentGuidance; segmentId: string; segmentNumber: number; partial: boolean;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  if (!guidance || (!guidance.items.length && !guidance.complements.length)) return null;
  return <div className="segment-guidance">
    {!!guidance.items.length && <>
      <button className="guidance-trigger" aria-haspopup="dialog" onClick={() => dialog.current?.showModal()}>
        <span className="guidance-count">{guidance.items.length}</span>{' '}
        <span>{guidance.items.length === 1 ? 'ponto de atenção' : 'pontos de atenção'}</span>
        <span className="guidance-trigger-action">Ver recomendações <span aria-hidden="true">↗</span></span>
      </button>
      <dialog ref={dialog} className="guidance-drawer" aria-labelledby={titleId}>
        <header className="guidance-drawer-heading">
          <div><span>Trecho {String(segmentNumber).padStart(2, '0')}</span><h2 id={titleId}>Recomendações para o trecho</h2>
            <p>{guidance.items.length} {guidance.items.length === 1 ? 'ponto de atenção identificado' : 'pontos de atenção identificados'}</p></div>
          <button type="button" className="result-button" aria-label="Fechar recomendações" onClick={() => dialog.current?.close()}>Fechar</button>
        </header>
        <div className="guidance-drawer-body">
          {partial && <p className="guidance-context">Leitura parcial: confira as evidências no original. Outros trechos podem complementar estas informações.</p>}
          {guidance.items.map((item, index) => <details className="guidance-disclosure" key={item.recommendation.id} open={index === 0}>
            <summary>{item.title}</summary><GuidanceCard item={item} segmentId={segmentId} />
          </details>)}
        </div>
      </dialog>
    </>}
    {!!guidance.complements.length && <details className="guidance-complements">
      <summary>Informação complementada em outros trechos</summary>
      <p>Estas passagens foram usadas em conjunto na avaliação da pergunta.</p>
      {guidance.complements.map(item => <div key={`${item.question}:${item.segment.segment_id}`}>
        <strong>{item.question} · Trecho {String(item.index + 1).padStart(2, '0')}{item.segment.page_start !== null ? ` · Página ${item.segment.page_start}` : ''}</strong>
        <blockquote>“{item.segment.text}”</blockquote>
      </div>)}
    </details>}
  </div>;
}

export function GeneralRecommendations({ items, partial }: { items: Guidance[]; partial: boolean }) {
  if (!items.length) return null;
  return <section className="result-panel general-guidance" aria-labelledby="general-guidance-title">
    <h2 id="general-guidance-title">Pontos gerais da política <span className="count-pill">{items.length}</span></h2>
    <p>Orientações sobre o documento como um todo, sem atribuir uma lacuna a um trecho por suposição. Esta lista não muda com os filtros dos trechos.</p>
    {partial && <p className="guidance-context">Leitura parcial: revise o original antes de concluir que uma informação está ausente.</p>}
    {items.map(item => <details className="guidance-disclosure" key={item.recommendation.id}>
      <summary>{item.recommendation.what_to_do}</summary><GuidanceCard item={item} />
    </details>)}
  </section>;
}
