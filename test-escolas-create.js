const http = require('http');

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoibWFyb3RoZXVzLm1vcmEiLCJyb2xlIjoibWFyb3RoZXVzLm1vcmEiLCJpYXQiOjE3ODE0NTQxMzAsImV4cCI6MTc4MTQ4MjkzMH0.v8YAxvXIvvOWVdzACja-4KVedCk0TRJyq4AM5fqbOs8";

function postEscola(escola, cb) {
  const data = JSON.stringify(escola);
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/escolas',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data)
    }
  };

  const req = http.request(options, (res) => {
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => cb(null, res.statusCode, body));
  });
  req.on('error', cb);
  req.write(data);
  req.end();
}

function getEscolas(query, cb) {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/escolas' + (query ? ('?' + query) : ''),
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };

  const req = http.request(options, (res) => {
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => cb(null, res.statusCode, body));
  });
  req.on('error', cb);
  req.end();
}

const escola = {
  codigo: 'TEST001',
  nome: 'Escola de Teste Automático',
  provincia: 'Luanda',
  municipio: 'Cazenga',
  nivel_ensino: 'Primário',
  diretor: 'Teste Diretor',
  num_salas: 5,
  total_alunos: 120
};

postEscola(escola, (err, status, body) => {
  if (err) return console.error('POST erro:', err);
  console.log('POST status', status, 'body', body);

  // Agora consultar por provincia
  getEscolas('provincia=Luanda', (err2, status2, body2) => {
    if (err2) return console.error('GET erro:', err2);
    console.log('GET status', status2, 'body', body2);
  });
});
