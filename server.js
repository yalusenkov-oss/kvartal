const http = require('http');
const fs = require('fs');
const path = require('path');

const host = process.env.HOST || '127.0.0.1';
const port = Number(process.env.PORT || 3000);
const rootDir = __dirname;

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

function send(res, status, body, contentType = 'text/plain; charset=utf-8') {
  res.writeHead(status, { 'Content-Type': contentType });
  res.end(body);
}

function resolvePath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split('?')[0]);
  const cleaned = decoded === '/' ? '/index.html' : decoded;
  const filePath = path.normalize(path.join(rootDir, cleaned));

  if (!filePath.startsWith(rootDir)) {
    return null;
  }

  return filePath;
}

const server = http.createServer((req, res) => {
  const filePath = resolvePath(req.url || '/');

  if (!filePath) {
    send(res, 403, 'Forbidden');
    return;
  }

  fs.stat(filePath, (statErr, stats) => {
    if (statErr) {
      send(res, 404, 'Not found');
      return;
    }

    const targetPath = stats.isDirectory() ? path.join(filePath, 'index.html') : filePath;

    fs.readFile(targetPath, (readErr, data) => {
      if (readErr) {
        send(res, 404, 'Not found');
        return;
      }

      const ext = path.extname(targetPath).toLowerCase();
      send(res, 200, data, mimeTypes[ext] || 'application/octet-stream');
    });
  });
});

server.listen(port, host, () => {
  console.log(`Server running at http://${host}:${port}`);
});
