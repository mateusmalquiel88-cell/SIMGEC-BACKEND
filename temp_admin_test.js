const http = require('http');
const data = JSON.stringify({ email: 'marotheus.mora', password: 'admin' });
const opts = {
  hostname: 'localhost',
  port: 3000,
  path: '/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data),
  },
};
const req = http.request(opts, (res) => {
  let body = '';
  res.on('data', (chunk) => (body += chunk));
  res.on('end', () => {
    console.log('LOGIN', res.statusCode, body);
    if (res.statusCode !== 200) return;
    const token = JSON.parse(body).token;
    const cookie = `simgc_token=${encodeURIComponent(token)}`;
    const opts2 = {
      hostname: 'localhost',
      port: 3000,
      path: '/admin',
      method: 'GET',
      headers: {
        Cookie: cookie,
      },
    };
    const req2 = http.request(opts2, (res2) => {
      let body2 = '';
      res2.on('data', (chunk) => (body2 += chunk));
      res2.on('end', () => {
        console.log('ADMIN', res2.statusCode);
        console.log(body2.slice(0, 1000));
      });
    });
    req2.end();
  });
});
req.on('error', (err) => console.error('ERROR', err));
req.write(data);
req.end();
