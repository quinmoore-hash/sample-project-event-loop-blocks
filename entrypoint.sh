#!/bin/sh
set -u

node main.mjs &
NODE_PID="$!"

terminate() {
  echo "[ENTRYPOINT] Termination request received."
  /crash-report.sh "$NODE_PID" || true
  echo "[ENTRYPOINT] Terminating main process."
  kill -TERM "$NODE_PID" 2>/dev/null || true
  wait "$NODE_PID"
}
trap terminate TERM INT

wait "$NODE_PID"
