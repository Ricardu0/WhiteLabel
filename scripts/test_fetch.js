import http from 'http';

const options = {
  hostname: 'localhost',
  port: 3308,
  path: '/locacoes/1',
  method: 'GET'
};

const req = http.request(options, res => {
  console.log('STATUS:', res.statusCode);
  res.setEncoding('utf8');
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log('BODY:', body.slice(0,1000));
  });
});

req.on('error', e => {
  console.error('REQ ERROR', e.message);
});

req.end();
