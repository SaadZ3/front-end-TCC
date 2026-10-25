# Direção visual

## Área interna — unificação de 19/10/2026

Esta direção substitui os padrões anteriores das telas internas. Envio, histórico,
entrada do dashboard e resultado compartilham `AnalysisShell` e `workspaceStyles`.

- Branco #FFFFFF, fundo #F6F8FA, texto #0B1F3A, secundário #657D9B,
  verde #13795B e divisórias #E8EEF5; a paleta vem do dashboard aprovado.
- Segoe UI, título de página de 23 px, títulos de painel de 14 px e controles
  compactos. Barra lateral de 226 px, cabeçalho de 65 px e conteúdo de até 1040 px.
- Mesma marca, menu, conta e navegação móvel em todas as telas. A busca superior
  aparece no resultado; nas demais telas, o cabeçalho identifica a página atual.
- Histórico mantém documentos, estados, paginação e exclusão. Envio mantém
  formulário e instruções laterais, agora com os mesmos painéis e botões.
- `/app/dashboard` sem seleção mostra uma orientação com ações para selecionar
  uma análise no histórico ou enviar uma política. Não carrega o histórico, nem
  apresenta indicadores sem documento. O resultado individual mantém sua rota.

```text
menu comum | cabeçalho comum: contexto ou busca / conta
           | título + ação
           | envio: formulário / instruções
           | histórico: documentos / estados / exclusão
           | dashboard sem seleção: orientação / selecionar ou enviar
           | resultado: indicadores / trechos / recomendações
```

Revisão: adotar o dashboard como referência evita criar outra identidade visual.
O estado sem seleção precisa orientar uma ação; repetir a lista do histórico
deixava duas opções do menu com a mesma função.

## Landing page — direção aprovada no pedido de 18/10/2026

Esta direção substitui as propostas anteriores da landing page: verde, elementos simples e apresentação adequada a um TCC.

- Cores: verde #236751, verde escuro #194A3A, texto #24352F, texto secundário #5D6D65, fundo suave #EFF6F1 e papel #FFFFFF.
- Segoe UI em toda a página. Título principal de até 54 px, títulos de seção de até 32 px, texto de 14–17 px. Sem títulos editoriais em serifas.
- Abertura alinhada à esquerda com explicação direta e uma demonstração compacta à direita. Botões de temas mostram uma única evidência e sua explicação, sem reproduzir um painel completo.
- Processo em três passos, três recursos apresentados com ícones, contexto acadêmico com limites explícitos, perguntas frequentes e convite final em verde suave.
- Bordas suaves, sombras apenas na demonstração e espaçamento consistente. A cor sinaliza ações e evidências. Não acrescentar efeitos automáticos, métricas ilustrativas ou dependências.

```text
marca                         como funciona / recursos / projeto / entrar
explicação + iniciar           exemplo interativo compacto
enviar                 explorar                 conferir
dashboard              histórico                exportação
projeto e limites              perguntas frequentes
convite para analisar                                  ação
```

Revisão: reduzir o peso visual da versão editorial e a densidade da demonstração. O destaque deve ser a relação entre tema e evidência. Manter os recursos existentes e preservar todas as telas internas.

## Landing page — nova proposta de 12/10/2026

Substitui a direção anterior somente na página inicial. Conceito: uma mesa de leitura digital, com o documento como ponto de encontro entre temas e evidências.

- Paleta: azul tinta #17314C, azul ação #2855A0, papel #FFFFFF, fundo azul claro #EDF3F9, texto secundário #52677B e marcação #FFF0AE.
- Tipografia: Georgia nos títulos principais, com peso normal e escala de 38–76 px; Segoe UI na navegação, no texto e nos controles. A combinação remete à leitura de documentos, sem fontes externas.
- Estrutura: abertura centralizada e ampla, demonstração horizontal interativa abaixo, faixa azul escura com o processo, recursos em duas áreas assimétricas, perguntas e contexto acadêmico, fechamento com acesso ao sistema.
- A demonstração permite escolher três temas e acompanhar a marcação e sua explicação. Todos os dados são explicitamente ilustrativos; não há notas nem contagens inventadas.

```text
marca                         demonstração / recursos / projeto / entrar
                    título editorial amplo
                    descrição e ação
         temas | documento com marcação | explicação
processo         envio / exploração / conferência
histórico com versões           relatório e exportação
perguntas frequentes            pesquisa e limites
convite final                   acesso
```

Revisão da proposta: trocar a abertura dividida em texto e cartão por uma composição central com demonstração de largura inteira. O contraste vem da tipografia e das áreas de leitura, sem gradientes, animações automáticas ou uma sequência de cartões iguais. Cabeçalho e rodapé locais evitam alterar as telas internas.

## Evolução de 12/10/2026

