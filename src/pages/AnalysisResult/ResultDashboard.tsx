import { formatPolicyMean, policyMean } from './policyMean';
import { useMemo, useState, type KeyboardEvent } from 'react';
import { Link } from 'react-router';
import Icon from '../../components/Icon';
import { date, labels, scopeNames, type Grade } from '../../services/analyses';
import CategoryCharts from './CategoryCharts';
import SegmentsTable from './SegmentsTable';
import { dashboardData, gradeDescriptions, type CompletedAnalysis } from './dashboardData';
import { recommendationData } from './recommendationData';
import { GeneralRecommendations } from './SegmentRecommendations';

export type ResultTab = 'overview' | 'documents';
export default function ResultDashboard({ analysis, query, onQuery, tab, onTab, onDownload, downloading, downloadError }: {
  analysis: CompletedAnalysis; query: string; onQuery: (query: string) => void; tab: ResultTab; onTab: (tab: ResultTab) => void;
  onDownload: () => void; downloading: boolean; downloadError: string;
}) {
  const { categories, rows, classified, identified } = dashboardData(analysis);
  const [category, setCategory] = useState('all');
  const evaluation = analysis.result.evaluation;
  const mean = policyMean(evaluation);
  const guidance = useMemo(() => recommendationData(analysis.result), [analysis.result]);
  const partial = evaluation.score === null;
  function selectCategory(value: string) {
    setCategory(value);
    document.getElementById('trechos-classificados')?.scrollIntoView({ block: 'start', behavior: 'instant' });
  }
  function tabsKeyboard(event: KeyboardEvent<HTMLDivElement>) {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === 'Home' ? 'overview' : event.key === 'End' ? 'documents' : tab === 'overview' ? 'documents' : 'overview';
    onTab(next); document.getElementById(`tab-${next}`)?.focus();
  }
  return <>
    <div className={`result-notice${partial ? ' warning' : ''}`} role="note"><Icon name="document" size={15} /><p>
      <strong>{partial ? 'Análise parcial ou sem nota global.' : 'Análise automática.'}</strong>{' '}
      {partial ? 'As notas locais disponíveis se referem ao texto analisado. O conteúdo disponível não permite concluir a avaliação global.' : 'As notas de 0 a 3 descrevem as informações encontradas na política. O resultado ainda não foi validado por uma pessoa.'}
    </p></div>
    <div className="result-tabs" role="tablist" aria-label="Conteúdo do resultado" onKeyDown={tabsKeyboard}>
      <button id="tab-overview" role="tab" aria-selected={tab === 'overview'} aria-controls="panel-overview" tabIndex={tab === 'overview' ? 0 : -1} onClick={() => onTab('overview')}><Icon name="grid" size={14} />Visão geral e indicadores</button>
      <button id="tab-documents" role="tab" aria-selected={tab === 'documents'} aria-controls="panel-documents" tabIndex={tab === 'documents' ? 0 : -1} onClick={() => onTab('documents')}><Icon name="files" size={14} />Documentos<span className="count-pill">1</span></button>
    </div>
    <div id="panel-overview" role="tabpanel" aria-labelledby="tab-overview" hidden={tab !== 'overview'}>
      <div className="document-line"><div className="document-name"><Icon name="document" size={14} /><span title={analysis.original_filename}>{analysis.original_filename || 'Política de privacidade'}</span></div><small>Classificação temática</small></div>
      <div className="metric-grid">
        <section className="metric-card" aria-label="Nota média da política"><span className="metric-label">Nota média da política</span><span className="metric-icon"><Icon name="badge" size={15} /></span>
          <div className="metric-value"><strong className={mean === null ? 'no-score' : undefined}><output aria-label="Nota global da política">{mean === null ? 'Sem nota global' : formatPolicyMean(mean)}</output></strong>{mean !== null && <span>/ 3</span>}</div>
          <p>{mean === null ? 'Há impedimentos para emitir a nota global' : 'Média ponderada dos critérios, de 0 a 3'}</p>
        </section>
        <section className="metric-card" aria-label="Trechos classificados"><span className="metric-label">Trechos classificados</span><span className="metric-icon"><Icon name="scan" size={16} /></span><div className="metric-value"><strong>{classified}</strong><span>trechos</span></div><p>Um trecho pode receber mais de uma categoria</p></section>
        <section className="metric-card" aria-label="Categorias identificadas"><span className="metric-label">Categorias identificadas</span><span className="metric-icon"><Icon name="shapes" size={16} /></span><div className="metric-value"><strong>{identified}</strong><span>/ {Object.keys(labels).length}</span></div><p>Categorias com ao menos um trecho</p></section>
      </div>
      <CategoryCharts categories={categories} selected={category} onSelect={selectCategory} />
      <SegmentsTable rows={rows} categories={categories} query={query} onQuery={onQuery} category={category} onCategory={setCategory} guidance={guidance.bySegment} partial={analysis.result.extraction.status !== 'ok'} />
      <GeneralRecommendations items={guidance.general} partial={analysis.result.extraction.status !== 'ok'} />
      <div className="grade-legend" aria-label="Escala de avaliação"><strong>Escala de avaliação</strong>{([0, 1, 2, 3] as Grade[]).map(grade => <span key={grade}><b className="grade-badge" data-grade={grade}>{grade}</b>{gradeDescriptions[grade]}</span>)}</div>
      <p className="result-footnote">A nota avalia a informação documentada; não representa um percentual de conformidade legal. Na tabela, a nota é da categoria na política, não uma nota individual do trecho.</p>
    </div>
    <div id="panel-documents" role="tabpanel" aria-labelledby="tab-documents" hidden={tab !== 'documents'}>
      <section className="result-panel document-panel"><h2>{analysis.original_filename || 'Política de privacidade'}</h2>
        <dl className="document-facts"><div><dt>Data de envio</dt><dd>{date(analysis.created_at)}</dd></div><div><dt>Conteúdo enviado</dt><dd>{scopeNames[analysis.result.document_scope]}</dd></div><div><dt>Método de avaliação</dt><dd>Qualidade da informação documentada · Escala de 0 a 3</dd></div></dl>
        <p>{rows.length} trechos extraídos{analysis.result.extraction.page_count ? ` em ${analysis.result.extraction.page_count} páginas` : ''}.</p>
        {!!analysis.result.extraction.warnings.length && <ul>{analysis.result.extraction.warnings.map((warning, index) => <li key={index}>{warning}</li>)}</ul>}
        {analysis.supersedes_analysis_id && <p>Reanálise vinculada à <Link to={'/app/analyses/' + analysis.supersedes_analysis_id}>avaliação anterior</Link>.</p>}
        <div className="document-actions"><button className="result-button" disabled={downloading} onClick={onDownload}><Icon name="download" size={15} />{downloading ? 'Baixando…' : 'Baixar arquivo original'}</button>
          <Link className="result-button" to={'/app/new?supersedes=' + encodeURIComponent(analysis.analysis_id)}>Reavaliar política</Link></div>
        {downloadError && <p className="result-error" role="alert">{downloadError}</p>}
      </section>
    </div>
  </>;
}
