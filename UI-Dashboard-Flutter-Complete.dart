import 'package:flutter/material.dart';

void main() {
  runApp(const SimgecApp());
}

class SimgecApp extends StatelessWidget {
  const SimgecApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'SIMGEC',
      theme: simgecTheme,
      initialRoute: '/',
      routes: {
        '/': (context) => const DashboardPage(),
        '/escolas': (context) => const EscolasPage(),
        '/alunos': (context) => const AlunosPage(),
        '/matriculas': (context) => const MatriculasPage(),
        '/relatorios': (context) => const RelatoriosPage(),
        '/configuracoes': (context) => const ConfiguracoesPage(),
      },
    );
  }
}

final ThemeData simgecTheme = ThemeData(
  brightness: Brightness.light,
  primaryColor: const Color(0xFF1E88E5),
  scaffoldBackgroundColor: const Color(0xFFF5F7FA),
  colorScheme: const ColorScheme.light(
    primary: Color(0xFF1E88E5),
    secondary: Color(0xFF43A047),
    tertiary: Color(0xFFFB8C00),
    background: Color(0xFFF5F7FA),
    surface: Colors.white,
  ),
  textTheme: const TextTheme(
    headlineLarge: TextStyle(fontSize: 28, fontWeight: FontWeight.w700, color: Color(0xFF1F2937)),
    headlineMedium: TextStyle(fontSize: 22, fontWeight: FontWeight.w700, color: Color(0xFF1F2937)),
    bodyLarge: TextStyle(fontSize: 16, color: Color(0xFF1F2937)),
    bodyMedium: TextStyle(fontSize: 14, color: Color(0xFF64748B)),
  ),
  cardTheme: CardTheme(
    color: Colors.white,
    elevation: 4,
    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
  ),
  appBarTheme: const AppBarTheme(
    backgroundColor: Colors.white,
    elevation: 0,
    iconTheme: IconThemeData(color: Color(0xFF1E88E5)),
    titleTextStyle: TextStyle(color: Color(0xFF1F2937), fontSize: 20, fontWeight: FontWeight.w600),
  ),
  elevatedButtonTheme: ElevatedButtonThemeData(
    style: ElevatedButton.styleFrom(
      backgroundColor: const Color(0xFF1E88E5),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      elevation: 0,
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
    ),
  ),
);

class DashboardPage extends StatelessWidget {
  const DashboardPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Dashboard'),
        actions: [
          IconButton(onPressed: () {}, icon: const Icon(Icons.notifications_none)),
          IconButton(onPressed: () {}, icon: const Icon(Icons.account_circle_outlined)),
        ],
      ),
      drawer: const SimgecDrawer(),
      body: const DashboardContent(),
    );
  }
}

class EscolasPage extends StatelessWidget {
  const EscolasPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Escolas')),
      drawer: const SimgecDrawer(),
      body: const Center(child: Text('Página de Escolas')),
    );
  }
}

class AlunosPage extends StatelessWidget {
  const AlunosPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Alunos')),
      drawer: const SimgecDrawer(),
      body: const Center(child: Text('Página de Alunos')),
    );
  }
}

class MatriculasPage extends StatelessWidget {
  const MatriculasPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Matrículas')),
      drawer: const SimgecDrawer(),
      body: const Center(child: Text('Página de Matrículas')),
    );
  }
}

class RelatoriosPage extends StatelessWidget {
  const RelatoriosPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Relatórios')),
      drawer: const SimgecDrawer(),
      body: const Center(child: Text('Página de Relatórios')),
    );
  }
}

class ConfiguracoesPage extends StatelessWidget {
  const ConfiguracoesPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Configurações')),
      drawer: const SimgecDrawer(),
      body: const Center(child: Text('Página de Configurações')),
    );
  }
}

class SimgecDrawer extends StatelessWidget {
  const SimgecDrawer({super.key});

  @override
  Widget build(BuildContext context) {
    return Drawer(
      child: ListView(
        padding: EdgeInsets.zero,
        children: [
          DrawerHeader(
            decoration: const BoxDecoration(color: Color(0xFF1E88E5)),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: const [
                Text('SIMGEC', style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.w700)),
                SizedBox(height: 8),
                Text('Município do Cubal', style: TextStyle(color: Colors.white70, fontSize: 14)),
              ],
            ),
          ),
          _DrawerLink(label: 'Dashboard', route: '/'),
          _DrawerLink(label: 'Escolas', route: '/escolas'),
          _DrawerLink(label: 'Alunos', route: '/alunos'),
          _DrawerLink(label: 'Matrículas', route: '/matriculas'),
          _DrawerLink(label: 'Relatórios', route: '/relatorios'),
          _DrawerLink(label: 'Configurações', route: '/configuracoes'),
        ],
      ),
    );
  }
}

class _DrawerLink extends StatelessWidget {
  final String label;
  final String route;
  const _DrawerLink({required this.label, required this.route});

