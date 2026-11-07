/** Recebe documento e escopo e envia uma nova análise ao backend. */
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import AnalysisShell from '../../components/AnalysisShell';
import Icon from '../../components/Icon';
import { api, ApiError } from '../../services/api';
import { assessmentCategories, allCategoryIds, selectionDescription, type AssessmentScope, type CategoryId } from '../../services/assessmentScope';
import type { Analysis, Scope } from '../../services/analyses';
import { Card, UploadForm, UploadField, PageHeading, ContentColumns } from '../../styles/analysisStyles';

/** Recebe documento e escopo e envia uma nova análise ao backend. Retorna o conteúdo da página ou componente. */
export default function NewAnalysis() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const previous = params.get('supersedes');
  const [file, setFile] = useState<File | null>(null);
  const [scope, setScope] = useState<Scope | ''>('');
  const [selectionMode, setSelectionMode] = useState<AssessmentScope['mode']>('all_categories');
  const [categoryIds, setCategoryIds] = useState<CategoryId[]>([...allCategoryIds]);
  const [loadedPrevious, setLoadedPrevious] = useState<string | null>(null);
  const previousReady = previous === null || loadedPrevious === previous;
  const selection: AssessmentScope = {mode: selectionMode, category_ids: selectionMode === 'all_categories' ? [...allCategoryIds] : allCategoryIds.filter(id => categoryIds.includes(id))};
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [uncertain, setUncertain] = useState(false);
  const pending = useRef(false);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);
  useEffect(() => {
    if (!busy) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [busy]);
  useEffect(() => {
    if (!previous) return;
    const controller = new AbortController();
    api<Analysis>('/analyses/' + encodeURIComponent(previous), {signal: controller.signal}).then(data => {
      if (controller.signal.aborted) return;
      const saved = data.assessment_scope ?? {mode: data.profile_id === 'core-14-v1' ? 'selected_categories' : 'all_categories', category_ids: data.profile_id === 'core-14-v1' ? allCategoryIds.slice(0,7) : [...allCategoryIds]} as AssessmentScope;
      setSelectionMode(saved.mode); setCategoryIds(saved.category_ids);
      if (data.status === 'completed') setScope(data.result.document_scope);
      setLoadedPrevious(previous);
    }).catch(() => { if (!controller.signal.aborted) setError('Não foi possível carregar a seleção anterior. Reabra a reanálise pelo histórico.'); });
    return () => controller.abort();
  }, [previous]);
  /** Recebe o envio do formulário, valida os dados e apresenta o resultado ou a falha sem duplicar a requisição. */
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (pending.current || !previousReady) return;
    setError('');
    setUncertain(false);
    if (!selection.category_ids.length) { setError('Selecione pelo menos uma categoria para avaliar.'); return; }
    if (!file || !scope) {
      setError('Selecione um arquivo e informe o escopo.');
      return;
    }
    if (!/\.(pdf|txt)$/i.test(file.name)) {
      setError('Envie um PDF com texto ou um TXT UTF-8.');
      return;
    }
    if (!file.size) {
      setError('O arquivo está vazio.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('O arquivo deve ter no máximo 10 MiB.');
      return;
    }
    pending.current = true;
    setBusy(true);
    const body = new FormData();
    body.append('file', file);
    body.append('language', 'pt');
    body.append('document_scope', scope);
    body.append('assessment_scope', JSON.stringify(selection));
    if (previous) body.append('supersedes_analysis_id', previous);
    try {
      const result = await api<Analysis>('/analyses', { method: 'POST', body }, 240000);
      if (mounted.current) await navigate('/app/analyses/' + result.analysis_id);
    } catch (failure) {
      if (!mounted.current) return;
      if (failure instanceof ApiError && failure.analysisId) {
        await navigate('/app/analyses/' + encodeURIComponent(failure.analysisId));
        return;
      }
      setError(failure instanceof Error ? failure.message : 'Não foi possível enviar a política.');
      setUncertain(failure instanceof ApiError && failure.status === 0);
    } finally {
      pending.current = false;
      if (mounted.current) setBusy(false);
    }
  }
  return <AnalysisShell>
    <PageHeading>
      <div>
        <span className="result-eyebrow">
          <Icon name="plus" size={11} />Nova análise</span>
        <h1>Enviar política de privacidade</h1>
        <p>Selecione um documento em português. O sistema identifica temas e apresenta as evidências encontradas no texto.</p>
      </div>
    </PageHeading>
    <ContentColumns>
      <Card>
        <h2>Documento para análise</h2>
        <UploadForm onSubmit={event => void submit(event)} aria-busy={busy}>
          <fieldset disabled={busy || !previousReady}>
            {previous && <p>Nova avaliação vinculada à <Link to={'/app/analyses/' + encodeURIComponent(previous)}>análise anterior</Link>. Envie o documento que deseja avaliar; o resultado anterior será preservado.</p>}
            <UploadField>
              <Icon name="upload" size={30} />
              <label>Arquivo da política<input type="file" accept=".pdf,.txt" required aria-describedby="file-hint" onChange={event => setFile(event.target.files?.[0] ?? null)} />
              </label>
              <p id="file-hint">PDF com texto ou TXT UTF-8, até 10 MiB.</p>
              {file && <p role="status">
                {file.name} · {(file.size / 1024).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} KiB</p>}
            </UploadField>
            <label>Conteúdo enviado<select required aria-describedby="scope-help" value={scope} onChange={event => setScope(event.target.value as Scope)}>
              <option value="">Selecione uma opção</option>
              <option value="full_document">Política inteira</option>
              <option value="excerpt">Somente um trecho</option>
              <option value="unknown">Não sei se a política está inteira</option>
            </select>
            </label>
            <p id="scope-help">{scope === 'full_document' ? 'Permite média das categorias escolhidas, se a leitura estiver utilizável.' : scope === 'excerpt' ? 'Avalia apenas o trecho enviado; mostra notas locais, sem média global.' : scope === 'unknown' ? 'Mostra notas locais, sem média global, pois a integridade foi declarada como desconhecida.' : 'Informe se o documento está completo. Essa escolha é independente das categorias.'}</p>
            <label>Categorias a avaliar<select value={selectionMode} onChange={event => { setSelectionMode(event.target.value as AssessmentScope['mode']); setError(''); }}>
              <option value="all_categories">Todas as categorias com nota</option>
              <option value="selected_categories">Escolher categorias</option>
            </select></label>
            {selectionMode === 'selected_categories' && <fieldset className="category-selection">
              <legend>Marque as categorias que deseja avaliar</legend>
              <div className="selection-actions">
                <button type="button" className="result-button" onClick={() => { setCategoryIds([...allCategoryIds]); setError(''); }}>Selecionar todas</button>
                <button type="button" className="result-button" onClick={() => { setCategoryIds([]); setError(''); }}>Limpar seleção</button>
              </div>
              {assessmentCategories.map(([id,title]) => <label key={id}><input type="checkbox" checked={categoryIds.includes(id)}
                onChange={event => { setCategoryIds(ids => event.target.checked ? [...ids,id] : ids.filter(value => value !== id)); setError(''); }} />{title}</label>)}
              <small>Outros temas ficam disponíveis no arquivo e no JSON, sem nota.</small>
            </fieldset>}
            <p className="workspace-notice" aria-label="Resumo da seleção">{selectionDescription(selection)} A média, os gráficos e as orientações consideram apenas esses temas. Conjuntos diferentes não devem ser comparados como uma mesma avaliação.</p>
          </fieldset>
          {!previousReady && !error && <p role="status">Carregando seleção da análise anterior…</p>}
          <p>
            <small>Trechos e documentos incompletos recebem uma análise parcial, sem nota global.</small>
          </p>
          {error && <p className="workspace-error" role="alert">
            {error}
          </p>}
          {uncertain && <p className="workspace-notice">O envio pode ter sido recebido. <Link to="/app">Consulte o histórico</Link> antes de enviar novamente.</p>}
          {busy && <p className="workspace-notice" role="status">Analisando a política… Isso pode levar alguns minutos. Aguarde sem reenviar. Se sair desta tela, consulte depois o histórico.</p>}
          <button className="result-button primary" type="submit" disabled={busy || !previousReady}>
            <Icon name="scan" size={15} />
            {busy ? 'Analisando…' : 'Analisar política'}
          </button>
        </UploadForm>
      </Card>
      <aside className="result-panel">
        <h2>Antes de enviar</h2>
        <p>Use um documento em português, com até 50 páginas e 100 mil caracteres.</p>
        <h2>O PDF precisa conter texto</h2>
        <p>Documentos digitalizados apenas como imagem precisam de reconhecimento de texto (OCR) e não são suportados.</p>
        <h2>Política inteira ou trecho?</h2>
        <p>Essa informação determina se o sistema pode calcular a nota média da política. Se não tiver certeza, escolha a opção correspondente.</p>
        <div className="workspace-notice">O resultado apoia a leitura. Não é uma certificação de conformidade com a LGPD.</div>
      </aside>
    </ContentColumns>
  </AnalysisShell>;
}
