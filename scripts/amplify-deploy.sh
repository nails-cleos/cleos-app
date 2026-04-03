#!/usr/bin/env bash
set -euo pipefail

APP_ID="${1:?missing Amplify app id}"
BRANCH_NAME="${2:?missing Amplify branch name}"

echo "Deploy app ${APP_ID} branch ${BRANCH_NAME}"

JOB_ID="$(
  aws amplify start-job \
    --app-id "$APP_ID" \
    --branch-name "$BRANCH_NAME" \
    --job-type RELEASE \
    --query 'jobSummary.jobId' \
    --output text
)"

echo "Release started"
echo "Job ID: ${JOB_ID}"

while true; do
  JOB_STATUS="$(
    aws amplify get-job \
      --app-id "$APP_ID" \
      --branch-name "$BRANCH_NAME" \
      --job-id "$JOB_ID" \
      --query 'job.summary.status' \
      --output text
  )"

  echo "Current status: ${JOB_STATUS}"

  case "$JOB_STATUS" in
    PENDING|PROVISIONING|RUNNING)
      sleep 10
      ;;
    SUCCEED)
      echo "Job finished successfully"
      exit 0
      ;;
    FAILED|CANCELLED)
      echo "Job finished with status: ${JOB_STATUS}" >&2
      exit 1
      ;;
    *)
      echo "Unexpected Amplify job status: ${JOB_STATUS}" >&2
      exit 1
      ;;
  esac
done
