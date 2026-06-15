const http = require('http');

function login(creds, cb) {
  const data = JSON.stringify(creds);
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data)
    }
  };
  const req = http.request(options, (res) => {
    let body = '';
    res.on('data', (c) => body += c);
    res.on('end', () => cb(null, res.statusCode, body));
  });
  req.on('error', cb);
  req.write(data);
  req.end();
}

function postEscola(escola, token, cb) {
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

function getEscolas(query, token, cb) {
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

const creds = { email: 'marotheus.mora', password: 'M@iqueias318565' };
const escola = {
  codigo: 'TEST002',
  nome: 'Escola de Teste Login',
  provincia: 'Luanda',
  municipio: 'Cazenga',
  nivel_ensino: 'Primário',
  diretor: 'Diretor Teste',
  num_salas: 3,
  total_alunos: 80
};

login(creds, (err, status, body) => {
  if (err) return console.error('Login erro:', err);
  console.log('Login status', status, 'body', body);
  if (status !== 200) return console.error('Login falhou');
  const data = JSON.parse(body);
  const token = data.token;

  postEscola(escola, token, (err2, st2, b2) => {
    if (err2) return console.error('POST erro:', err2);
    console.log('POST status', st2, 'body', b2);

    getEscolas('provincia=Luanda', token, (err3, st3, b3) => {
      if (err3) return console.error('GET erro:', err3);
      console.log('GET status', st3, 'body', b3);
    });
  });
});
