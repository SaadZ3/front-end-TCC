/** Apresenta o rodapé das páginas públicas. */
import { FooterContainer, FooterContent } from './styles';
/** Apresenta o rodapé das páginas públicas. Retorna o conteúdo da página ou componente. */
export default function Footer() {
  return <FooterContainer>
    <FooterContent>
      <span>Políticas TCC · Ciência da Computação, UNIP</span>
      <span>Ferramenta de pesquisa e apoio à leitura</span>
      <a href="/#sobre">Sobre o projeto</a>
    </FooterContent>
  </FooterContainer>;
}