- Manter a identidade acadêmica: papel #FFFFFF, fundo #F5F7F6, texto #24352F, texto secundário #5D6D65, ação #236751 e divisórias #DCE3DF.
- Segoe UI nos controles e títulos; Georgia somente no exemplo de documento. Títulos mais expressivos na landing page, leitura alinhada à esquerda e espaçamento maior entre assuntos.
- Landing page: apresentação com documento anotado, formatos aceitos, recursos atuais, processo, leitura crítica, perguntas frequentes, contexto acadêmico e ação final. A seção verde escura destaca o papel das evidências, sem métricas fictícias.
- Área interna: mesmo conjunto de quatro opções em envio, histórico e resultado. O dashboard é por documento; fora de um resultado, a opção abre uma seleção de análises. Configurações mantém a consulta dos dados da conta, sem sugerir edição que a API não oferece.
- Evolução discreta de formulários, envio, histórico e autenticação. Preservar o conteúdo, os gráficos e os estilos do dashboard analítico; somente sua navegação é compartilhada.

```text
marca                         recursos / processo / projeto / entrar
apresentação e ação            documento anotado
formatos e idioma
dashboard                     evidências / histórico / exportação
envio                  exploração                  conferência
leitura crítica               temas / detalhamento / limites
perguntas                     respostas expansíveis
projeto                       contexto acadêmico
ação final
```

Revisão: usar o documento anotado como elemento central, sem ilustrações genéricas ou cartões repetidos para todos os assuntos. Preservar o verde existente e fontes locais. No celular, as quatro opções da área de trabalho se organizam em duas colunas; o resultado mantém seu menu móvel atual.

## Tela de resultado — referência de 10/10/2026

A tela de resultado segue as duas imagens fornecidas pelo usuário. A referência define os cartões, a densidade e o verde; essas escolhas prevalecem sobre a direção anterior desta página.

- Fundo #F6F8FA; superfície #FFFFFF; texto #0B1F3A; texto secundário #657D9B; verde #13795B; divisórias #E8EEF5.
- Segoe UI, já disponível no projeto. Título 23 px; indicadores 30 px; títulos de painel 14 px; conteúdo 12 px.
- Menu lateral de 226 px, barra superior de 65 px e conteúdo central de até 1040 px. Cartões com bordas suaves e sombra discreta, iguais à referência.

```text
marca / menu | busca                                      conta
             | título                         exportar resultado
             | aviso / abas
             | documento / versão
             | nota                 trechos             categorias
             | barras por categoria     gráfico de radar
             | busca + filtros / tabela de trechos / paginação
             | legenda / limites / acesso ao relatório detalhado
```

Revisão contra a referência: manter o painel compacto, o mesmo alinhamento entre seções e o radar de linhas finas. Não copiar resultados fictícios. O resumo usa a nota global real e a tabela identifica a nota da categoria relacionada ao trecho; a API não fornece nota individual por trecho. Valores nulos não viram zero. Preservar evidências, recomendações, download e reanálise no relatório detalhado e na aba Documentos.

Políticas TCC é um ambiente de leitura e investigação de políticas de privacidade. Deve parecer uma ferramenta acadêmica bem cuidada, com controles familiares e evidências fáceis de conferir.

## Sistema
- Papel: #FFFFFF. Fundo: #F4F6F5. Texto: #24352F.
- Texto secundário: #5D6D65. Ação: #236751. Divisória: #DCE3DF.
- Segoe UI, com alternativas nativas, para uma interface familiar sem fontes externas. Georgia diferencia citações do documento dos controles.
- Escala: 12, 14, 16, 20, 24, 32 e 48 px. Alinhamento à esquerda; leitura em aproximadamente 75 caracteres.

## Estrutura
Início: apresentação e ação ao lado de um documento anotado, explicitamente ilustrativo. Processo em três passos e contexto acadêmico.

    marca                        navegação / acesso
    apresentação + ação          documento anotado
    envio              análise              evidências
    contexto acadêmico           limites da ferramenta

Área interna: navegação persistente, cabeçalho e conteúdo de largura controlada. No celular a navegação fica acima do conteúdo, sem menu oculto.

    marca      | contexto da página
    nova       | título + ação
    histórico  | formulário / histórico / resultado
    conta      | evidências e trechos

## Revisão da proposta
Evitar métricas decorativas e cartões idênticos: histórico como lista de arquivos, envio como formulário com instruções laterais e resultado como relatório. O elemento característico é o texto anotado, coerente com a atividade do projeto. Sem gradientes ou efeitos de entrada. Preservar nome, contratos da API, limitações do índice e estados de falha/parcialidade.
Foco visível, links identificáveis, navegação por teclado, contraste e adaptação móvel fazem parte do sistema. Cores de estado sempre acompanham texto.

## Resultado E2

Manter papel #FFFFFF, fundo #F4F6F5, texto #24352F, ação #236751 e divisória #DCE3DF; usar #FFF0B8 para marcar a evidência dentro do documento. Segoe UI para controles e números; Georgia apenas no texto citado. Não acrescentar fontes ou dependências.

    resumo da análise              cobertura / detalhe / revisão
    barras por critério, escala fixa 0–100
    filtros + tabela de notas, pesos e contribuições
    explicação do critério selecionado
    sinais contextuais
    navegador do documento com evidência marcada e retorno à origem

Revisão da proposta: a nota serve de entrada, mas o elemento principal é a ligação entre gráfico, linha do relatório e texto destacado. Barras em uma cor, sem faixas de risco; não usar pizza com categorias multi-label. A tabela é a alternativa acessível ao gráfico. No celular, filtros e linhas se reorganizam sem esconder campos nem exigir rolagem horizontal da página. Ausência de valores históricos aparece como informação não registrada, nunca como zero.
