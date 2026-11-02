#!/bin/sh
set -u

NODE_PID="$1"

if curl --silent --max-time 5 "http://localhost:8001/health" >/dev/null; then
  exit 0
fi

echo "[ENTRYPOINT] Service is terminating while unhealthy. Capturing crash report."

# This script runs in the service container before the termination signal is given to the process.
# You can add any report-gathering or diagnostic tools here.
#
# Attaching the debugger opens the unauthenticated Node inspector on 127.0.0.1:9229 until the
# process exits, so keep the window short: every debugger step fails fast and the whole session
# is capped. The container runs as a non-root user and must not share its network namespace
# with untrusted workloads.

mkdir -p /crash-reports
cd /crash-reports

NODE_DISABLE_COLORS=1
timeout 20 expect <<EOF
  set timeout 10
  spawn node inspect -p $NODE_PID
  expect_after timeout { exit 1 } eof { exit 1 }
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
