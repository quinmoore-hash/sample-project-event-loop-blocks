import { createServer } from 'node:http'
import { Worker } from 'node:worker_threads'

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

if (process.env.CRASH_REPORT_TRIGGER) {
  new Worker(new URL('./profiler-worker.mjs', import.meta.url), {
    workerData: {
      triggerPath: process.env.CRASH_REPORT_TRIGGER,
      reportDir: process.env.CRASH_REPORT_DIR ?? '/crash-reports',
    },
  }).unref()
}

createServer(serve).listen(8001, () => console.log('listening'));
