const express = require('express');
const jwt = require('jsonwebtoken');
const app = express();

const SECRET = "change_this_secret";

app.use(express.json());
app.use(express.static(__dirname + '/public'));

// Middleware de autenticação
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token não fornecido" });
  }
  
  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(token, SECRET);
    req.user = payload;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token inválido" });
  }
}

// Middleware de autorização
function authorize(requiredRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Token não fornecido" });
    }

    const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Acesso negado" });
    }

    next();
  };
}

const router = express.Router();

router.get('/', authenticate, authorize(["admin", "director", "secretaria", "professor", "consulta"]), (req, res) => {
  res.json({ message: 'GET /escolas lista com autenticação' });
});

router.post('/', authenticate, authorize("admin"), (req, res) => {
  res.json({ message: 'POST /escolas cria' });
});

app.use('/escolas', router);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Rota não encontrada' });
});

app.listen(3002, () => {
  console.log('Teste servidor com autenticação na porta 3002');
});
