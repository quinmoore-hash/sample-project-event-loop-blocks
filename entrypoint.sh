#!/bin/sh
set -u

# Private (0700) directory used by crash-report.sh to ask the app to capture a profile.
CRASH_REPORT_TRIGGER="$(mktemp -d)/capture-request"
export CRASH_REPORT_TRIGGER

node --disable-sigusr1 main.mjs &
NODE_PID="$!"

terminate() {
  echo "[ENTRYPOINT] Termination request received."
  /crash-report.sh || true
  echo "[ENTRYPOINT] Terminating main process."
  kill -TERM "$NODE_PID" 2>/dev/null || true
  wait "$NODE_PID"
}
trap terminate TERM INT

wait "$NODE_PID"
