echo "Deploy app $1 branch $2"
JOB_ID=$(aws amplify start-job --app-id $1 --branch-name $2 --job-type RELEASE | jq -r '.jobSummary.jobId')
echo "Release started"
echo "Job ID is $JOB_ID"

JOB_STATUS="$(aws amplify get-job --app-id $1 --branch-name $2 --job-id $JOB_ID | jq -r '.job.summary.status')"
echo "Job status is $JOB_STATUS"
