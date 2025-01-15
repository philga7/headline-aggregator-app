import * as http from 'http';
import * as url from 'url';
import next from 'next';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  http.createServer((req: any, res: any) => {
    const parsedUrl = url.parse(req.url!, true);
    handle(req, res, parsedUrl);
  }).listen(3000, () => {
    console.log('> Ready on http://localhost:3000');
  });

  // Proper signal handling for development
  ['SIGINT', 'SIGTERM'].forEach((signal) => {
    process.on(signal, () => {
      console.log(`\n${signal} received, gracefully shutting down...`);
      process.exit(0);
    });
  });
});
