import 'package:flutter/material.dart';

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
    headline1: TextStyle(fontSize: 28, fontWeight: FontWeight.w700, color: Color(0xFF1F2937)),
    headline2: TextStyle(fontSize: 22, fontWeight: FontWeight.w700, color: Color(0xFF1F2937)),
    subtitle1: TextStyle(fontSize: 16, fontWeight: FontWeight.w500, color: Color(0xFF64748B)),
    bodyText1: TextStyle(fontSize: 15, color: Color(0xFF1F2937)),
  ),
  cardTheme: CardTheme(
    color: Colors.white,
    elevation: 4,
    shape: RoundedRectangleBorder(
      borderRadius: BorderRadius.circular(20),
    ),
  ),
  appBarTheme: const AppBarTheme(
    backgroundColor: Colors.white,
    elevation: 0,
    iconTheme: IconThemeData(color: Color(0xFF1E88E5)),
    titleTextStyle: TextStyle(
      color: Color(0xFF1F2937),
      fontSize: 20,
      fontWeight: FontWeight.w600,
    ),
  ),
  elevatedButtonTheme: ElevatedButtonThemeData(
    style: ElevatedButton.styleFrom(
      backgroundColor: const Color(0xFF1E88E5),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      elevation: 0,
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
    ),
  ),
);

class SimgecDashboard extends StatelessWidget {
  const SimgecDashboard({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F7FA),
      body: SafeArea(
        child: Row(
          children: [
            SizedBox(
              width: 280,
              child: _Sidebar(),
            ),
            Expanded(
              child: Padding(
                padding: const EdgeInsets.all(28),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: const [
                    _TopBar(),
                    SizedBox(height: 24),
                    _HeroCard(),
                    SizedBox(height: 24),
                    _MetricGrid(),
                    SizedBox(height: 24),
                    _MainPanels(),
                    SizedBox(height: 24),
                    _ActionsRow(),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _Sidebar extends StatelessWidget {
  const _Sidebar();

  @override
  Widget build(BuildContext context) {
    return Card(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(28)),
      elevation: 10,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 28),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  width: 48,
                  height: 48,
                  decoration: const BoxDecoration(
                    color: Color(0xFF1E88E5),
                    borderRadius: BorderRadius.all(Radius.circular(16)),
                  ),
                  child: const Center(
                    child: Text('S', style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold)),
                  ),
                ),
                const SizedBox(width: 16),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: const [
                    Text('SIMGEC', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 18)),
                    SizedBox(height: 4),
                    Text('Município do Cubal', style: TextStyle(color: Color(0xFF64748B), fontSize: 13)),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 28),
            const _SidebarLink(label: 'Dashboard', isActive: true),
            const _SidebarLink(label: 'Escolas'),
            const _SidebarLink(label: 'Alunos'),
            const _SidebarLink(label: 'Matrículas'),
            const _SidebarLink(label: 'Relatórios'),
            const _SidebarLink(label: 'Configurações'),
          ],
        ),
      ),
    );
  }
}

class _SidebarLink extends StatelessWidget {
  final String label;
  final bool isActive;

  const _SidebarLink({required this.label, this.isActive = false});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Container(
        decoration: BoxDecoration(
          color: isActive ? const Color(0xFF1E88E5).withOpacity(0.12) : Colors.transparent,
          borderRadius: BorderRadius.circular(18),
        ),
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 18),
          child: Text(
            label,
            style: TextStyle(
              color: isActive ? const Color(0xFF1E88E5) : const Color(0xFF1F2937),
              fontWeight: FontWeight.w500,
            ),
          ),
        ),
      ),
    );
  }
}

class _TopBar extends StatelessWidget {
  const _TopBar();

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: const [
            Text('Gestão Integrada da Educação', style: TextStyle(color: Color(0xFF64748B), fontSize: 13, letterSpacing: 0.08)),
            SizedBox(height: 8),
            Text('SIMGEC - Município do Cubal', style: TextStyle(fontSize: 32, fontWeight: FontWeight.w700)),
          ],
        ),
        Row(
          children: [
            _IconCircle(label: '🔔'),
            const SizedBox(width: 12),
            _IconCircle(label: '👤'),
          ],
        ),
      ],
    );
  }
}

class _IconCircle extends StatelessWidget {
  final String label;
  const _IconCircle({required this.label});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 52,
      height: 52,
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.06), blurRadius: 24, offset: const Offset(0, 6))]),
      child: Center(child: Text(label, style: const TextStyle(fontSize: 18))),
    );
  }
}

class _HeroCard extends StatelessWidget {
  const _HeroCard();

  @override
  Widget build(BuildContext context) {
    return Card(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(28)),
      child: Padding(
        padding: const EdgeInsets.all(28),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: const [
                  Text('Painel de gestão', style: TextStyle(color: Color(0xFF64748B), fontSize: 13, letterSpacing: 0.12)),
                  SizedBox(height: 12),
                  Text('Resumo das escolas e matrículas', style: TextStyle(fontSize: 26, fontWeight: FontWeight.w700)),
                ],
              ),
            ),
            const SizedBox(width: 16),
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
    );
  }
}

class _MetricGrid extends StatelessWidget {
  const _MetricGrid();

  @override
  Widget build(BuildContext context) {
    return GridView.count(
      crossAxisCount: 4,
      crossAxisSpacing: 20,
      mainAxisSpacing: 20,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      children: const [
        _MetricTile(label: 'Alunos ativos', value: '5.240'),
        _MetricTile(label: 'Escolas conectadas', value: '18'),
        _MetricTile(label: 'Matrículas novas', value: '312'),
        _MetricTile(label: 'Avaliações concluídas', value: '92%'),
      ],
    );
  }
}

class _MetricTile extends StatelessWidget {
  final String label;
  final String value;

  const _MetricTile({required this.label, required this.value});

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

class _MainPanels extends StatelessWidget {
  const _MainPanels();

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: const [
          Expanded(child: _LargePanel()),
          SizedBox(width: 20),
          Expanded(child: _SmallPanel()),
        ],
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
                  decoration: BoxDecoration(color: const Color(0xFF43A047), borderRadius: BorderRadius.circular(999)),
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
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
          children: [
            const Text('Status geral', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
            const SizedBox(height: 20),
            const _StatusRow(label: 'Presença média', value: '89%'),
            const _StatusRow(label: 'Taxa de aprovação', value: '94%'),
            const _StatusRow(label: 'Alertas abertos', value: '7', isAlert: true),
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

class _ActionsRow extends StatelessWidget {
  const _ActionsRow();

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 160,
      child: Row(
        children: const [
          Expanded(child: _ActionCard(icon: '📄', title: 'Relatórios', subtitle: 'Gerar exportações em PDF e Excel')),
          SizedBox(width: 20),
          Expanded(child: _ActionCard(icon: '✅', title: 'Matrículas', subtitle: 'Validar registros e aprovar inscrições')),
          SizedBox(width: 20),
          Expanded(child: _ActionCard(icon: '⚠️', title: 'Alertas', subtitle: 'Ações pendentes e notificações urgentes')),
        ],
      ),
    );
  }
}

class _ActionCard extends StatelessWidget {
  final String icon;
  final String title;
  final String subtitle;

  const _ActionCard({required this.icon, required this.title, required this.subtitle});

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
              child: Center(child: Text(icon, style: const TextStyle(fontSize: 24))),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(title, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
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
