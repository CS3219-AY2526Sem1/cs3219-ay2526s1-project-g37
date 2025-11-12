# Written in assistance with ai
# Deploy All Services to ECS - PowerShell Wrapper
# Usage: 
#   .\deploy-all-services.ps1              # Builds all images once, then deploys all services

Write-Host "Setting up environment..." -ForegroundColor Cyan

# Add jq to PATH if it exists in user profile
if (Test-Path "$env:USERPROFILE\jq.exe") {
    $env:PATH += ";$env:USERPROFILE"
    Write-Host "Added jq.exe to PATH" -ForegroundColor Green
}

Write-Host "Running deployment script for ALL services..." -ForegroundColor Cyan
Write-Host ""

# Run the bash script
bash deploy-all-services.sh

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
