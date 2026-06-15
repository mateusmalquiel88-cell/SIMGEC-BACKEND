# SIMGEC — Wireframe e Guia Visual

## Paleta de Cores

- **Cor Principal**: `#1E88E5`
  - Confiança
  - Tecnologia
  - Educação
- **Cor Secundária**: `#43A047`
  - Crescimento
  - Aprovação
  - Desenvolvimento
- **Cor de Destaque**: `#FB8C00`
  - Atenção
  - Alertas
  - Notificações
- **Fundo**: `#F5F7FA`
  - Muito leve
  - Agradável aos olhos

---

## Tela Principal — Layout

### 1. Cabeçalho principal

- Fundo branco com leve sombra e borda arredondada
- Texto principal:
  - `SIMGEC - Município do Cubal`
  - `Gestão Integrada da Educação`
- Painel de ações à direita:
  - Ícone de notificações `🔔`
  - Avatar/perfil `👤`
  - Botão secundário de ajuda ou status

```
┌───────────────────────────────────────────────┐
│ SIMGEC - Município do Cubal                   │
│ Gestão Integrada da Educação                  │
│                               🔔 👤           │
└───────────────────────────────────────────────┘
```

### 2. Seção de resumo de desempenho

- 3 ou 4 cards principais em linha:
  - Alunos ativos
  - Escolas conectadas
  - Turmas com avaliação concluída
  - Tarefas pendentes ou aprovações
- Cartões com bordas arredondadas, sombra suave, e cores leves nos ícones

### 3. Painel de indicadores gráficos

- Gráfico de tendência: presença, desempenho ou engajamento
- Gráfico de barras: comparação entre escolas ou turmas
- Gráfico de pizza leve: porcentagem de aprovação

### 4. Cards de ação rápida

- Importar dados
- Relatórios
- Validar matrícula
- Receber avisos

### 5. Lista de tarefas e alertas

- Painel com notificações importantes
- Indicadores em `#FB8C00` para alertas e ações urgentes
- Botões de ação imediata com `#43A047` para concluir ou confirmar

### 6. Painel lateral / menu de navegação

- Ícones e texto com foco em:
  - Dashboard
  - Escolas
  - Alunos
  - Matrículas
  - Relatórios
  - Configurações
- Menu com estilo minimalista e espaço generoso

---

## Estilo visual

### Tipografia

- Fonte recomendada: `Inter`, `Roboto`, ou equivalente
- Peso:
  - Títulos: `600`
  - Subtítulos: `500`
  - Texto: `400`
- Linhas claras, espaçamento confortável e boa hierarquia visual

### Componentes

- `Card`:
  - Fundo: `#FFFFFF`
  - Borda: `none` ou `1px solid rgba(34, 43, 69, 0.08)`
  - Border-radius: `20px`
  - Sombra: `0 18px 30px rgba(15, 23, 42, 0.08)`
- Botões:
  - Primário: `#1E88E5`
  - Secundário: `#43A047`
  - Destaque/alerta: `#FB8C00`
- Inputs e painéis:
  - Fundo: `#F5F7FA`
  - Contorno: `rgba(34, 43, 69, 0.12)`
  - Focus: `#1E88E5`

### Ícones

- Uso de ícones suaves e arredondados
- Ícones de status com cores suaves e contornos finos
- Preferência por pictogramas claros para gestão educacional

---

## Proposta de UI Web / Flutter

### Exemplo de CSS base

```css
:root {
  --primary: #1E88E5;
  --secondary: #43A047;
  --accent: #FB8C00;
  --background: #F5F7FA;
  --surface: #FFFFFF;
  --text: #1E293B;
  --muted: #64748B;
}

body {
  margin: 0;
  font-family: 'Inter', sans-serif;
  background: var(--background);
  color: var(--text);
}

.header-card,
.metric-card,
.quick-action-card,
.alert-card {
  background: var(--surface);
  border-radius: 24px;
  box-shadow: 0 18px 30px rgba(15, 23, 42, 0.08);
}

.button-primary {
  background: var(--primary);
  color: white;
  border-radius: 16px;
  padding: 12px 20px;
}

.button-secondary {
  background: var(--secondary);
  color: white;
  border-radius: 16px;
  padding: 12px 20px;
}

.button-alert {
  background: var(--accent);
  color: white;
  border-radius: 16px;
  padding: 12px 20px;
}
```

### Exemplo de tema Flutter

```dart
final ThemeData simgecTheme = ThemeData(
  brightness: Brightness.light,
  primaryColor: Color(0xFF1E88E5),
  scaffoldBackgroundColor: Color(0xFFF5F7FA),
  colorScheme: ColorScheme.light(
    primary: Color(0xFF1E88E5),
    secondary: Color(0xFF43A047),
    tertiary: Color(0xFFFB8C00),
    background: Color(0xFFF5F7FA),
    surface: Colors.white,
  ),
  cardTheme: CardTheme(
    color: Colors.white,
    elevation: 4,
    shape: RoundedRectangleBorder(
      borderRadius: BorderRadius.circular(20),
    ),
  ),
  appBarTheme: AppBarTheme(
    backgroundColor: Colors.white,
    elevation: 0,
    iconTheme: IconThemeData(color: Color(0xFF1E88E5)),
    titleTextStyle: TextStyle(
      color: Colors.black87,
      fontSize: 20,
      fontWeight: FontWeight.w600,
    ),
  ),
  elevatedButtonTheme: ElevatedButtonThemeData(
    style: ElevatedButton.styleFrom(
      backgroundColor: Color(0xFF1E88E5),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      elevation: 0,
    ),
  ),
);
```

---

## Wireframe principal sugerido

### Área 1 — Topo
- Logo e nome da plataforma
- Subtítulo com gestor e município
- Botões de notificação e perfil

### Área 2 — Estatísticas rápidas
- Card 1: Total de alunos
- Card 2: Escolas ativas
- Card 3: Matrículas pendentes
- Card 4: Nível média de desempenho

### Área 3 — Gráficos
- Gráfico de linha: evolução geral
- Gráfico de barras: comparativo por escola
- Cartão de resumo de aprovação e presença

### Área 4 — Ações rápidas
- Botões de importação
- Gerar relatório
- Validar documentos
- Confirmar agenda

### Área 5 — Notificações e workflow
- Avisos de prazos
- Alertas de pendências
- Links rápidos para corregedores

---

## Recomendações de implementação

- Use espaçamento generoso entre cards e seções
- Priorize um visual limpo com fundo claro
- Evite excesso de cor: azul para foco, verde para sucesso, laranja apenas para destaque
- Adapte o layout para mobile com cards empilhados e navegação simplificada
- Mantenha a experiência consistente entre web e Flutter
