const http = require('http');

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoibWFyb3RoZXVzLm1vcmEiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3ODE0NTQxMzAsImV4cCI6MTc4MTQ4MjkzMH0.v8YAxvXIvvOWVdzACja-4KVedCk0TRJyq4AM5fqbOs8";

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/escolas',
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log('Headers:', JSON.stringify(res.headers, null, 2));
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response Body:', data);
  });
});

req.on('error', (error) => {
  console.error('Error:', error);
});

req.end();
