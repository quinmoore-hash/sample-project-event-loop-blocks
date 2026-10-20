import { createServer } from 'node:http'
import { timingSafeEqual } from 'node:crypto'

// The /loop demo route is disabled unless LOOP_ROUTE_TOKEN is set, and then
// requires a matching X-Loop-Token header.
const LOOP_ROUTE_TOKEN = process.env.LOOP_ROUTE_TOKEN || ''

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

function routeNotFound(req, res) {
  res.writeHead(404, {
    'Content-Type': 'application/json'
  });
  res.end(JSON.stringify({
    'ok': false
  }));
}

function routeLoop(req, res) {
  while (true) {
    // Sample complex task
    new URL("http://a")
  }
}

function isLoopAuthorized(req) {
  if (!LOOP_ROUTE_TOKEN) {
    return false;
  }
  const provided = Buffer.from(String(req.headers['x-loop-token'] ?? ''));
  const expected = Buffer.from(LOOP_ROUTE_TOKEN);
  return provided.length === expected.length && timingSafeEqual(provided, expected);
}

function serve(req, res) {
  console.log(new Date(), req.method, req.url);
  if (req.url?.toString() === '/loop') {
    if (isLoopAuthorized(req)) {
      routeLoop(req, res);
    } else {
      routeNotFound(req, res);
    }
  } else {
    routeOk(req, res);
  }
}

createServer(serve).listen(8001, () => console.log('listening'));
