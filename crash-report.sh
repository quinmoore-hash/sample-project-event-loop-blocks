#!/bin/sh
set -u

NODE_PID="$1"

if curl --silent --max-time 5 "http://localhost:8001/health" >/dev/null; then
  exit 0
fi

echo "[ENTRYPOINT] Service is terminating while unhealthy. Capturing crash report."

# This script runs in the service container before the termination signal is given to the process.
# You can add any report-gathering or diagnostic tools here.

mkdir -p /crash-reports
cd /crash-reports

NODE_DISABLE_COLORS=1
expect <<EOF
  set timeout 30
  spawn node inspect -p $NODE_PID
  expect "debug>"
  send "profile\r"
  expect "debug>"
  sleep 5
  send "profileEnd\r"
  expect "debug>"
  send "profiles\[0\].save()\r"
  expect "debug>"
  send ".exit\r"
  expect eof
EOF

CPU_PROFILE=$(ls *.cpuprofile 2>/dev/null | head -1)
if [ -z "$CPU_PROFILE" ]; then
  echo "[ENTRYPOINT] No crash report to save."
  exit 1
fi

#PREFIX="$(date -u +%Y-%m-%dT%H-%M-%SZ)-$(hostname)"
#aws s3 cp "$CPU_PROFILE" "s3://${CRASH_REPORTS_BUCKET}/${PREFIX}/${CPU_PROFILE}"

echo "[ENTRYPOINT] Crash report completed."
