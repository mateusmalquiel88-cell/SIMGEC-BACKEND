// Teste de carregamento das rotas - versão 2
console.log('Testando carregamento das rotas...');

try {
  const escolasRoutes = require('./routes/escolas.js');
  console.log('✓ escolas.js carregado');
  console.log('  Type:', typeof escolasRoutes);
} catch (e) {
  console.log('✗ Erro ao carregar escolas.js:', e.message);
  console.log(e.stack);
}

console.log('\nTestando app com todas as rotas...');

const express = require('express');
const app = express();

app.use(express.json());

const authRoutes = require('./routes/auth').router;
const alunosRoutes = require('./routes/alunos');
const analyticsRoutes = require('./routes/analytics');
const adminRoutes = require('./routes/admin');
const escolasRoutes = require('./routes/escolas');
const chatRoutes = require('./routes/chat');

app.use('/auth', authRoutes);
console.log('✓ Auth route registered');

app.use('/alunos', alunosRoutes);
console.log('✓ Alunos route registered');

app.use('/escolas', escolasRoutes);
console.log('✓ Escolas route registered');

app.use('/analytics', analyticsRoutes);
console.log('✓ Analytics route registered');

app.use('/admin-api', adminRoutes);
console.log('✓ Admin route registered');

app.use('/chat', chatRoutes);
console.log('✓ Chat route registered');

// Verificar se escolas tem rotas
console.log('\nVerificando rotas em escolasRoutes:');
if (escolasRoutes.stack) {
  escolasRoutes.stack.forEach((layer, i) => {
    console.log(`  ${i}: ${layer.route ? layer.route.path : 'Middleware'} - ${Object.keys(layer.route ? layer.route.methods : {}).join(',') || 'N/A'}`);
  });
}

console.log('\nTeste concluído!');
