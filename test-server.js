const cp = require('child_process');
const http = require('http');
const path = require('path');

const server = cp.spawn('node', ['server.js'], {
  cwd: path.resolve(__dirname),
  stdio: ['ignore', 'pipe', 'pipe']
});

server.stdout.on('data', (data) => process.stderr.write(data));
server.stderr.on('data', (data) => process.stderr.write(data));

const serverPort = process.env.PORT || 3000;

const req = (path, method, body) => new Promise((resolve, reject) => {
  const opts = {
    hostname: 'localhost',
    port: serverPort,
    path,
    method,
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const r = http.request(opts, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      try {
        resolve({ status: res.statusCode, body: JSON.parse(data) });
      } catch (err) {
        resolve({ status: res.statusCode, body: data });
      }
    });
  });

  r.on('error', reject);
  if (body) r.write(JSON.stringify(body));
  r.end();
});

setTimeout(async () => {
  try {
    const root = await req('/', 'GET');
    console.log('ROOT_OK', JSON.stringify(root));

    const post = await req('/alunos', 'POST', { nome: 'João', idade: 20, turma: 'A1' });
    console.log('POST_OK', JSON.stringify(post));

    const list = await req('/alunos', 'GET');
    console.log('LIST_OK', JSON.stringify(list));
  } catch (err) {
    console.error('ERROR', err);
  } finally {
    server.kill();
    process.exit(0);
  }
}, 2000);