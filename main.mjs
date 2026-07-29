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

function serve(req, res) {
  console.log(new Date(), req.method, req.url);
  if (req.url?.toString() === '/loop') {
    routeLoop(req, res);
  } else {
    routeOk(req, res);
  }
}

createServer(serve).listen(8001, () => console.log('listening'));