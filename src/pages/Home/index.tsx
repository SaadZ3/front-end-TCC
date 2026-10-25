import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../../auth/auth-context';
import Icon from '../../components/Icon';
import { LandingPage } from './styles';

const readingExamples = [
  { name: 'Coleta de dados', icon: 'document' as const, title: 'Quais dados são coletados?', text: 'Coletamos seu nome e endereço de e-mail para criar e manter sua conta.', explanation: 'Este trecho informa quais dados são coletados e para que são usados.' },
  { name: 'Compartilhamento', icon: 'files' as const, title: 'Com quem os dados são compartilhados?', text: 'Compartilhamos seu endereço com a transportadora responsável pela entrega do pedido.', explanation: 'Este trecho identifica com quem os dados são compartilhados e a finalidade dessa prática.' },
  { name: 'Seus direitos', icon: 'user' as const, title: 'Como solicitar a exclusão?', text: 'Você pode solicitar a exclusão dos seus dados pelo e-mail privacidade@exemplo.com.', explanation: 'Este trecho apresenta uma forma de solicitar a exclusão dos dados e um canal de contato.' },
];

export default function Home() {
  const navigate = useNavigate();
  const { session, loading } = useAuth();
  const [selected, setSelected] = useState(0);
  const example = readingExamples[selected];

  return <LandingPage>
    <a className="skip-link" href="#conteudo">Pular para o conteúdo</a>
    <header className="landing-header container">
      <Link className="brand" to="/" aria-label="Políticas TCC — início"><span className="brand-icon"><Icon name="document" size={23} /></span>Políticas<span className="brand-note">TCC</span></Link>
      <nav aria-label="Navegação principal"><a href="#como-funciona">Como funciona</a><a href="#recursos">Recursos</a><a href="#sobre">O projeto</a></nav>
      <button className="account-button" disabled={loading} onClick={() => void navigate(session ? '/app' : '/login')}>{session ? 'Minha área' : 'Entrar'}<Icon name="user" size={17} /></button>
    </header>
    <main id="conteudo">
      <section className="hero container" aria-labelledby="home-title">
        <div className="hero-copy">
          <span className="project-label"><Icon name="search" size={16} />Tecnologia a serviço da leitura</span>
          <h1 id="home-title">Entenda melhor uma política de privacidade.</h1>
          <p>Descubra como o documento aborda o uso dos seus dados. Explore os temas e confira os trechos que sustentam cada resultado.</p>
          <div className="hero-actions"><button className="primary-action" onClick={() => void navigate('/app/new')}>Analisar uma política<Icon name="arrow" size={18} /></button><a href="#como-funciona">Como funciona</a></div>
          <div className="format-note"><Icon name="files" size={17} /><span>PDF ou TXT em português, até 10 MiB</span></div>
        </div>
        <section className="demo" id="demonstracao" aria-label="Demonstração interativa de leitura">
          <header className="demo-header"><span className="icon-tile"><Icon name="scan" size={22} /></span><div><h2>Do tema à evidência</h2><p>Escolha um tema e veja um exemplo.</p></div></header>
          <div className="topic-buttons">{readingExamples.map((item, index) => <button key={item.name} aria-pressed={selected === index} aria-controls="example-result" onClick={() => setSelected(index)}>{item.name}</button>)}</div>
          <div id="example-result" className="example-result" aria-live="polite" aria-atomic="true">
            <div className="document-label"><Icon name="document" size={16} /><span>Trecho da política</span></div>
            <blockquote><mark>{example.text}</mark></blockquote>
            <div className="insight"><Icon name="check" size={18} /><div><h3>{example.title}</h3><p>{example.explanation}</p></div></div>
          </div>
          <footer><span className="example-tag">Exemplo ilustrativo</span><p>Na sua análise, as evidências vêm do documento enviado.</p></footer>
        </section>
      </section>
      <section className="process container" id="como-funciona">
        <div className="section-heading"><h2>Uma análise em três passos</h2><p>Você envia o documento. A ferramenta ajuda a organizar a leitura.</p></div>
        <ol className="steps"><li><span className="step-number">1</span><div><h3>Envie sua política</h3><p>Escolha um PDF com texto ou TXT e informe se é o documento inteiro ou apenas um trecho.</p></div></li><li><span className="step-number">2</span><div><h3>Explore os resultados</h3><p>Consulte os indicadores e filtre os trechos pelos temas que deseja investigar.</p></div></li><li><span className="step-number">3</span><div><h3>Confira no texto</h3><p>Leia as evidências, interprete o contexto e exporte a análise para consultar depois.</p></div></li></ol>
      </section>
      <section className="resources" id="recursos"><div className="container">
        <div className="section-heading"><h2>Mais clareza para acompanhar cada documento</h2><p>Recursos que conectam a visão geral aos detalhes da política.</p></div>
        <div className="feature-grid">
          <article><span className="icon-tile"><Icon name="chart" size={25} /></span><h3>Dashboard analítico</h3><p>Veja a cobertura e o detalhamento do texto, explore as notas por categoria e encontre os trechos relacionados.</p><div className="feature-detail"><Icon name="search" size={15} />Gráficos, categorias e evidências</div></article>
          <article><span className="icon-tile"><Icon name="history" size={25} /></span><h3>Suas análises organizadas</h3><p>Retome resultados pelo histórico e avalie novas versões de uma política, mantendo a análise anterior disponível.</p><Link className="feature-detail" to="/app">Acessar minhas análises<Icon name="arrow" size={15} /></Link></article>
          <article><span className="icon-tile"><Icon name="download" size={25} /></span><h3>Resultados para consultar</h3><p>Exporte o relatório em PDF ou os dados em JSON. O arquivo original também fica disponível para download.</p><div className="format-tags"><span>PDF</span><span>JSON</span><span>Arquivo original</span></div></article>
        </div>
      </div></section>
      <section className="about-and-questions container">
        <article className="about" id="sobre"><span className="project-label"><Icon name="document" size={16} />Sobre o projeto</span><h2>Uma ferramenta de pesquisa para ler com mais atenção.</h2><p>Desenvolvido como Trabalho de Conclusão de Curso em Ciência da Computação na UNIP, o Políticas TCC aplica classificação de texto à leitura de políticas de privacidade em português.</p><p>A proposta é facilitar o acesso às informações do documento e apresentar evidências que você pode conferir.</p><aside className="research-note"><Icon name="search" size={22} /><div><h3>A interpretação continua com você</h3><p>O índice descreve o conteúdo encontrado. Não certifica conformidade com a LGPD nem substitui revisão humana.</p></div></aside></article>
        <section className="questions" id="duvidas" aria-labelledby="questions-title"><h2 id="questions-title">Antes de começar</h2><p>Respostas para preparar sua primeira análise.</p>
          <details><summary>Que tipo de documento posso analisar?<Icon name="plus" size={18} /></summary><p>Uma política de privacidade em português, em PDF com texto selecionável ou TXT em UTF-8. O limite é de 10 MiB, 50 páginas e 100 mil caracteres. PDFs digitalizados apenas como imagem não são suportados.</p></details>
          <details><summary>Posso enviar somente um trecho?<Icon name="plus" size={18} /></summary><p>Sim. Selecione “Somente um trecho” no envio. Documentos incompletos recebem uma análise parcial, sem nota global. Se não souber se a política está inteira, há uma opção para indicar isso.</p></details>
          <details><summary>O que a nota da análise significa?<Icon name="plus" size={18} /></summary><p>O índice indica a cobertura e o detalhamento encontrados no texto. Consulte os critérios e as evidências para interpretá-lo. A nota não comprova conformidade com a Lei Geral de Proteção de Dados (LGPD).</p></details>
          <details><summary>Preciso criar uma conta?<Icon name="plus" size={18} /></summary><p>Sim. Sua conta permite enviar documentos, acompanhar o processamento e retomar os resultados pelo histórico.</p></details>
        </section>
      </section>
      <section className="closing container"><div><h2>Pronto para explorar sua política?</h2><p>Comece com um documento e descubra o que ele informa.</p></div><Link className="primary-action" to="/app/new">Começar uma análise<Icon name="arrow" size={18} /></Link></section>
    </main>
    <footer className="landing-footer container"><Link className="brand" to="/" aria-label="Políticas TCC — início"><Icon name="document" size={21} />Políticas<span className="brand-note">TCC</span></Link><p>Ciência da Computação · UNIP</p><a href="#sobre">Pesquisa e apoio à leitura</a></footer>
  </LandingPage>;
}
