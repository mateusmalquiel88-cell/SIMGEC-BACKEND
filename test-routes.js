const http = require('http');

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoibWFyb3RoZXVzLm1vcmEiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3ODE0NTQxMzAsImV4cCI6MTc4MTQ4MjkzMH0.v8YAxvXIvvOWVdzACja-4KVedCk0TRJyq4AM5fqbOs8";

const routes = ['/escolas', '/alunos', '/analytics', '/auth/login'];

routes.forEach(path => {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: path,
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };

  const req = http.request(options, (res) => {
    console.log(`${path}: ${res.statusCode}`);
  });

  req.on('error', (error) => {
    console.error(`${path}: ERROR -`, error.message);
  });

  req.end();
});
