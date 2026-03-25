const http = require('http');

const data = JSON.stringify({ email: 'test@example.com' });

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/auth/send-otp',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  console.log('Status:', res.statusCode);
  res.on('data', (chunk) => {
    console.log('Response:', chunk.toString());
  });
});

req.on('error', (e) => {
  console.error('Error:', e);
});

req.write(data);
req.end();
