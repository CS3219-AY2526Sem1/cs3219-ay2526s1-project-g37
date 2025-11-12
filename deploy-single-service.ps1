# PowerShell wrapper for deploy-single-service.sh
# Usage: .\deploy-single-service.ps1 <service-name>

param(
    [Parameter(Mandatory=$true)]
    [string]$ServiceName
)

Write-Host "Setting up environment..." -ForegroundColor Cyan

# Add jq to PATH if it exists in user profile
if (Test-Path "$env:USERPROFILE\jq.exe") {
    $env:PATH += ";$env:USERPROFILE"
    Write-Host "Added jq.exe to PATH" -ForegroundColor Green
}

Write-Host "Deploying service: $ServiceName" -ForegroundColor Cyan
Write-Host ""

# Run the bash script
bash deploy-single-service.sh $ServiceName

# Capture exit code
$exitCode = $LASTEXITCODE

if ($exitCode -eq 0) {
    Write-Host ""
    Write-Host "Deployment completed successfully!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "Deployment failed with exit code: $exitCode" -ForegroundColor Red
}

exit $exitCode
