const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const { ACHFilesApi, Configuration } = require('../dist/index.js');

let server;
let basePath;

before(async () => {
  server = http.createServer((req, res) => {
    const url = req.url.split('?')[0];
    if (req.method === 'GET' && url === '/ping') {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('PONG');
      return;
    }
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('not found');
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  basePath = `http://127.0.0.1:${port}`;
});

after(async () => {
  if (server) {
    await new Promise((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
  }
});

test('exports the file API and configuration', () => {
  assert.equal(typeof ACHFilesApi, 'function');
  assert.equal(typeof Configuration, 'function');
  const api = new ACHFilesApi();
  assert.equal(typeof api.createFile, 'function');
  assert.equal(typeof api.getFileContents, 'function');
  assert.equal(typeof api.validateFile, 'function');
  assert.equal(typeof api.ping, 'function');
});

test('ping reaches a local ACH-compatible server', async () => {
  const api = new ACHFilesApi(new Configuration({ basePath }));
  const res = await api.ping();
  assert.equal(res.status, 200);
  assert.equal(res.data, 'PONG');
});
