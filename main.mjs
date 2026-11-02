import { createServer } from 'node:http'

function routeOk(req, res) {
  setTimeout(() => {
    res.writeHead(200, {
      'Content-Type': 'application/json'
    });
    res.end(JSON.stringify({
      'ok': true
    }));
  }, 1000)
}

function routeLoop(req, res) {
  while (true) {
    // Sample complex task
    new URL("http://a")
  }
}

const DEMO_LOOP = process.env.DEMO_LOOP === '1';

function serve(req, res) {
  console.log(new Date(), req.method, req.url);
  if (DEMO_LOOP && req.url?.toString() === '/loop') {
    routeLoop(req, res);
  } else {
    routeOk(req, res);
  }
}

createServer(serve).listen(8001, () => console.log('listening', DEMO_LOOP ? '(DEMO_LOOP=1: /loop blocks the event loop)' : ''));