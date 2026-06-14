const express = require('express');
const app = express();

app.use(express.json());
app.use(express.static(__dirname + '/public'));

const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'GET /escolas lista' });
});

router.post('/', (req, res) => {
  res.json({ message: 'POST /escolas cria' });
});

app.use('/escolas', router);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Rota não encontrada' });
});

app.listen(3001, () => {
  console.log('Teste servidor na porta 3001');
});
