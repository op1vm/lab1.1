const http = require('http');
const fs = require('fs');
const path = require('path');

const port = process.env.PORT || 5500;
const root = process.cwd();

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
  '.txt': 'text/plain; charset=utf-8'
};

function sendFile(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const type = mime[ext] || 'application/octet-stream';
  fs.createReadStream(filePath)
    .on('open', () => {
      res.writeHead(200, { 'Content-Type': type });
    })
    .on('error', () => {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not found');
    })
    .pipe(res);
}

const server = http.createServer((req, res) => {
  try {
    const decoded = decodeURIComponent(req.url.split('?')[0]);
    let filePath = path.join(root, decoded);
    // Если путь директории — искать index.html
    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      const index = path.join(filePath, 'index.html');
      if (fs.existsSync(index)) {
        return sendFile(res, index);
      }
      // простая листинга
      const entries = fs.readdirSync(filePath).map(f => `<li><a href="${path.posix.join(req.url, f)}">${f}</a></li>`).join('');
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(`<h1>Index of ${req.url}</h1><ul>${entries}</ul>`);
    }

    // Если файл не существует — попробовать добавить .html
    if (!fs.existsSync(filePath)) {
      const maybeHtml = filePath + '.html';
      if (fs.existsSync(maybeHtml)) filePath = maybeHtml;
    }

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      return sendFile(res, filePath);
    }

    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('404 Not Found');
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Server error');
  }
});

server.listen(port, () => {
  console.log(`Serving ${root} at http://localhost:${port}`);
});