  @override
  Widget build(BuildContext context) {
    return ListTile(
      title: Text(label, style: const TextStyle(fontWeight: FontWeight.w600)),
      onTap: () {
        Navigator.of(context).pushReplacementNamed(route);
      },
    );
  }
}

class DashboardContent extends StatelessWidget {
  const DashboardContent({super.key});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Card(
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: const [
                      Text('Painel de gestão', style: TextStyle(color: Color(0xFF64748B), letterSpacing: 0.12, fontSize: 13)),
                      SizedBox(height: 10),
                      Text('Resumo das escolas e matrículas', style: TextStyle(fontSize: 26, fontWeight: FontWeight.w700)),
                    ],
                  ),
                  Row(
                    children: [
                      ElevatedButton(onPressed: () {}, style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF43A047)), child: const Text('Importar dados')),
                      const SizedBox(width: 12),
                      ElevatedButton(onPressed: () {}, child: const Text('Novo relatório')),
                    ],
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 24),
          GridView.count(
            crossAxisCount: MediaQuery.of(context).size.width > 900 ? 4 : 1,
            crossAxisSpacing: 20,
            mainAxisSpacing: 20,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            children: const [
              _MetricCard(label: 'Alunos ativos', value: '5.240'),
              _MetricCard(label: 'Escolas conectadas', value: '18'),
              _MetricCard(label: 'Matrículas novas', value: '312'),
              _MetricCard(label: 'Avaliações concluídas', value: '92%'),
            ],
          ),
          const SizedBox(height: 24),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(child: _LargePanel()),
              const SizedBox(width: 20),
              Expanded(child: _SmallPanel()),
            ],
          ),
          const SizedBox(height: 24),
          Row(
            children: const [
              Expanded(child: _ActionPanel(icon: Icons.description, label: 'Relatórios', subtitle: 'Gerar exportações em PDF e Excel')),
              SizedBox(width: 20),
              Expanded(child: _ActionPanel(icon: Icons.check_circle_outline, label: 'Matrículas', subtitle: 'Validar registros e aprovar inscrições')),
              SizedBox(width: 20),
              Expanded(child: _ActionPanel(icon: Icons.warning_amber_outlined, label: 'Alertas', subtitle: 'Ações pendentes e notificações urgentes')),
            ],
          ),
        ],
      ),
    );
  }
}

class _MetricCard extends StatelessWidget {
  final String label;
  final String value;
  const _MetricCard({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Card(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label, style: const TextStyle(color: Color(0xFF64748B), fontSize: 14)),
            const SizedBox(height: 16),
            Text(value, style: const TextStyle(fontSize: 32, fontWeight: FontWeight.w700)),
          ],
        ),
      ),
    );
  }
}

class _LargePanel extends StatelessWidget {
  const _LargePanel();

  @override
  Widget build(BuildContext context) {
    return Card(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Desempenho por escola', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  decoration: BoxDecoration(color: const Color(0xFF43A047), borderRadius: BorderRadius.circular(999)),
                  child: const Text('Em alta', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w700)),
                ),
              ],
            ),
            const SizedBox(height: 20),
            Expanded(
              child: Container(
                decoration: BoxDecoration(color: const Color(0xFF1E88E5).withOpacity(0.12), borderRadius: BorderRadius.circular(24)),
                child: const Center(child: Text('Gráfico de barras', style: TextStyle(color: Color(0xFF64748B), fontWeight: FontWeight.w600))),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _SmallPanel extends StatelessWidget {
  const _SmallPanel();

  @override
  Widget build(BuildContext context) {
    return Card(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: const [
            Text('Status geral', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
            SizedBox(height: 20),
            _StatusRow(label: 'Presença média', value: '89%'),
            _StatusRow(label: 'Taxa de aprovação', value: '94%'),
            _StatusRow(label: 'Alertas abertos', value: '7', isAlert: true),
          ],
        ),
      ),
    );
  }
}

class _StatusRow extends StatelessWidget {
  final String label;
  final String value;
  final bool isAlert;

  const _StatusRow({required this.label, required this.value, this.isAlert = false});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 12),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: Color(0xFF64748B), fontSize: 14)),
          Text(value, style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700, color: isAlert ? const Color(0xFFFB8C00) : const Color(0xFF1F2937))),
        ],
      ),
    );
  }
}

class _ActionPanel extends StatelessWidget {
  final IconData icon;
  final String label;
  final String subtitle;

  const _ActionPanel({required this.icon, required this.label, required this.subtitle});

  @override
  Widget build(BuildContext context) {
    return Card(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
      child: Padding(
        padding: const EdgeInsets.all(22),
        child: Row(
          children: [
            Container(
              width: 52,
              height: 52,
              decoration: BoxDecoration(color: const Color(0xFF1E88E5).withOpacity(0.12), borderRadius: BorderRadius.circular(18)),
              child: Icon(icon, color: const Color(0xFF1E88E5)),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(label, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
                  const SizedBox(height: 6),
                  Text(subtitle, style: const TextStyle(color: Color(0xFF64748B), fontSize: 14)),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
