import { once } from 'node:events'
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
  const profiler = new Worker(new URL('./profiler-worker.mjs', import.meta.url), {
    workerData: {
      triggerPath: process.env.CRASH_REPORT_TRIGGER,
      reportDir: process.env.CRASH_REPORT_DIR ?? '/crash-reports',
    },
  })
  profiler.on('error', (err) => console.error('[PROFILER] Worker failed:', err))
  profiler.unref()
  // Don't accept requests until the profiler is attached; it can't attach once the loop is blocked.
  await once(profiler, 'message').catch(() => {})
}

createServer(serve).listen(8001, () => console.log('listening'));
