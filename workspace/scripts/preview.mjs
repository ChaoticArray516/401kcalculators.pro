import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('dist');
const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.ico': 'image/x-icon',
};

function fileFor(urlPath) {
  const pathname = decodeURIComponent(new URL(urlPath, 'http://localhost').pathname);
  const relative = path.normalize(pathname).replace(/^([/\\])+/, '');
  const full = path.resolve(root, relative);
  if (!full.startsWith(root + path.sep) && full !== root) return null;
  if (fs.existsSync(full) && fs.statSync(full).isFile()) return full;
  const index = path.join(full, 'index.html');
  if (fs.existsSync(index) && fs.statSync(index).isFile()) return index;
  return null;
}

const server = http.createServer((req, res) => {
  if (!['GET', 'HEAD'].includes(req.method)) {
    res.writeHead(405);
    res.end();
    return;
  }
  const file = fileFor(req.url);
  const notFound = !file;
  const target = notFound ? path.join(root, '404.html') : file;
  const status = notFound ? 404 : 200;
  res.writeHead(status, { 'Content-Type': types[path.extname(target)] || 'application/octet-stream' });
  if (req.method === 'HEAD') {
    res.end();
    return;
  }
  fs.createReadStream(target).pipe(res);
});

const port = Number(process.env.PORT || 4321);
server.listen(port, '127.0.0.1', () => {
  console.log(`Static preview listening on http://127.0.0.1:${port}`);
});
