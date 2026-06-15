# Prototipo de Navegação — SIMGEC

## Objetivo
Fornecer um fluxo claro, responsivo e consistente entre Web e mobile, com foco na experiência de gestores educacionais.

---

## Estrutura de navegação principal

### 1. Menu lateral principal
- Dashboard
- Escolas
- Alunos
- Matrículas
- Relatórios
- Configurações

### 2. Estado ativo
- Cada item ativo ganha fundo claro `rgba(30, 136, 229, 0.12)`
- Texto em `#1E88E5`
- Bordas arredondadas para melhorar a leitura

### 3. Cabeçalho superior
- Ícones de notificação e perfil à direita
- Título da página e subtítulo do município
- Ações importantes com botões primários e secundários

### 4. Mobile / Tablet
- Drawer lateral deslizante
- Acesso rápido por hambúrguer no topo
- Cards empilhados para visualização em telas pequenas

---

## Fluxo de navegação sugerido

1. **Dashboard**
   - Visão geral de métricas
   - Gráficos de desempenho
   - Alertas principais
2. **Escolas**
   - Lista de unidades
   - Filtros por estado e turno
   - Acesso a dados da instituição
3. **Alunos**
   - Busca rápida por nome ou código
   - Situação de matrícula e histórico
4. **Matrículas**
   - Processamento de solicitações
   - Aprovações e pendências
5. **Relatórios**
   - Geração de relatórios gerenciais
   - Exportação em PDF/Excel
6. **Configurações**
   - Acesso de usuários
   - Preferências da escola

---

## Componentes de navegação

### Barra lateral
- Altura total da tela
- Seções agrupadas
- Rodapé opcional com ajuda e logout

### Topbar
- Logo e texto à esquerda
- Ações rápidas no canto direito
- Botão de ajuda ou modo de exibição

### Breadcrumbs
- Exibir caminho atual em páginas internas
- Exemplo: Dashboard > Escolas > Relatório mensal

### Painéis flutuantes
- Painéis com bordas arredondadas e sombra leve
- Entram com transições suaves
- Garantem foco na informação sem poluir a UI

---

## Regras de design de navegação

- Use `#1E88E5` em itens selecionados e indicadores importantes
- Use `#43A047` para ações de sucesso e confirmações
- Use `#FB8C00` para alertas, avisos e filas de aprovação
- Mantenha o fundo `#F5F7FA` como base para evitar cansaço visual
- Preserve espaçamento amplo entre elementos

---

## Exemplo de interação mobile

- O menu lateral fica oculto por padrão
- A topbar exibe um botão 'menu' no canto esquerdo
- Tocar no item abre a página sem recarregamento completo
- A navegação deve responder com animações sutis
