import { Link } from 'react-router';
import AnalysisShell from '../../components/AnalysisShell';
import Icon from '../../components/Icon';

export default function DashboardEntry() {
  return <AnalysisShell>
    <header className="result-heading"><div>
      <span className="result-eyebrow"><Icon name="grid" size={11} />Indicadores e evidências</span>
      <h1>Dashboard analítico</h1>
      <p>Explore as notas, os trechos e as recomendações de uma política.</p>
    </div></header>
    <section className="result-panel dashboard-entry" aria-labelledby="dashboard-entry-title">
      <span className="dashboard-entry-icon"><Icon name="grid" size={30} /></span>
      <div className="dashboard-entry-copy">
        <span className="dashboard-entry-status">Nenhuma análise selecionada</span>
        <h2 id="dashboard-entry-title">Qual política você quer explorar?</h2>
        <p>Selecione uma análise em seu histórico para abrir o dashboard daquele documento. Se ainda não enviou uma política, comece uma nova análise.</p>
        <div className="document-actions">
          <Link className="result-button primary" to="/app"><Icon name="history" size={15} />Selecionar uma análise</Link>
          <Link className="result-button" to="/app/new"><Icon name="plus" size={15} />Enviar nova política</Link>
        </div>
      </div>
      <p className="dashboard-entry-note">Cada dashboard apresenta os resultados de uma única política.</p>
    </section>
  </AnalysisShell>;
}
