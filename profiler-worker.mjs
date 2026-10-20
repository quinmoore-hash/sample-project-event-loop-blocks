// Captures a CPU profile of the main thread on request, without opening an inspector port.
// The session must connect while the main thread is still responsive; once connected,
// profiler commands are serviced even while the main thread's event loop is blocked.
import { Session } from 'node:inspector/promises'
import { existsSync, mkdirSync, renameSync, rmSync, writeFileSync, writeSync } from 'node:fs'
import { join } from 'node:path'
import { setTimeout as sleep } from 'node:timers/promises'
import { parentPort, workerData } from 'node:worker_threads'

const { triggerPath, reportDir, durationMs = 5000 } = workerData

const session = new Session()
session.connectToMainThread()
const enabled = session.post('Profiler.enable')

let capturing = false
setInterval(async () => {
  if (capturing || !existsSync(triggerPath)) return
  capturing = true
  try {
    rmSync(triggerPath, { force: true })
    await session.post('Profiler.start')
    await sleep(durationMs)
    const { profile } = await session.post('Profiler.stop')
    mkdirSync(reportDir, { recursive: true })
    const tmpPath = join(reportDir, '.node.cpuprofile.tmp')
    writeFileSync(tmpPath, JSON.stringify(profile))
    renameSync(tmpPath, join(reportDir, 'node.cpuprofile'))
  } catch (err) {
    // Worker console output is relayed by the (possibly blocked) main thread, so write directly.
    writeSync(2, `[PROFILER] Failed to capture CPU profile: ${err}\n`)
  } finally {
    capturing = false
  }
}, 200)

await enabled
parentPort.postMessage('ready')
