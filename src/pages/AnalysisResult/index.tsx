/** Carrega uma análise, acompanha seu estado e permite baixar documento, JSON e PDF. */
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import Icon from '../../components/Icon';
import { apiFile, ApiError } from '../../services/api';
import { fetchAnalysis, type Analysis } from '../../services/analyses';
import AnalysisShell from '../../components/AnalysisShell';
import ResultDashboard, { type ResultTab } from './ResultDashboard';

/** Baixa o conteúdo recebido com o nome indicado e libera a URL após o clique. */
function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Recebe o ID da análise e retorna sua tela com atualização, falhas e downloads. */
function AnalysisView({ id }: { id: string; }) {
  const [state, setState] = useState<{ data?: Analysis; error?: string; missing?: boolean; }>({});
  const [attempt, setAttempt] = useState(0);
  const [downloadError, setDownloadError] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState('');
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<ResultTab>('overview');
  useEffect(() => {
    const controller = new AbortController();
    let timer: number | undefined;
    /** Busca o estado atual e agenda outra consulta somente enquanto a análise estiver em processamento. */
    async function load() {
      try {
        const data = await fetchAnalysis(id, controller.signal);
        if (controller.signal.aborted) return;
        setState({ data });
        if (data.status === 'processing') timer = window.setTimeout(() => void load(), 3000);
      } catch (error) {
        if (!controller.signal.aborted) setState({
          error: error instanceof Error ? error.message : 'Não foi possível carregar.',
          missing: error instanceof ApiError && [400, 404].includes(error.status)
        });
      }
    }
    void load();
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [id, attempt]);
  /** Baixa o original da análise atual e atualiza o estado de erro ou andamento. */
  async function download() {
    setDownloading(true);
    setDownloadError('');
    try {
      const blob = await apiFile('/analyses/' + encodeURIComponent(id) + '/file');
      downloadBlob(blob, state.data?.original_filename || 'politica');
    } catch (error) { setDownloadError(error instanceof Error ? error.message : 'Não foi possível baixar.'); }
    finally { setDownloading(false); }
  }
  const data = state.data;
  /** Gera o PDF da análise concluída e informa o andamento ou falha na tela. */
  async function exportPdf() {
    if (!data || data.status !== 'completed' || exporting) return;
    setExporting(true);
    setExportError('');
    try {
      const { exportAnalysisPdf } = await import('./exportPdf');
      await exportAnalysisPdf(data);
    } catch { setExportError('Não foi possível gerar o PDF. Tente novamente.'); }
    finally { setExporting(false); }
  }
  /** Baixa o JSON integral da análise concluída, sem aplicar os filtros da tela. */
  function exportResult() {
    if (!data || data.status !== 'completed') return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' });
    downloadBlob(blob, `resultado-${id}.json`);
  }
  return <AnalysisShell onSearch={value => {
    setQuery(value);
    setTab('overview');
    requestAnimationFrame(() => {
      document.getElementById('trechos-classificados')?.scrollIntoView({ block: 'start' });
      document.getElementById('segment-search')?.focus({ preventScroll: true });
    });
  }}>
    {!data && !state.error && <section className="result-panel status-panel">
      <p role="status">Carregando análise…</p>
    </section>}
    {state.error && <section className="result-panel status-panel">
      <h1>
        {state.missing ? 'Análise não encontrada' : 'Não foi possível carregar a análise'}
      </h1>
      <p className="result-error" role="alert">
        {state.error}
      </p>
      {!state.missing && <button className="result-button" onClick={() => {
        setState({});
        setAttempt(value => value + 1);
      }}>Tentar novamente</button>}
      <Link to="/app">Voltar ao histórico</Link>
    </section>}
    {data && <header className="result-heading">
      <div>
        <span className="result-eyebrow">
          <Icon name="badge" size={11} />
          {data.status === 'completed' ? 'Resultado da análise' : data.status === 'processing' ? 'Em processamento' : 'Análise não concluída'}
        </span>
        <h1>Resultado da análise de políticas</h1>
        <p>Classificação dos trechos e avaliação por categoria, em um só lugar.</p>
      </div>
      {data.status === 'completed' && <div className="document-actions">
        <button className="result-button" disabled={exporting} onClick={() => void exportPdf()}>
          <Icon name="download" size={15} />
          {exporting ? 'Gerando PDF…' : 'Exportar PDF'}
        </button>
        <button className="result-button" onClick={exportResult}>Exportar JSON</button>
      </div>}
    </header>}
    {exportError && <p className="result-error" role="alert">
      {exportError}
    </p>}
    {data && data.status !== 'completed' && <section className="result-panel status-panel">
      <h2>
        {data.original_filename || 'Política de privacidade'}
      </h2>
      {data.status === 'processing' && <p role="status">Análise em processamento. Esta página será atualizada automaticamente. Você também pode voltar pelo histórico.</p>}
      {data.status === 'failed' && <>
        <h2>Não foi possível concluir a análise</h2>
        <p className="result-error" role="alert">
          {data.error.message}
        </p>
        <p>Nenhuma nota foi gerada para esta tentativa.</p>
        <Link to="/app/new">Enviar outra política</Link>
      </>}
      <div className="document-actions">
        <Link to="/app">Voltar ao histórico</Link>
        <button className="result-button" disabled={downloading} onClick={() => void download()}>
          {downloading ? 'Baixando…' : 'Baixar arquivo original'}
        </button>
      </div>
      {downloadError && <p className="result-error" role="alert">
        {downloadError}
      </p>}
    </section>}
    {data?.status === 'completed' && <ResultDashboard analysis={data} query={query} onQuery={setQuery} tab={tab} onTab={setTab} onDownload={() => void download()} downloading={downloading} downloadError={downloadError} />}
  </AnalysisShell>;
}
/** Carrega uma análise, acompanha seu estado e permite baixar documento, JSON e PDF. Retorna o conteúdo da página ou componente. */
export default function AnalysisResult() {
  const { id = '' } = useParams();
  return <AnalysisView key={id} id={id} />;
}
