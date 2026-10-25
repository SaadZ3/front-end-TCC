import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import Icon from '../../components/Icon';
import AnalysisShell from '../../components/AnalysisShell';
import { useAuth } from '../../auth/auth-context';
import { api } from '../../services/api';
import { date, statusNames, type History } from '../../services/analyses';
import { Card, Row, Badge, HistoryList, PageHeading, EmptyState, DeleteDialog } from '../../styles/analysisStyles';

export default function PrivateArea() {
  const { session } = useAuth();
  const [params, setParams] = useSearchParams();
  const page = Math.max(1, Math.min(100000, Math.floor(Number(params.get('page'))) || 1));
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<{ key: string; data?: History; error?: string }>({ key: '' });
  const [selected, setSelected] = useState<History['items'][number] | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [notice, setNotice] = useState('');
  const dialog = useRef<HTMLDialogElement>(null);
  const key = page + ':' + attempt;
  useEffect(() => {
    const controller = new AbortController();
    api<History>('/analyses?page=' + page + '&page_size=10', { signal: controller.signal })
      .then(data => setState({ key, data }))
      .catch(error => { if (!controller.signal.aborted) setState({ key, error: error.message }); });
    return () => controller.abort();
  }, [page, key]);
  const current = state.key === key ? state : undefined;
  async function removeSelected() {
    if (!selected || deleting) return;
    setDeleting(true); setDeleteError(''); setNotice('');
    try {
      await api<void>('/analyses/' + encodeURIComponent(selected.analysis_id), { method: 'DELETE' });
      dialog.current?.close(); setSelected(null);
      setNotice('Análise excluída do histórico.');
      if (page > 1 && current?.data?.items.length === 1) setParams({ page: String(page - 1) });
      setAttempt(value => value + 1);
    } catch (error) { setDeleteError(error instanceof Error ? error.message : 'Não foi possível excluir.'); }
    finally { setDeleting(false); }
  }
  return <AnalysisShell>
    <PageHeading>
      <div><span className="result-eyebrow"><Icon name="history" size={11} />Documentos salvos</span><h1>Minhas análises</h1><p>Olá, {session?.user.name}. Retome suas leituras e acompanhe cada documento.</p></div>
      <Link className="result-button primary" to="/app/new"><Icon name="plus" size={15} />Nova análise</Link>
    </PageHeading>
    <Card aria-labelledby="history-title">
      <Row><div><h2 id="history-title">Histórico de análises</h2><p><small>Abra um documento para consultar seu dashboard ou acompanhar o processamento.</small></p></div><button className="result-button" onClick={() => setAttempt(value => value + 1)}><Icon name="history" size={15} />Atualizar histórico</button></Row>
      {notice && <p className="workspace-notice" role="status">{notice}</p>}
      {!current && <p role="status">Carregando histórico…</p>}
      {current?.error && <p className="workspace-error" role="alert">{current.error}</p>}
      {current?.data && <>
        {current.data.items.length === 0 ? <EmptyState><Icon name="document" size={40} /><h3>{page === 1 ? 'Sua primeira análise começa aqui' : 'Nenhuma análise nesta página'}</h3><p>{page === 1 ? 'Você ainda não enviou nenhuma política. Escolha um documento para explorar seus temas e evidências.' : 'Volte à página anterior para consultar seus documentos.'}</p><Link to="/app/new">Enviar uma política</Link></EmptyState> :
          <HistoryList>{current.data.items.map(item => <li key={item.analysis_id}><Row>
            <div className="file-info"><Icon name="document" size={22} /><div><Link to={'/app/analyses/' + item.analysis_id}>{item.original_filename}</Link><p><small>{date(item.created_at)}</small></p></div></div>
            <Row><Badge $status={item.status}>{statusNames[item.status]}</Badge>
              <button className="result-button" disabled={item.status === 'processing'} aria-label={'Excluir análise ' + item.original_filename}
                title={item.status === 'processing' ? 'Aguarde o processamento terminar para excluir.' : undefined}
                onClick={() => { setSelected(item); setDeleteError(''); dialog.current?.showModal(); }}>Excluir</button>
            </Row>
          </Row></li>)}</HistoryList>}
        <Row><small>{current.data.total} análise(s) · Página {page}</small>
          <div><button className="result-button" disabled={page <= 1} onClick={() => setParams({ page: String(page - 1) })}>Anterior</button>{' '}
            <button className="result-button" disabled={page * 10 >= current.data.total} onClick={() => setParams({ page: String(page + 1) })}>Próxima</button></div>
        </Row>
      </>}
    </Card>
    <DeleteDialog ref={dialog} aria-labelledby="delete-title" aria-describedby="delete-description" onCancel={event => { if (deleting) event.preventDefault(); }}>
      <h2 id="delete-title">Excluir análise?</h2>
      <p id="delete-description">O resultado e o arquivo de <strong>{selected?.original_filename}</strong> serão excluídos. Esta ação não pode ser desfeita. Reanálises desse documento serão mantidas.</p>
      {deleteError && <p className="workspace-error" role="alert">{deleteError}</p>}
      <Row><button className="result-button" autoFocus disabled={deleting} onClick={() => dialog.current?.close()}>Cancelar</button>
        <button className="result-button danger" disabled={deleting} onClick={() => void removeSelected()}>{deleting ? 'Excluindo…' : 'Excluir análise'}</button></Row>
    </DeleteDialog>
  </AnalysisShell>;
}
