import { useState } from 'react';
import Icon from '../../components/Icon';
import { labels, type Grade } from '../../services/analyses';
import { filterSegments, gradeDescriptions, type CategoryScore, type SegmentRow } from './dashboardData';
import SegmentRecommendations, { HighlightedText } from './SegmentRecommendations';
import type { SegmentGuidance } from './recommendationData';

export function GradeBadge({ grade }: { grade: Grade | null }) {
  return <span className="grade-badge" data-grade={grade ?? 'none'}>{grade === null ? 'Sem nota' : `${grade} / 3`}</span>;
}

function PaginatedRows({ rows, guidance, partial }: { rows: SegmentRow[]; guidance: Map<string, SegmentGuidance>; partial: boolean }) {
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const pageSize = 5;
  const pages = Math.max(1, Math.ceil(rows.length / pageSize));
  const first = (page - 1) * pageSize;
  const visible = rows.slice(first, first + pageSize);
  return <>
    <table className="segments-table" aria-label="Trechos classificados e notas das categorias">
      <thead><tr><th scope="col">Trecho da política</th><th scope="col">Categoria</th><th scope="col">Nota da categoria</th></tr></thead>
      <tbody>{visible.map(({ segment, index, categories }) => {
        const long = segment.text.length > 360;
        const isExpanded = expanded.has(segment.segment_id);
        const tips = guidance.get(segment.segment_id);
        const evidence = tips?.items.flatMap(item => item.evidence.filter(ref => ref.segment_id === segment.segment_id)) ?? [];
        return <tr key={segment.segment_id}>
          <td><div className="segment-copy"><span className="segment-index">Trecho {String(index + 1).padStart(2, '0')}{segment.page_start !== null ? ` · Página ${segment.page_start}` : ''}{segment.truncated ? ' · Trecho truncado' : ''}</span>
            <p className="segment-text">“<HighlightedText text={segment.text} evidence={evidence} limit={long && !isExpanded ? 360 : undefined} />”</p>
            {long && <button className="segment-text-toggle" aria-expanded={isExpanded} onClick={() => setExpanded(previous => {
              const next = new Set(previous); if (next.has(segment.segment_id)) next.delete(segment.segment_id); else next.add(segment.segment_id); return next;
            })}>{isExpanded ? 'Recolher trecho' : 'Ler trecho completo'}</button>}</div>
            <SegmentRecommendations guidance={tips} segmentId={segment.segment_id} segmentNumber={index + 1} partial={partial} />
          </td>
          <td data-label="Categoria"><div className="row-categories">{categories.length ? categories.map(category => <div key={category.label}><span className="category-tag">{labels[category.label] ?? category.title}</span></div>) : <span className="category-tag">Sem categoria detectada</span>}</div></td>
          <td data-label="Nota da categoria"><div className="row-grades">{categories.length ? categories.map(category => {
            const grade = segment.truncated ? null : category.score;
            return <div key={category.label} title={`Nota de ${category.title} na política`}><GradeBadge grade={grade} /><span className="grade-description">{segment.truncated ? 'Trecho excluído do cálculo' : grade === null ? 'Categoria sem nota' : gradeDescriptions[grade]}</span></div>;
          }) : <GradeBadge grade={null} />}</div></td>
        </tr>;
      })}
        {!rows.length && <tr><td colSpan={3} className="empty-segments">Nenhum trecho encontrado. Ajuste a busca ou os filtros.</td></tr>}
      </tbody>
    </table>
    <div className="pagination"><span role="status">{rows.length ? `${first + 1}–${Math.min(first + pageSize, rows.length)} de ${rows.length} trechos` : '0 trechos'}</span>
      <div><button aria-label="Página anterior de trechos" disabled={page === 1} onClick={() => setPage(page - 1)}><Icon name="chevron" size={12} style={{ transform: 'rotate(180deg)' }} /></button>
        <span>Página {page} de {pages}</span><button aria-label="Próxima página de trechos" disabled={page === pages} onClick={() => setPage(page + 1)}><Icon name="chevron" size={12} /></button></div>
    </div>
  </>;
}

export default function SegmentsTable({ rows, categories, query, onQuery, category, onCategory, guidance, partial }: {
  rows: SegmentRow[]; categories: CategoryScore[]; query: string; onQuery: (query: string) => void; category: string; onCategory: (category: string) => void;
  guidance: Map<string, SegmentGuidance>; partial: boolean;
}) {
  const [grade, setGrade] = useState('all');
  const filtered = filterSegments(rows, query, category, grade);
  return <section className="result-panel segments-panel" id="trechos-classificados" aria-labelledby="segments-title">
    <div className="segments-heading">
      <div><div className="panel-heading"><h2 id="segments-title">Trechos classificados e avaliados</h2><p>Confira o texto, as categorias atribuídas e suas notas na política.</p></div><span className="count-pill">{rows.length} trechos</span></div>
      <div className="segment-filters">
        <label className="segment-search"><Icon name="search" size={15} /><span className="sr-only">Buscar nos trechos</span><input id="segment-search" placeholder="Buscar nos trechos..." value={query} onChange={event => onQuery(event.target.value)} /></label>
        <select aria-label="Filtrar categoria dos trechos" value={category} onChange={event => onCategory(event.target.value)}><option value="all">Todas as categorias</option>{categories.map(item => <option key={item.label} value={item.label}>{labels[item.label] ?? item.title}</option>)}</select>
        <select aria-label="Filtrar nota da categoria" value={grade} onChange={event => setGrade(event.target.value)}><option value="all">Todas as notas</option>{[0, 1, 2, 3].map(value => <option key={value} value={value}>Nota {value}</option>)}<option value="none">Sem nota</option></select>
      </div>
    </div>
    <PaginatedRows key={`${query}|${category}|${grade}`} rows={filtered} guidance={guidance} partial={partial} />
  </section>;
}
