const http = require('http');

function request(options, data, cb) {
  const req = http.request(options, (res) => {
    let body = '';
    res.on('data', (c) => body += c);
    res.on('end', () => cb(null, res.statusCode, body));
  });
  req.on('error', cb);
  if (data) req.write(JSON.stringify(data));
  req.end();
}

function login(cb) {
  const options = {
    hostname: 'localhost', port: 3000, path: '/auth/login', method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  };
  request(options, { email: 'marotheus.mora', password: 'M@iqueias318565' }, cb);
}

function createSchool(token, cb) {
  const escola = {
    codigo: 'AUTO' + Date.now(), nome: 'Escola Automática', provincia: 'Luanda', municipio: 'Cazenga', nivel_ensino: 'Primário', diretor: 'Teste Auto', num_salas: 4, total_alunos: 120
  };
  const options = { hostname: 'localhost', port: 3000, path: '/escolas', method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` } };
  request(options, escola, cb);
}

function getSchools(token, query, cb) {
  const path = '/escolas' + (query ? ('?' + query) : '');
  const options = { hostname: 'localhost', port: 3000, path, method: 'GET', headers: { 'Authorization': `Bearer ${token}` } };
  request(options, null, cb);
}

login((err, status, body) => {
  if (err) return console.error('Login error:', err);
  console.log('Login status', status, body);
  if (status !== 200) return console.error('Login failed');
  const token = JSON.parse(body).token;
  createSchool(token, (err2, st2, b2) => {
    if (err2) return console.error('Create error:', err2);
    console.log('Create status', st2, b2);
    // query by province
    getSchools(token, 'provincia=Luanda', (err3, st3, b3) => {
      if (err3) return console.error('Get error:', err3);
      console.log('Get status', st3, b3);
    });
  });
});
