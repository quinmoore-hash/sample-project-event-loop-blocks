#!/bin/sh
set -u

if curl --silent --max-time 5 "http://localhost:8001/health" >/dev/null; then
  exit 0
fi

echo "[ENTRYPOINT] Service is terminating while unhealthy. Capturing crash report."

# This script runs in the service container before the termination signal is given to the process.
# You can add any report-gathering or diagnostic tools here.

mkdir -p /crash-reports
cd /crash-reports
rm -f node.cpuprofile

# The app's profiler worker (profiler-worker.mjs) watches for this file, profiles the
# main thread for 5 seconds, and writes /crash-reports/node.cpuprofile.
touch "$CRASH_REPORT_TRIGGER"

for _ in $(seq 1 30); do
  [ -f node.cpuprofile ] && break
  sleep 1
done

CPU_PROFILE=$(ls *.cpuprofile 2>/dev/null | head -1)
if [ -z "$CPU_PROFILE" ]; then
  echo "[ENTRYPOINT] No crash report to save."
  exit 1
fi

#PREFIX="$(date -u +%Y-%m-%dT%H-%M-%SZ)-$(hostname)"
#aws s3 cp "$CPU_PROFILE" "s3://${CRASH_REPORTS_BUCKET}/${PREFIX}/${CPU_PROFILE}"

echo "[ENTRYPOINT] Crash report completed."
